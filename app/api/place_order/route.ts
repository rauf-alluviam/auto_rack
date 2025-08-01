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
     
    } = body;

    if (  !quantity || !size || !delivery_address) {
      return NextResponse.json({ success: false, message: 'All required fields must be filled' }, { status: 400 });
    }

    await connectToDB();

    const newOrder = await Order.create({
      quantity,
      size,
      delivery_address,
     
      is_accepted: false,
      estimated_delivery: '',
      order_status: 'Pending',
    });

    return NextResponse.json({ success: true, message: 'Order placed!', order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
