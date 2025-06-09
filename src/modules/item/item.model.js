import mongoose from "mongoose";
import { Schema } from "mongoose";
import { STATUS } from "../../constant/status.constant.js";

const itemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    expiredDate: {
      type: Date,
      required: true,
    },
    weights: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [STATUS.ACTIVE, STATUS.INACTIVE],
      default: STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
