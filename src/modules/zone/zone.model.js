import mongoose from "mongoose";
import { Schema } from "mongoose";
import { STATUS } from "../../constant/status.constant.js";
import Warehouse from "../warehouse/warehouse.model.js";

const zoneSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    storageTemperature: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    currentCapacity: { type: Number, default: 0 },
    totalCapacity: { type: Number, required: true },
    status: {
      type: String,
      enum: [STATUS.ACTIVE, STATUS.INACTIVE],
      default: STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

const Zone = mongoose.model("Zone", zoneSchema);

export default Zone;
