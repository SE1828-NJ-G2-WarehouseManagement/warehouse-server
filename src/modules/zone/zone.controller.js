import zoneService from "./zone.service.js";

export const getZones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const result = await zoneService.getZones(req.user, page);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getZoneCapacity = async (req, res) => {
  try {
    const zoneCapacities = await zoneService.getZoneCapacity(req.user);
    res.status(200).json(zoneCapacities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
