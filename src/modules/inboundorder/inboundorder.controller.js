import inboundOrderService from "./inboundorder.service.js";

export const createInboundOrder = async (req, res) => {
  try {
    const inboundData = req.body;
    const inboundOrder = await inboundOrderService.createInboundOrder(
      inboundData,
      req.user
    );
    return res.status(201).json(inboundOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getListInboundOrder = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await inboundOrderService.getListInboundOrder(page);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInboundById = async (req, res) => {
  try {
    const id = req.params.id;
    const inboundOrder = await inboundOrderService.getInboundById(id);
    res.status(200).json(inboundOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
