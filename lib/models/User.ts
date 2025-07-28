import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['buyer', 'supplier'], default: 'buyer', required: true },
  // address: { type: String, default: "" },   
});

// Clear existing model to avoid caching issues in development
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User = mongoose.model('User', UserSchema);