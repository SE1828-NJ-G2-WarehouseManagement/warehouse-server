import { email } from "zod/v4";
import { publishEmail } from "../../config/kafka/producer.js";
import JwtUtils from "../../utils/auth.utils.js";
import {
  deleteOtpStored,
  deleteOtpVerified,
  generateOtp,
  getOtpStored,
  getOtpVerified,
  saveOtp,
  saveOtpVerified,
} from "../../utils/otp.utils.js";
import User from "./user.model.js";
import { ROLES } from "../../constant/role.constant.js";
import Warehouse from "../warehouse/warehouse.model.js";
import { STATUS } from "../../constant/status.constant.js";
import { deleteImage } from "../../config/cloudinary.js";

const login = async (email, password) => {
  try {
    //find user by email
    const user = await User.findOne({ email });
    const MESSAGE_NOT_FOUND = "User not found";
    const MESSAGE_NOT_MATH_PASSWORD = "Wrong password";

    if (!user) {
      throw new Error(MESSAGE_NOT_FOUND);
    }

    const isValidPassword = await JwtUtils.comparePassword(
      password,
      user.password
    );

    if (!isValidPassword) {
      throw new Error(MESSAGE_NOT_MATH_PASSWORD);
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const register = async (email, password, role) => {
  try {
    //find user by email
    const user = await User.findOne({ email });
    const MESSAGE_EXISTED_USER = "User has existed";

    if (user) {
      throw new Error(MESSAGE_EXISTED_USER);
    }

    const newUser = await User.create({
      email,
      password: await JwtUtils.hashPassword(password),
      role,
    });

    return newUser;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (email) => {
  try {
    const otp = generateOtp();

    //save to redis
    await saveOtp(email, otp);

    await publishEmail({
      to: email,
      subject: "Reset password",
      otp,
    });
  } catch (error) {
    console.log(error);
    throw new Error("Reset password failed");
  }
};

const verifyOtp = async (otp, email) => {
  try {
    const otpStored = await getOtpStored(email);

    console.log(otp, otpStored);

    if (otp !== otpStored) {
      throw new Error("Invalid otp verify");
    }

    await saveOtpVerified(email);
    await deleteOtpStored(email);
  } catch (error) {
    throw error;
  }
};

const changePassword = async (password, email) => {
  try {
    const userFound = await User.findOne({ email });

    if (!userFound) {
      throw new Error("Change password failed, user not found");
    }

    const isUserVerified = await getOtpVerified(email);

    if (!isUserVerified) {
      throw new Error("You need to verify first to change password");
    }

    const hashedPassword = await JwtUtils.hashPassword(password);
    userFound.password = hashedPassword;

    await userFound.save();

    //delete otp verified in redis cache
    await deleteOtpVerified(email);
  } catch (error) {
    throw error;
  }
};

const changePasswordUser = async (currentPassword, newPassword, email) => {
  try {
    const userFound = await User.findOne({ email });    
    if (!userFound) {
      return {
        isSuccess: false,
        message: "User not found",
      };
    }   
    const isValidPassword = await JwtUtils.comparePassword(
      currentPassword,
      userFound.password
    );
    if (!isValidPassword) {
      return {
        isSuccess: false,
        message: "Current password is incorrect",
      };
    } 
    const hashedPassword = await JwtUtils.hashPassword(newPassword);
    userFound.password = hashedPassword;
    await userFound.save();
    return {
      isSuccess: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error(`Error in changePasswordUser: ${error}`);
    return {
      isSuccess: false,
      message: "An error occurred while changing password",
    };
  }
};  

const viewProfile = async (email) => {
  try {
    const userFound = await User.findOne({ email }).select(
      "-password -__v -createdAt -updatedAt -_id"
    );

    if (!userFound) {
      throw new Error("User not found");
    }
    return userFound;
  } catch (error) {
    throw error;
  }
};

const updateProfile = async (email, username, phone, avatar, firstName, lastName) => {
  try {
    const userFound = await User.findOne({ email });

    if (!userFound) {
      throw new Error("User not found");
    }

    // If there's a new avatar and user has an existing avatar, delete the old one
    if (avatar && userFound.avatar !== null) {
      try {
        const oldAvatarUrl = userFound.avatar;
        const publicIdMatch = oldAvatarUrl.match(/warehouse-avatars\/([^\/]+)/);
        if (publicIdMatch) {
          const publicId = `warehouse-avatars/${publicIdMatch[1]}`;
          await deleteImage(publicId);
        }
      } catch (error) {
        console.error('Error deleting old avatar:', error);
        // Continue with update even if deletion fails
      }
    }


    userFound.username = username;
    userFound.phone = phone;
    userFound.avatar = avatar;
    userFound.firstName = firstName;
    userFound.lastName = lastName;
    userFound.updatedAt = new Date();

    const updatedUser = await userFound.save();

    return updatedUser;
  } catch(error) {
    throw error;
  }
}

const getAllUser = async () => {
  try {
    const listUser = await User.find({
      role: { $ne: ROLES.ADMIN_WAREHOUSE }
    }).select('-password')
    .populate('assignedWarehouse', 'name');
    return listUser;
  } catch (error) {
    throw error;
  }
}

const getAllManagerAvailable = async () => {
  try {
    const listManager = await User.find({
      role: {$eq: ROLES.WAREHOUSE_MANAGER},
      assignedWarehouse: {$eq: null}
    }).select('-password');

    return listManager;
  } catch (error) {
    throw error;
  }
}

const getUserById = async (id) => {
  try {
    const user = await User.findById(id).select('-password');
    return user;
  } catch (error) {
    throw error;
  }
}

const getAllStaffAvailable = async () => {
  try {
    // Get all staff users
    const staffs = await User.find({
      role: ROLES.WAREHOUSE_STAFF
    }).select('-password');

    // Get all active warehouses
    const warehouses = await Warehouse.find({
      status: STATUS.ACTIVE
    });

    // Get all staff IDs that are already assigned to warehouses
    const assignedStaffIds = warehouses.reduce((acc, warehouse) => {
      return [...acc, ...(warehouse.staffs || [])];
    }, []);

    // Filter out staff that are already assigned
    const staffsAvailable = staffs.filter(staff => 
      !assignedStaffIds.includes(staff._id.toString())
    );

    return staffsAvailable;
  } catch (error) {
    throw error;
  }
}

const deleteUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    await user.deleteOne();
  } catch (error) {
    throw error;
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
  deleteUserByEmail,
  changePasswordUser
};
