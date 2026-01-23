import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import openPointProject from "@/lib/models/openPointProject";
import User from "@/lib/models/User";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const { username, role } = await req.json();

    // 1. Find user
    const user = await User.findOne({ name: username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Find project
    const project = await openPointProject.findById(params.id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 3. Prevent duplicate member
    const alreadyExists = project.team_members.some(
      (m: any) => m.user.toString() === user._id.toString()
    );
    if (alreadyExists) {
      return NextResponse.json({ error: "Member already exists" }, { status: 400 });
    }

    // 4. Push into DB ✅
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
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const project = await openPointProject.findById(params.id)
      .populate("team_members.user", "name email");

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Return clean data
    const members = project.team_members.map((m: any) => ({
      _id: m.user._id,
      username: m.user.name,   // ✅ NAME, not ObjectId
      role: m.role,
    }));

    return NextResponse.json(members);
  } catch (err) {
    console.error("FETCH MEMBERS ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
