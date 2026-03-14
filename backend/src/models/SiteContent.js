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
    linkedinUrl: { type: String, default: "" },
  },
  { _id: true }
)

const aboutSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    galleryImages: { type: [String], default: [] },
    highlightTitle: { type: String, default: "" },
    highlightSubtitle: { type: String, default: "" },
    highlightPoints: { type: [String], default: [] },
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

const homeHeroCardSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: "" },
    caption: { type: String, default: "" },
  },
  { _id: false }
)

const homeSchema = new mongoose.Schema(
  {
    heroCards: { type: [homeHeroCardSchema], default: [] },
  },
  { _id: false }
)

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    about: { type: aboutSchema, default: () => ({}) },
    contact: { type: contactSchema, default: () => ({}) },
    home: { type: homeSchema, default: () => ({}) },
  },
  { timestamps: true }
)

export const SiteContent = mongoose.model("SiteContent", siteContentSchema)
