import Product from "./product.model.js";
import mongoose from "mongoose";
import { STATUS} from "../../constant/status.constant.js";
import { ACTION } from "../../constant/action.constant.js";

import Category from "../category/category.model.js";
import { deleteImage } from "../../config/cloudinary.js";

const createProduct = async (data, userId) => {
  const exist = await Product.findOne({ name: data.name });
  const existCategory = await Category.findOne({ _id: data.category });
  if (exist) throw new Error("Product name already exists");
  if (!existCategory) throw new Error("Category not found");
  const product = new Product({
    ...data,
    image: data.image, // image là url từ API upload-image
    status: STATUS.PENDING,
    action: ACTION.INACTIVE,
    requestType: "CREATE",
    pendingChanges: null,
    createdBy: userId,
    updatedBy: userId,
  });
  return await product.save();
};

const getProducts = async () => {
  return await Product.find()
    .populate("category", "name action _id")
    .populate("createdBy", "email role _id")
    .populate("updatedBy", "email role _id");
};

const getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid product ID");
  const product = await Product.findById(id)
    .populate("category", "name action _id")
    .populate("createdBy", "email role _id")
    .populate("updatedBy", "email role _id");

  if (!product) throw new Error("Product not found");

  let pendingCategory = null;
  if (product.pendingChanges && product.pendingChanges.category) {
    // Populate tên category cho pendingChanges
    const cat = await Category.findById(product.pendingChanges.category).select(
      "name _id"
    );
    if (cat) {
      pendingCategory = { _id: cat._id, name: cat.name };
    }
  }

  // Trả về object đã bổ sung tên category cho pendingChanges
  const result = product.toObject();
  if (pendingCategory) {
    result.pendingChanges = {
      ...result.pendingChanges,
      category: pendingCategory,
    };
  }

  return result;
};

const updateProduct = async (id, data, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid product ID");

  const currentProduct = await Product.findById(id);
  if (!currentProduct) throw new Error("Product not found");

  if (data.category) {
    const existCategory = await Category.findOne({ _id: data.category });
    if (!existCategory) throw new Error("Category not found");
  }

  const fieldsToCheck = [
    "name",
    "category",
    "density",
    "storageTemperature",
    "image",
    "reason",
  ];
  let allSame = true;
  for (const field of fieldsToCheck) {
    if (data[field] !== undefined) {
      if (typeof data[field] === "object" && data[field] !== null) {
        if (
          JSON.stringify(data[field]) !== JSON.stringify(currentProduct[field])
        ) {
          allSame = false;
          break;
        }
      } else {
        if (data[field] != currentProduct[field]) {
          allSame = false;
          break;
        }
      }
    }
  }
  if (allSame) throw new Error("Product already exists");

  // Kiểm tra trùng tên với sản phẩm khác
  if (data.name) {
    const exist = await Product.findOne({ name: data.name, _id: { $ne: id } });
    if (exist) throw new Error("Product already exists");
  }

  currentProduct.requestType = "UPDATE";
  currentProduct.status = STATUS.PENDING;
  currentProduct.pendingChanges = {
    ...(data.name && { name: data.name }),
    ...(data.category && { category: data.category }),
    ...(data.density && { density: data.density }),
    ...(data.storageTemperature && {
      storageTemperature: data.storageTemperature,
    }),
    ...(data.image && { image: data.image }),
    ...(data.reason && { reason: data.reason }),
  };
  currentProduct.updatedBy = userId;
  await currentProduct.save();

  return await Product.findById(id)
    .populate("category")
    .populate("createdBy")
    .populate("updatedBy");
};

const changeProductAction = async (id, newAction, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid product ID");
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  if (product.status === STATUS.PENDING) {
    throw new Error("Cannot change action while product is pending approval.");
  }

  if (
    (product.action === ACTION.ACTIVE && newAction === ACTION.INACTIVE) ||
    (product.action === ACTION.INACTIVE && newAction === ACTION.ACTIVE)
  ) {
    product.pendingChanges = { action: newAction };
    product.status = STATUS.PENDING;
    product.requestType = "STATUS_CHANGE";
    product.updatedBy = userId;
    await product.save();
    return product;
  } else {
    throw new Error("Invalid action transition");
  }
};

