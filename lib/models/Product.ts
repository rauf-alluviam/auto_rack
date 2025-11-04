import mongoose, { Schema, Document, models, model } from "mongoose"

export interface IProduct extends Document {
  product_name: string
  price: number
  description: string
  seller_id: mongoose.Types.ObjectId 
}

const ProductSchema: Schema = new Schema(
  {
    product_name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: false },
    seller_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
)


const Product = models.Product || model<IProduct>("Product", ProductSchema)

export default Product
