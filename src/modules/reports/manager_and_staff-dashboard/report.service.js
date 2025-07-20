import Product from "../../product/product.model.js";
import InboundOrder from "../../inboundorder/inboundorder.model.js";
import OutboundOrder from "../../outboundorder/outboundorder.model.js";
import Expired from "../../expired/expired.model.js";
import Zone from "../../zone/zone.model.js";

const getReports = async (date) => {
  try {
    const year = date.split("/")[2];
    const totalAnalysis = await getTotalStatsByYear(year);
    const monthlyAnalysis = await getMonthlyStatsOfYear(year);
    return {
        totalAnalysis,
        monthlyAnalysis
    };
  } catch (err) {
    err.status = err.status || 500;
    throw err;
  }
};

const getTotalStatsByYear = async (year) => {
  console.log(year);

  try {
    const matchYear = {
      createdAt: { $lte: new Date(`${year}-12-31T23:59:59.999Z`) },
    };

    const [products, imports, exports, expired, zones] = await Promise.all([
      Product.countDocuments(matchYear),
      InboundOrder.countDocuments(matchYear),
      OutboundOrder.countDocuments(matchYear),
      Expired.countDocuments(matchYear),
      Zone.countDocuments(matchYear),
    ]);

    return {
      products,
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

const getMonthlyStatsOfYear = async (year) => {
  try {
    const results = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const month = i + 1;

        // Start: 1st day of month
        const start = new Date(
          `${year}-${month.toString().padStart(2, "0")}-01T00:00:00.000Z`
        );

        // End: last day of month at 23:59:59.999
        const end = new Date(new Date(year, month, 0, 23, 59, 59, 999));

        const match = { createdAt: { $gte: start, $lt: end } };

        const [products, imports, exports, expired] = await Promise.all([
          Product.countDocuments(match),
          InboundOrder.countDocuments(match),
          OutboundOrder.countDocuments(match),
          Expired.countDocuments(match),
        ]);

        return {
          month: new Intl.DateTimeFormat("en-US", { month: "short" }).format(
            start
          ),
          products,
          imports,
          exports,
          expired,
        };
      })
    );

    return results;
  } catch (err) {
    err.status = err.status || 500;
    throw err;
  }
};

export { getReports, getTotalStatsByYear };
