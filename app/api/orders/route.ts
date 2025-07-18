import { connectToDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDB(); 
    const orders = await Order.find({});
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
