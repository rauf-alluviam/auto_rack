import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  team_members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: String,
    added_at: Date
  }]
});

export default mongoose.models.OpenPointProject ||
  mongoose.model("OpenPointProject", ProjectSchema);
