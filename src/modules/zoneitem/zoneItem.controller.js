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
