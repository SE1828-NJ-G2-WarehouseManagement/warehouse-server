import Product from "../../product/product.model.js";
import InboundOrder from "../../inboundorder/inboundorder.model.js";
import OutboundOrder from "../../outboundorder/outboundorder.model.js";
import Expired from "../../expired/expired.model.js";
import Zone from "../../zone/zone.model.js";
import Item from "../../item/item.model.js";
import ZoneItem from "../../zoneitem/zoneitem.model.js";
import Warehouse from "../../warehouse/warehouse.model.js";
import User from "../../user/user.model.js";

// Main Entry
const getReports = async (date, email) => {
  try {
    const [day, month, year] = date.split('/');
    const formattedDate = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

    const userFound = await User.findOne({email});
    const userId = userFound._id;
    
    const totalAnalysis = await getTotalStatsByDate(formattedDate, userId);
    const monthlyAnalysis = await getMonthlyStatsOfYear(year, userId);
    
    return {
      totalAnalysis,
      monthlyAnalysis,
    };
  } catch (err) {
    err.status = err.status || 500;
    throw err;
  }
};

// Helper: Get relevant warehouse -> zone -> zoneItems
const getUserContext = async (userId) => {
  const warehouses = await Warehouse.find({
    $or: [{ manageBy: userId }, { staffs: userId }],
  }).select('_id');

  const warehouseIds = warehouses.map(w => w._id);

  const zones = await Zone.find({
    warehouseId: { $in: warehouseIds },
  }).select('_id');

  const zoneIds = zones.map(z => z._id);

  const zoneItems = await ZoneItem.find({
    zoneId: { $in: zoneIds },
  }).select('_id');

  const zoneItemIds = zoneItems.map(z => z._id);

  return { zoneIds, zoneItemIds };
};

// Get total up to given date
const getTotalStatsByDate = async (upToDate, userId) => {
  try {
    const { zoneIds, zoneItemIds } = await getUserContext(userId);

    const dateFilter = { createdAt: { $lte: upToDate } };

    const [zoneItems, imports, exports, expired, zones] = await Promise.all([
      ZoneItem.countDocuments({ ...dateFilter, zoneId: { $in: zoneIds } }),
      InboundOrder.countDocuments({ ...dateFilter, zoneId: { $in: zoneIds } }),
      OutboundOrder.countDocuments({ ...dateFilter, "items.zoneItem": { $in: zoneItemIds } }),
      Expired.countDocuments({ ...dateFilter, zoneItemId: { $in: zoneItemIds } }),
      Zone.countDocuments({ ...dateFilter, _id: { $in: zoneIds } }),
    ]);

    return {
      products: zoneItems,
      imports,
      exports,
      expired,
      zones,
    };
  } catch (err) {
    err.status = err.status || 500;
    throw err;
  }
};

// Get each month in the year
const getMonthlyStatsOfYear = async (year, userId) => {
  try {
    const { zoneIds, zoneItemIds } = await getUserContext(userId);

    const results = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const month = i + 1;

        const start = new Date(`${year}-${month.toString().padStart(2, "0")}-01T00:00:00.000Z`);
        const end = new Date(new Date(year, month, 0, 23, 59, 59, 999)); // last day of month

        const match = { createdAt: { $gte: start, $lt: end } };

        const [products, imports, exports, expired] = await Promise.all([
          Product.countDocuments(match), // all products are global
          InboundOrder.countDocuments({ ...match, zoneId: { $in: zoneIds } }),
          OutboundOrder.countDocuments({ ...match, "items.zoneItem": { $in: zoneItemIds } }),
          Expired.countDocuments({ ...match, zoneItemId: { $in: zoneItemIds } }),
        ]);

        return {
          month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(start),
          products,
          imports,
          exports,
          expired,
        };
      })
    );

    return results;
  } catch (err) {
    console.log(err);
    err.status = err.status || 500;
    throw err;
  }
};

export { getReports };
