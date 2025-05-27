import e from "express";
import warehouseService from "./warehouse.service.js";

export const getWarehouses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await warehouseService.getWarehouses(page);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWarehouseById = async (req, res) => {
  try {
    const id = req.params.id;
    const warehouse = await warehouseService.getWarehouseById(id);
    res.status(200).json(warehouse);
  } catch (error) {
    if (error.message === "Invalid warehouse ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Warehouse not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getAllWarehouseCapacity = async (req, res) => {
  try {
    const capacities = await warehouseService.getAllWarehouseCapacity();
    res.status(200).json(capacities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const warehouse = await warehouseService.createWarehouse(req.body);
    res.status(201).json(warehouse);
  } catch (error) {
    if (error.message === "Warehouse name already exists") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedWarehouse = await warehouseService.updateWarehouse(
      id,
      req.body
    );
    res.status(200).json(updatedWarehouse);
  } catch (error) {
    if (error.message === "Invalid warehouse ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Warehouse not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const changeWarehouseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const updatedWarehouse = await warehouseService.changeWarehouseStatus(
      id,
      status
    );
    res.status(200).json(updatedWarehouse);
  } catch (error) {
    if (error.message === "Invalid warehouse ID") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Warehouse not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
