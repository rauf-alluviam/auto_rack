/**
 * @swagger
 * /api/sellerOrder/orderHistory:
 *   get:
 *     summary: Get all delivered or accepted orders (Order History)
 *     description: Returns a list of orders that are either "Delivered"
 *     tags:
 *       - Order History
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivered orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderHistory'
 *                 total:
 *                   type: integer
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized or invalid token (optional warning only)
 *       500:
 *         description: Server error while fetching order history
 *
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   schemas:
 *     OrderHistory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64b7f1a5e3d531c59f8f28e1"
 *         product_name:
 *           type: string
 *           example: "Crate"
 *         delivery_address:
 *           type: string
 *           example: "123 Main St, City, Country"
 *         estimated_delivery:
 *           type: string
 *           format: date
 *           example: "2025-07-25"
 *         is_accepted:
 *           type: string
 *           enum: [Accepted, Rejected, Pending]
 *           example: "Accepted"
 *         status:
 *           type: string
 *           enum: [In Production , Qulity Check, packaging, shipped, Delivered, Cancelled]
 *           example: "Delivered"
 *         quantity:
 *           type: integer
 *           example: 2
 *         delivery_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2025-07-24T16:00"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-07-22T10:00"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-07-23T09:00"
 */


import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDB } from '@/lib/db'
import { Order } from '@/lib/models/order'
import { Types } from 'mongoose'

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";


interface OrderDocument {
  _id: Types.ObjectId;
  product_name?: string;
  customer_name?: string;
  delivery_address?: string;
  address?: string;
  estimated_delivery?: string;
  is_accepted?: string;
  status?: string;
  quantity?: number;
  size?: string;
  buyer?: {
    name?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  updated_at?: Date;
  ETA?: Date;
  order_date?: Date;
  delivery_date?: Date;
  [key: string]: any; 
}

export async function GET(req: NextRequest) {
  try {
 
    await connectToDB();
    
    const authHeader = req.headers.get("authorization");
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
          console.log('Fetching order history for authenticated user:', userId);
        } catch (err) {
          console.warn('Token verification failed, fetching all delivered orders:', err);
        }
      }
    }


    const deliveredOrders = await Order.find({
      $or: [
        { is_accepted: "Accepted" },
        { status: "Delivered" }
      ]
    })
      .sort({ 
        delivery_date: -1,  
        createdAt: -1      
      })
      .lean() as OrderDocument[];

    console.log(`Found ${deliveredOrders.length} delivered orders`);

    const transformedOrders = deliveredOrders.map((order: OrderDocument) => {
      
      let deliveryDate = '';
      if (order.estimated_delivery) {
        deliveryDate = new Date(order.estimated_delivery).toISOString().slice(0, 16);
      } else if (order.ETA) {
        deliveryDate = new Date(order.ETA).toISOString().slice(0, 16);
      }

      return {
        _id: order._id.toString(),
        product_name: order.product_name || order.size || 'Product',
        customer_name: order.customer_name || order.buyer?.name || 'Customer',
        delivery_address: order.delivery_address || order.address || '',
        estimated_delivery: deliveryDate,
        is_accepted: order.is_accepted || 'Accepted',
        status: order.status || order.is_accepted || 'Delivered',
        quantity: order.quantity || 1,
        delivery_date: order.delivery_date || null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt || order.updated_at
      };
    });

    
    const validDeliveredOrders = transformedOrders.filter(order => {
      return order.is_accepted === 'Accepted' || order.status === 'Delivered';
    });

    console.log(`Returning ${validDeliveredOrders.length} delivered orders`);

    return NextResponse.json({ 
      orders: validDeliveredOrders,
      total: validDeliveredOrders.length,
      message: validDeliveredOrders.length === 0 ? "No delivered orders found" : `Found ${validDeliveredOrders.length} delivered orders`
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (err: any) {
    console.error('GET order-history error:', err);
    
    return NextResponse.json({ 
      message: "Failed to fetch order history", 
      error: err.message,
      orders: []
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}


// export async function POST(req: NextRequest) {
//   return NextResponse.json({ 
//     message: "POST method not supported for order history" 
//   }, { 
//     status: 405,
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });
// }