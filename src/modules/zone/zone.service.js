import Zone from "./zone.model.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import { STATUS } from "../../constant/status.constant.js";
import { ROLES } from "../../constant/role.constant.js";
import User from "../user/user.model.js";
import Warehouse from "../warehouse/warehouse.model.js";


const getZoneWithoutPagination = async (user) => {
  // Lấy user theo email
  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }
  // Lấy zone theo assignedWarehouse
  const zones = await Zone.find({ warehouseId: userCurrent.assignedWarehouse });
  if (!zones || zones.length === 0) {
    throw new Error("No zones found for this warehouse");
  }
  return zones;
};

// Warehouse Manager and Staff can only view zones of their assigned warehouse
const getZones = async (user, page) => {
  const skip = (page - 1) * PAGE_SIZE;

  // lấy user theo email
  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }
  // lọc theo assignedWarehouse
  const filter = { warehouseId: userCurrent.assignedWarehouse };
  const [data, total] = await Promise.all([
    Zone.find(filter).populate("warehouseId").skip(skip).limit(PAGE_SIZE),
    Zone.countDocuments(filter),
  ]);
  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

const getZoneCapacity = async (user) => {
  // Lấy user theo email
  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }
  // Lấy zone theo assignedWarehouse
  const zones = await Zone.find({ warehouseId: userCurrent.assignedWarehouse });
  if (!zones || zones.length === 0) {
    throw new Error("No zones found for this warehouse");
  }

  const zoneCapacities = zones.map((zone) => ({
    zoneId: zone._id,
    name: zone.name,

    storageTemperature: {
      min: zone.storageTemperature.min,
      max: zone.storageTemperature.max,
    },
    currentCapacity: zone.currentCapacity,
    totalCapacity: zone.totalCapacity,
    availableCapacity: zone.totalCapacity - zone.currentCapacity,
  }));

  return zoneCapacities;
};

const getZoneById = async (user, zoneId) => {
  // Lấy user theo email
  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }
  // Lấy zone theo assignedWarehouse
  const zone = await Zone.findOne({
    _id: zoneId,
    warehouseId: userCurrent.assignedWarehouse,
  });
  if (!zone) {
    throw new Error(
      "Zone not found or does not belong to the user's warehouse"
    );
  }
  return zone;
};

const createZone = async (user, zoneData) => {
  // Lấy user theo email
  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }

  // Kiểm tra role phải là Warehouse Manager
  if (userCurrent.role !== ROLES.WAREHOUSE_MANAGER) {
    throw new Error("You do not have permission to create a zone");
  }

  const warehouse = await Warehouse.findById(userCurrent.assignedWarehouse);

  // kiểm tra Warehouse Manager có quyền tạo zone trong warehouse không
  if (!userCurrent.assignedWarehouse.equals(warehouse._id)) {
    throw new Error(
      "You do not have permission to create a zone in this warehouse"
    );
  }

  // Kiểm tra warehouse còn đủ để tạo zone mới không
  if (!warehouse) {
    throw new Error("Warehouse not found");
  }
  if (warehouse.status !== STATUS.ACTIVE) {
    throw new Error("Warehouse is not active");
  }

  // Tính tổng totalCapacity các zone hiện tại trong kho
  const zones = await Zone.find({ warehouseId: warehouse._id });
  const totalZoneCapacity = zones.reduce((sum, z) => sum + z.totalCapacity, 0);

  if (totalZoneCapacity + zoneData.totalCapacity > warehouse.totalCapacity) {
    throw new Error(
      "Not enough capacity in the warehouse to create a new zone"
    );
  }

  // Kiểm tra zone name đã tồn tại trong warehouse chưa
  const existingZone = await Zone.findOne({
    name: zoneData.name,
    warehouseId: userCurrent.assignedWarehouse,
  });
  if (existingZone) {
    throw new Error("Zone name already exists");
  }
  // Tạo zone mới
  const newZone = new Zone({
    ...zoneData,
    warehouseId: userCurrent.assignedWarehouse,
  });
  await newZone.save();
  return newZone;
};

