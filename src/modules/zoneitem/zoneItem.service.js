import ZoneItem from "./zoneItem.model.js";
import Zone from "../zone/zone.model.js";
import User from "../user/user.model.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import { ROLES } from "../../constant/role.constant.js";
import Item from "../item/item.model.js";
import Product from "../product/product.model.js";
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

// chuyển nội bộ giữa các zone
const transferBetweenZone = async (
  sourceZoneId,
  destinationZoneId,
  itemId,
  quantity,
  user
) => {
  const userCurrent = await User.findOne({ email: user.email });
  if (!userCurrent) {
    throw new Error("User not found");
  }

  if (userCurrent.role !== ROLES.WAREHOUSE_STAFF) {
    throw new Error("You do not have permission!");
  }

  // 1. Lấy thông tin zone
  const [sourceZone, destinationZone] = await Promise.all([
    Zone.findById(sourceZoneId),
    Zone.findById(destinationZoneId),
  ]);

  if (!sourceZone || !destinationZone) {
    throw new Error("One or both zones not found");
  }

  // 2. check sourceZone và destinationZone phải cùng 1 warehouse
  if (!sourceZone.warehouseId.equals(destinationZone.warehouseId)) {
    throw new Error("Zones must be in the same warehouse");
  }



  // 3.Source zone và destination zone phải thuộc warehouse được phân công cho user
  if (!sourceZone.warehouseId.equals(userCurrent.assignedWarehouse)) {
    throw new Error("You are not allowed to operate in this warehouse");
  }

  // 4. Kiểm tra item tồn tại và lấy thông tin product
  const item = await Item.findById(itemId);
  if (!item) {
    throw new Error("Item not found");
  }

  // lấy product để check nhiệt độ
  const product = await Product.findById(item.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  // 5. Kiểm tra nhiệt độ có phù hợp với destination zone không
  const isTempCompatible =
    destinationZone.storageTemperature.min >= product.storageTemperature.min &&
    destinationZone.storageTemperature.max <= product.storageTemperature.max;
  if (!isTempCompatible) {
    throw new Error(
      `Zone temperature not compatible with product ${product.name}`
    );
  }

  // 6. Kiểm tra số lượng tại source zone
  const sourceZoneItem = await ZoneItem.findOne({
    zoneId: sourceZoneId,
    itemId,
  });
  if (!sourceZoneItem || sourceZoneItem.quantity < quantity) {
    throw new Error("Not enough quantity in souce zone");
  }

  // 7. Kiểm tra sức chứa còn lại của destination zone
  const itemVolume = item.weights / product.density;
  const totalVolume = itemVolume * quantity;

  const availableCapacity =
    destinationZone.totalCapacity - destinationZone.currentCapacity;

  if (availableCapacity < totalVolume) {
    throw new Error("Destination zone does not have enough capacity");
  }

  // 8. Trừ số lượng source zone
  sourceZoneItem.quantity -= quantity;
  if (sourceZoneItem.quantity <= 0) {
    // Nếu số lượng về 0 hoặc nhỏ hơn, xóa khỏi zone
    await ZoneItem.deleteOne({ _id: sourceZoneItem._id });
  } else {
    // Ngược lại thì chỉ update lại số lượng
    await sourceZoneItem.save();
  }

  // 9. Cộng vào destination zone (tạo nếu chưa có)
  let destinationZoneItem = await ZoneItem.findOne({
    zoneId: destinationZoneId,
    itemId,
  });

  if (destinationZoneItem) {
    destinationZoneItem.quantity += quantity;
  } else {
    destinationZoneItem = new ZoneItem({
      zoneId: destinationZoneId,
      itemId,
      quantity,
    });
  }

  await destinationZoneItem.save();

  // 10. Cập nhật sức chứa của 2 kho
  sourceZone.currentCapacity -= totalVolume;
  destinationZone.currentCapacity += totalVolume;
  await sourceZone.save();
  await destinationZone.save();

  return {
    message: "Transfer between zone successful",
  };
};


const getAllActiveProductsInZones = async () => {
  const zoneItems = await ZoneItem.find().populate({
    path: "itemId",
    populate: {
      path: "productId",
      model: "Product",
      match: { action: "ACTIVE" }, 
    },
  });

  const products = [];
  const productIds = new Set();

  zoneItems.forEach((zoneItem) => {
    const item = zoneItem.itemId;
    if (item && item.productId && item.productId.action === "ACTIVE") {
      const prod = item.productId;
      if (!productIds.has(prod._id.toString())) {
        products.push(prod);
        productIds.add(prod._id.toString());
      }
    }
  });

  return products;
};

const getAllProductsInZones = async () => {
  const zoneItems = await ZoneItem.find().populate({
    path: "itemId",
    populate: {
      path: "productId",
      model: "Product",
    },
  });

  const products = [];
  const productIds = new Set();

  zoneItems.forEach((zoneItem) => {
    const item = zoneItem.itemId;
    if (item && item.productId) {
      const prod = item.productId;
      if (!productIds.has(prod._id.toString())) {
        products.push(prod);
        productIds.add(prod._id.toString());
      }
    }
  });

  return products;
};

export default {
  getItemByZoneId,
  transferBetweenZone,
  getAllActiveProductsInZones,
  getAllProductsInZones,
};
