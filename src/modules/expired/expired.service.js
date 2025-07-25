import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import ZoneItem from "../zoneitem/zoneitem.model.js";
import { STATUS } from "../../constant/status.constant.js";
import Expired from "./expired.model.js";
import User from "../user/user.model.js";
import Warehouse from "../warehouse/warehouse.model.js";
import Zone from "../zone/zone.model.js";
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const getAllExpiringSoon = async () => {
  const today = dayjs().startOf("day");
  const sevenDaysLater = dayjs().add(7, "day").endOf("day");

  const zoneItems = await ZoneItem.find()
    .populate({
      path: "itemId",
      populate: {
        path: "productId",
      },
    })
    .populate({
      path: "zoneId",
      populate: {
        path: "warehouseId",
      },
    });
  const expiringItems = zoneItems
    .filter((zoneItem) => {
      const item = zoneItem.itemId;
      if (!item?.expiredDate || item.status !== STATUS.ACTIVE) return false;
      const expiryDate = dayjs(item.expiredDate);
      return (
        expiryDate.isSameOrAfter(today) &&
        expiryDate.isSameOrBefore(sevenDaysLater)
      );
    })
    .map((zoneItem) => {
      const daysLeft = dayjs(zoneItem.itemId.expiredDate).diff(today, "day");
      return {
        zoneItemId: zoneItem._id,
        productName: zoneItem.itemId.productId.name,
        itemId: zoneItem.itemId._id,
        expiredDate: zoneItem.itemId.expiredDate,
        zoneName: zoneItem.zoneId?.name || "Unknown",
        warehouseName: zoneItem.zoneId?.warehouseId?.name || "Unknown",
        quantity: zoneItem.quantity,
        daysLeft,
      };
    });

  return expiringItems;
};

export const getExpiredProductsService = async () => {
  const expiredList = await Expired.find()
    .sort({ createdAt: -1 }) // mới nhất trước
    .populate({
      path: 'zoneItemId',
      populate: [
        {
          path: 'itemId',
          populate: {
            path: 'productId',
          },
        },
        {
          path: 'zoneId',
        },
      ],
    });

  return expiredList.map(expired => {
    const zoneItem = expired.zoneItemId;
    const item = zoneItem?.itemId;
    const product = item?.productId;
    const zone = zoneItem?.zoneId;

    return {
      expiredId: expired._id,
      note: expired.note,
      createdAt: expired.createdAt,

      zoneItem: {
        id: zoneItem?._id,
        quantity: zoneItem?.quantity,
        status: zoneItem?.status,
      },

      item: {
        id: item?._id,
        expiredDate: item?.expiredDate,
        weights: item?.weights,
        status: item?.status,
      },

      product: {
        id: product?._id,
        name: product?.name,
        density: product?.density,
        image: product?.image
      },

      zone: {
        id: zone?._id,
        name: zone?.name,
      },
    };
  });
};

const getExpiredProductsByUserEmail = async (userEmail) => {
  const user = await User.findOne({ email: userEmail });
  if (!user) throw new Error("User not found");

  // 1. Tìm tất cả warehouse mà user quản lý hoặc là staff
  const warehouses = await Warehouse.find({
    $or: [
      { manageBy: user._id },
      { staffs: user._id }
    ]
  }).select("_id");

  const warehouseIds = warehouses.map(w => w._id);

  // 2. Tìm tất cả zone thuộc các warehouse đó
  const zones = await Zone.find({
    warehouseId: { $in: warehouseIds }
  }).select("_id");

  const zoneIds = zones.map(z => z._id);

  // 3. Tìm tất cả zoneItem thuộc các zone đó
  const zoneItems = await ZoneItem.find({
    zoneId: { $in: zoneIds }
  }).select("_id");

  const zoneItemIds = zoneItems.map(z => z._id);

  // 4. Lấy expired chỉ cho các zoneItem đó
  const expiredList = await Expired.find({
    zoneItemId: { $in: zoneItemIds }
  })
    .sort({ createdAt: -1 })
    .populate({
      path: 'zoneItemId',
      populate: [
        {
          path: 'itemId',
          populate: {
            path: 'productId',
          },
        },
        {
          path: 'zoneId',
        },
      ],
    });

  // 5. Format kết quả trả về
  return expiredList.map(expired => {
    const zoneItem = expired.zoneItemId;
    const item = zoneItem?.itemId;
    const product = item?.productId;
    const zone = zoneItem?.zoneId;

    return {
      expiredId: expired._id,
      note: expired.note,
      createdAt: expired.createdAt,

      zoneItem: {
        id: zoneItem?._id,
        quantity: zoneItem?.quantity,
        status: zoneItem?.status,
      },

      item: {
        id: item?._id,
        expiredDate: item?.expiredDate,
        weights: item?.weights,
        status: item?.status,
      },

      product: {
        id: product?._id,
        name: product?.name,
        density: product?.density,
        image: product?.image
      },

      zone: {
        id: zone?._id,
        name: zone?.name,
      },
    };
  });
};

export default {
  getAllExpiringSoon,
  getExpiredProductsService,
  getExpiredProductsByUserEmail
};