const updateZone = async (user, zoneId, zoneData) => {
  // Lấy user theo email
  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }
  // Kiểm tra role phải là Warehouse Manager
  if (userCurrent.role !== ROLES.WAREHOUSE_MANAGER) {
    throw new Error("You do not have permission to update a zone");
  }

  // Lấy zone theo assignedWarehouse
  const zone = await Zone.findOne({
    _id: zoneId,
    warehouseId: userCurrent.assignedWarehouse,
  });
  if (!zone) {
    throw new Error(
      "Zone not found or does not belong to the user's warehouse"
    );
  }

  // Kiểm tra warehouse còn đủ để cập nhật zone không
  const warehouse = await Warehouse.findById(userCurrent.assignedWarehouse);
  if (!warehouse) {
    throw new Error("Warehouse not found");
  }
  if (warehouse.status !== STATUS.ACTIVE) {
    throw new Error("Warehouse is not active");
  }
  // Tính tổng totalCapacity các zone hiện tại trong kho
  const zones = await Zone.find({ warehouseId: warehouse._id });
  const totalZoneCapacity = zones.reduce(
    (sum, z) => sum + (z._id.equals(zoneId) ? 0 : z.totalCapacity),
    0
  );
  // Kiểm tra tổng capacity sau khi cập nhật có vượt quá totalCapacity của warehouse không
  if (
    totalZoneCapacity + (zoneData.totalCapacity || zone.totalCapacity) >
    warehouse.totalCapacity
  ) {
    throw new Error("Not enough capacity in the warehouse to update the zone");
  }

  // Kiểm tra zone name đã tồn tại trong warehouse chưa
  const existingZone = await Zone.findOne({
    name: zoneData.name,
    warehouseId: userCurrent.assignedWarehouse,
    _id: { $ne: zoneId },
  });
  if (existingZone) {
    throw new Error("Zone name already exists");
  }

  // Cập nhật zone
  const updatedZone = await Zone.findByIdAndUpdate(
    zoneId,
    { ...zoneData, warehouseId: userCurrent.assignedWarehouse },
    { new: true }
  );
  return updatedZone;
};

const changeStatusZone = async (user, zoneId, status) => {
  // Lấy user theo email
  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }
  // Kiểm tra role phải là Warehouse Manager
  if (userCurrent.role !== ROLES.WAREHOUSE_MANAGER) {
    throw new Error(
      "You do not have permission to change the status of a zone"
    );
  }
  // Lấy zone theo assignedWarehouse
  const zone = await Zone.findOne({
    _id: zoneId,
    warehouseId: userCurrent.assignedWarehouse,
  });
  if (!zone) {
    throw new Error(
      "Zone not found or does not belong to the user's warehouse"
    );
  }
  // Kiểm tra trạng thái zone
  if (![STATUS.ACTIVE, STATUS.INACTIVE].includes(status)) {
    throw new Error("Status must be ACTIVE or INACTIVE.");
  }

  // Chỉ cho phép chuyển sang INACTIVE nếu zone đang ACTIVE và không còn hàng
  if (status === STATUS.INACTIVE) {
    if (zone.status !== STATUS.ACTIVE) {
      throw new Error("Zone is not active");
    }
    if (zone.currentCapacity > 0) {
      throw new Error("Zone cannot be inactive while it has items");
    }
  }

  // Chỉ cho phép chuyển sang ACTIVE nếu zone đang INACTIVE
  if (status === STATUS.ACTIVE) {
    if (zone.status !== STATUS.INACTIVE) {
      throw new Error("Zone is not inactive");
    }
  }

  // Cập nhật trạng thái zone
  zone.status = status;
  await zone.save();
  return zone;
};

export default {
  getZones,
  getZoneCapacity,
  getZoneById,
  createZone,
  updateZone,
  changeStatusZone,
  getZoneWithoutPagination,
  changeStatusZone
};
