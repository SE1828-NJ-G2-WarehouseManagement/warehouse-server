import Warehouse from "./warehouse.model.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import { STATUS } from "../../constant/status.constant.js";
import mongoose from "mongoose";
import { ROLES } from "../../constant/role.constant.js";
import User from "../user/user.model.js";
import Zone from "../zone/zone.model.js";

const createWarehouse = async (data) => {
  // check existing warehouse
  const exist = await Warehouse.findOne({ name: data.name });
  if (exist) {
    throw new Error("Warehouse name already exists");
  }

  // Kiểm tra manager
  if (data.manageBy) {
    const manager = await User.findById(data.manageBy);
    if (!manager) throw new Error("Manager not found");
    if (manager.role !== ROLES.WAREHOUSE_MANAGER) {
      // check role
      throw new Error("Manager must have role WAREHOUSE_MANAGER");
    }
    if (manager.assignedWarehouse) {
      throw new Error("This manager is already assigned to another warehouse");
    }
  }

  // Kiểm tra staffs
  if (data.staffs && data.staffs.length > 0) {
    const staffs = await User.find({ _id: { $in: data.staffs } });
    if (staffs.length !== data.staffs.length) {
      throw new Error("Some staff not found");
    }
    for (const staff of staffs) {
      // check role
      if (staff.role !== ROLES.WAREHOUSE_STAFF) {
        throw new Error(`Staff ${staff.email} must have role WAREHOUSE_STAFF`);
      }
      if (staff.assignedWarehouse) {
        throw new Error(
          `Staff ${staff.email} is already assigned to another warehouse`
        );
      }
    }
  }

  // Tạo warehouse
  const warehouse = new Warehouse(data);
  const savedWarehouse = await warehouse.save();

  // Cập nhật assignedWarehouse cho manager
  if (data.manageBy) {
    await User.findByIdAndUpdate(data.manageBy, {
      assignedWarehouse: savedWarehouse._id,
      role: ROLES.WAREHOUSE_MANAGER,
    });
  }

  // Cập nhật assignedWarehouse cho staffs
  if (data.staffs && data.staffs.length > 0) {
    await User.updateMany(
      { _id: { $in: data.staffs } },
      { assignedWarehouse: savedWarehouse._id, role: ROLES.WAREHOUSE_STAFF }
    );
  }

  return savedWarehouse;
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

  // Lấy warehouse cũ để so sánh và cập nhật user
  const oldWarehouse = await Warehouse.findById(id);
  if (!oldWarehouse) {
    throw new Error("Warehouse not found");
  }

  // Kiểm tra manager
  if (data.manageBy && data.manageBy !== oldWarehouse.manageBy.toString()) {
    const manager = await User.findById(data.manageBy);
    if (!manager) {
      throw new Error("Manage not found");
    }
    // check role
    if (manager.role !== ROLES.WAREHOUSE_MANAGER) {
      throw new Error("Manager must have role WAREHOUSE_MANAGER");
    }
    if (
      manager.assignedWarehouse &&
      manager.assignedWarehouse.toString() !== id
    ) {
      throw new Error("This manager is already assigned to another warehouse");
    }
  }
  // Kiểm tra staffs mới (nếu có truyền)
  if (data.staffs && data.staffs.length > 0) {
    const staffs = await User.find({ _id: { $in: data.staffs } });
    if (staffs.length !== data.staffs.length) {
      throw new Error("Some staff not found");
    }
    for (const staff of staffs) {
      if (staff.role !== ROLES.WAREHOUSE_STAFF) {
        throw new Error(`Staff ${staff.email} must have role WAREHOUSE_STAFF`);
      }
      if (
        staff.assignedWarehouse &&
        staff.assignedWarehouse.toString() !== id
      ) {
        throw new Error(
          `Staff ${staff.email} is already assigned to another warehouse`
        );
      }
    }
  }
  // Cập nhật warehouse
  const warehouse = await Warehouse.findByIdAndUpdate(id, data, { new: true });

  // Nếu đổi manager, reset assignedWarehouse và role cho manager cũ
  if (
    data.manageBy !== undefined &&
    oldWarehouse.manageBy &&
    data.manageBy !== oldWarehouse.manageBy.toString()
  ) {
    await User.findByIdAndUpdate(oldWarehouse.manageBy, {
      assignedWarehouse: null,  
    });
  }

  // Nếu đổi staffs, reset assignedWarehouse và role cho các staff cũ bị loại
  if (
    data.staffs !== undefined &&
    oldWarehouse.staffs &&
    oldWarehouse.staffs.length > 0
  ) {
    const removedStaffs = oldWarehouse.staffs.filter(
      (s) => !data.staffs.includes(s.toString())
    );
    if (removedStaffs.length > 0) {
      await User.updateMany(
        { _id: { $in: removedStaffs } },
        { assignedWarehouse: null }
      );
    }
  }
  // Nếu có manager mới, cập nhật assignedWarehouse và role
  if (data.manageBy) {
    await User.findByIdAndUpdate(data.manageBy, {
      assignedWarehouse: warehouse._id,
      role: ROLES.WAREHOUSE_MANAGER,
    });
  }

  // Nếu có staffs mới, cập nhật assignedWarehouse và role cho các staff mới
  if (data.staffs && data.staffs.length > 0) {
    await User.updateMany(
      { _id: { $in: data.staffs } },
      { assignedWarehouse: warehouse._id, role: ROLES.WAREHOUSE_STAFF }
    );
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

const getWarehousesWithZonesCapacity = async (userId) => {
  // 1. Vẫn lấy user để validate (optional)
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // 2. Lấy TẤT CẢ warehouses - KHÔNG check role
  const warehouses = await Warehouse.find({ status: STATUS.ACTIVE })
    .select("name address currentCapacity totalCapacity status")
    .sort({ name: 1 });

  // 3. Lấy zones cho từng warehouse
  const warehousesWithZones = await Promise.all(
    warehouses.map(async (warehouse) => {
      const zones = await Zone.find({
        warehouseId: warehouse._id,
        status: STATUS.ACTIVE,
      })
        .select("name storageTemperature currentCapacity totalCapacity status")
        .sort({ name: 1 });

      // Tính tổng capacity của warehouse từ zones
      const totalZoneCapacity = zones.reduce(
        (sum, zone) => sum + zone.totalCapacity,
        0
      );
      const currentZoneCapacity = zones.reduce(
        (sum, zone) => sum + zone.currentCapacity,
        0
      );

      return {
        warehouseId: warehouse._id,
        warehouseName: warehouse.name,
        warehouseAddress: warehouse.address,
        warehouseStatus: warehouse.status,
        warehouseCapacity: {
          current: currentZoneCapacity,
          total: totalZoneCapacity,
          percentage:
            totalZoneCapacity > 0
              ? Math.round((currentZoneCapacity / totalZoneCapacity) * 100)
              : 0,
          available: totalZoneCapacity - currentZoneCapacity,
        },
        totalZones: zones.length,
        zones: zones.map((zone) => ({
          zoneId: zone._id,
          zoneName: zone.name,
          storageTemperature: zone.storageTemperature,
          zoneStatus: zone.status,
          capacity: {
            current: zone.currentCapacity,
            total: zone.totalCapacity,
            percentage:
              zone.totalCapacity > 0
                ? Math.round((zone.currentCapacity / zone.totalCapacity) * 100)
                : 0,
            available: zone.totalCapacity - zone.currentCapacity,
          },
        })),
      };
    })
  );

  return warehousesWithZones;
};
const getMyWarehouseWithZonesCapacity = async (userId) => {
  // 1. Lấy thông tin user để có assignedWarehouse
  const user = await User.findById(userId).populate("assignedWarehouse");
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.assignedWarehouse) {
    throw new Error("User must be assigned to a warehouse");
  }

  // 2. Lấy warehouse được assigned (chỉ nếu active)
  const warehouse = await Warehouse.findOne({
    _id: user.assignedWarehouse._id,
    status: STATUS.ACTIVE,
  }).select("name address currentCapacity totalCapacity status");

  if (!warehouse) {
    throw new Error("Assigned warehouse not found or inactive");
  }

  // 3. Lấy zones của warehouse này
  const zones = await Zone.find({
    warehouseId: warehouse._id,
    status: STATUS.ACTIVE,
  })
    .select("name storageTemperature currentCapacity totalCapacity status")
    .sort({ name: 1 });

  // 4. Tính tổng capacity của warehouse từ zones
  const totalZoneCapacity = zones.reduce(
    (sum, zone) => sum + zone.totalCapacity,
    0
  );
  const currentZoneCapacity = zones.reduce(
    (sum, zone) => sum + zone.currentCapacity,
    0
  );

  // 5. Return warehouse với zones info
  return {
    warehouseId: warehouse._id,
    warehouseName: warehouse.name,
    warehouseAddress: warehouse.address,
    warehouseStatus: warehouse.status,
    warehouseCapacity: {
      current: currentZoneCapacity,
      total: totalZoneCapacity,
      percentage:
        totalZoneCapacity > 0
          ? Math.round((currentZoneCapacity / totalZoneCapacity) * 100)
          : 0,
      available: totalZoneCapacity - currentZoneCapacity,
    },
    totalZones: zones.length,
    zones: zones.map((zone) => ({
      zoneId: zone._id,
      zoneName: zone.name,
      storageTemperature: zone.storageTemperature,
      zoneStatus: zone.status,
      capacity: {
        current: zone.currentCapacity,
        total: zone.totalCapacity,
        percentage:
          zone.totalCapacity > 0
            ? Math.round((zone.currentCapacity / zone.totalCapacity) * 100)
            : 0,
        available: zone.totalCapacity - zone.currentCapacity,
      },
    })),
  };
};
export default {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  getAllWarehouseCapacity,
  updateWarehouse,
  changeWarehouseStatus,
  getWarehousesWithZonesCapacity,
  getMyWarehouseWithZonesCapacity,
};
