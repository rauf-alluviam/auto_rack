import { connectToDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import TrackingUpdate from '@/lib/models/TrackingUpdate';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectToDB();

    const body = await req.json();
    const { orderId, status, estimated_delivery } = body;

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    order.order_status = status;
    order.estimated_delivery = estimated_delivery;
    await order.save();

    
    await TrackingUpdate.create({
      orderId: order._id,
      product_name: order.product_name,         
      delivery_address: order.delivery_address,   
      estimated_delivery,
      is_accepted: status,
      seller_id: order.seller_id,                 
    });

    return NextResponse.json({ message: 'Order updated and tracking created successfully' });
  } catch (err) {
    console.error('Error updating order:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
