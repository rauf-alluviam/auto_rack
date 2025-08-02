import mongoose, { Schema, Document, Model } from 'mongoose';
console.log(" User model loaded");

export interface IUser extends Document {
  name: string;
  companyName: string;
  email: string;
  password: string;
  userType: 'buyer' | 'supplier';
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['buyer', 'supplier'], default: 'buyer', required: true },
});

// ✅ This ensures the model is not re-registered in dev mode (prevents MissingSchemaError)
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
