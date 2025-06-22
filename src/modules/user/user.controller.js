import JwtUtils from "../../utils/auth.utils.js";
import * as userService from "./user.service.js";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userService.login(email, password);

    const token = JwtUtils.signJwt({
      email,
      role: user.role,
    });
    return res.json({
      data: {
        email: user.email,
        role: user.role,
      },
      message: "Login successfully",
      isSuccess: true,
      token,
    });
  } catch (error) {
    return res.json({
      data: null,
      isSuccess: false,
      message: "Login failed",
    });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const newUser = await userService.register(email, password, role);

    return res.json({
      data: newUser,
      message: "Register successfully",
      isSuccess: true,
    });
  } catch (error) {
    if (error.message === "User has existed") {
      return res.status(400).json({
        data: null,
        isSuccess: false,
        message: "User has existed",
      });
    }
    return res.status(500).json({
      data: null,
      isSuccess: false,
      message: "Register failed",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    await userService.resetPassword(email);
    res.status(200).json({
      message: "Sent OTP to your email successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Sent OTP failed",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    await userService.verifyOtp(otp, email);

    return res.json({
      message: "Verified successfully",
      isSuccess: true,
    });
  } catch (error) {
    return res.json({
      message: "Verified failed",
      isSuccess: false,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword, email } = req.body;

    await userService.changePassword(newPassword, email);

    return res.status(200).json({
      message: "change password successfully",
      isSuccess: true,
    });
  } catch (error) {
    return res.status(400).json({
      message: "change password failed",
      isSuccess: false,
    });
  }
};

const viewProfile = async (req, res) => {
  try {
    const { email } = req.user;

    const user = await userService.viewProfile(email);

    return res.status(200).json({
      message: "View profile successfully",
      isSuccess: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "View profile failed",
      isSuccess: false,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, username, phone, firstName, lastName } = req.body;

    // Get avatar URL from uploaded file if exists
    const avatar = req.file ? req.file.path : undefined;
    

    const updatedUser = await userService.updateProfile(
      email,
      username,
      phone,
      avatar,
      firstName,
      lastName
    );

    return res.status(200).json({
      message: "Update profile successfully",
      isSuccess: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log(`error: ${error}`);
    return res.status(500).json({
      message: "Update profile failed",
      isSuccess: false,
    });
  }
};


const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    return res.status(200).json({
      message: "Get user by id successfully",
      isSuccess: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get user by id failed",
      isSuccess: false,
    });
  }
}

const getAllUser = async (req, res) => {
  try {
    const data = await userService.getAllUser();
    console.log(data);
    return res.status(200).json({
      message: "Get list successfully",
      isSuccess: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get list failed",
      isSuccess: false,
    });
  }
};

const getAllManagerAvailable = async (req, res) => {
  try {
    const data = await userService.getAllManagerAvailable();
    console.log(data);
    return res.status(200).json({
      message: "Get list manager available successfully",
      isSuccess: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get list failed",
      isSuccess: false,
    });
  }
};

const getAllStaffAvailable = async (req, res) => {
  try {
    const data = await userService.getAllStaffAvailable();
    return res.status(200).json({
      message: "Get list staff available successfully",
      isSuccess: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get list failed",
      isSuccess: false,
    });
  }
}

const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.deleteUserByEmail(email);
    return res.status(200).json({
      message: "Delete user successfully",
      isSuccess: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Delete user failed",
      isSuccess: false,
    });
  }
}

export {
  login,
  register,
  resetPassword,
  verifyOtp,
  changePassword,
  viewProfile,
  updateProfile,
  getAllUser,
  getAllManagerAvailable,
  getAllStaffAvailable,
  getUserById,
  deleteUserByEmail
};
