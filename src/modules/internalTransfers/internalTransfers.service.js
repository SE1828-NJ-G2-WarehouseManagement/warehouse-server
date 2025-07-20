import InternalTransfer from "./internalTransfers.model.js";
import ZoneItem from "../zoneitem/zoneItem.model.js";
import Zone from "../zone/zone.model.js";
import Warehouse from "../warehouse/warehouse.model.js";
import User from "../user/user.model.js";
import mongoose from "mongoose";
import { STATUS } from "../../constant/status.constant.js";

const createInternalTransfer = async (data, userId) => {
  // 1. Lấy thông tin user để có assignedWarehouse
  const user = await User.findById(userId).populate("assignedWarehouse");
  if (!user || !user.assignedWarehouse) {
    throw new Error("User must be assigned to a warehouse");
  }

  const sourceWarehouseId = user.assignedWarehouse._id;

  // 2. Lấy thông tin tất cả zoneItems
  const zoneItemIds = data.items.map((item) => item.zoneItemId);
  const zoneItems = await ZoneItem.find({ _id: { $in: zoneItemIds } }).populate(
    {
      path: "zoneId",
      populate: {
        path: "warehouseId",
      },
    }
  );

  if (zoneItems.length !== zoneItemIds.length) {
    throw new Error("Some zone items not found");
  }

  // 3. Kiểm tra tất cả zoneItems có thuộc warehouse của user không
  const invalidItems = zoneItems.filter(
    (zoneItem) => !zoneItem.zoneId.warehouseId._id.equals(sourceWarehouseId)
  );
  if (invalidItems.length > 0) {
    throw new Error("Some zone items do not belong to your assigned warehouse");
  }

  // 4. Kiểm tra tất cả zoneItems có cùng zoneId không
  const firstZoneId = zoneItems[0].zoneId._id;
  const differentZoneItems = zoneItems.filter(
    (zoneItem) => !zoneItem.zoneId._id.equals(firstZoneId)
  );
  if (differentZoneItems.length > 0) {
    throw new Error("All zone items must belong to the same zone");
  }

  // 5. Kiểm tra số lượng có đủ không
  const quantityErrors = [];
  data.items.forEach((item) => {
    const zoneItem = zoneItems.find(
      (zi) => zi._id.toString() === item.zoneItemId
    );
    if (zoneItem && zoneItem.quantity < item.quantity) {
      quantityErrors.push(
        `Item ${item.zoneItemId}: Available ${zoneItem.quantity}, Requested ${item.quantity}`
      );
    }
  });
  if (quantityErrors.length > 0) {
    throw new Error(`Not enough quantity: ${quantityErrors.join("; ")}`);
  }

  // 6. Kiểm tra destination warehouse có tồn tại và khác source warehouse không
  const destinationWarehouse = await Warehouse.findById(
    data.receiver.warehouseId
  );
  if (!destinationWarehouse) {
    throw new Error("Destination warehouse not found");
  }

  if (sourceWarehouseId.equals(data.receiver.warehouseId)) {
    throw new Error(
      "Destination warehouse must be different from source warehouse"
    );
  }

  // 7. Tạo internal transfer
  const internalTransfer = new InternalTransfer({
    sourceWarehouseId,
    sourceZoneId: firstZoneId,
    items: data.items,
    receiver: {
      warehouseId: data.receiver.warehouseId,
      zoneId: null,
    },
    reason: data.reason,
    status: STATUS.PENDING,
    rejectedNote: null,
    createdBy: userId,
  });

  return await internalTransfer.save();
};

const getInternalTransfers = async () => {
  return await InternalTransfer.find()
    .populate("sourceWarehouseId", "name address")
    .populate("sourceZoneId", "name storageTemperature")
    .populate({
      path: "items.zoneItemId",
      populate: {
        path: "itemId",
        populate: {
          path: "productId",
          select: "name density",
        },
      },
    })
    .populate("receiver.warehouseId", "name address")
    .populate("receiver.zoneId", "name storageTemperature")
    .populate("createdBy", "email firstName lastName")
    .populate("approvedBy", "email firstName lastName")
    .sort({ createdAt: -1 });
};

