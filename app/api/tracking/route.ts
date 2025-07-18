// File: app/api/tracking/route.ts

import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import TrackingUpdate from '@/lib/models/TrackingUpdate';

export async function GET() {
  try {
    await connectToDB();

    const acceptedOrders = await TrackingUpdate.find({ is_accepted: 'Accepted' })
      .populate('orderId'); // to get full order details if needed

    return NextResponse.json(acceptedOrders);
  } catch (error) {
    console.error('Error fetching accepted orders:', error);
    return NextResponse.json({ error: 'Failed to fetch accepted orders' }, { status: 500 });
  }
}
