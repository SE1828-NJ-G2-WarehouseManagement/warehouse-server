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
    action: ACTION.INACTIVE,
    requestType: "CREATE",
    pendingChanges: null,
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
      .sort({
        status: 1
      })
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

const getListCategories = async (page = 1, name = '', status = '', type = '') => {
  const skip = (page - 1) * PAGE_SIZE;

  const query = {};
  if (name) {
    query.name = { $regex: name, $options: 'i' };
  }

  if (status && status !== '') {
    query.status = status;
  }

  if (type && type !== '') {
    query.requestType = type;
  }

  const [data, total] = await Promise.all([
    Category.find(query)
      .populate("createdBy", "firstName lastName phone _id")
      .populate("updatedBy", "firstName lastName phone _id")
      .sort({
        status: 1
      })
      .skip(skip)
      .limit(PAGE_SIZE),
    Category.countDocuments(query), // Áp dụng query vào countDocuments
  ]);

  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};


const filterCategoriesByName = async (name, page = 1) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [data, total] = await Promise.all([
    Category.find({ name: new RegExp(name, "i") })
      .populate("createdBy", "firstName lastName phone _id")
      .populate("updatedBy", "firstName lastName phone _id")
      .sort({ status: 1 })
      .skip(skip)
      .limit(PAGE_SIZE),
    Category.countDocuments({ name: new RegExp(name, "i") }),
  ]);
  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

const getCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }
  const category = await Category.findById(id).populate("createdBy", "firstName lastName phone _id")
    .populate("updatedBy", "firstName lastName phone _id").populate("approveBy", "firstName lastName phone _id");
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
    const existPending = await Category.findOne({
      "pendingChanges.name": data.name,
      _id: { $ne: id },
    });
    if (existPending) {
      throw new Error("Category name is pending approval");
    }
  }

  currentCategory.requestType = "UPDATE";
  currentCategory.status = STATUS.PENDING;
  currentCategory.pendingChanges = {
    ...(data.name && { name: data.name }),
    ...(data.status && { status: data.status }),
    ...(data.action && { action: data.action }),
  };
  currentCategory.updatedBy = userId;
  await currentCategory.save();

  return await Category.findById(id)
    .populate("createdBy", "firstName lastName phone _id")
    .populate("updatedBy", "firstName lastName phone _id")
    .populate("approveBy", "firstName lastName phone _id");
};

const changeCategoryStatus = async (id, newAction, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID");
  }
  const category = await Category.findById(id)
    .populate("createdBy", "firstName lastName phone _id")
    .populate("updatedBy", "firstName lastName phone _id")
    .populate("approveBy", "firstName lastName phone _id");
  if (!category) {
    throw new Error("Category not found");
  }

  if (category.status === STATUS.PENDING) {
    throw new Error("Cannot change action while category is pending approval.");
  }

  if (
    (category.action === ACTION.ACTIVE && newAction === ACTION.INACTIVE) ||
    (category.action === ACTION.INACTIVE && newAction === ACTION.ACTIVE)
  ) {
    category.pendingChanges = { action: newAction };
    category.status = STATUS.PENDING;
    category.requestType = "STATUS_CHANGE";
    category.updatedBy = userId;
    await category.save();
    return category;
  } else {
    throw new Error("Invalid action transition");
  }
};

const approveCategory = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid category ID");
  const category = await Category.findById(id)
    .populate("createdBy", "firstName lastName phone _id")
    .populate("updatedBy", "firstName lastName phone _id");
  if (!category) throw new Error("Category not found");
  if (category.status !== STATUS.PENDING)
    throw new Error("Only pending categories can be approved");

  if (
    category.requestType === "UPDATE" ||
    category.requestType === "STATUS_CHANGE"
  ) {
    if (category.pendingChanges) {
      if (category.pendingChanges.name)
        category.name = category.pendingChanges.name;
      if (category.pendingChanges.status)
        category.status = category.pendingChanges.status;
      if (category.pendingChanges.action)
        category.action = category.pendingChanges.action;
    }
    category.status = STATUS.APPROVED;
    // category.pendingChanges = null;
    // category.requestType = null;
    category.approveBy = userId;  
    await category.save();
    return category;
  }
  category.status = STATUS.APPROVED;
  category.action = ACTION.ACTIVE;
  category.approveBy = userId;
  await category.save();
  return category;
};

const rejectCategory = async (id, userId, note) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid category ID");
  const category = await Category.findById(id)
    .populate("createdBy", "firstName lastName phone _id")
    .populate("updatedBy", "firstName lastName phone _id");
  if (!category) throw new Error("Category not found");
  if (category.status !== STATUS.PENDING)
    throw new Error("Only pending categories can be rejected");

  if (
    category.requestType === "UPDATE" ||
    category.requestType === "STATUS_CHANGE"
  ) {
    // category.pendingChanges = null;
    // category.requestType = null;
    category.status = STATUS.REJECTED;
    category.rejectedNote = note;
    category.approveBy = userId;
    await category.save();
    return category;
  }

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
  filterCategoriesByName,
  getListCategories
};
