import User from "../user/user.model.js";
import itemService from "./item.service.js";

export const getItemsByProductId = async (req, res) => {
  try {
    const { productId } = req.query;
    const items = await itemService.getItemsByProductId(productId);
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getItemsInMyWarehouse = async (req, res) => {
  try {
    let userId;
    if (req.user._id) {
      userId = req.user._id;
    } else if (req.user.email) {
      const user = await User.findOne({ email: req.user.email });
      if (!user) return res.status(401).json({ message: "User not found" });
      userId = user._id;
    } else {
      return res.status(400).json({ message: "User ID not found in token" });
    }

    const items = await itemService.getItemsInMyWarehouse(userId);
    res.status(200).json(items);
  } catch (error) {
    if (error.message === "User must be assigned to a warehouse") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};