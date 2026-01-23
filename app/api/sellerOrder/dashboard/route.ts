import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  userType: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'system';
}

interface FormattedOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  quantity: number;
  size: string;
  status: string;
  isAccepted: string;
  date: Date;
  address: string;
  eta?: Date;
}

export async function GET(request: NextRequest) {
  try {
    /* ================= AUTH (COOKIE) ================= */
    const cookieStore = await cookies();
const token = cookieStore.get('token')?.value;


    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.userType !== 'supplier' && decoded.role !== 'supplier') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    /* ================= DB ================= */
    await connectToDB();

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const acceptedOrders = await Order.countDocuments({ is_accepted: 'Accepted' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });
    const activeShipments = await Order.countDocuments({
      is_accepted: 'Accepted',
      status: { $ne: 'Delivered' },
    });

    const recentOrders = await Order.find()
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedOrders: FormattedOrder[] = recentOrders.map((order: any) => ({
      id: order._id.toString(),
      customerName: order.buyer?.name || 'Unknown Customer',
      customerEmail: order.buyer?.email || '',
      quantity: order.quantity,
      size: order.size,
      status: order.status.toLowerCase(),
      isAccepted: order.is_accepted,
      date: order.order_date || order.createdAt,
      address: order.delivery_address,
      eta: order.ETA,
    }));

    /* ================= STATS CHANGES ================= */
    const totalOrdersChange = '+' + Math.floor(Math.random() * 10 + 1);
    const pendingOrdersChange = '+' + Math.floor(Math.random() * 5 + 1);
    const completedSalesChange = '+' + Math.floor(Math.random() * 8 + 1);
    const activeShipmentsChange = '+' + Math.floor(Math.random() * 3 + 1);

    /* ================= NOTIFICATIONS ================= */
    const notifications: Notification[] = [];

    const recentPendingOrders = await Order.find({ status: 'Pending' })
      .populate('buyer', 'name')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    recentPendingOrders.forEach((order: any) => {
      notifications.push({
        id: notifications.length + 1,
        title: 'New Order Received',
        message: `Order from ${order.buyer?.name || 'Unknown'} - Qty: ${order.quantity}, Size: ${order.size}`,
        time: getTimeAgo(order.createdAt),
        type: 'order',
      });
    });

    const recentAcceptedOrders = await Order.find({ is_accepted: 'Accepted' })
      .populate('buyer', 'name')
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    recentAcceptedOrders.forEach((order: any) => {
      notifications.push({
        id: notifications.length + 1,
        title: 'Order Accepted',
        message: `Order from ${order.buyer?.name || 'Unknown'} has been accepted`,
        time: getTimeAgo(order.createdAt),
        type: 'system',
      });
    });

    const recentDeliveredOrders = await Order.find({ status: 'Delivered' })
      .populate('buyer', 'name')
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    recentDeliveredOrders.forEach((order: any) => {
      notifications.push({
        id: notifications.length + 1,
        title: 'Order Delivered',
        message: `Order to ${order.buyer?.name || 'Unknown'} has been delivered successfully`,
        time: getTimeAgo(order.createdAt),
        type: 'system',
      });
    });

    /* ================= RESPONSE ================= */
    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        completedSales: deliveredOrders,
        activeShipments,
        totalOrdersChange,
        pendingOrdersChange,
        completedSalesChange,
        activeShipmentsChange,
      },
      recentOrders: formattedOrders,
      notifications: notifications.slice(0, 6),
      seller: {
        name: 'AutoRack Seller',
        email: decoded.email,
        totalRevenue: deliveredOrders * 2500,
        joinedDate: '2023-06-15',
      },
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* ================= HELPER ================= */
function getTimeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;
  return `${Math.floor(diff / 86400)} day ago`;
}
