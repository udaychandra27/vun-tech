import mongoose from "mongoose"

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      unique: true,
      index: true,
    },
    content: { type: String, required: true },
    excerpt: { type: String, default: "", maxlength: 420 },
    featuredImage: { type: String, default: "" },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, default: "", trim: true, maxlength: 120, index: true },
    tags: [{ type: String, trim: true, maxlength: 60 }],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    seoTitle: { type: String, default: "", maxlength: 180 },
    seoDescription: { type: String, default: "", maxlength: 320 },
    readTime: { type: Number, default: 1, min: 1 },
    publishedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
)

blogPostSchema.index({ status: 1, publishedAt: -1, createdAt: -1 })
blogPostSchema.index({ title: "text", excerpt: "text", author: "text", tags: "text" })

export const BlogPost = mongoose.model("BlogPost", blogPostSchema)
