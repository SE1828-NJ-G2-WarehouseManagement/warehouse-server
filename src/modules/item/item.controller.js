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