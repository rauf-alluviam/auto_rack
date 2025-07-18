import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
  delivery_address: { type: String, required: true },
  description: { type: String },

  // 🆕 Tracking-related fields
  is_accepted: { type: String, default: "Pending" }, // "Yes", "No", "Pending"
  estimated_delivery: { type: Date },                // Seller will set this
  order_status: {                                     // Track status
    type: String,
     enum: [ 'Accepted', 'Packaging', 'In Production', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Accepted',
  },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date }
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
