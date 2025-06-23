import e from "express";
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
    const newSupplier = await supplierService.createSupplier(
      supplierData,
      req.user
    );
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const updatedData = req.body;
    const updatedSupplier = await supplierService.updateSupplier(
      supplierId,
      updatedData,
      req.user
    );
    res.status(200).json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const user = req.user;
    const approvedSupplier = await supplierService.approveSupplier(
      supplierId,
      user
    );
    res.status(200).json(approvedSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const user = req.user;
    const note = req.body.note;
    const rejectedSupplier = await supplierService.rejectSupplier(
      supplierId,
      user,
      note
    );
    res.status(200).json(rejectedSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
