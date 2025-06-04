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

export const getListSuppliersPending = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await supplierService.getListSuppliersPending(page);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const supplier = await supplierService.getSupplierById(supplierId);
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const supplierData = req.body;
    const newSupplier = await supplierService.createSupplier(supplierData);
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
