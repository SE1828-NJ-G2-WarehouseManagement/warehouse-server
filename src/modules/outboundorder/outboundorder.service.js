import OutboundOrder from "./outboundorder.model.js";
import Customer from "../customer/customer.model.js";
import User from "../user/user.model.js";
import ZoneItem from "../zoneitem/zoneitem.model.js";

const createOutboundOrder = async (data, user) => {
  const { customerId, signed, items, quantity } = data;

  // Kiểm tra customer
  const customer = await Customer.findById(customerId);
  if (!customer) throw new Error("Customer not found");

  // Kiểm tra user
  const userCurrent = await User.findById(user._id);
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
    const zoneItem = await ZoneItem.findById(item.zoneItem);
    zoneItem.quantity -= item.quantity;
    await zoneItem.save();
  }

  // Tạo outbound order
  const outboundOrder = await OutboundOrder.create({
    customerId,
    signed,
    items,
    quantity,
    createBy: user._id,
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

export default {
  createOutboundOrder,
  getListOutboundOrder,
  getOutboundOrderById,
};
