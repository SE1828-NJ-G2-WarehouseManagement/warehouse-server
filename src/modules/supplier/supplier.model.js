import mongoose from "mongoose";
import { Schema } from "mongoose";
import { STATUS } from "../../constant/status.constant.js";
import { ACTION } from "../../constant/action.constant.js";
import User from "../user/user.model.js";

const supplierSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    address: { type: String, required: true },
    taxId: { type: String, unique: true, required: true },
    status: {
      type: String,
      enum: [ STATUS.PENDING,STATUS.APPROVED, STATUS.REJECTED],
      default: STATUS.PENDING,
    },
    rejectedNote: { type: String, default: null },
    approveBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    action: {
      type: String,
      enum: [ACTION.ACTIVE, ACTION.INACTIVE],
      default: ACTION.INACTIVE,
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
