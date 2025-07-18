import mongoose from 'mongoose';

const acceptedOrderSchema = new mongoose.Schema({
  product_name: String,
  quantity: Number,
  size: String,
  delivery_address: String,
  estimated_delivery: String,
  is_accepted: String
}, { timestamps: true });

export default mongoose.models.AcceptedOrder || mongoose.model('AcceptedOrder', acceptedOrderSchema);
