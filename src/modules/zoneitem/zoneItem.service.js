import ZoneItem from "./zoneItem.model.js";
import Zone from "../zone/zone.model.js";
import User from "../user/user.model.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";

const getItemByZoneId = async (zoneId, user, page) => {
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
  const skip = (page - 1) * PAGE_SIZE;
  const items = await ZoneItem.find({ zoneId: zone._id })
  .populate({
    path: "itemId",
    populate: {
      path: "productId",
      model: "Product",
    },
  })
  .populate("zoneId")
  .skip(skip)
  .limit(PAGE_SIZE);
  const total = await ZoneItem.countDocuments({ zoneId: zone._id });
  const format = items.map((item) => ({
    _id: item._id,
    itemId: item.itemId,
    itemName: item.itemId.name,
    quantity: item.quantity,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
  return {
    zoneName: zone.name,
    data: format,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

export default {
  getItemByZoneId,
};
