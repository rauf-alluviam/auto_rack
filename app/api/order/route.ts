import { connectToDB } from '@/lib/db';
import { Order } from '@/lib/models/order'; 
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await connectToDB();

  const { product_name, quantity, size, delivery_address, description } = await request.json();

  if (!product_name || !quantity || !size || !delivery_address) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const order = await Order.create({
      product_name,
      quantity,
      size,
      delivery_address,
      description
    });

    return NextResponse.json({ message: 'Order submitted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
