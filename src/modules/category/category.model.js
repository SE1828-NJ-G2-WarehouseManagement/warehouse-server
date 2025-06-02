import mongoose from "mongoose";
import { Schema } from "mongoose";
import { STATUS } from "../../../constant/status.constant.js";
import User from "../user/user.model.js";

const categorySchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    status: {
      type: String,
      enum: [STATUS.ACTIVE, STATUS.INACTIVE, STATUS.PENDING, STATUS.REJECTED],
      default: STATUS.ACTIVE,
    },
    reason: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
