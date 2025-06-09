import e from "express";
import zoneService from "./zone.service.js";

export const getZones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await zoneService.getZones(req.user, page);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getZoneCapacity = async (req, res) => {
  try {
    const zoneCapacities = await zoneService.getZoneCapacity(req.user);
    res.status(200).json(zoneCapacities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getZoneById = async (req, res) => {
  try {
    const zoneId = req.params.id;
    const zone = await zoneService.getZoneById(req.user, zoneId);
    res.status(200).json(zone);
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message ===
      "Zone not found or does not belong to the user's warehouse"
    ) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const createZone = async (req, res) => {
  try {
    const zoneData = req.body;
    const newZone = await zoneService.createZone(req.user, zoneData);
    res.status(201).json(newZone);
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateZone = async (req, res) => {
  try {
    const zoneId = req.params.id;
    const zoneData = req.body;
    const updatedZone = await zoneService.updateZone(
      req.user,
      zoneId,
      zoneData
    );
    res.status(200).json(updatedZone);
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message ===
      "Zone not found or does not belong to the user's warehouse"
    ) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

export const changeStatusZone = async (req, res) => {
  try {
    const zoneId = req.params.id;
    const { status } = req.body;
    const updatedZone = await zoneService.changeStatusZone(
      req.user,
      zoneId,
      status
    );
    res.status(200).json(updatedZone);
  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    if (
      error.message ===
      "Zone not found or does not belong to the user's warehouse"
    ) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};
