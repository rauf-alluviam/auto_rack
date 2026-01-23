/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       size:
 *                         type: string
 *                       address:
 *                         type: string
 *                       product_name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       order_date:
 *                         type: string
 *                         format: date-time
 *                       is_accepted:
 *                         type: string
 *                       ETA:
 *                         type: string
 *                         format: date-time
 *                       estimated_delivery:
 *                         type: string
 *                         format: date-time
 *                       buyer:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *       401:
 *         description: Unauthorized or invalid token
 *       500:
 *         description: Failed to fetch orders
 *
 *   post:
 *     summary: Create a new order
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
 *             required:
 *               - quantity
 *               - size
 *               - address
 *             properties:
 *               quantity:
 *                 type: number
 *               size:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   type: object
 *       400:
 *         description: Validation error (e.g. missing fields)
 *       401:
 *         description: Unauthorized or invalid token
 *       500:
 *         description: Failed to create order
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDB } from '@/lib/db'
import { Order } from '@/lib/models/order'
import  User  from '@/lib/models/User';
import { Inventory } from '@/lib/models/inventory';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  await connectToDB();
  
  try {
   
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized - No token provided" }, { status: 401 });
    }

   
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id; 

    console.log('Fetching orders for user ID:', userId);

    
    const orders = await Order.find({ buyer: userId })
      .populate('buyer', 'name email') 
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

// POST 

export async function POST(req: NextRequest) {
  await connectToDB();

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");





  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const buyerId = decoded.id;

  try {
    const body = await req.json();
    const { quantity, size, address, product_name, remark } = body;

    if (!quantity || !size || !address) {
      return NextResponse.json(
        { error: "Missing required fields", details: body },
        { status: 400 }
      );
    }

    const buyer = await User.findById(buyerId).lean();
    if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

    // ✅ Create Order
    const newOrder = await Order.create({
      buyer: buyerId,
      buyerName: buyer.name,
      quantity: parseInt(quantity),
      size,
      address,
      delivery_address: address,
      product_name,
      status: "Pending",
      order_date: new Date(),
      is_accepted: "Pending",
      ETA: null,
      estimated_delivery: null,
      remark: remark || "",
  
    });

    console.log("✅ Order created:", newOrder._id);

    // ✅ Inventory Size Mapping
    const sizeMap: any = {
      "Small Crate": "S",
      "Medium Crate": "M",
      "Large Crate": "L",
      "XL Crate": "XL",
    };
    const dbSize = sizeMap[size];

    // ✅ Reduce inventory after order
    if (dbSize) {
      const invItem = await Inventory.findOne({ productName: product_name });
      if (invItem) {
        await Inventory.findByIdAndUpdate(
          invItem._id,
          { $inc: { [`inventory.${dbSize}`]: -quantity } },
          { new: true }
        );
        console.log(`✅ Inventory updated for ${product_name}: -${quantity} ${dbSize}`);
      } else {
        console.warn("⚠️ Inventory product not found:", product_name);
      }
    } else {
      console.warn("⚠️ Size not found in inventory map:", size);
    }

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Order creation failed:", error.message);
    return NextResponse.json(
      { error: "Failed to place order", details: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(req: NextRequest) {
  await connectToDB();

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const userId = decoded.id;

  try {
    const body = await req.json();
    const { orderId, ETA, status, remark } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const updateFields: any = {
      updated_at: new Date()
    };

    if (ETA) updateFields.ETA = new Date(ETA);
    if (status) updateFields.is_accepted = status;
    if (remark !== undefined) updateFields.remark = remark;

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      updateFields,
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
