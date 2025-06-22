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
