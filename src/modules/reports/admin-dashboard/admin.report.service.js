import User from '../../user/user.model.js';
import Warehouse from '../../warehouse/warehouse.model.js';
import Category from '../../category/category.model.js';
import InboundOrder from '../../inboundorder/inboundorder.model.js';
import OutboundOrder from '../../outboundorder/outboundorder.model.js';
import Product from '../../product/product.model.js';
import { STATUS } from '../../../constant/status.constant.js';
import ZoneItem from '../../zoneitem/zoneitem.model.js';
import Expired from '../../expired/expired.model.js';
import Zone from '../../zone/zone.model.js';

const reports = async () => {
  // Tổng sản phẩm hệ thống
  const inventoryAgg = await ZoneItem.aggregate([
    { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
  ]);
  const inventory = inventoryAgg.length > 0 ? inventoryAgg[0].totalQuantity : 0;

  // Tổng sản phẩm hết hạn
  const expiredCount = await Expired.countDocuments();

  // Trạng thái người dùng
  const [userActive, userInactive] = await Promise.all([
    User.countDocuments({ status: STATUS.ACTIVE }),
    User.countDocuments({ status: STATUS.INACTIVE })
  ]);

  // Trạng thái kho
  const [warehouseActive, warehouseInactive] = await Promise.all([
    Warehouse.countDocuments({ status: STATUS.ACTIVE }),
    Warehouse.countDocuments({ status: STATUS.INACTIVE })
  ]);

  // Phân tích người dùng
  const userYearAgg = await User.aggregate([
    { $group: { _id: { $year: "$createdAt" }, users: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  const userAnalysis = userYearAgg.map(u => ({ year: u._id, users: u.users }));

  // Phân tích danh mục sản phẩm
  const productCategoryAgg = await Product.aggregate([
    { $group: { _id: "$category", value: { $sum: 1 } } },
    {
      $lookup: {
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

  // Phân tích giao dịch
  const now = new Date();
  const year = now.getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const inboundAgg = await InboundOrder.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        value: { $sum: 1 }
      }
    }
  ]);
  const inboundByMonth = Array(12).fill(0);
  inboundAgg.forEach(i => { inboundByMonth[i._id - 1] = i.value; });

  const outboundAgg = await OutboundOrder.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        value: { $sum: 1 }
      }
    }
  ]);
  const outboundByMonth = Array(12).fill(0);
  outboundAgg.forEach(o => { outboundByMonth[o._id - 1] = o.value; });

  const transactionAnalysis = months.flatMap((label, idx) => [
    { label, type: "Inbound Order", value: inboundByMonth[idx] },
    { label, type: "Outbound Order", value: outboundByMonth[idx] }
  ]);

  // Inbound orders theo warehouse (qua Zone)
  const inboundByWarehouse = await InboundOrder.aggregate([
    {
      $lookup: {
        from: 'zones',
        localField: 'zoneId',
        foreignField: '_id',
        as: 'zone'
      }
    },
    { $unwind: '$zone' },
    {
      $group: {
        _id: '$zone.warehouseId',
        count: { $sum: 1 }
      }
    }
  ]);

  // Outbound orders theo warehouse (qua ZoneItem → Zone)
  const outboundByWarehouse = await OutboundOrder.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'zoneitems',
        localField: 'items.zoneItem',
        foreignField: '_id',
        as: 'zi'
      }
    },
    { $unwind: '$zi' },
    {
      $lookup: {
        from: 'zones',
        localField: 'zi.zone',
        foreignField: '_id',
        as: 'zone'
      }
    },
    { $unwind: '$zone' },
    {
      $group: {
        _id: '$zone.warehouseId',
        count: { $sum: 1 }
      }
    }
  ]);

  // Chi tiết từng warehouse
  const warehouses = await Warehouse.find({});
  const warehouseDetails = await Promise.all(warehouses.map(async (wh) => {
    // Số lượng zone
    const zoneCount = await Zone.countDocuments({ warehouseId: wh._id });

    // Tổng sản phẩm
    const totalProducts = await ZoneItem.aggregate([
      { $match: { warehouse: wh._id } },
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]).then(res => res[0]?.total || 0);

    // Sản phẩm hết hạn
    const expiredProducts = await Expired.countDocuments({ warehouse: wh._id });

    // Inbound / Outbound orders
    const inboundOrders = inboundByWarehouse.find(i => String(i._id) === String(wh._id))?.count || 0;
    const outboundOrders = outboundByWarehouse.find(i => String(i._id) === String(wh._id))?.count || 0;

    return {
      name: wh.name,
      zoneCount,
      totalProducts,
      expiredProducts,
      inboundOrders,
      outboundOrders
    };
  }));

  // Trả về dữ liệu
  return {
    user: {
      'user-active': userActive,
      'user-inactive': userInactive
    },
    warehouse: {
      'warehouse-active': warehouseActive,
      'warehouse-inactive': warehouseInactive,
      'products-warehouse': inventory,
      'expired-item': expiredCount,
      warehouseDetails
    },
    analysis: {
      userAnalysis,
      categoryAnalysis,
      transactionAnalysis
    }
  };
};

export { reports };
