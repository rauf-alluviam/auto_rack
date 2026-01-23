/**
 * @swagger
 * /api/sellerOrder/customerOrder:
 *   get:
 *     summary: Get all orders (seller use)
 *     description: Requires a valid JWT token. Returns all orders sorted by creation date.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Failed to fetch orders
 */

/**
 * @swagger
 * /api/sellerOrder/customerOrder:
 *   put:
 *     summary: Update an existing order
 *     description: Requires a valid JWT token. Allows updating estimated delivery or order status.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               ETA:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected, delivered]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error or bad request
 *       401:
 *         description: Unauthorized or expired token
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */


import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '@/lib/db';
import { Order } from '@/lib/models/order';
import { Inventory } from '@/lib/models/inventory';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

/* ========================== GET ORDERS ========================== */
export async function GET(req: NextRequest) {
  await connectToDB();

  try {
    /* ===== AUTH (COOKIE) ===== */
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    console.log('Fetching orders for user ID:', userId);

    const orders = await Order.find()
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error('GET orders error:', err);

    if (err.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (err.name === 'TokenExpiredError') {
      return NextResponse.json({ message: 'Token expired' }, { status: 401 });
    }

    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/* ========================== UPDATE ORDER ========================== */
export async function PUT(req: NextRequest) {
  await connectToDB();

  try {
    /* ===== AUTH (COOKIE) ===== */
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    console.log('Updating order for user ID:', userId);

    const body = await req.json();
    const { orderId, estimated_delivery, ETA, status, remark } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = { updated_at: new Date() };

    if (estimated_delivery || ETA) {
      const deliveryDate = estimated_delivery || ETA;
      updateData.estimated_delivery = deliveryDate;
      updateData.ETA = new Date(deliveryDate);
    }

    if (status) {
      updateData.is_accepted = status;
    }

    if (remark !== undefined) {
      updateData.remark = remark;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    );

    /* ===== INVENTORY UPDATE (ON ACCEPT) ===== */
    if (status === 'Accepted' && existingOrder.is_accepted !== 'Accepted') {
      const sizeMap: Record<string, string> = {
        'Small Crate': 'S',
        'Medium Crate': 'M',
        'Large Crate': 'L',
        'Extra Large Crate': 'XL',
      };

      const sizeKey = sizeMap[existingOrder.size];
      if (sizeKey) {
        const inventoryDoc = await Inventory.findOne();
        if (inventoryDoc) {
          // Inventory logic (optional)
          // await Inventory.findByIdAndUpdate(
          //   inventoryDoc._id,
          //   { $inc: { [`inventory.${sizeKey}`]: -existingOrder.quantity } }
          // );
        }
      }
    }

    return NextResponse.json(
      { success: true, order: updatedOrder },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Order update error:', error);

    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
