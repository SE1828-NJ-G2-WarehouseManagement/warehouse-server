import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import ZoneItem from "../zoneitem/zoneitem.model.js";
import { STATUS } from "../../constant/status.constant.js";
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

export default {
  getAllExpiringSoon,
};
