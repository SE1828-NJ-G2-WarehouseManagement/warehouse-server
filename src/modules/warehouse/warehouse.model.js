import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { STATUS } from '../../constant/status.constant.js';
import User from '../user/user.model.js';    

const warehouseSchema = new Schema({
  name: { type: String,unique: true, required: true },
  address: { type: String },
  currentCapacity: { type: Number },
  totalCapacity: { type: Number },
  status: {
    type: String,
    enum: [STATUS.ACTIVE, STATUS.INACTIVE],
    default: STATUS.ACTIVE,
  },
  manageBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  staffs: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
},{timestamps: true}); 
const Warehouse = mongoose.model('Warehouse', warehouseSchema);

export default Warehouse;
