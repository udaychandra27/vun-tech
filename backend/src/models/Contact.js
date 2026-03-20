import mongoose from "mongoose"

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: String },
    serviceNeeded: { type: String, default: "" },
    referenceLink: { type: String, default: "" },
    attachmentUrl: { type: String, default: "" },
    attachmentName: { type: String, default: "" },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Contact = mongoose.model("Contact", contactSchema)
