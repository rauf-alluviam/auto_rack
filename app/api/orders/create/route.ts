import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import { Order } from '@/lib/models/order';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      quantity,
      size,
      delivery_address,
      estimated_delivery,
      buyer_id,
      seller_id,
      customer_name,
      order_date,
    } = body;

    if (
      !quantity ||
      !size ||
      !delivery_address ||
      !estimated_delivery ||
      !buyer_id ||
      !seller_id ||
      !customer_name ||
      !order_date
    ) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    await connectToDB();

    const newOrder = await Order.create({
      quantity,
      size,
      delivery_address,
      estimated_delivery,
      buyer_id,
      seller_id,
      customer_name,
      order_date,
      order_status: 'Pending',
      is_accepted: false,
    });

    return NextResponse.json(
      { success: true, message: 'Order placed!', order: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}
