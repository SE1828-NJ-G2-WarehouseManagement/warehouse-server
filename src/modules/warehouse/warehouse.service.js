import Warehouse from "./warehouse.model.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import { STATUS } from "../../constant/status.constant.js";
import mongoose from "mongoose";
import { ROLES } from "../../constant/role.constant.js";
import User from "../user/user.model.js";
const createWarehouse = async (data) => {
  // check existing warehouse
  const exist = await Warehouse.findOne({ name: data.name });
  if (exist) {
    throw new Error("Warehouse name already exists");
  }
  const warehouse = new Warehouse(data);
  return await warehouse.save();
};

const getWarehouses = async (page) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [data, total] = await Promise.all([
    Warehouse.find()
      .populate("manageBy")
      .populate("staffs")
      .skip(skip)
      .limit(PAGE_SIZE),
    Warehouse.countDocuments({}),
  ]);
  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

const getWarehouseById = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid warehouse ID");
  }
  const warehouse = await Warehouse.findById(id)
    .populate("manageBy")
    .populate("staffs");
  if (!warehouse) {
    throw new Error("Warehouse not found");
  }

  // Nếu không phải admin, lấy user từ DB để kiểm tra assignedWarehouse
  if (user.role !== ROLES.ADMIN_WAREHOUSE) {
    const dbUser = await User.findOne({ email: user.email }); 
    if (
      !dbUser.assignedWarehouse ||
      dbUser.assignedWarehouse.toString() !== warehouse._id.toString()
    ) {
      throw new Error("You do not have permission to access this warehouse");
    }
  }

  return warehouse;
};

const getAllWarehouseCapacity = async (user) => {
  let filter = {};

  if (user.role !== ROLES.ADMIN_WAREHOUSE) {
    // Lấy user từ DB để đảm bảo có assignedWarehouse
    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser || !dbUser.assignedWarehouse) {
      return []; // Không có warehouse nào được assign
    }
    filter = { _id: dbUser.assignedWarehouse };
  }

  const warehouses = await Warehouse.find(filter);
  return warehouses.map((w) => ({
    id: w._id,
    name: w.name,
    address: w.address,
    currentCapacity: w.currentCapacity,
    totalCapacity: w.totalCapacity,
    availableCapacity: w.totalCapacity - w.currentCapacity,
  }));
};

const updateWarehouse = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid warehouse ID");
  }
  // check name
  if (data.name) {
    const exsit = await Warehouse.findOne({
      name: data.name,
      _id: { $ne: id },
    });
    if (exsit) {
      throw new Error("Warehouse name already exists");
    }
  }
  const warehouse = await Warehouse.findByIdAndUpdate(id, data, { new: true });
  if (!warehouse) {
    throw new Error("Warehouse not found");
  }
  return warehouse;
};

const changeWarehouseStatus = async (id, status) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid warehouse ID");
  }
  const warehouse = await Warehouse.findById(id);
  if (!warehouse) {
    throw new Error("Warehouse not found");
  }


  if (![STATUS.ACTIVE, STATUS.INACTIVE].includes(status)) {
    throw new Error("Status must be ACTIVE or INACTIVE");
  }


  if (status === STATUS.INACTIVE) {
    // Chỉ cho phép chuyển sang INACTIVE nếu kho đang ACTIVE và không còn hàng
    if (warehouse.status !== STATUS.ACTIVE) {
      throw new Error("Warehouse is not ACTIVE");
    }
    if (warehouse.currentCapacity > 0) {
      throw new Error("Cannot change status, warehouse has items");
    }
  }


  if (status === STATUS.ACTIVE) {
    // Chỉ cho phép chuyển sang ACTIVE nếu kho đang INACTIVE
    if (warehouse.status !== STATUS.INACTIVE) {
      throw new Error("Warehouse is not INACTIVE");
    }
  }

  warehouse.status = status;
  return await warehouse.save();
};

export default {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  getAllWarehouseCapacity,
  updateWarehouse,
  changeWarehouseStatus,
};
