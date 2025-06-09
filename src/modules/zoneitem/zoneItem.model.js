import mongoose from "mongoose";
import { Schema } from "mongoose";
import Item from "../item/item.model.js";
import Zone from "../zone/zone.model.js";
const zoneItemSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const ZoneItem = mongoose.model("ZoneItem", zoneItemSchema);
export default ZoneItem;
