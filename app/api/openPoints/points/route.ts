export const dynamic = 'force-dynamic';
export const auth = false;

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import OpenPoint from "@/lib/models/OpenPoint";
import OpenPointProject from "@/lib/models/openPointProject";
import { Types } from "mongoose";

export async function POST(req: Request) {
  await connectToDB();

  const body = await req.json();
  const {
    project_id,
    title,
    status,
    target_date,
    responsible_person,
    reviewer
  } = body;

  if (!project_id || !title || !status || !target_date) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const projectExists = await OpenPointProject.exists({
    _id: new Types.ObjectId(project_id)
  });

  if (!projectExists) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 }
    );
  }

  const openPoint = await OpenPoint.create({
    project_id: new Types.ObjectId(project_id),
    title,
    status,
    target_date: new Date(target_date),
    responsible_person: responsible_person
      ? new Types.ObjectId(responsible_person)
      : undefined,
    reviewer: reviewer
      ? new Types.ObjectId(reviewer)
      : undefined,
    history: [
      {
        action: `Point created with status ${status}`,
        timestamp: new Date()
      }
    ]
  });

  return NextResponse.json(openPoint, { status: 201 });
}
