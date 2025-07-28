// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";
// import { connectToDB } from "@/lib/db";

// let isWatching = false;

// export async function GET(req: NextRequest) {
//   if (!isWatching) {
//     await connectToDB();

//     const db = mongoose.connection;
//     const ordersCollection = db.collection("orders");

//     const changeStream = ordersCollection.watch();

//     changeStream.on("change", (change: any) => {
//     const updatedFields = change?.updateDescription?.updatedFields;

//     switch (change.operationType) {
//         case "insert":
//         console.log("🟢 Order Inserted:");
//         console.log("🆔 ID:", change.documentKey?._id);
//         console.log("📄 Full Document:", change.fullDocument);
//         break;

//         case "update":
//         console.log("🟡 Order Updated:");
//         console.log("🆔 ID:", change.documentKey?._id);

//         // Hardcoded fields to check for
//         const fieldsToLog = ["status"];

//         fieldsToLog.forEach((field) => {
//             if (updatedFields?.hasOwnProperty(field)) {
//             console.log(`🔁 ${field}:`, updatedFields[field]);
//             }
//         })

//       break;

//     default:
//       console.log("📦 Other Change Type:", change.operationType);
//   }
// });


//     isWatching = true;
//     console.log(" Change stream started");
//   }

//   return NextResponse.json({ message: "Change Stream is running" });
// }

export {};