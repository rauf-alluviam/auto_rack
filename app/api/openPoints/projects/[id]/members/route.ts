import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import openPointProject from "@/lib/models/openPointProject";
import User from "@/lib/models/User";

/* ===================== POST ===================== */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await context.params;
    const { username, role } = await req.json();

    const user = await User.findOne({ name: username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const project = await openPointProject.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const alreadyExists = project.team_members.some(
      (m: any) => m.user.toString() === user._id.toString()
    );
    if (alreadyExists) {
      return NextResponse.json({ error: "Member already exists" }, { status: 400 });
    }

    project.team_members.push({
      user: user._id,
      role,
      added_at: new Date(),
    });

    await project.save();

    return NextResponse.json({ message: "Member added successfully" });
  } catch (err) {
    console.error("ADD MEMBER ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ===================== GET ===================== */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDB();

    const { id } = await context.params;

    const project = await openPointProject
      .findById(id)
      .populate("team_members.user", "name email");

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

const members = project.team_members
  .filter((m: any) => m.user) 
  .map((m: any) => ({
    _id: m.user._id,
    username: m.user.name,
    role: m.role,
  }));


    return NextResponse.json(members);
  } catch (err) {
    console.error("FETCH MEMBERS ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
