import expireService from "./expired.service.js";

export const getAllExpiringSoon = async (req, res) => {
  try {
    const expiringItems = await expireService.getAllExpiringSoon(req.user);
    res.status(200).json(expiringItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpiredProducts = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const result = await expireService.getExpiredProductsByUserEmail(userEmail);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching expired products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};