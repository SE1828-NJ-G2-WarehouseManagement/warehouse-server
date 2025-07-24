  import mongoose from "mongoose";
  import { Schema } from "mongoose";
  import { STATUS } from "../../constant/status.constant.js";
  import { ACTION } from "../../constant/action.constant.js";

  const productSchema = new Schema(
    {
      name: { type: String, required: true },
      category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
      storageTemperature: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
      },
      density: { type: Number },
      image: { type: String },
      status: {
        type: String,
        enum: [STATUS.PENDING, STATUS.APPROVED, STATUS.REJECTED],
        default: STATUS.PENDING,
      },
      action: {
        type: String,
        enum: [ACTION.ACTIVE, ACTION.INACTIVE],
        default: ACTION.INACTIVE,
      },
      rejectedNote: { type: String, default: null },
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
      approveBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      requestType: {
        type: String,
        enum: ["CREATE", "STATUS_CHANGE", "UPDATE"],
        default: null,
      },
      pendingChanges: {
        name: String,
        category: { type: Schema.Types.ObjectId, ref: "Category" },
        storageTemperature: {
          min: Number,
          max: Number,
        },
        density: Number,
        image: String,
        action: String,
      },
    },
    { timestamps: true }
  );

  const Product = mongoose.model("Product", productSchema);

  export default Product;
