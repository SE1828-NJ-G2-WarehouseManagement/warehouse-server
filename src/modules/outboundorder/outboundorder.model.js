import mongoose from "mongoose";
import { Schema } from "mongoose";

const outboundOrderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    signed: {
      type: String,
      required: false,
    },
    items: [
      {
        zoneItem: {
          type: Schema.Types.ObjectId,
          ref: "ZoneItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    quantity: {
      type: Number,
      required: true,
    },
    createBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const OutboundOrder = mongoose.model("OutboundOrder", outboundOrderSchema);
export default OutboundOrder;