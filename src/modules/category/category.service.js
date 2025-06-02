import Category from "./category.model.js";
import mongoose from "mongoose";

const createCategory = async (data) => {
  const exist = await Category.findOne({ name: data.name });
  if (exist) {
    throw new Error("Category name already exists");
  }
  const category = new Category(data);
  return await category.save();
};

const getCategories = async () => {
  return await Category.find().populate("createdBy").populate("updatedBy");
};

const getCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }
  const category = await Category.findById(id).populate("createdBy").populate("updatedBy");
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

const updateCategory = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }
  if (data.name) {
    const exist = await Category.findOne({ name: data.name, _id: { $ne: id } });
    if (exist) {
      throw new Error("Category name already exists");
    }
  }
  const category = await Category.findByIdAndUpdate(id, data, { new: true });
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

const changeCategoryStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }
  const category = await Category.findById(id);
  if (!category) {
    throw new Error("Category not found");
  }
  category.status = status;
  return await category.save();
};

export default {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  changeCategoryStatus,
};
