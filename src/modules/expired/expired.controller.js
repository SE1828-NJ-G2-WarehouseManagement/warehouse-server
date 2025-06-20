import expireService from "./expired.service.js";

export const getAllExpiringSoon = async (req, res) => {
  try {
    const expiringItems = await expireService.getAllExpiringSoon(req.user);
    res.status(200).json(expiringItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
