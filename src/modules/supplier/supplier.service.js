import Supplier from "./supplier.model.js";
import { STATUS } from "../../constant/status.constant.js";
import PAGE_SIZE from "../../constant/pageSize.constant.js";

// danh sách nhà cung cấp trạng thái ACTIVE
const getListSuppliers = async (page) => {
  const skip = (page - 1) * PAGE_SIZE;
  const [data, total] = await Promise.all([
    Supplier.find({ status: STATUS.ACTIVE }).skip(skip).limit(PAGE_SIZE),
    Supplier.countDocuments({ status: STATUS.ACTIVE }),
  ]);
  return {
    data,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
};

export default {
  getListSuppliers,
};
