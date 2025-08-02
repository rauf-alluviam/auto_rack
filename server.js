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
    });
  });

  mongoose.connect(MONGODB_URI, { dbName: 'autoRack' });
  const db = mongoose.connection;
  db.once('open', () => {
    const orderColl = db.collection('orders');
    const stream = orderColl.watch();

    stream.on('change', (change) => {
      if (change.operationType === 'insert') {
        // Notify the only seller in real time
        io.emit('orderPlaced', change.fullDocument);
      }
      if (change.operationType === 'update') {
        orderColl.findOne({ _id: change.documentKey._id }).then((doc) => {
        const buyerId = doc?.buyer?.toString();
        if (buyerId && socketUsers[buyerId]?.socketId) {
        io.to(socketUsers[buyerId].socketId).emit('orderUpdated', change.updateDescription?.updatedFields);
        }
  });
}

    });
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
