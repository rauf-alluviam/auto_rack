import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import OpenPointProject from "@/lib/models/openPointProject";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export async function POST(req: Request) {
  try {
    await connectToDB();

    // 🔐 READ AUTH HEADER
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 🔐 VERIFY TOKEN
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // 🔎 FIND USER
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 📥 READ BODY
    const { name, description } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // ✅ CREATE PROJECT
    const project = await OpenPointProject.create({
      name,
      description,
      owner: user._id,
      team_members: []
    });

    return NextResponse.json(project, { status: 201 });

  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
