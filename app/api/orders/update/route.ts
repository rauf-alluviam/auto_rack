// /**
//  * @swagger
//  * /api/orders/update:
//  *   get:
//  *     summary: Get all updated orders for the authenticated user
//  *     tags:
//  *       - Orders
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: A list of the user's orders
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 orders:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Order'
//  *       401:
//  *         description: Unauthorized or invalid token
//  *       500:
//  *         description: Server error while fetching orders
//  *
//  *   post:
//  *     summary: Create or update an order (based on request body)
//  *     tags:
//  *       - Orders
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             oneOf:
//  *               - type: object
//  *                 required:
//  *                   - productId
//  *                   - quantity
//  *                   - size
//  *                   - address
//  *                 properties:
//  *                   productId:
//  *                     type: string
//  *                   quantity:
//  *                     type: number
//  *                   size:
//  *                     type: string
//  *                   address:
//  *                     type: string
//  *               - type: object
//  *                 required:
//  *                   - orderId
//  *                 properties:
//  *                   orderId:
//  *                     type: string
//  *                   estimated_delivery:
//  *                     type: string
//  *                     format: date-time
//  *                   status:
//  *                     type: string
//  *                     enum: [Pending, Accepted, Rejected, Delivered, Cancelled]
//  *     responses:
//  *       201:
//  *         description: Order created successfully
//  *       200:
//  *         description: Order updated successfully
//  *       400:
//  *         description: Missing or invalid fields
//  *       403:
//  *         description: Unauthorized or token issue
//  *       500:
//  *         description: Server error
//  *
//  *   put:
//  *     summary: Update an order's status or delivery details
//  *     tags:
//  *       - Orders
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - orderId
//  *             properties:
//  *               orderId:
//  *                 type: string
//  *               estimated_delivery:
//  *                 type: string
//  *                 format: date-time
//  *               status:
//  *                 type: string
//  *                 enum: [Pending, Accepted, Rejected, Delivered, Cancelled]
//  *     responses:
//  *       200:
//  *         description: Order updated successfully
//  *       400:
//  *         description: Invalid input or missing order ID
//  *       403:
//  *         description: Unauthorized to update this order
//  *       404:
//  *         description: Order not found
//  *       500:
//  *         description: Server error
//  *
//  * components:
//  *   securitySchemes:
//  *     bearerAuth:
//  *       type: http
//  *       scheme: bearer
//  *       bearerFormat: JWT
//  *   schemas:
//  *     Order:
//  *       type: object
//  *       properties:
//  *         _id:
//  *           type: string
//  *         product_name:
//  *           type: string
//  *         quantity:
//  *           type: number
//  *         size:
//  *           type: string
//  *         address:
//  *           type: string
//  *         delivery_address:
//  *           type: string
//  *         status:
//  *           type: string
//  *         is_accepted:
//  *           type: string
//  *         order_date:
//  *           type: string
//  *           format: date-time
//  *         ETA:
//  *           type: string
//  *           format: date-time
//  *         estimated_delivery:
//  *           type: string
//  *           format: date-time
//  *         product_id:
//  *           type: string
//  *         buyer_id:
//  *           type: string
//  *         seller_id:
//  *           type: string
//  */



// import { NextRequest, NextResponse } from 'next/server'
// import jwt from 'jsonwebtoken'
// import { connectToDB } from '@/lib/db'
// import { Order } from '@/lib/models/order'
// import Product from '@/lib/models/Product'

// const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// export async function GET(req: NextRequest) {
//   try {
//     await connectToDB();
    
//     const authHeader = req.headers.get("authorization");
//     const token = authHeader?.split(" ")[1];
    
//     if (!token) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }
    
//     const decoded: any = jwt.verify(token, JWT_SECRET);
    
//     const userId = decoded.userId || decoded.id; 
    
//     console.log("Fetching orders for user:", userId);
    
    
//     const orders = await Order.find({ buyer_id: userId }).populate("product_id");
    
//     console.log("Orders found:", orders.length);
    
//     return NextResponse.json({ orders });
//   } catch (err: any) {
//     console.error("Error in GET /api/orders:", err);
//     return NextResponse.json({ 
//       message: "Failed to fetch orders",
//       error: err.message 
//     }, { status: 500 });
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     await connectToDB();
    
//     const authHeader = req.headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 403 });
//     }
    
//     const token = authHeader.replace('Bearer ', '');
    
//     let decoded: any;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     } catch (error) {
//       console.error('Token verification failed:', error);
//       return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
//     }
    
//     const body = await req.json();
//     console.log('POST request body:', body);

//     if (body.orderId) {
//       console.log('Routing to order update');
//       return await handleOrderUpdate(body, decoded);
//     }
    
