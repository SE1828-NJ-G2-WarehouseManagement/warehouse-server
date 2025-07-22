import e from "express";
import warehouseService from "./warehouse.service.js";
import User from "../user/user.model.js";

export const getWarehouses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { status, name } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    const result = await warehouseService.getWarehouses(page, filter);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWarehouseById = async (req, res) => {
  try {
    const id = req.params.id;
    const warehouse = await warehouseService.getWarehouseById(id, req.user);
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
    const capacities = await warehouseService.getAllWarehouseCapacity(req.user);
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
export const getWarehousesWithZonesCapacity = async (req, res) => {
  try {
    let userId;
    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const warehouses = await warehouseService.getWarehousesWithZonesCapacity(
      userId
    );
    res.status(200).json(warehouses);
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getMyWarehouseWithZonesCapacity = async (req, res) => {
  try {
    let userId;
    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const warehouse = await warehouseService.getMyWarehouseWithZonesCapacity(
      userId
    );
    res.status(200).json(warehouse);
  } catch (error) {
    if (
      error.message === "User not found" ||
      error.message === "User must be assigned to a warehouse"
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};