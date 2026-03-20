import mongoose from "mongoose"

const serviceTabSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    items: [{ type: String }],
  },
  { _id: false }
)

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    includes: [{ type: String }],
    idealFor: { type: String },
    visible: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory" },
    icon: { type: String, default: "" },
    theme: { type: String, default: "blue" },
    eyebrow: { type: String, default: "" },
    badgeLabel: { type: String, default: "" },
    tags: [{ type: String }],
    detailTabs: { type: [serviceTabSchema], default: [] },
  },
  { timestamps: true }
)

export const Service = mongoose.model("Service", serviceSchema)
