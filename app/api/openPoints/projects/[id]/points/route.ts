import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import OpenPoint from "@/lib/models/OpenPoint";
import OpenPointProject from "@/lib/models/openPointProject";
import User from "@/lib/models/User"; // ✅ REQUIRED
import { Types } from "mongoose";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectToDB();

    const { id: projectId } = await Promise.resolve(context.params);

    const project = await OpenPointProject.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const today = new Date();
    await OpenPoint.updateMany(
      {
        project_id: new Types.ObjectId(projectId),
        status: { $ne: "Green" },
        target_date: { $lt: today }
      },
      { $set: { status: "Red" } }
    );

    const points = await OpenPoint.find({
      project_id: new Types.ObjectId(projectId)
    })
      .populate({
        path: "responsible_person",
        model: User,
        select: "name email"
      })
      .populate({
        path: "reviewer",
        model: User,
        select: "name email"
      })
      .sort({ status: 1, target_date: 1 });

    return NextResponse.json(points);
  } catch (err) {
    console.error("GET PROJECT POINTS ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
