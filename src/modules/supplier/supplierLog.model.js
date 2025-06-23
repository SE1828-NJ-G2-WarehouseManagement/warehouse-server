import mongoose from "mongoose";
import { Schema } from "mongoose";
import { STATUS } from "../../constant/status.constant.js";
import { ACTION } from "../../constant/action.constant.js";
import User from "../user/user.model.js";
import Supplier from "./supplier.model.js";
import { requestType } from "../../constant/requestType.constant.js";

const supplierLogSchema = new Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null, // null nếu tạo mới
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    taxId: { type: String, required: true },
    status: {
      type: String,
      enum: [STATUS.PENDING, STATUS.APPROVED, STATUS.REJECTED],
      default: STATUS.PENDING,
    },
    rejectedNote: { type: String, default: null },
    approveBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [ACTION.ACTIVE, ACTION.INACTIVE],
      default: ACTION.INACTIVE,
    },
    requestType: {
      type: String,
      enum: [requestType.CREATE, requestType.UPDATE],
      required: true,
    },
  },

  { timestamps: true }
);

const SupplierLog = mongoose.model("SupplierLog", supplierLogSchema);
export default SupplierLog;
