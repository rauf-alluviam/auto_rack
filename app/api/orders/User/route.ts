import { connectToDB } from "@/lib/db"
import { Order } from "@/lib/models/order"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectToDB()
    
    const userId = params.userId
    const userOrders = await Order.find({ buyer_id: userId })
      .sort({ createdAt: -1 }) 
    
    return NextResponse.json({ 
      success: true, 
      orders: userOrders 
    }, { status: 200 })
    
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch user orders" 
    }, { status: 500 })
  }
}