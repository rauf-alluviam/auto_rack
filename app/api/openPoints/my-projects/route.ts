import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import OpenPointProject from "@/lib/models/openPointProject";
import OpenPoint from "@/lib/models/OpenPoint";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  try {
    await connectToDB();

    // ✅ AWAIT cookies() (IMPORTANT)
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userObjectId = new Types.ObjectId(decoded.id);

    const projects = await OpenPointProject.find()
      .populate("owner", "name email")
      .populate("team_members.user", "name email");

    const result = await Promise.all(
      projects.map(async (project) => {
        const points = await OpenPoint.find({
          project_id: project._id
        });

        const stats = {
          red: points.filter(p => p.status === "Red").length,
          yellow: points.filter(p => p.status === "Yellow").length,
          orange: points.filter(p => p.status === "Orange").length,
          green: points.filter(p => p.status === "Green").length,
          total: points.length
        };

        const myPoints = points.filter(
          p => p.responsible_person?.toString() === userObjectId.toString()
        );

        const myStats = {
          red: myPoints.filter(p => p.status === "Red").length,
          yellow: myPoints.filter(p => p.status === "Yellow").length,
          orange: myPoints.filter(p => p.status === "Orange").length,
          green: myPoints.filter(p => p.status === "Green").length,
          total: myPoints.length
        };

        return {
          ...project.toObject(),
          stats,
          myStats
        };
      })
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error("MY PROJECTS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
