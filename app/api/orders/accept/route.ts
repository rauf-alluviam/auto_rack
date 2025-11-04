import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import { Order } from '@/lib/models/order'

export async function POST(req: NextRequest) {
  await connectToDB();

  try {
    const { orderId, estimated_delivery } = await req.json();

    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      is_accepted: 'Processing',
      estimated_delivery: estimated_delivery,
    }, { new: true });

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order accepted', order: updatedOrder });
  } catch (err) {
    console.error('Error updating order:', err);
    return NextResponse.json({ message: 'Failed to update order' }, { status: 500 });
  }
}
