import { connectToDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    const { delivery_address, quantity, size } = body;

    if (!delivery_address || quantity || size) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const newOrder = await Order.create({
      delivery_address,
      order_status: 'Pending',
      estimated_delivery: '',
      quantity,
      size,
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully.',
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error(' API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
