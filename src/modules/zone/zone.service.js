import Zone from "./zone.model.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import { STATUS } from "../../constant/status.constant.js";

import User from "../user/user.model.js";
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
export default {
  getZones,
  getZoneCapacity,
};
