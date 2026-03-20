import mongoose from "mongoose"

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
    industry: { type: String },
    domain: { type: String, default: "" },
    badgeLabel: { type: String, default: "" },
    accent: { type: String, default: "blue" },
    icon: { type: String, default: "Monitor" },
    summary: { type: String, default: "" },
    includes: [{ type: String }],
    outcome: { type: String },
    idealFor: { type: String, default: "" },
    stack: [{ type: String }],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Project = mongoose.model("Project", projectSchema)
