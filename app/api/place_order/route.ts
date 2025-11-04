import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import { Inventory } from '@/lib/models/inventory';

// ✅ Declare allowed sizes OUTSIDE the function
type SizeType = "S" | "M" | "L" | "XL";

export async function POST(request: Request) {
  try {
    await connectToDB();
    const body = await request.json();

    const { productId, buyerId, quantity, size, delivery_address } = body as {
      productId: string;
      buyerId: string;
      quantity: number;
      size: SizeType;
      delivery_address: string;
    };

    // ✅ Validate required data
    if (!productId || !buyerId || !quantity || !size || !delivery_address) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // ✅ Fetch the product from inventory
    const product = await Inventory.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    // ✅ Ensure inventory object is typed
    const stock = (product.inventory as Record<SizeType, number>)[size];

    if (stock < quantity) {
      return NextResponse.json(
        { success: false, message: `Only ${stock} units available in size ${size}` },
        { status: 400 }
      );
    }

    // ✅ Decrease stock
    // await Inventory.findByIdAndUpdate(
    //   productId,
    //   { $inc: { [`inventory.${size}`]: -quantity } },
    //   { new: true }
    // );

    // ✅ Create order
    const newOrder = await Order.create({
      buyerId,
      productId,
      quantity,
      size,
      delivery_address,
      is_accepted: false,
      estimated_delivery: "",
      order_status: "Pending",
   
    });

    return NextResponse.json(
      { success: true, message: "Order placed successfully", order: newOrder },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error placing order:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
