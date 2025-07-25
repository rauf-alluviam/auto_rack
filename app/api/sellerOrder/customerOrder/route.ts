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
 *               estimated_delivery:
 *                 type: string
 *                 format: date-time
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


import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDB } from '@/lib/db'
import { Order } from '@/lib/models/order'
import {NextApiRequest, NextApiResponse} from 'next'

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  await connectToDB();
  
  try {
    
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized - No token provided" }, { status: 401 });
    }

    // Verify JWT token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id; 

    console.log('Fetching orders for user ID:', userId);

    const orders = await Order.find()
      // .populate('buyer', 'buyer_id ')
      .sort({ createdAt: -1 }) 
      .lean(); 

    console.log(`Found ${orders.length} orders for user ${userId}`);

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error('GET orders error:', err);
    
    if (err.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if (err.name === 'TokenExpiredError') {
      return NextResponse.json({ message: "Token expired" }, { status: 401 });
    }
    
    return NextResponse.json({ message: "Failed to fetch orders", error: err.message }, { status: 500 });
  }
}

// PUT - For updating existing orders
export async function PUT(req: NextRequest) {
  await connectToDB()
 
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
  }
 
  const token = authHeader.replace('Bearer ', '')
  let decoded: any
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error('Token verification failed:', error)
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }
 
  const userId = decoded.id
  console.log('Updating order for user ID:', userId)
 
  try {
    const body = await req.json()
    console.log('Order update request body:', body)
 
   
    const { orderId, estimated_delivery, ETA, status } = body
    

    if (!orderId) {
      return NextResponse.json({
        error: 'Validation failed',
        details: ['orderId is required']
      }, { status: 400 })
    }

    
    const updateData: any = {
      updated_at: new Date()
    };

   
    if (estimated_delivery || ETA) {
      const deliveryDate = estimated_delivery || ETA;
      updateData.estimated_delivery = deliveryDate;
      updateData.ETA = new Date(deliveryDate);
      console.log('Setting delivery date:', deliveryDate);
    }

    if (status) {
      updateData.is_accepted = status;
      console.log('Setting status:', status);
    }

    console.log('Update data:', updateData);

   
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedOrder) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 })
    }
 
    console.log('Order updated successfully:', {
      orderId: updatedOrder._id,
      is_accepted: updatedOrder.is_accepted,
      estimated_delivery: updatedOrder.estimated_delivery,
      ETA: updatedOrder.ETA
    });

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 })
  } catch (error: any) {
    console.error('Order update error:', error)
 
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 })
    }

    if (error.name === 'CastError') {
      return NextResponse.json({
        error: 'Invalid order ID format'
      }, { status: 400 })
    }
 
    return NextResponse.json({ 
      error: 'Failed to update order',
      details: error.message 
    }, { status: 500 })
  }
}