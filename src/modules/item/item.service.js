import Item from "./item.model.js";

const getItemsByProductId = async (productId) => {
  return await Item.find({ productId }).populate("productId");
};

export default {
  getItemsByProductId,
};
