import User from '../../user/user.model.js';
import Warehouse from '../../warehouse/warehouse.model.js';
import Category from '../../category/category.model.js';
import InboundOrder from '../../inboundorder/inboundorder.model.js';
import OutboundOrder from '../../outboundorder/outboundorder.model.js';
import Product from '../../product/product.model.js';
import { STATUS } from '../../../constant/status.constant.js';
import { ACTION } from '../../../constant/action.constant.js';
import ZoneItem from '../../zoneitem/zoneitem.model.js';
import Expired from '../../expired/expired.model.js';

/**
 * get reports for dashboard
 *
 * RESPONSE DESIGN
 * const response = {
  user: {
    user-active: 0,
    user-inactive: 10
  },
  warehouse: {
    warehouse-active: 0,
    warehouse-inactive: 10
  },
  analysis: {
    userAnalysis: [
      {year: 1999, users: 100}  
    ],
    categoryAnalysis: [
      {type: "Foods", value: 29}
    ],
    transactionAnalysis: [
      {label: "Jan", type: "Inbound Order", value: 200},
      { label: "Jan", type: "Outbound Order", value: 2800 }
    ]
  }
}
 *
 * @returns api response
 */
const reports = async () => {
  // Inventory count (total products in all warehouses)
  const inventoryAgg = await ZoneItem.aggregate([
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: "$quantity" }
      }
    }
  ]);
  const inventory = inventoryAgg.length > 0 ? inventoryAgg[0].totalQuantity : 0;

  // Expired item count
  const expiredCount = await Expired.countDocuments();

  // User status counts
  const [userActive, userInactive] = await Promise.all([
    User.countDocuments({ status: STATUS.ACTIVE }),
    User.countDocuments({ status: STATUS.INACTIVE })
  ]);

  // Warehouse status counts
  const [warehouseActive, warehouseInactive] = await Promise.all([
    Warehouse.countDocuments({ status: STATUS.ACTIVE }),
    Warehouse.countDocuments({ status: STATUS.INACTIVE })
  ]);

  // User analysis by year
  const userYearAgg = await User.aggregate([
    {
      $group: {
        _id: { $year: "$createdAt" },
        users: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  const userAnalysis = userYearAgg.map(u => ({ year: u._id, users: u.users }));

  // Category analysis by product count (active products only)
  const productCategoryAgg = await Product.aggregate([
    { $group: { _id: "$category", value: { $sum: 1 } } },
    { $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    { $unwind: '$categoryInfo' },
    { $project: { type: '$categoryInfo.name', value: 1 } },
    { $sort: { value: -1 } }
  ]);

  const categoryAnalysis = productCategoryAgg.map(c => ({ type: c.type, value: c.value }));

  // Transaction analysis by month (for current year)
  const now = new Date();
  const year = now.getFullYear();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Inbound Orders by month
  const inboundAgg = await InboundOrder.aggregate([
    { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
    { $group: { _id: { $month: "$createdAt" }, value: { $sum: 1 } } }
  ]);
  const inboundByMonth = Array(12).fill(0);
  inboundAgg.forEach(i => { inboundByMonth[i._id - 1] = i.value; });

  // Outbound Orders by month
  const outboundAgg = await OutboundOrder.aggregate([
    { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
    { $group: { _id: { $month: "$createdAt" }, value: { $sum: 1 } } }
  ]);
  const outboundByMonth = Array(12).fill(0);
  outboundAgg.forEach(o => { outboundByMonth[o._id - 1] = o.value; });

  // Compose transaction analysis
  const transactionAnalysis = months.flatMap((label, idx) => [
    { label, type: "Inbound Order", value: inboundByMonth[idx] },
    { label, type: "Outbound Order", value: outboundByMonth[idx] }
  ]);

  return {
    user: {
      'user-active': userActive,
      'user-inactive': userInactive
    },
    warehouse: {
      'warehouse-active': warehouseActive,
      'warehouse-inactive': warehouseInactive,
      'products-warehouse': inventory,
      'expired-item': expiredCount
    },
    analysis: {
      userAnalysis,
      categoryAnalysis,
      transactionAnalysis,
    }
  };
};

export {
  reports
}