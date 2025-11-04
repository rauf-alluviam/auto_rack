import mongoose from 'mongoose';

const trackingUpdateSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
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
    default: 'Pending',
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const TrackingUpdate = mongoose.models.TrackingUpdate || mongoose.model('TrackingUpdate', trackingUpdateSchema);

export default TrackingUpdate;
