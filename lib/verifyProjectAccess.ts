import mongoose from "mongoose";
import OpenPointProject from "@/lib/models/openPointProject";

interface TeamMember {
  user: mongoose.Types.ObjectId;
  role: string;
  added_at: Date;
}

export async function verifyProjectAccess(
  projectId: string,
  userId: string
) {
  const project = await OpenPointProject.findById(projectId);
  if (!project) return null;

  const isOwner = project.owner.toString() === userId;

  const isMember = project.team_members.some(
    (m: TeamMember) => m.user.toString() === userId
  );

  if (!isOwner && !isMember) return null;
  return project;
}
