/**
 * @swagger
 * /api/sellerOrder/updatestatus:
 *   get:
 *     summary: Fetch accepted orders with delivery status
 *     description: Retrieves orders that are accepted and have an estimated delivery or ETA. Authentication token is optional.
 *     tags:
 *       - Order Status
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
 *                     $ref: '#/components/schemas/OrderStatus'
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Update the status or delivery of an order
 *     description: Accepts or updates the status of an order using orderId. Optionally includes estimated_delivery.
 *     tags:
 *       - Order Status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "64b7f1a5e3d531c59f8f28e1"
 *               ETA:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-28"
 *               status:
 *                 type: string
 *                 enum: [In Production, Qulity Check, packaging, shipped, Delivered, Cancelled]
 *                 example: "Delivered"
 *     responses:
 *       200:
 *         description: Successfully updated order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   $ref: '#/components/schemas/OrderStatus'
 *       400:
 *         description: Missing required fields or validation error
 *       401:
 *         description: Unauthorized or invalid token
 *       404:
 *         description: Order not found
 *       500:
 *         description: Failed to process status update
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     OrderStatus:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         delivery_address:
 *           type: string
 *         ETA:
 *           type: string
 *           format: date
 *         is_accepted:
 *           type: string
 *           enum: [Accepted, Rejected, Pending]
 *         status:
 *           type: string
 *           enum: [In Production, Qulity Check, packaging, shipped, Delivered, Cancelled]
 *         quantity:
 *           type: integer
 *         updatedAt:
 *           type: string
 *           format: date
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
  [key: string]: any; 
}

export async function GET(req: NextRequest) {
  await connectToDB();
  
  try {
    const authHeader = req.headers.get("authorization");
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
          console.log('Fetching orders for authenticated user:', userId);
        } catch (err) {
          console.warn('Token verification failed, fetching all orders:', err);
        }
      }
    }

 
    const allOrders = await Order.find()
      .sort({ createdAt: -1 })
      .lean() as OrderDocument[];

    console.log('=== DEBUG: ALL ORDERS ===');
    allOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        _id: order._id.toString(),
        is_accepted: order.is_accepted,
        status: order.status, 
        estimated_delivery: order.estimated_delivery,
        product_name: order.product_name,
        size: order.size,
        customer_name: order.customer_name,
        buyer_name: order.buyer?.name
      });
    });

   
    const acceptedOrders = allOrders.filter(order => order.is_accepted === "Accepted");
    console.log(`\n=== STEP 1: Found ${acceptedOrders.length} orders with status "Accepted" ===`);

    const withDeliveryDate = acceptedOrders.filter(order => 
      order.estimated_delivery && 
      order.estimated_delivery !== null && 
      order.estimated_delivery !== ""
    );
    console.log(`\n=== STEP 2: Found ${withDeliveryDate.length} accepted orders with delivery dates ===`);

    
    const orders = await Order.find({
      $and: [
        {
          $or: [
            { is_accepted: "Accepted" },
            { status: { $nin: ["Pending", ""] } }
          ]
        },
        {
          $or: [
            { 
              estimated_delivery: { 
                $exists: true, 
                $ne: null, 
                $nin: ["", null] 
              }
            },
            { 
              ETA: { 
                $exists: true, 
                $ne: null 
              }
            }
          ]
        }
      ]
    })
      .sort({ createdAt: -1 })
      .lean() as OrderDocument[];

    console.log(`\n=== FINAL QUERY: Found ${orders.length} orders matching criteria ===`);

    const transformedOrders = orders.map((order: OrderDocument) => {
     
      let deliveryDate = '';
      if (order.estimated_delivery) {
        deliveryDate = new Date(order.estimated_delivery).toISOString().slice(0, 16);
      } else if (order.ETA) {
        deliveryDate = new Date(order.ETA).toISOString().slice(0, 16);
      }

      const transformed = {
        _id: order._id.toString(),
        product_name: order.product_name || order.size || 'Product',
        customer_name: order.customer_name || order.buyer?.name || 'Customer',
        delivery_address: order.delivery_address || order.address || '',
        estimated_delivery: deliveryDate,
        is_accepted: order.is_accepted || 'Pending',
        status: order.status || order.is_accepted || 'Pending', 
        quantity: order.quantity || 1,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt || order.updated_at
      };

      console.log('Transformed order:', {
        _id: transformed._id,
        product_name: transformed.product_name,
        customer_name: transformed.customer_name,
        is_accepted: transformed.is_accepted,
        status: transformed.status, 
        estimated_delivery: transformed.estimated_delivery,
        originalETA: order.ETA,
        originalEstimatedDelivery: order.estimated_delivery
      });

      return transformed;
    });

 
    const validOrders = transformedOrders.filter(order => {
     
      const hasValidDeliveryDate = order.estimated_delivery && order.estimated_delivery.trim() !== '';
      const hasValidStatus = order.is_accepted !== 'Pending' || order.status !== 'Pending';
      
      const isValid = hasValidDeliveryDate && hasValidStatus;
      
      if (!isValid) {
        console.log(`Filtering out invalid order ${order._id}:`, {
          estimated_delivery: order.estimated_delivery,
          hasValidDeliveryDate,
          is_accepted: order.is_accepted,
          status: order.status,
          hasValidStatus
        });
      }
      
      return isValid;
    });

    console.log(`\n=== FINAL RESULT: Returning ${validOrders.length} valid orders ===`);

    return NextResponse.json({ orders: validOrders });
  } catch (err: any) {
    console.error('GET status-update error:', err);
    
    return NextResponse.json({ 
      message: "Failed to fetch orders", 
      error: err.message 
    }, { status: 500 });
  }
}

// POST - Handle order acceptance and status updates
export async function POST(req: NextRequest) {
  await connectToDB();
  
  try {
  
    const authHeader = req.headers.get("authorization");
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const decoded: any = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
        } catch (err) {
          console.warn('Token verification failed, continuing without auth:', err);
        }
      }
    }

    const body = await req.json();
    console.log('Status update request:', body);

    const { orderId, estimated_delivery, status } = body;

    if (!orderId) {
      return NextResponse.json({ 
        message: "Order ID is required" 
      }, { status: 400 });
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return NextResponse.json({ 
        message: "Order not found" 
      }, { status: 404 });
    }

    console.log(`Processing order ${orderId}:`, {
      currentStatus: existingOrder.is_accepted,
      newStatus: status,
      estimatedDelivery: estimated_delivery
    });


    const mapStatusToDbValue = (frontendStatus: string): string => {
      const statusMapping: { [key: string]: string } = {
        'Cancelled': 'Rejected', 
        'Canceled': 'Rejected',  
        'Processing': 'Processing',
        'Shipped': 'Shipped', 
        'Out for Delivery': 'Out for Delivery',
        'Delivered': 'Delivered',
        'Accepted': 'Accepted',
        'Pending': 'Pending',
        'Rejected': 'Rejected'
      };
      
      return statusMapping[frontendStatus] || frontendStatus;
    };


    const updateData: any = {
      updated_at: new Date()
    };

    if (estimated_delivery && !status) {
      updateData.is_accepted = 'Accepted';
      updateData.status = 'Accepted'; 
      updateData.estimated_delivery = estimated_delivery;
      updateData.ETA = new Date(estimated_delivery);
      
      console.log(`Accepting order ${orderId} with delivery date: ${estimated_delivery}`);
    }
   
    else if (status) {
      const dbStatus = mapStatusToDbValue(status);
      updateData.is_accepted = dbStatus;
      updateData.status = status; 
      
      
      if (estimated_delivery) {
        updateData.estimated_delivery = estimated_delivery;
        updateData.ETA = new Date(estimated_delivery);
      }
      
     
      switch (dbStatus) {
        case 'Delivered':
          updateData.delivery_date = new Date();
          updateData.status = 'Delivered'; 
          break;
        case 'Shipped':
          updateData.ship_date = new Date();
          updateData.status = 'Shipped';
          break;
        case 'Processing':
          updateData.processing_date = new Date();
          updateData.status = 'Processing';
          break;
        case 'Rejected': 
          updateData.rejection_date = new Date();
          updateData.rejection_reason = status === 'Cancelled' ? 'Cancelled by seller' : 'Rejected by seller';
          updateData.status = status; 
          break;
        default:
          updateData.status = status;
          break;
      }
      
      console.log(`Updating order ${orderId} status from ${existingOrder.is_accepted}/${existingOrder.status} to ${dbStatus}/${status}`);
    }
    else {
      return NextResponse.json({ 
        message: "Either estimated_delivery (for acceptance) or status must be provided" 
      }, { status: 400 });
    }

    
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { 
        new: true, 
        runValidators: false, 
        strict: false
      }
    );

    if (!updatedOrder) {
      return NextResponse.json({ 
        message: "Failed to update order" 
      }, { status: 500 });
    }

    console.log('Order updated successfully:', {
      orderId: updatedOrder._id,
      newStatus: updatedOrder.is_accepted,
      estimatedDelivery: updatedOrder.estimated_delivery
    });
    
   
    const responseMessage = status 
      ? `Order status updated to ${status}` 
      : "Order accepted successfully";

    const responseOrder = {
      _id: updatedOrder._id.toString(),
      product_name: updatedOrder.product_name || updatedOrder.size || 'Product',
      customer_name: updatedOrder.customer_name || 'Customer',
      delivery_address: updatedOrder.delivery_address || updatedOrder.address || '',
      ETA: updatedOrder.ETA || '',
      is_accepted: status || updatedOrder.is_accepted, 
      status: status || updatedOrder.status, 
      quantity: updatedOrder.quantity || 1,
      updatedAt: updatedOrder.updated_at
    };

    return NextResponse.json({ 
      success: true, 
      message: responseMessage,
      order: responseOrder
    }, { status: 200 });

  } catch (err: any) {
    console.error('POST status-update error:', err);
    
    // Handle specific error types
    if (err.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if (err.name === 'TokenExpiredError') {
      return NextResponse.json({ message: "Token expired" }, { status: 401 });
    }
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map((error: any) => error.message);
      return NextResponse.json({ 
        message: "Validation failed", 
        details: validationErrors 
      }, { status: 400 });
    }
    if (err.name === 'CastError') {
      return NextResponse.json({ 
        message: "Invalid order ID format" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: "Failed to process status update", 
      error: err.message 
    }, { status: 500 });
  }
}