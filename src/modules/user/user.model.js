import mongoose from 'mongoose';
import { ROLES } from '../../constant/role.constant.js';
import { STATUS } from '../../constant/status.constant.js';
import Warehouse from '../warehouse/warehouse.model.js';
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: [ROLES.ADMIN_WAREHOUSE, ROLES.WAREHOUSE_MANAGER, ROLES.WAREHOUSE_STAFF],
  },
  status: {
    type: String,
    enum: [STATUS.ACTIVE, STATUS.INACTIVE],
    default: STATUS.ACTIVE
  },
  avatar: {
    type: String
  },
  assignedWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    default: null
  }
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

export default User;
