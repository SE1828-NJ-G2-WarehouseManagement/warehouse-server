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
    status: STATUS.PENDING,
    rejectedNote: null,
    createdBy: userId,
  });

  const savedTransfer = await internalTransfer.save();

  const sourceZone = await Zone.findById(firstZoneId);
  const sourceWarehouse = await Warehouse.findById(sourceWarehouseId);
  let totalVolume = 0;
  for (const item of data.items) {
    const zoneItem = await ZoneItem.findById(item.zoneItemId).populate({
      path: "itemId",
      populate: { path: "productId", select: "density" },
    });
    if (!zoneItem) continue;
    zoneItem.quantity -= item.quantity;
    if (zoneItem.quantity <= 0) {
      await ZoneItem.deleteOne({ _id: zoneItem._id });
    } else {
      await zoneItem.save();
    }
    const weights = zoneItem.itemId.weights;
    const density = zoneItem.itemId.productId.density;
    totalVolume += (weights / density) * item.quantity;
  }
  sourceZone.currentCapacity -= totalVolume;
  if (sourceZone.currentCapacity < 0) sourceZone.currentCapacity = 0;
  await sourceZone.save();

  sourceWarehouse.currentCapacity -= totalVolume;
  if (sourceWarehouse.currentCapacity < 0) sourceWarehouse.currentCapacity = 0;
  await sourceWarehouse.save();

  return savedTransfer;
};

const getInternalTransfers = async (userId) => {
  // 1. Lấy thông tin user để có assignedWarehouse
  const user = await User.findById(userId).populate("assignedWarehouse");
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.assignedWarehouse) {
    throw new Error("User must be assigned to a warehouse");
  }

  const userWarehouseId = user.assignedWarehouse._id;

  // 2. Chỉ lấy những internal transfers có receiver.warehouseId trùng với warehouse của user
  return await InternalTransfer.find({
    "receiver.warehouseId": userWarehouseId,
  })
    .populate("sourceWarehouseId", "name address")
    .populate("sourceZoneId", "name storageTemperature")
    .populate({
      path: "items.zoneItemId",
      populate: {
        path: "itemId",
        populate: {
          path: "productId",
          select: "name density storageTemperature image",
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
      populate: [
        {
          path: "itemId",
          populate: {
            path: "productId",
            select: "name density storageTemperature image",
          },
        },
        {
          path: "zoneId",
          select: "name storageTemperature",
        },
      ],
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
      populate: [
        {
          path: "itemId",
          populate: {
            path: "productId",
            select: "name density storageTemperature",
          },
        },
        {
          path: "zoneId",
        },
      ],
    });

  if (!transfer) throw new Error("Internal transfer not found");
  if (transfer.status !== STATUS.PENDING)
    throw new Error(
      "Internal transfer can only be approved when status is PENDING"
    );

  // 1. Kiểm tra destination zone và warehouse
  const destinationZone = await Zone.findById(destinationZoneId);
  if (!destinationZone) throw new Error("Destination zone not found");
  if (!destinationZone.warehouseId.equals(transfer.receiver.warehouseId._id)) {
    throw new Error("Destination zone must belong to the receiver warehouse");
  }
  const destinationWarehouse = await Warehouse.findById(
    destinationZone.warehouseId
  );

  // 2. Tính tổng volume cần chuyển
  let totalVolumeToTransfer = 0;
  for (const transferItem of transfer.items) {
    const item = transferItem.zoneItemId.itemId;
    const product = item.productId;
    const weights = item.weights;
    const density = product.density;
    totalVolumeToTransfer += (weights / density) * transferItem.quantity;
  }

  // 3. Kiểm tra sức chứa zone và warehouse đích
  const availableZoneCapacity =
    destinationZone.totalCapacity - destinationZone.currentCapacity;
  const availableWarehouseCapacity =
    destinationWarehouse.totalCapacity - destinationWarehouse.currentCapacity;
  if (availableZoneCapacity < totalVolumeToTransfer) {
    throw new Error(
      `Destination zone does not have enough capacity. Available: ${availableZoneCapacity}, Required: ${totalVolumeToTransfer}`
    );
  }
  if (availableWarehouseCapacity < totalVolumeToTransfer) {
    throw new Error(
      `Destination warehouse does not have enough capacity. Available: ${availableWarehouseCapacity}, Required: ${totalVolumeToTransfer}`
    );
  }

  // 4. Cộng số lượng và thể tích vào kho đích
  for (const transferItem of transfer.items) {
    const item = transferItem.zoneItemId.itemId;
    let destinationZoneItem = await ZoneItem.findOne({
      zoneId: destinationZoneId,
      itemId: item._id,
    });
    if (destinationZoneItem) {
      destinationZoneItem.quantity += transferItem.quantity;
    } else {
      destinationZoneItem = new ZoneItem({
        zoneId: destinationZoneId,
        itemId: item._id,
        quantity: transferItem.quantity,
      });
    }
    await destinationZoneItem.save();
  }

  // 5. Cập nhật sức chứa zone và warehouse đích
  destinationZone.currentCapacity += totalVolumeToTransfer;
  destinationWarehouse.currentCapacity += totalVolumeToTransfer;
  await destinationZone.save();
  await destinationWarehouse.save();

  // 6. Cập nhật trạng thái transfer
  transfer.status = STATUS.APPROVED;
  transfer.approvedBy = userId;
  transfer.receiver.zoneId = destinationZoneId;

  return await transfer.save();
};

const rejectInternalTransfer = async (id, userId, rejectedNote) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid internal transfer ID");
  }

  const transfer = await InternalTransfer.findById(id)
    .populate({
      path: "items.zoneItemId",
      populate: [
        {
          path: "itemId",
          populate: { path: "productId", select: "density" },
        },
        {
          path: "zoneId",
        },
      ],
    })
    .populate("sourceZoneId")
    .populate("sourceWarehouseId");

  if (!transfer) throw new Error("Internal transfer not found");
  if (transfer.status !== STATUS.PENDING)
    throw new Error(
      "Internal transfer can only be rejected when status is PENDING"
    );

  // Trả lại số lượng và thể tích cho kho nguồn
  let totalVolume = 0;
  for (const transferItem of transfer.items) {
    const zoneItem = await ZoneItem.findById(transferItem.zoneItemId._id);
    const item = transferItem.zoneItemId.itemId;
    const product = item.productId;
    const weights = item.weights;
    const density = product.density;
    if (zoneItem) {
      zoneItem.quantity += transferItem.quantity;
      await zoneItem.save();
      totalVolume += (weights / density) * transferItem.quantity;
    }
  }
  const sourceZone = transfer.sourceZoneId;
  const sourceWarehouse = await Warehouse.findById(transfer.sourceWarehouseId);

  sourceZone.currentCapacity += totalVolume;
  sourceWarehouse.currentCapacity += totalVolume;
  await sourceZone.save();
  await sourceWarehouse.save();

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