const getActiveProducts = async () => {
  return await Product.find({ action: ACTION.ACTIVE })
    .populate("category", "name action _id")
    .populate("createdBy", "email role _id")
    .populate("updatedBy", "email role _id");
};

const approveProduct = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid product ID");
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");
  if (product.status !== STATUS.PENDING)
    throw new Error("Only pending products can be approved");

  // Lưu lại dữ liệu cũ để chuyển vào pendingChanges
  const oldData = {
    name: product.name,
    category: product.category,
    density: product.density,
    storageTemperature: product.storageTemperature,
    image: product.image,
    reason: product.reason,
    action: product.action,
  };

  // STATUS_CHANGE
  if (product.requestType === "STATUS_CHANGE") {
    if (product.pendingChanges && product.pendingChanges.action) {
      // Cập nhật action mới, lưu action cũ vào pendingChanges
      product.pendingChanges = { ...oldData };
      product.action = product.pendingChanges.action;
    }
    product.status = STATUS.APPROVED;
    product.action = ACTION.ACTIVE;
    product.approveBy = userId;
    await product.save();
    return product;
  }

  // UPDATE
  if (product.requestType === "UPDATE") {
    if (product.pendingChanges) {
      // Nếu có ảnh mới và đã có ảnh cũ thì xóa ảnh cũ trên Cloudinary
      if (product.pendingChanges.image && product.image) {
        try {
          const oldImageUrl = product.image;
          const publicIdMatch = oldImageUrl.match(
            /warehouse-products\/([^\.\/]+)/
          );
          if (publicIdMatch) {
            const publicId = `warehouse-products/${publicIdMatch[1]}`;
            await deleteImage(publicId);
          }
        } catch (error) {
          console.error("Error deleting old product image:", error);
        }
      }
      // Cập nhật các trường từ pendingChanges sang trường chính
      if (product.pendingChanges.name)
        product.name = product.pendingChanges.name;
      if (product.pendingChanges.category)
        product.category = product.pendingChanges.category;
      if (product.pendingChanges.density)
        product.density = product.pendingChanges.density;
      if (product.pendingChanges.storageTemperature)
        product.storageTemperature = product.pendingChanges.storageTemperature;
      if (product.pendingChanges.image)
        product.image = product.pendingChanges.image;
      if (product.pendingChanges.reason)
        product.reason = product.pendingChanges.reason;
      if (product.pendingChanges.action)
        product.action = product.pendingChanges.action;
      // Lưu dữ liệu cũ vào pendingChanges
      product.pendingChanges = { ...oldData };
    }
    product.status = STATUS.APPROVED;
    product.action = ACTION.ACTIVE;
    product.approveBy = userId;
    await product.save();
    return product;
  }

  // CREATE
  product.status = STATUS.APPROVED;
  product.action = ACTION.ACTIVE;
  product.approveBy = userId;
  await product.save();
  return product;
};

const rejectProduct = async (id, userId, note) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid product ID");
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");
  if (product.status !== STATUS.PENDING)
    throw new Error("Only pending products can be rejected");

  if (
    product.requestType === "UPDATE" ||
    product.requestType === "STATUS_CHANGE"
  ) {
    // product.pendingChanges = null;
      product.action = ACTION.ACTIVE;
    product.status = STATUS.REJECTED;
    product.rejectedNote = note;
    product.approveBy = userId;
    await product.save();
    return product;
  }

  // CREATE
  product.status = STATUS.REJECTED;
  product.action = ACTION.INACTIVE;
  product.rejectedNote = note;
  product.approveBy = userId;
  await product.save();
  return product;
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  changeProductAction,
  getActiveProducts,
  approveProduct,
  rejectProduct,
};
