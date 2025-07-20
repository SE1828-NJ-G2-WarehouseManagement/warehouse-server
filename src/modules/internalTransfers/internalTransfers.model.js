import mongoose from "mongoose";
import { Schema } from "mongoose";
import { STATUS } from "../../constant/status.constant.js";

const internalTransferSchema = new Schema(
  {
    sourceWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    sourceZoneId: {
      type: Schema.Types.ObjectId,
      ref: "Zone",
      required: false,
    },
    items: [
      {
        zoneItemId: {
          type: Schema.Types.ObjectId,
          ref: "ZoneItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    receiver: {
      warehouseId: {
        type: Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
      },
      zoneId: {
        type: Schema.Types.ObjectId,
        ref: "Zone",
        default: null,
      },
    },
    status: {
      type: String,
      enum: [STATUS.PENDING, STATUS.APPROVED, STATUS.REJECTED],
      default: STATUS.PENDING,
    },
    rejectedNote: {
      type: String,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const InternalTransfer = mongoose.model(
  "InternalTransfer",
  internalTransferSchema
);

export default InternalTransfer;
