import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import OpenPoint from "@/lib/models/OpenPoint";
import { Types } from "mongoose";

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectToDB();

    const { id } = await Promise.resolve(context.params);

    const body = await req.json();
    const { title, status, target_date, responsible_person, reviewer } = body;

    const updated = await OpenPoint.findByIdAndUpdate(
      id,
      {
        title,
        status,
        target_date,
        responsible_person: responsible_person
          ? new Types.ObjectId(responsible_person)
          : undefined,
        reviewer: reviewer
          ? new Types.ObjectId(reviewer)
          : undefined
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Point not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("UPDATE POINT ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectToDB();

    const { id } = await Promise.resolve(context.params);

    const deleted = await OpenPoint.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Point not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE POINT ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
