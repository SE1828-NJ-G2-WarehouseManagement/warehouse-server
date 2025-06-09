import Supplier from "./supplier.model.js";
import { STATUS } from "../../constant/status.constant.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import mongoose from "mongoose";
import User from "../user/user.model.js";

// danh sách nhà cung cấp trạng thái ACTIVE
const getListSuppliers = async (page) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [data, total] = await Promise.all([
    Supplier.find({ status: STATUS.ACTIVE })
      .populate("approveBy")
      .skip(skip)
      .limit(PAGE_SIZE),
    Supplier.countDocuments({ status: STATUS.ACTIVE }),
  ]);
  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

const getListSuppliersPending = async (page) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [data, total] = await Promise.all([
    Supplier.find({ status: STATUS.PENDING })
      .populate("approveBy")
      .skip(skip)
      .limit(PAGE_SIZE),
    Supplier.countDocuments({ status: STATUS.PENDING }),
  ]);

  // Thêm field requestType vào mỗi supplier
  const dataWithType = data.map((supplier) => {
    const isNew = supplier.createdAt.getTime() === supplier.updatedAt.getTime();
    return {
      ...supplier.toObject(),
      requestType: isNew ? "CREATE" : "UPDATE",
    };
  });

  return {
    data: dataWithType,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

const getSupplierById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid supplier ID");
  }
  const supplier = await Supplier.findById(id).populate("approveBy");
  if (!supplier) {
    throw new Error("Supplier not found");
  }
  return supplier;
};

const createSupplier = async (supplierData) => {
  // check trùng name
  const existingName = await Supplier.findOne({ name: supplierData.name });
  if (existingName) {
    throw new Error("Supplier with this name already exists");
  }
  // check trùng phone
  const existingPhone = await Supplier.findOne({ phone: supplierData.phone });
  if (existingPhone) {
    throw new Error("Supplier with this phone number already exists");
  }

  // check trùng email
  const existingEmail = await Supplier.findOne({ email: supplierData.email });
  if (existingEmail) {
    throw new Error("Supplier with this email already exists");
  }

  // check trùng taxId
  const existingTaxId = await Supplier.findOne({
    taxId: supplierData.taxId,
  });
  if (existingTaxId) {
    throw new Error("Supplier with this tax ID already exists");
  }

  const supplier = new Supplier(supplierData);
  await supplier.save();
  return supplier;
};

const updateSupplier = async (id, supplierData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid supplier ID");
  }

  const currentSupplier = await Supplier.findById(id);
  if (!currentSupplier) {
    throw new Error("Supplier not found");
  }
  if (currentSupplier.status !== STATUS.ACTIVE) {
    throw new Error("Only suppliers with status ACTIVE can be updated");
  }

  // Kiểm tra trùng name
  const existingName = await Supplier.findOne({
    name: supplierData.name,
    _id: { $ne: id },
  });
  if (existingName) {
    throw new Error("Supplier with this name already exists");
  }

  // Kiểm tra trùng phone
  const existingPhone = await Supplier.findOne({
    phone: supplierData.phone,
    _id: { $ne: id },
  });
  if (existingPhone) {
    throw new Error("Supplier with this phone number already exists");
  }

  // Kiểm tra trùng email
  const existingEmail = await Supplier.findOne({
    email: supplierData.email,
    _id: { $ne: id },
  });
  if (existingEmail) {
    throw new Error("Supplier with this email already exists");
  }

  // Kiểm tra trùng taxId
  const existingTaxId = await Supplier.findOne({
    taxId: supplierData.taxId,
    _id: { $ne: id },
  });
  if (existingTaxId) {
    throw new Error("Supplier with this tax ID already exists");
  }

  // Kiểm tra nếu không thay đổi gì
  const isSame =
    currentSupplier.name === supplierData.name &&
    currentSupplier.phone === supplierData.phone &&
    currentSupplier.email === supplierData.email &&
    currentSupplier.address === supplierData.address &&
    currentSupplier.taxId === supplierData.taxId;

  if (isSame) {
    throw new Error("you must change at least one field to update");
  }

  // Khi update sẽ chuyển status thành PENDING
  supplierData.status = STATUS.PENDING;

  const supplier = await Supplier.findByIdAndUpdate(id, supplierData, {
    new: true,
    runValidators: true,
  }).populate("approveBy");

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  return supplier;
};

const approveSupplier = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid supplier ID");
  }

  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new Error("Supplier not found");
  }

  if (supplier.status !== STATUS.PENDING) {
    throw new Error("Only suppliers with status PENDING can be approved");
  }
  // Kiểm tra quyền của user
  const userCurrent = await User.findOne({ email: user.email });

  supplier.status = STATUS.ACTIVE;
  supplier.approveBy = userCurrent._id;

  await supplier.save();
  return supplier;
};

const rejectSupplier = async (id, user, note) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid supplier ID");
  }

  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new Error("Supplier not found");
  }

  if (supplier.status !== STATUS.PENDING) {
    throw new Error("Only suppliers with status PENDING can be rejected");
  }

  // Kiểm tra quyền của user
  const userCurrent = await User.findOne({ email: user.email });

  supplier.status = STATUS.REJECTED;
  supplier.rejectedNote = note;
  supplier.approveBy = userCurrent._id;

  await supplier.save();
  return supplier;
};

export default {
  getListSuppliers,
  getListSuppliersPending,
  getSupplierById,
  createSupplier,
  updateSupplier,
  approveSupplier,
  rejectSupplier,
};
