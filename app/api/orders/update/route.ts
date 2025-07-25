import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDB } from '@/lib/db'
import { Order } from '@/lib/models/order'
import Product from '@/lib/models/Product'

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    await connectToDB();
    
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    const userId = decoded.userId || decoded.id; 
    
    console.log("Fetching orders for user:", userId);
    
    
    const orders = await Order.find({ buyer_id: userId }).populate("product_id");
    
    console.log("Orders found:", orders.length);
    
    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Error in GET /api/orders:", err);
    return NextResponse.json({ 
      message: "Failed to fetch orders",
      error: err.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 403 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }
    
    const body = await req.json();
    console.log('POST request body:', body);

    if (body.orderId) {
      console.log('Routing to order update');
      return await handleOrderUpdate(body, decoded);
    }
    
    if (body.productId) {
      console.log('Routing to order creation');
      return await handleOrderCreation(body, decoded);
    }
    
    
    return NextResponse.json({ 
      error: 'Invalid request: either orderId (for updates) or productId (for creation) is required',
      received: Object.keys(body)
    }, { status: 400 });
    
  } catch (error) {
    console.error('POST API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


async function handleOrderCreation(body: any, decoded: any) {
  try {
   
    const buyerId = decoded.userId || decoded.id;
    console.log('Creating order for buyer ID:', buyerId);
    
    const { productId, quantity, size, address } = body;
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    const product = await Product.findById(productId);
    console.log('Product found:', product);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const newOrder = await Order.create({
      product_id: product._id,
      product_name: product.product_name,
      quantity,
      size,
      address,
      buyer_id: buyerId,
      seller_id: product.seller_id,
      status: 'Pending',
      delivery_address: address,
      order_date: new Date(),
      is_accepted: 'Pending',
      ETA: ''
    });
    
    console.log('Order created successfully:', newOrder);
    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
    
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}


async function handleOrderUpdate(body: any, decoded: any) {
  try {
    const userId = decoded.userId || decoded.id;
    const { orderId, estimated_delivery, status } = body;
    
    console.log('Updating order:', { orderId, estimated_delivery, status, userId });
    console.log('Full request body:', body);
    
    if (!orderId) {
      console.log('Missing orderId');
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
 
    const order = await Order.findById(orderId);
    console.log('Found order:', order ? 'Yes' : 'No');
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    console.log('Order seller_id:', order.seller_id?.toString());
    console.log('Order buyer_id:', order.buyer_id?.toString());
    console.log('Current user ID:', userId);
    
   
    const isAuthorized = order.seller_id?.toString() === userId || order.buyer_id?.toString() === userId;
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized to update this order' }, { status: 403 });
    }
    
  
    const updateData: any = {};
    
    if (estimated_delivery !== undefined) {
      console.log('Processing estimated_delivery:', estimated_delivery);
     
      if (estimated_delivery && estimated_delivery.trim() !== '') {
        const deliveryDate = new Date(estimated_delivery);
        console.log('Parsed delivery date:', deliveryDate);
        if (isNaN(deliveryDate.getTime())) {
          return NextResponse.json({ 
            error: 'Invalid delivery date format',
            received: estimated_delivery 
          }, { status: 400 });
        }
        updateData.estimated_delivery = deliveryDate;
      } else {
        updateData.estimated_delivery = null;
      }
    }
    
    if (status) {
      console.log('Processing status:', status);
     
      const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status value',
          received: status,
          valid: validStatuses 
        }, { status: 400 });
      }
      updateData.is_accepted = status;
      updateData.status = status;
    }
    
    console.log('Update data:', updateData);
    
   
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
    
    console.log('Order updated successfully:', updatedOrder);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order updated successfully',
      order: updatedOrder 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 403 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }
    
    const body = await req.json();
    return await handleOrderUpdate(body, decoded);
    
  } catch (error) {
    console.error('PUT API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}