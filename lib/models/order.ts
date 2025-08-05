import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
    buyerName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
 
  delivery_address: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Accepted', 'Rejected', 'Delivered']
  },
  is_accepted: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Accepted', 'Rejected']
  },
  order_date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ETA: {
    type: Date,
    default: null,
  },
  remark: {
  type: String,
  default: '',
},

//   inventoryId: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'Inventory',
//   required: true,
// },

});

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);