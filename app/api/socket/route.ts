// import { Server } from "socket.io";
// import { createServer } from "http";
// import next from "next";
// import mongoose from "mongoose";
// import { ChangeStreamDocument } from "mongodb"
// import { connectToDB } from '@/lib/db';

// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// const httpServer = createServer();
// const io = new Server(httpServer, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// interface SocketUser {
//   socketId: string;
//   role: "buyer" | "seller";
// }

// let socketUsers: Record<string, SocketUser> = {};

// io.on("connection", (socket) => {
//   console.log("Client connected:", socket.id);

//   socket.on("register", ({ userId, role }: { userId: string; role: "buyer" | "seller" }) => {
//     socketUsers[userId] = { socketId: socket.id, role };
//     console.log(" Registered:", socketUsers);
//   });
// });

// connectToDB();
// const db = mongoose.connection;
// const orderColl = db.collection("orders");
// const stream = orderColl.watch();

// stream.on("change", (change: ChangeStreamDocument<any>) => {
//   if (change.operationType === "insert") {
//     const docId = change.documentKey?._id.toString();
//     const sellerId = change.fullDocument?.seller_id;

//     if (sellerId && socketUsers[sellerId]?.socketId) {
//       io.to(socketUsers[sellerId].socketId).emit("orderPlaced", change.fullDocument);
//       console.log(` Notified seller ${sellerId} about new order ${docId}`);
//     }
//   }

//   if (change.operationType === "update") {
//     const docId = change.documentKey?._id.toString();

//     // Assuming buyerId is stored in DB; we need to fetch it
//     orderColl.findOne({ _id: change.documentKey._id }).then((doc) => {
//       const buyerId = doc?.buyer_id;
//       if (buyerId && socketUsers[buyerId]?.socketId) {
//         io.to(socketUsers[buyerId].socketId).emit("orderUpdated", change.updateDescription?.updatedFields);
//         console.log(` Notified buyer ${buyerId} about update to order ${docId}`);
//       }
//     });
//   }
// });
export {};