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

const approveInternalTransfer = async (id, userId, destinationZoneId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid internal transfer ID");
  }

  const transfer = await InternalTransfer.findById(id)
    .populate("sourceZoneId")
    .populate("receiver.warehouseId")
    .populate({
      path: "items.zoneItemId",
      populate: {
        path: "itemId",
        populate: {
          path: "productId",
        },
      },
    });

  if (!transfer) {
    throw new Error("Internal transfer not found");
  }

  if (transfer.status !== STATUS.PENDING) {
    throw new Error(
      "Internal transfer can only be approved when status is PENDING"
    );
  }

  // 1. Kiểm tra destination zone có tồn tại và thuộc đúng warehouse không
  const destinationZone = await Zone.findById(destinationZoneId);
  if (!destinationZone) {
    throw new Error("Destination zone not found");
  }

  if (!destinationZone.warehouseId.equals(transfer.receiver.warehouseId._id)) {
    throw new Error("Destination zone must belong to the receiver warehouse");
  }

  // 2. Kiểm tra tất cả items có tồn tại và đủ quantity không
  const sourceZoneItems = [];
  for (const transferItem of transfer.items) {
    const sourceZoneItem = await ZoneItem.findById(transferItem.zoneItemId);
    if (!sourceZoneItem) {
      throw new Error(`Source zone item ${transferItem.zoneItemId} not found`);
    }
    if (sourceZoneItem.quantity < transferItem.quantity) {
      throw new Error(
        `Not enough quantity for item ${transferItem.zoneItemId}. Available: ${sourceZoneItem.quantity}, Requested: ${transferItem.quantity}`
      );
    }
    sourceZoneItems.push({
      sourceZoneItem,
      transferQuantity: transferItem.quantity,
      item: transferItem.zoneItemId.itemId,
      product: transferItem.zoneItemId.itemId.productId,
    });
  }

  // 3. Kiểm tra nhiệt độ tất cả products có phù hợp với destination zone không
  for (const { product } of sourceZoneItems) {
    const isTempCompatible =
      destinationZone.storageTemperature.min >=
        product.storageTemperature.min &&
      destinationZone.storageTemperature.max <= product.storageTemperature.max;

    if (!isTempCompatible) {
      throw new Error(
        `Zone temperature not compatible with product ${product.name}`
      );
    }
  }

  // 4. Tính tổng volume cần chuyển
  let totalVolumeToTransfer = 0;
  for (const { item, product, transferQuantity } of sourceZoneItems) {
    const itemVolume = item.weights / product.density;
    totalVolumeToTransfer += itemVolume * transferQuantity;
  }

  // 5. Kiểm tra sức chứa destination zone
  const availableCapacity =
    destinationZone.totalCapacity - destinationZone.currentCapacity;
  if (availableCapacity < totalVolumeToTransfer) {
    throw new Error(
      `Destination zone does not have enough capacity. Available: ${availableCapacity}, Required: ${totalVolumeToTransfer}`
    );
  }

  // 6. Thực hiện chuyển kho (trừ từ source, cộng vào destination)
  const sourceZone = transfer.sourceZoneId;

  for (const { sourceZoneItem, transferQuantity, item } of sourceZoneItems) {
    // Trừ quantity từ source zone
    sourceZoneItem.quantity -= transferQuantity;

    if (sourceZoneItem.quantity <= 0) {
      // Nếu quantity về 0, xóa khỏi source zone
      await ZoneItem.deleteOne({ _id: sourceZoneItem._id });
    } else {
      // Ngược lại update quantity
      await sourceZoneItem.save();
    }

    // Cộng vào destination zone (tạo mới nếu chưa có)
    let destinationZoneItem = await ZoneItem.findOne({
      zoneId: destinationZoneId,
      itemId: item._id,
    });

    if (destinationZoneItem) {
      destinationZoneItem.quantity += transferQuantity;
    } else {
      destinationZoneItem = new ZoneItem({
        zoneId: destinationZoneId,
        itemId: item._id,
        quantity: transferQuantity,
      });
    }

    await destinationZoneItem.save();
  }

  // 7. Cập nhật sức chứa của 2 zones
  sourceZone.currentCapacity -= totalVolumeToTransfer;
  destinationZone.currentCapacity += totalVolumeToTransfer;

  await sourceZone.save();
  await destinationZone.save();

  // 8. Cập nhật trạng thái transfer
  transfer.status = STATUS.APPROVED;
  transfer.approvedBy = userId;
  transfer.receiver.zoneId = destinationZoneId; // Lưu zone đích đã chọn

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
