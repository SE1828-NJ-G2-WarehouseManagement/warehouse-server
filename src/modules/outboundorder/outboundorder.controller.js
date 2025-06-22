import outboundOrderService from "./outboundorder.service.js";

export const createOutboundOrder = async (req, res) => {
  try {
    const outboundData = req.body;
    const outboundOrder = await outboundOrderService.createOutboundOrder(
      outboundData,
      req.user
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