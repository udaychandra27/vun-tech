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
    trustPoints: { type: [String], default: [] },
    formTitle: { type: String, default: "" },
    formStatusLabel: { type: String, default: "" },
    serviceFieldLabel: { type: String, default: "" },
    directTitle: { type: String, default: "" },
    email: { type: String, default: "" },
    whatsappUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    linkedinLabel: { type: String, default: "" },
    locationText: { type: String, default: "" },
    nextStepsTitle: { type: String, default: "" },
    nextSteps: { type: [String], default: [] },
    requirementsTitle: { type: String, default: "" },
    requirements: { type: [String], default: [] },
    attachmentHint: { type: String, default: "" },
    linkFieldLabel: { type: String, default: "" },
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

const homeTestimonialSchema = new mongoose.Schema(
  {
    quote: { type: String, default: "" },
    name: { type: String, default: "" },
    role: { type: String, default: "" },
  },
  { _id: false }
)

const homeWhyChooseItemSchema = new mongoose.Schema(
  {
    icon: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
)

const homeStatSchema = new mongoose.Schema(
  {
    value: { type: String, default: "" },
    label: { type: String, default: "" },
  },
  { _id: false }
)

const homeSchema = new mongoose.Schema(
  {
    hero_title: { type: String, default: "" },
    hero_subtitle: { type: String, default: "" },
    hero_description: { type: String, default: "" },
    hero_primary_button_text: { type: String, default: "" },
    hero_primary_button_link: { type: String, default: "" },
    hero_secondary_button_text: { type: String, default: "" },
    hero_secondary_button_link: { type: String, default: "" },
    brand_accent_color: { type: String, default: "" },
    trusted_badges: { type: [String], default: [] },
    why_choose_items: { type: [homeWhyChooseItemSchema], default: [] },
    stats: { type: [homeStatSchema], default: [] },
    heroCards: { type: [homeHeroCardSchema], default: [] },
    trustLabel: { type: String, default: "" },
    trustLogos: { type: [String], default: [] },
    showTestimonials: { type: Boolean, default: true },
    testimonials: { type: [homeTestimonialSchema], default: [] },
  },
  { _id: false }
)

const workSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    allProjectsLabel: { type: String, default: "" },
    ctaTitle: { type: String, default: "" },
    ctaSubtitle: { type: String, default: "" },
    primaryCtaLabel: { type: String, default: "" },
    primaryCtaUrl: { type: String, default: "" },
    secondaryCtaLabel: { type: String, default: "" },
    secondaryCtaUrl: { type: String, default: "" },
  },
  { _id: false }
)

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    about: { type: aboutSchema, default: () => ({}) },
    contact: { type: contactSchema, default: () => ({}) },
    home: { type: homeSchema, default: () => ({}) },
    work: { type: workSchema, default: () => ({}) },
  },
  { timestamps: true }
)

export const SiteContent = mongoose.model("SiteContent", siteContentSchema)
