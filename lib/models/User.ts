import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
  address: { type: String, default: "" },   
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
