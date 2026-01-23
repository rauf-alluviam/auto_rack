import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function GET() {
  try {
    await connectToDB();

    // ✅ ONLY SUPPLIERS (NO BUYERS)
    const users = await User.find({
      userType: "supplier"
    }).select("_id name companyName userType");

    return NextResponse.json(users);
  } catch (error) {
    console.error("FETCH SUPPLIERS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