const getInternalTransferById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid internal transfer ID");
  }

  const transfer = await InternalTransfer.findById(id)
    .populate("sourceWarehouseId", "name address")
    .populate("sourceZoneId", "name storageTemperature")
    .populate({
      path: "items.zoneItemId",
      populate: {
        path: "itemId zoneId",
        populate: {
          path: "productId",
        },
      },
    })
    .populate("receiver.warehouseId", "name address")
    .populate("receiver.zoneId", "name storageTemperature")
    .populate("createdBy", "email firstName lastName")
    .populate("approvedBy", "email firstName lastName");

  if (!transfer) {
    throw new Error("Internal transfer not found");
  }

  return transfer;
};

const updateInternalTransfer = async (id, data, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid internal transfer ID");
  }

  const transfer = await InternalTransfer.findById(id);
  if (!transfer) {
    throw new Error("Internal transfer not found");
  }

  if (transfer.status !== STATUS.PENDING) {
    throw new Error(
      "Internal transfer can only be updated when status is PENDING"
    );
  }

  // Chỉ cho phép người tạo cập nhật
  if (!transfer.createdBy.equals(userId)) {
    throw new Error("You can only update your own internal transfer");
  }

  // Cập nhật items nếu có
  if (data.items) {
    // Kiểm tra logic tương tự như create
    const zoneItemIds = data.items.map((item) => item.zoneItemId);
    const zoneItems = await ZoneItem.find({
      _id: { $in: zoneItemIds },
    }).populate({
      path: "zoneId",
      populate: {
        path: "warehouseId",
      },
    });

    if (zoneItems.length !== zoneItemIds.length) {
      throw new Error("Some zone items not found");
    }

    // Check cùng zone
    const firstZoneId = zoneItems[0].zoneId._id;
    const differentZoneItems = zoneItems.filter(
      (zoneItem) => !zoneItem.zoneId._id.equals(firstZoneId)
    );
    if (differentZoneItems.length > 0) {
      throw new Error("All zone items must belong to the same zone");
    }

    // Check quantity
    const quantityErrors = [];
    data.items.forEach((item) => {
      const zoneItem = zoneItems.find(
        (zi) => zi._id.toString() === item.zoneItemId
      );
      if (zoneItem && zoneItem.quantity < item.quantity) {
        quantityErrors.push(
          `Item ${item.zoneItemId}: Available ${zoneItem.quantity}, Requested ${item.quantity}`
        );
      }
    });
    if (quantityErrors.length > 0) {
      throw new Error(`Not enough quantity: ${quantityErrors.join("; ")}`);
    }

    transfer.items = data.items;
    transfer.sourceZoneId = firstZoneId;
  }

  // Cập nhật receiver
  if (data.receiver) {
    if (data.receiver.warehouseId) {
      const destinationWarehouse = await Warehouse.findById(
        data.receiver.warehouseId
      );
      if (!destinationWarehouse) {
        throw new Error("Destination warehouse not found");
      }

      if (transfer.sourceWarehouseId.equals(data.receiver.warehouseId)) {
        throw new Error(
          "Destination warehouse must be different from source warehouse"
        );
      }

      transfer.receiver.warehouseId = data.receiver.warehouseId;
    }

    if (data.receiver.zoneId) {
      transfer.receiver.zoneId = data.receiver.zoneId;
    }
  }

  if (data.reason) {
    transfer.reason = data.reason;
  }

  return await transfer.save();
};

const approveInternalTransfer = async (id, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid internal transfer ID");
  }

  const transfer = await InternalTransfer.findById(id);
  if (!transfer) {
    throw new Error("Internal transfer not found");
  }

  if (transfer.status !== STATUS.PENDING) {
    throw new Error(
      "Internal transfer can only be approved when status is PENDING"
    );
  }

  // TODO: Thực hiện logic chuyển kho (trừ quantity từ source, cộng vào destination)

  transfer.status = STATUS.APPROVED;
  transfer.approvedBy = userId;

  return await transfer.save();
};

const rejectInternalTransfer = async (id, userId, rejectedNote) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid internal transfer ID");
  }

  const transfer = await InternalTransfer.findById(id);
  if (!transfer) {
    throw new Error("Internal transfer not found");
  }

  if (transfer.status !== STATUS.PENDING) {
    throw new Error(
      "Internal transfer can only be rejected when status is PENDING"
    );
  }

  transfer.status = STATUS.REJECTED;
  transfer.rejectedNote = rejectedNote;
  transfer.approvedBy = userId;

  return await transfer.save();
};

export default {
  createInternalTransfer,
  getInternalTransfers,
  getInternalTransferById,
  updateInternalTransfer,
  approveInternalTransfer,
  rejectInternalTransfer,
};
