import mongoose from "mongoose"

const approachSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
)

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { _id: true }
)

const aboutSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    approach: { type: [approachSchema], default: [] },
    team: { type: [teamMemberSchema], default: [] },
    closingNote: { type: String, default: "" },
  },
  { _id: false }
)

const contactSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    email: { type: String, default: "" },
    whatsappUrl: { type: String, default: "" },
    locationText: { type: String, default: "" },
    nextSteps: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
  },
  { _id: false }
)

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    about: { type: aboutSchema, default: () => ({}) },
    contact: { type: contactSchema, default: () => ({}) },
  },
  { timestamps: true }
)

export const SiteContent = mongoose.model("SiteContent", siteContentSchema)
