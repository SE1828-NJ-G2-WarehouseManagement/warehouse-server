const validateSchema = (schema) => {
    return (req, res, next) => {
      try {
        const validated = schema.parse(req.body); 
        req.body = validated;
        next();
      } catch (error) {
        return res.status(400).json({
          message: 'error',
          error: error.errors
        });
      }
    };
  };

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(CONSTANT.SPLIT_PREFIX)[1];
  
    //verify => token
  
    next();
  };

  const verifyRole = (requiredRole) => {
    return async (req, res, next) => {
    //   const { userId } = req.body;
  
    //   const userFound = await User.findOne({ _id: userId });
  
  
    //   if (userFound.role !== requiredRole) {
    //     return res.send(new ApiResponse(403, "You don't have permission", null));
    //   }
      next();
    };
  };
export { validateSchema, verifyRole }