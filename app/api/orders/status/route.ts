import { connectToDB } from '@/lib/db';
import TrackingUpdate from '@/lib/models/TrackingUpdate';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDB();

    const trackingData = await TrackingUpdate.find({ is_accepted: 'Accepted' });

    const result = trackingData.map((item) => ({
      _id: item._id,
      product_name: item.product_name,
      delivery_address: item.address,
      estimated_delivery: item.estimated_delivery,
      status: item.status || 'Pending',
    }));

    return NextResponse.json({ orders: result });
  } catch (err) {
    console.error('Error in /api/orders/status:', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
