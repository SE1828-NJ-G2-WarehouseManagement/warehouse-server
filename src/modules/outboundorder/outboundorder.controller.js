import outboundOrderService from "./outboundorder.service.js";
import User from "../user/user.model.js";

export const createOutboundOrder = async (req, res) => {
  try {
    const outboundData = req.body;
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
    const outboundOrder = await outboundOrderService.createOutboundOrder(
      outboundData,
      userId
    );
    return res.status(201).json(outboundOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getListOutboundOrder = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await outboundOrderService.getListOutboundOrder(page);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOutboundOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await outboundOrderService.getOutboundOrderById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOutboundOrderByWarehouse = async (req, res) => {
  try {
    const user = req.user;
    const orders = await outboundOrderService.getOutboundOrderByWarehouse(user);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
