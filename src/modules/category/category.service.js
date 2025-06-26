import Category from "./category.model.js";
import mongoose from "mongoose";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import { STATUS } from "../../constant/status.constant.js";
import { ACTION } from "../../constant/action.constant.js";


const createCategory = async (data, userId) => {
  const exist = await Category.findOne({ name: data.name });
  if (exist) {
    throw new Error("Category name already exists");
  }
  const category = new Category({
    ...data,
    status: STATUS.PENDING,
    createdBy: userId,
    updatedBy: userId,
  });
  return await category.save();
};

const getCategories = async (page = 1) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [data, total] = await Promise.all([
    Category.find()
      .populate("createdBy", "firstName lastName phone _id")
      .populate("updatedBy", "firstName lastName phone _id")
      .skip(skip)
      .limit(PAGE_SIZE),
    Category.countDocuments({}),
  ]);
  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

const getCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }
  const category = await Category.findById(id).populate("createdBy", "firstName lastName phone _id")
  .populate("updatedBy", "firstName lastName phone _id");
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

const updateCategory = async (id, data, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }

  const currentCategory = await Category.findById(id);
  if (!currentCategory) {
    throw new Error("Category not found");
  }

  if (data.name) {
    const existOther = await Category.findOne({
      name: data.name,
      _id: { $ne: id },
    });
    if (existOther) {
      throw new Error("Category name already exists");
    }

    if (currentCategory.name === data.name) {
      throw new Error("Category name already exists");
    }
  }

  // if (data.reason && currentCategory.reason === data.reason) {
  //   throw new Error("Category reason already exists");
  // }

  const updateData = {
    ...data,
    status: STATUS.PENDING,
    approveBy: null, 
    updatedBy: userId,
  };

  console.log("Update data with userId:", updateData);

  const category = await Category.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .populate("createdBy", "firstName lastName phone _id")
    .populate("updatedBy", "firstName lastName phone _id");

  return category;
};

const changeCategoryStatus = async (id, newStatus, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }
  const category = await Category.findById(id);
  if (!category) {
    throw new Error("Category not found");
  }

  const currentStatus = category.status;

  if (
    (currentStatus === "PENDING" &&
      (newStatus === "ACTIVE" || newStatus === "INACTIVE")) ||
    (currentStatus === "ACTIVE" && newStatus === "INACTIVE") ||
    (currentStatus === "INACTIVE" && newStatus === "PENDING")
  ) {
    category.status = newStatus;
    category.approveBy = userId;
    return await category.save();
  } else {
    throw new Error("Invalid status transition");
  }
};

const approveCategory = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid category ID");
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");
  if (category.status !== STATUS.PENDING)
    throw new Error("Only pending categories can be approved");

  category.status = STATUS.APPROVED;
  category.action = ACTION.ACTIVE;
  category.approveBy = userId;
  await category.save();
  return category;
};

const rejectCategory = async (id, userId, note) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid category ID");
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");
  if (category.status !== STATUS.PENDING)
    throw new Error("Only pending categories can be rejected");

  category.status = STATUS.REJECTED;
  category.action = ACTION.INACTIVE;
  category.rejectedNote = note;
  category.approveBy = userId;
  await category.save();
  return category;
};

const getActiveCategories = async () => {
  return await Category.find({ action: ACTION.ACTIVE });
};

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  changeCategoryStatus,
  approveCategory,
  rejectCategory,
  getActiveCategories,
};
