import mongoose from "mongoose";

const OpenPointSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: "OpenPointProject" },
  title: String,
  status: String,
  target_date: Date,
  responsible_person: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  history: [{
    action: String,
    changed_by: mongoose.Schema.Types.ObjectId,
    remarks: String,
    timestamp: Date
  }],
  evidence: [String],
  completion_date: Date
});

export default mongoose.models.OpenPoint ||
  mongoose.model("OpenPoint", OpenPointSchema);
