import Warehouse from "./warehouse.model.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import { STATUS } from "../../constant/status.constant.js";
import mongoose from "mongoose";
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

const getWarehouseById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid warehouse ID");
  }
  const warehouse = await Warehouse.findById(id)
    .populate("manageBy")
    .populate("staffs");
  if (!warehouse) {
    throw new Error("Warehouse not found");
  }
  return warehouse;
};

const getAllWarehouseCapacity = async () => {
  const warehouses = await Warehouse.find();
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
  if(data.name){
    const exsit = await Warehouse.findOne({name: data.name, _id: {$ne: id}});
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
  if(!mongoose.Types.ObjectId.isValid(id)){
    throw new Error("Invalid warehouse ID");
  }
  const warehouse = await Warehouse.findById(id);
  if (!warehouse) {
    throw new Error("Warehouse not found");
  }
  // check còn hàng trong kho không
  if (warehouse.currentCapacity > 0) {
    throw new Error("Cannot change status, warehouse has items");
  }
  if (warehouse.status !== STATUS.ACTIVE) {
    throw new Error("Warehouse is not ACTIVE");
  }
  warehouse.status = STATUS.INACTIVE;
  return await warehouse.save();
}

export default {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  getAllWarehouseCapacity,
  updateWarehouse,
  changeWarehouseStatus,
};
