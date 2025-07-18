import mongoose, { Schema, models } from 'mongoose';

const trackingUpdateSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  delivery_address: {
    type: String,
    required: true,
  },
  estimated_delivery: {
    type: String,
    required: true,
  },
  is_accepted: {
    type: String,
    default: 'Accepted',
  },
  seller_id: {
    type: String, // can also be ObjectId if you have a Seller model
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const TrackingUpdate = models.TrackingUpdate || mongoose.model('TrackingUpdate', trackingUpdateSchema);
export default TrackingUpdate;
