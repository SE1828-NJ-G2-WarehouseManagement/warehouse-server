import User from "../user/user.model.js";
import zoneItemService from "./zoneItem.service.js";

export const getItemByZoneId = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { zoneId } = req.params;
    const user = req.user;
    const items = await zoneItemService.getItemByZoneId(zoneId, user, page);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const transferBetweenZone = async (req, res) => {
  try {
    const { sourceZoneId, destinationZoneId, itemId, quantity } = req.body;
    const user = req.user;

    const result = await zoneItemService.transferBetweenZone(
      sourceZoneId,
      destinationZoneId,
      itemId,
      quantity,
      user
    );

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getProductsInMyWarehouse = async (req, res) => {
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

    const products = await zoneItemService.getProductsInMyWarehouse(userId);
    res.status(200).json(products);
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
export const getAllActiveProductsInZones = async (req, res) => {
  try {
    const products = await zoneItemService.getAllActiveProductsInZones();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProductsInZones = async (req, res) => {
  try {
    const products = await zoneItemService.getAllProductsInZones();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};