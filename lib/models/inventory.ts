import mongoose, { Document, Model } from 'mongoose';

export interface IInventory extends Document {
  productName: string;
  inventory: {
    S: number;
    M: number;
    L: number;
    XL: number;
  };
}

const InventorySchema = new mongoose.Schema<IInventory>({
  productName: { type: String, required: true },
  inventory: {
    S: { type: Number, default: 0 },
    M: { type: Number, default: 0 },
    L: { type: Number, default: 0 },
    XL: { type: Number, default: 0 },
  },
});

export const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);
