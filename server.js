const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const MONGODB_URI = process.env.MONGODB_URI;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Socket.IO setup
  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  let socketUsers = {};

  io.on('connection', (socket) => {
    socket.on('register', ({ userId, role }) => {
      socketUsers[userId] = { socketId: socket.id, role };
      console.log(`📝 User Registered: ${userId} (${role})`);
    });
  });

  mongoose.connect(MONGODB_URI, { dbName: 'autoRack' });
  const db = mongoose.connection;
  db.once('open', () => {
    const orderColl = db.collection('orders');
    const stream = orderColl.watch();

    stream.on('change', (change) => {
      
      // --- HANDLE INSERT (New Order) ---
      if (change.operationType === 'insert') {
        const newOrder = change.fullDocument;
        
        // IMPORTANT: Adjust this logic to match your exact Database Schema
        // We look for the seller ID to target the specific dashboard
        const sellerId = newOrder.seller?._id?.toString() || 
                         newOrder.sellerId?.toString() || 
                         newOrder.seller?.toString();

        console.log("🔥 SERVER: Order Placed. Target Seller ID:", sellerId);

        // Only emit if the seller is currently online
        if (sellerId && socketUsers[sellerId]) {
          io.to(socketUsers[sellerId].socketId).emit('orderPlaced', newOrder);
          console.log(`✅ Emitted 'orderPlaced' to ${sellerId}`);
        } else {
           console.log(`⚠️ Seller ${sellerId} is not connected or Seller ID is undefined in order.`);
        }
      }

      // --- HANDLE UPDATE (Order Status Change) ---
      if (change.operationType === 'update') {
        orderColl.findOne({ _id: change.documentKey._id }).then((doc) => {
          const buyerId = doc?.buyer?.toString();
          
          // Notify Buyer
          if (buyerId && socketUsers[buyerId]?.socketId) {
            io.to(socketUsers[buyerId].socketId).emit('orderUpdated', doc);
          }

          // Optional: Notify Seller if the status is updated?
          // Uncomment below if you want the seller to see updates too
          /*
          const sellerId = doc?.seller?._id?.toString() || doc?.sellerId?.toString();
          if (sellerId && socketUsers[sellerId]?.socketId) {
            io.to(socketUsers[sellerId].socketId).emit('orderUpdated', doc);
          }
          */

        }).catch(err => {
          console.error('Error fetching updated order:', err);
        });
      }

    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});