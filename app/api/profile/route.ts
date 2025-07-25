import { connectToDB } from "@/lib/db"
import { User } from "@/lib/models/User"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    await connectToDB()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await User.findOne({ email }).select("name email phone address") 

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