//     if (body.productId) {
//       console.log('Routing to order creation');
//       return await handleOrderCreation(body, decoded);
//     }
    
    
//     return NextResponse.json({ 
//       error: 'Invalid request: either orderId (for updates) or productId (for creation) is required',
//       received: Object.keys(body)
//     }, { status: 400 });
    
//   } catch (error) {
//     console.error('POST API error:', error);
//     return NextResponse.json({ 
//       error: 'Internal server error',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     }, { status: 500 });
//   }
// }


// async function handleOrderCreation(body: any, decoded: any) {
//   try {
   
//     const buyerId = decoded.userId || decoded.id;
//     console.log('Creating order for buyer ID:', buyerId);
    
//     const { productId, quantity, size, address } = body;
    
//     if (!productId) {
//       return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
//     }
    
//     const product = await Product.findById(productId);
//     console.log('Product found:', product);
    
//     if (!product) {
//       return NextResponse.json({ error: 'Product not found' }, { status: 404 });
//     }
    
//     const newOrder = await Order.create({
//       product_id: product._id,
//       product_name: product.product_name,
//       quantity,
//       size,
//       address,
//       buyer_id: buyerId,
//       seller_id: product.seller_id,
//       status: 'Pending',
//       delivery_address: address,
//       order_date: new Date(),
//       is_accepted: 'Pending',
//       ETA: ''
//     });
    
//     console.log('Order created successfully:', newOrder);
//     return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
    
//   } catch (error) {
//     console.error('Order creation error:', error);
//     return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
//   }
// }


// async function handleOrderUpdate(body: any, decoded: any) {
//   try {
//     const userId = decoded.userId || decoded.id;
//     const { orderId, estimated_delivery, status } = body;
    
//     console.log('Updating order:', { orderId, estimated_delivery, status, userId });
//     console.log('Full request body:', body);
    
//     if (!orderId) {
//       console.log('Missing orderId');
//       return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
//     }
 
//     const order = await Order.findById(orderId);
//     console.log('Found order:', order ? 'Yes' : 'No');
    
//     if (!order) {
//       return NextResponse.json({ error: 'Order not found' }, { status: 404 });
//     }
    
//     console.log('Order seller_id:', order.seller_id?.toString());
//     console.log('Order buyer_id:', order.buyer_id?.toString());
//     console.log('Current user ID:', userId);
    
   
//     const isAuthorized = order.seller_id?.toString() === userId || order.buyer_id?.toString() === userId;
    
//     if (!isAuthorized) {
//       return NextResponse.json({ error: 'Unauthorized to update this order' }, { status: 403 });
//     }
    
  
//     const updateData: any = {};
    
//     if (estimated_delivery !== undefined) {
//       console.log('Processing estimated_delivery:', estimated_delivery);
     
//       if (estimated_delivery && estimated_delivery.trim() !== '') {
//         const deliveryDate = new Date(estimated_delivery);
//         console.log('Parsed delivery date:', deliveryDate);
//         if (isNaN(deliveryDate.getTime())) {
//           return NextResponse.json({ 
//             error: 'Invalid delivery date format',
//             received: estimated_delivery 
//           }, { status: 400 });
//         }
//         updateData.estimated_delivery = deliveryDate;
//       } else {
//         updateData.estimated_delivery = null;
//       }
//     }
    
//     if (status) {
//       console.log('Processing status:', status);
     
//       const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Delivered', 'Cancelled'];
//       if (!validStatuses.includes(status)) {
//         return NextResponse.json({ 
//           error: 'Invalid status value',
//           received: status,
//           valid: validStatuses 
//         }, { status: 400 });
//       }
//       updateData.is_accepted = status;
//       updateData.status = status;
//     }
    
//     console.log('Update data:', updateData);
    
   
//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       updateData,
//       { new: true, runValidators: true }
//     );
    
//     if (!updatedOrder) {
//       return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
//     }
    
//     console.log('Order updated successfully:', updatedOrder);
    
//     return NextResponse.json({ 
//       success: true, 
//       message: 'Order updated successfully',
//       order: updatedOrder 
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error('Order update error:', error);
//     return NextResponse.json({ 
//       error: 'Failed to update order',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     }, { status: 500 });
//   }
// }


// export async function PUT(req: NextRequest) {
//   try {
//     await connectToDB();
    
//     const authHeader = req.headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 403 });
//     }
    
//     const token = authHeader.replace('Bearer ', '');
    
//     let decoded: any;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     } catch (error) {
//       console.error('Token verification failed:', error);
//       return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
//     }
    
//     const body = await req.json();
//     return await handleOrderUpdate(body, decoded);
    
//   } catch (error) {
//     console.error('PUT API error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }