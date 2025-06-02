import mongoose from "mongoose";
import { Schema } from "mongoose";
import { STATUS } from "../../../constant/status.constant.js";
import User from "../user/user.model.js";
import Category from "../category/category.model.js";

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    storageTemperatureMin: { type: Number },
    storageTemperatureMax: { type: Number },
    density: { type: Number },
    image: { type: String },
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

const Product = mongoose.model("Product", productSchema);

export default Product;
