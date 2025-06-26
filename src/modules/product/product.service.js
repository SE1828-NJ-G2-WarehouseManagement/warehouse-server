import Product from "./product.model.js";
import mongoose from "mongoose";
import { STATUS } from "../../constant/status.constant.js";
import Category from "../category/category.model.js";

const createProduct = async (data, userId) => {
  const exist = await Product.findOne({ name: data.name });
  const existCategory = await Category.findOne({ _id: data.category });
  if (exist) throw new Error("Product name already exists");
  if (!existCategory) throw new Error("Category not found");
  const product = new Product({
    ...data,
    status: STATUS.PENDING,
    createdBy: userId,
    updatedBy: userId,
  });
  return await product.save();
};

const getProducts = async () => {
  return await Product.find()
    .populate("category")
    .populate("createdBy")
    .populate("updatedBy");
};

const getProductById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid product ID");
  const product = await Product.findById(id)
    .populate("category")
    .populate("createdBy")
    .populate("updatedBy");
  if (!product) throw new Error("Product not found");
  return product;
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
    } else {
      continue;
    }
  }
  if (allSame) throw new Error("Product already exists");

  const query = { ...data, _id: { $ne: id } };
  const exist = await Product.findOne(query);
  if (exist) throw new Error("Product already exists");

  data.status = STATUS.PENDING;
  data.updatedBy = userId;

  const product = await Product.findByIdAndUpdate(id, data, { new: true });
  if (!product) throw new Error("Product not found");
  return product;
};

const changeProductStatus = async (id, newStatus, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid product ID");
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  const currentStatus = product.status;

  if (
    (currentStatus === "PENDING" &&
      (newStatus === "ACTIVE" || newStatus === "INACTIVE")) ||
    (currentStatus === "ACTIVE" && newStatus === "INACTIVE") ||
    (currentStatus === "INACTIVE" && newStatus === "PENDING")
  ) {
    product.status = newStatus;
    product.approveBy = userId;
    return await product.save();
  } else {
    throw new Error("Invalid status transition");
  }
};

const getActiveProducts = async () => {
  return await Product.find({ action: "ACTIVE" })
    .populate("category", "name action _id")
    .populate("createdBy", "email role _id")
    .populate("updatedBy", "email role _id");
};

export default {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  changeProductStatus,
  getActiveProducts,
};
