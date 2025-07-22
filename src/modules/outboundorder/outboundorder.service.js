import OutboundOrder from "./outboundorder.model.js";
import Customer from "../customer/customer.model.js";
import User from "../user/user.model.js";
import ZoneItem from "../zoneitem/zoneItem.model.js";
import Zone from "../zone/zone.model.js";
import { STATUS } from "../../constant/status.constant.js";
const createOutboundOrder = async (data, userId) => {
  const { customerId, items, quantity } = data;

  // Kiểm tra customer
  const customer = await Customer.findById(customerId);
  if (!customer) throw new Error("Customer not found");

  // Kiểm tra user
  const userCurrent = await User.findById(userId);
  if (!userCurrent) throw new Error("User not found");

  // Kiểm tra từng item
  for (const item of items) {
    const zoneItem = await ZoneItem.findById(item.zoneItem);
    if (!zoneItem) throw new Error(`ZoneItem ${item.zoneItem} not found`);
    if (zoneItem.quantity < item.quantity) {
      throw new Error(
        `ZoneItem ${item.zoneItem} does not have enough quantity`
      );
    }
  }

  // Trừ số lượng trong zoneitem
  for (const item of items) {
    const zoneItem = await ZoneItem.findById(item.zoneItem)
      .populate({
        path: "itemId",
        populate: { path: "productId", model: "Product" },
      })
      .populate("zoneId");
    const itemData = zoneItem.itemId;
    const productData = itemData.productId;
    const zone = zoneItem.zoneId;

    const weights = itemData.weights || 0;
    const density = productData.density || 1;
    const quantitytoExport = item.quantity;
    const Volume = (weights / density) * quantitytoExport;

    zone.currentCapacity -= Volume;
    await zone.save();
    console.log(weights, density, quantitytoExport, Volume);

    zoneItem.quantity -= item.quantity;
    // if (zoneItem.quantity <= 0) {
    //   // Nếu số lượng về 0 hoặc nhỏ hơn, xóa khỏi zone
    //   await ZoneItem.deleteOne({ _id: zoneItem._id });
    // } else {
    //   // Ngược lại thì chỉ update lại số lượng
    //   await zoneItem.save();
    // }
    if (zoneItem.quantity <= 0) {
      // XÓA MỀM
      zoneItem.status = STATUS.INACTIVE;
      await zoneItem.save();
    } else {
      await zoneItem.save();
    }
  }

  // Tạo outbound order
  const outboundOrder = await OutboundOrder.create({
    customerId,
    items,
    quantity,
    createBy: userId,
  });

  return outboundOrder;
};

const getListOutboundOrder = async (page) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [data, total] = await Promise.all([
    OutboundOrder.find()
      .populate("customerId")
      .populate("createBy")
      .populate("items.zoneItem")
      .skip(skip)
      .limit(PAGE_SIZE),
    OutboundOrder.countDocuments({}),
  ]);
  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

const getOutboundOrderById = async (id) => {
  return await OutboundOrder.findById(id)
    .populate("customerId")
    .populate("createBy")
    .populate("items.zoneItem");
};

// xem phiếu xuất theo warehouse
const getOutboundOrderByWarehouse = async (user) => {
  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }

  const zones = await Zone.find({ warehouseId: userCurrent.assignedWarehouse });

  const outboundOrders = await OutboundOrder.find({
    "items.zoneItem": { $ne: null }, 
  })
    .populate("customerId") 
    .populate("createBy") 
    .populate({
      path: "items.zoneItem", 
      populate: [
        {
          path: "itemId", 
          populate: {
            path: "productId", 
            model: "Product", 
            select: "name image density storageTemperature", 
          },
          select: "expiredDate weights", 
        },
        {
          path: "zoneId", 
          match: {
            _id: { $in: zones.map((zone) => zone._id) },
          },
        },
      ],
    });

  return outboundOrders;
};



export default {
  createOutboundOrder,
  getListOutboundOrder,
  getOutboundOrderById,
  getOutboundOrderByWarehouse,
};
