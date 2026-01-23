import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import OpenPointProject from "@/lib/models/openPointProject";
import OpenPoint from "@/lib/models/OpenPoint";
import { Types } from "mongoose";

/* ===================== GET PROJECT ===================== */
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectToDB();

    // ✅ FIX FOR NEXT.JS 15
    const { id: projectId } = await Promise.resolve(context.params);

    if (!Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    const project = await OpenPointProject.findById(projectId)
      .populate("owner", "name email")
      .populate("team_members.user", "name email");

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (err) {
    console.error("GET PROJECT ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ===================== DELETE PROJECT ===================== */
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectToDB();

    // ✅ FIX FOR NEXT.JS 15
    const { id: projectId } = await Promise.resolve(context.params);

    if (!Types.ObjectId.isValid(projectId)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }

    // Delete all open points of this project
    await OpenPoint.deleteMany({
      project_id: new Types.ObjectId(projectId),
    });

    // Delete the project
    const deleted = await OpenPointProject.findByIdAndDelete(projectId);

    if (!deleted) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("DELETE PROJECT ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
