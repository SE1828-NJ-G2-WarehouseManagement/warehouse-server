import mongoose from "mongoose";
import { Schema } from "mongoose";
import Zone from "../zone/zone.model.js";
import User from "../user/user.model.js";
import Product from "../product/product.model.js";
import Supplier from "../supplier/supplier.model.js";
const inboundOrderSchema = new Schema({
  zoneId: {
    type: Schema.Types.ObjectId,
    ref: "Zone",
    required: true,
  },
  item: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      weights: {
        type: Number,
        required: true,
      },
      expiredDate: {
        type: Date,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
},{timestamps: true});

const InboundOrder = mongoose.model("InboundOrder", inboundOrderSchema);

export default InboundOrder;
