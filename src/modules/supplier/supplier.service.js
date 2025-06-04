import Supplier from "./supplier.model.js";
import { STATUS } from "../../constant/status.constant.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import mongoose from "mongoose";
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
  return {
    data,
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

export default {
  getListSuppliers,
  getListSuppliersPending,
  getSupplierById,
  createSupplier,
};
