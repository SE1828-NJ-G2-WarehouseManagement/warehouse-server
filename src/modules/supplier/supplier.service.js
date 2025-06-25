import Supplier from "./supplier.model.js";
import { STATUS } from "../../constant/status.constant.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import mongoose from "mongoose";
import User from "../user/user.model.js";
import { ACTION } from "../../constant/action.constant.js";
import SupplierLog from "../supplier/supplierLog.model.js";
import { requestType } from "../../constant/requestType.constant.js";

// lấy ALL supplier
const getAllSuppliers = async (page = 1) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [data, total] = await Promise.all([
    Supplier.find().populate("approveBy").skip(skip).limit(PAGE_SIZE),
    Supplier.countDocuments(),
  ]);

  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

// danh sách nhà cung cấp trạng thái đã được approve và trạng thái active
const getListSuppliers = async (page) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [data, total] = await Promise.all([
    Supplier.find({ status: STATUS.APPROVED, action: ACTION.ACTIVE })
      .populate("approveBy")
      .skip(skip)
      .limit(PAGE_SIZE),
    Supplier.countDocuments({ status: STATUS.APPROVED, action: ACTION.ACTIVE }),
  ]);
  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

// danh sách nhà cung cấp trạng thái đang chờ duyệt và trạng thái inactive
// Thêm field requestType để phân biệt CREATE và UPDATE

const getListSuppliersPending = async (page) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [logs, total] = await Promise.all([
    SupplierLog.find({ status: STATUS.PENDING, action: ACTION.INACTIVE })
      .populate("approveBy")
      .populate("supplierId")
      .populate("createdBy")
      .skip(skip)
      .limit(PAGE_SIZE),
    SupplierLog.countDocuments({
      status: STATUS.PENDING,
      action: ACTION.INACTIVE,
    }),
  ]);

  const data = logs.map((log) => {
    const requestType = log.requestType || log.type;
    const logObject = log.toObject();

    if (requestType === "UPDATE" && log.supplierId) {
      const changes = {};
      const current = log.supplierId;

      if (log.name !== current.name)
        changes.name = { old: current.name, new: log.name };
      if (log.phone !== current.phone)
        changes.phone = { old: current.phone, new: log.phone };
      if (log.email !== current.email)
        changes.email = { old: current.email, new: log.email };
      if (log.address !== current.address)
        changes.address = { old: current.address, new: log.address };
      if (log.taxId !== current.taxId)
        changes.taxId = { old: current.taxId, new: log.taxId };

      return {
        ...logObject,
        requestType,
        changedFields: Object.keys(changes).length > 0 ? changes : undefined,
      };
    }

    return {
      ...logObject,
      requestType,
    };
  });

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

const createSupplier = async (supplierData, user) => {
  const existingName = await Supplier.findOne({ name: supplierData.name });
  if (existingName) {
    throw new Error("Supplier with this name already exists");
  }
  const existingPhone = await Supplier.findOne({ phone: supplierData.phone });
  if (existingPhone) {
    throw new Error("Supplier with this phone number already exists");
  }
  const existingEmail = await Supplier.findOne({ email: supplierData.email });
  if (existingEmail) {
    throw new Error("Supplier with this email already exists");
  }
  const existingTaxId = await Supplier.findOne({ taxId: supplierData.taxId });
  if (existingTaxId) {
    throw new Error("Supplier with this tax ID already exists");
  }

  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }

  const supplier = new Supplier({
    ...supplierData,
    status: STATUS.PENDING,
    action: ACTION.INACTIVE,
  });
  await supplier.save();

  const log = new SupplierLog({
    supplierId: supplier._id,
    name: supplier.name,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    taxId: supplier.taxId,
    status: supplier.status,
    action: supplier.action,
    requestType: requestType.CREATE,
    createdBy: userCurrent._id,
  });
  await log.save();

  return supplier;
};

const updateSupplier = async (id, supplierData, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid supplier ID");
  }

  const currentSupplier = await Supplier.findById(id);
  if (!currentSupplier) {
    throw new Error("Supplier not found");
  }
  if (currentSupplier.action !== ACTION.ACTIVE) {
    throw new Error("Only suppliers with action ACTIVE can be updated");
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

  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
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

  currentSupplier.status = STATUS.PENDING;
  currentSupplier.action = ACTION.INACTIVE;
  await currentSupplier.save();

  const log = new SupplierLog({
    supplierId: id,
    name: supplierData.name || currentSupplier.name,
    phone: supplierData.phone || currentSupplier.phone,
    email: supplierData.email || currentSupplier.email,
    address: supplierData.address || currentSupplier.address,
    taxId: supplierData.taxId || currentSupplier.taxId,
    status: STATUS.PENDING,
    action: ACTION.INACTIVE,
    requestType: requestType.UPDATE,
    createdBy: userCurrent._id,
  });
  await log.save();

  return log;
};

const approveSupplier = async (logId, user) => {
  const userCurrent = await User.findOne({ email: user.email });

  if (!mongoose.Types.ObjectId.isValid(logId)) {
    throw new Error("Invalid supplier log ID");
  }

  const log = await SupplierLog.findById(logId);
  if (!log) {
    throw new Error("Supplier log not found");
  }

  if (log.requestType === requestType.UPDATE && log.supplierId) {
    await Supplier.findByIdAndUpdate(log.supplierId, {
      name: log.name,
      phone: log.phone,
      email: log.email,
      address: log.address,
      taxId: log.taxId,
      status: STATUS.APPROVED,
      action: ACTION.ACTIVE,
      approveBy: userCurrent._id,
    });
  } else if (log.requestType === requestType.CREATE && log.supplierId) {
    await Supplier.findByIdAndUpdate(log.supplierId, {
      status: STATUS.APPROVED,
      action: ACTION.ACTIVE,
      approveBy: userCurrent._id,
    });
  } else {
    throw new Error("Invalid log type or missing supplier reference");
  }

  log.status = STATUS.APPROVED;
  log.action = ACTION.ACTIVE;
  log.approveBy = userCurrent._id;
  await log.save();

  return log;
};

const rejectSupplier = async (logId, user, note) => {
  if (!mongoose.Types.ObjectId.isValid(logId)) {
    throw new Error("Invalid supplier log ID");
  }

  const log = await SupplierLog.findById(logId);
  if (!log || log.status !== STATUS.PENDING) {
    throw new Error("Supplier log not found or not pending");
  }

  const userCurrent = await User.findOne({ email: user.email });

  log.status = STATUS.REJECTED;
  log.action = ACTION.INACTIVE;
  log.rejectedNote = note;
  log.approveBy = userCurrent._id;
  await log.save();

  await Supplier.findByIdAndUpdate(log.supplierId, {
    status: STATUS.REJECTED,
    action: ACTION.INACTIVE,
    approveBy: userCurrent._id,
  });

  return log;
};

export default {
  getListSuppliers,
  getListSuppliersPending,
  getSupplierById,
  createSupplier,
  updateSupplier,
  approveSupplier,
  rejectSupplier,
  getAllSuppliers,
};
