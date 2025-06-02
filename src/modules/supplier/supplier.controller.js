import supplierService from "./supplier.service.js";

export const getListSuppliers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await supplierService.getListSuppliers(page);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
