import mongoose from "mongoose";
import { Schema } from "mongoose";
import ZoneItem from "../zoneitem/zoneitem.model.js";
const expiredSchema = new Schema(
  {
    zoneItemId: {
      type: Schema.Types.ObjectId,
      ref: "ZoneItem",
      required: true,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

const Expired = mongoose.model("Expired", expiredSchema);
export default Expired;
