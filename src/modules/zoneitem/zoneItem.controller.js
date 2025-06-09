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
