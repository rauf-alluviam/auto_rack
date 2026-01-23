import mongoose, { Schema, Document, Model, Types  } from 'mongoose';

export interface IUser extends Document {
   _id: Types.ObjectId;   
  name: string;
  companyName: string;
  email: string;
  password: string;
  userType: 'buyer' | 'supplier';
  access_modules?: string[];
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: {
    type: String,
    enum: ['buyer', 'supplier'],
    
    default: 'buyer',
    required: true
  },
  access_modules: { type: [String], default: [] }
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
