// app/api/seller/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import { User } from '@/lib/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';

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
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is a seller/supplier
    if (decoded.userType !== 'supplier' && decoded.role !== 'supplier') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectToDB();

    // Get real order statistics based on your schema
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ 
      status: 'Pending' 
    });
    const acceptedOrders = await Order.countDocuments({ 
      is_accepted: 'Accepted' 
    });
    const deliveredOrders = await Order.countDocuments({ 
      status: 'Delivered' 
    });
    const activeShipments = await Order.countDocuments({ 
      is_accepted: 'Accepted',
      status: { $ne: 'Delivered' }
    });

    // Get recent orders with buyer information
    const recentOrders = await Order.find()
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Format recent orders for the dashboard
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

    // Calculate some changes (you can implement real comparison with previous periods)
    const totalOrdersChange = '+' + Math.floor(Math.random() * 10 + 1);
    const pendingOrdersChange = '+' + Math.floor(Math.random() * 5 + 1);
    const completedSalesChange = '+' + Math.floor(Math.random() * 8 + 1);
    const activeShipmentsChange = '+' + Math.floor(Math.random() * 3 + 1);

    // Create notifications based on recent orders
    const notifications: Notification[] = [];
    
    // Add notifications for recent pending orders
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
        type: 'order'
      });
    });

    // Add notifications for accepted orders
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
        type: 'system'
      });
    });

    // Add notifications for delivered orders
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
        type: 'system'
      });
    });

    const dashboardData = {
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
      notifications: notifications.slice(0, 6), // Limit to 6 notifications
      seller: {
        name: 'AutoRack Seller',
        email: decoded.email,
        totalRevenue: deliveredOrders * 2500, // Estimated revenue
        joinedDate: '2023-06-15',
      },
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
  return `${Math.floor(diffInSeconds / 86400)} day ago`;
}

// Optional: POST endpoint for updating dashboard data
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (decoded.userType !== 'supplier') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { action, data } = await request.json();

    // Handle different dashboard actions
    switch (action) {
      case 'status_update':
        break;
      
      case 'mark_notification_read':
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Action completed successfully' });

  } catch (error) {
    console.error('Dashboard POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}