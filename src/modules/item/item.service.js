import User from "../user/user.model.js";
import Zone from "../zone/zone.model.js";
import ZoneItem from "../zoneitem/zoneitem.model.js";
import Item from "./item.model.js";

const getItemsByProductId = async (productId) => {
  return await Item.find({ productId }).populate("productId");
};

const getItemsInMyWarehouse = async (userId) => {
  // Lấy user và warehouse được assign
  const user = await User.findById(userId).populate("assignedWarehouse");
  if (!user || !user.assignedWarehouse) {
    throw new Error("User must be assigned to a warehouse");
  }
  const warehouseId = user.assignedWarehouse._id;

  // Lấy tất cả zone thuộc warehouse
  const zones = await Zone.find({ warehouseId }).select("_id");
  const zoneIds = zones.map((z) => z._id);

  // Lấy tất cả zoneItem trong các zone này, populate thêm zoneId và itemId.productId
  const zoneItems = await ZoneItem.find({
    zoneId: { $in: zoneIds },
    quantity: { $gt: 0 },
  })
    .populate({
      path: "itemId",
      populate: {
        path: "productId",
        select: "name storageTemperature density",
      },
    })
    .populate({
      path: "zoneId",
      select: "name",
    });

  // Format kết quả
  return zoneItems.map((zi) => ({
    zoneItemId: zi._id,
    itemId: zi.itemId?._id,
    productName: zi.itemId?.productId?.name || "",
    productDensity: zi.itemId?.productId?.density,
    quantity: zi.quantity,
    expiredDate: zi.itemId?.expiredDate,
    itemWeights: zi.itemId?.weights,
    zoneName: zi.zoneId?.name || "",
    productStorageTemperature: zi.itemId?.productId?.storageTemperature,
  }));
};

export default {
  getItemsByProductId,
  getItemsInMyWarehouse,
};
