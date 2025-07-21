import ZoneItem from "./zoneItem.model.js";
import Zone from "../zone/zone.model.js";
import User from "../user/user.model.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";
import { ROLES } from "../../constant/role.constant.js";
import Item from "../item/item.model.js";
import Product from "../product/product.model.js";
import { STATUS } from "../../constant/status.constant.js";
import { ACTION } from "../../constant/action.constant.js";
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
  const items = await ZoneItem.find({
    zoneId: zone._id,
    status: STATUS.ACTIVE,
    quantity: { $gt: 0 },
  })
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
    sourceZoneItem.quantity = 0;
    sourceZoneItem.status = STATUS.INACTIVE;
  }
  // luôn gọi save sau khi chỉnh quantity và status
  await sourceZoneItem.save();

  // 9. Cộng vào destination zone (tạo nếu chưa có)
  let destinationZoneItem = await ZoneItem.findOne({
    zoneId: destinationZoneId,
    itemId,
  });

  if (destinationZoneItem) {
    destinationZoneItem.quantity += quantity;
    // nếu trước đó là INACTIVE mà giờ có hàng , chuyển lại active
    if (destinationZoneItem.status === STATUS.INACTIVE && destinationZoneItem.quantity > 0) {
      destinationZoneItem.status = STATUS.ACTIVE;
    }
  } else {
    destinationZoneItem = new ZoneItem({
      zoneId: destinationZoneId,
      itemId,
      quantity,
      status: STATUS.ACTIVE, // Mới tạo thì luôn là ACTIVE
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

const getProductsInMyWarehouse = async (userId) => {
  // 1. Lấy thông tin user và warehouse được assign
  const user = await User.findById(userId).populate("assignedWarehouse");
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.assignedWarehouse) {
    throw new Error("User must be assigned to a warehouse");
  }

  const warehouseId = user.assignedWarehouse._id;

  // 2. Lấy tất cả zones thuộc warehouse của user
  const zones = await Zone.find({
    warehouseId: warehouseId,
    status: STATUS.ACTIVE,
  });

  if (zones.length === 0) {
    return [];
  }

  const zoneIds = zones.map((zone) => zone._id);

  // 3. Lấy tất cả zoneItems trong các zones này
  const zoneItems = await ZoneItem.find({
    zoneId: { $in: zoneIds },
    quantity: { $gt: 0 }, // Chỉ lấy items có quantity > 0
  })
    .populate({
      path: "itemId",
      populate: {
        path: "productId",
        match: {
          status: STATUS.APPROVED,
          action: ACTION.ACTIVE,
        },
      },
    })
    .populate("zoneId");

  // 4. Filter và format data
  const productsInWarehouse = zoneItems
    .filter((zoneItem) => zoneItem.itemId && zoneItem.itemId.productId) // Loại bỏ null products
    .map((zoneItem) => ({
      zoneItemId: zoneItem._id,
      productId: zoneItem.itemId.productId._id,
      productName: zoneItem.itemId.productId.name,
      productImage: zoneItem.itemId.productId.image,
      productDensity: zoneItem.itemId.productId.density,
      storageTemperature: zoneItem.itemId.productId.storageTemperature,
      itemId: zoneItem.itemId._id,
      itemWeights: zoneItem.itemId.weights,
      itemManufactureDate: zoneItem.itemId.manufactureDate,
      itemExpiryDate: zoneItem.itemId.expiredDate,
      zoneId: zoneItem.zoneId._id,
      zoneName: zoneItem.zoneId.name,
      zoneTemperature: zoneItem.zoneId.storageTemperature,
      quantity: zoneItem.quantity,
      warehouseId: user.assignedWarehouse._id,
      warehouseName: user.assignedWarehouse.name,
    }))
    .sort((a, b) => a.productName.localeCompare(b.productName)); // Sort theo tên product

  return productsInWarehouse;
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
  getProductsInMyWarehouse,
};
