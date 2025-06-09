import { PREFIX } from "../constant/config.constant.js";
import JwtUtils from "../utils/auth.utils.js";

const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      return res.status(400).json({
        message: "error",
        error: error.errors,
      });
    }
  };
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(PREFIX.SPLIT_PREFIX)[1];
  
  //verify => token
  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  const { valid, data } = JwtUtils.verifyJwt(token);

  if (!valid) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  console.log(data);
  req.user = data;
  next();
};

const verifyRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // Lấy từ token đã decode trong verifyToken

      if (!user || !user.role) {
        return res.status(403).json({ message: "Role not found in token" });
      }

      if (user.role !== requiredRole) {
        return res
          .status(403)
          .json({ message: "Access denied: insufficient role" });
      }

      next();
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Server error during role verification" });
    }
  };
};

export { validateSchema, verifyRole, verifyToken };
