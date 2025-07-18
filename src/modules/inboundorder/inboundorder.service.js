import InboundOrder from "./inboundorder.model.js";
import Zone from "../zone/zone.model.js";
import User from "../user/user.model.js";
import Product from "../product/product.model.js";
import Supplier from "../supplier/supplier.model.js";
import { STATUS } from "../../constant/status.constant.js";
import { ROLES } from "../../constant/role.constant.js";
import Item from "../item/item.model.js";
import ZoneItem from "../zoneitem/zoneItem.model.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import mongoose from "mongoose";
import { ACTION } from "../../constant/action.constant.js";

const createInboundOrder = async (data, user) => {
  const { zoneId, items, supplierId } = data;
  // check quyền admin staff chỉ đc nhập hàng của zone mình quản lý
  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }

  // kiểm tra role là staff
  if (userCurrent.role !== ROLES.WAREHOUSE_STAFF) {
    throw new Error("You do not have permission");
  }

  // check supplier
  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    throw new Error("Supplier not found");
  }

  if (supplier.action !== ACTION.ACTIVE) {
    throw new Error("Supplier is not active");
  }
  // check zone
  const zone = await Zone.findOne({
    _id: zoneId,
    warehouseId: userCurrent.assignedWarehouse,
  });
  if (!zone) {
    throw new Error(
      "Zone not found or does not belong to the user's warehouse"
    );
  }
  if (zone.status !== STATUS.ACTIVE) {
    throw new Error("Zone is not active");
  }

  let totalVolumeToAdd = 0;

  for (const item of items) {
    // kiểm tra quantity
    if (!item.quantity || item.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // kiểm tra hạn sử dụng
    if (!item.expiredDate || new Date(item.expiredDate) <= new Date()) {
      throw new Error("Expired date must be in the future");
    }

    // check product
    const product = await Product.findById(item.productId);
    if (!product || product.action !== ACTION.ACTIVE) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    // Check nhiet do zone
    // zone nằm hoàn toàn trong product
    const isTempCompatible =
      zone.storageTemperature.min >= product.storageTemperature.min &&
      zone.storageTemperature.max <= product.storageTemperature.max;
    if (!isTempCompatible) {
      throw new Error(
        `Zone temperature not compatible with product ${product.name}`
      );
    }

    // tính thể tích cần thêm
    if (!product.density) {
      throw new Error(`Product ${product.name} missing density`);
    }
    const volumePerUnit = item.weights / product.density;
    totalVolumeToAdd += volumePerUnit * item.quantity;
  }
  if (zone.currentCapacity + totalVolumeToAdd >= zone.totalCapacity) {
    throw new Error("Zone does not have enough capacity");
  }

  // tạo inbound order
  const inboundOrder = await InboundOrder.create({
    zoneId,
    item: items,
    supplierId,
    createdBy: userCurrent._id,
  });

  // xử lí item và zone item
  for (const item of items) {
    // tìm hoặc tạo item
    let dbItem = await Item.findOne({
      productId: item.productId,
      expiredDate: item.expiredDate,
      weights: item.weights,
    });
    if (!dbItem) {
      dbItem = await Item.create({
        productId: item.productId,
        expiredDate: item.expiredDate,
        weights: item.weights,
        status: STATUS.ACTIVE,
      });
    }

    // tìm hoặc tạo zoneId
    let zoneItem = await ZoneItem.findOne({
      zoneId,
      itemId: dbItem._id,
    });

    if (zoneItem) {
      zoneItem.quantity += item.quantity;
      await zoneItem.save();
    } else {
      await ZoneItem.create({
        zoneId,
        itemId: dbItem._id,
        quantity: item.quantity,
      });
    }
  }

  // cập nhật dung lượng zone
  zone.currentCapacity += totalVolumeToAdd;
  await zone.save();

  return inboundOrder;
};

// xem phiếu
const getListInboundOrder = async (page) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [data, total] = await Promise.all([
    InboundOrder.find()
      .populate("createdBy")
      .populate("zoneId")
      .populate("item.productId")
      .populate("supplierId")
      .skip(skip)
      .limit(PAGE_SIZE),
    InboundOrder.countDocuments({}),
  ]);
  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

const getInboundById = async (id) => {
  if (!id) {
    throw new Error("ID is required");
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ID format");
  }

  const inboundOrder = await InboundOrder.findById(id)
    .populate("createdBy")
    .populate("zoneId")
    .populate("item.productId")
    .populate("supplierId");

  if (!inboundOrder) {
    throw new Error("Inbound order not found");
  }
  return inboundOrder;
};

// xem phiếu theo warehouse
const getInboundByWarehouse = async (user) => {
 const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }
  const zones = await Zone.find({
    warehouseId: userCurrent.assignedWarehouse,
  });

  const inboundOrders = await InboundOrder.find({
    zoneId: { $in: zones.map((zone) => zone._id) },
  })
    .populate("createdBy")
    .populate("zoneId")
    .populate("item.productId")
    .populate("supplierId");

  return inboundOrders;
};

export default {
  createInboundOrder,
  getListInboundOrder,
  getInboundById,
  getInboundByWarehouse,
};
