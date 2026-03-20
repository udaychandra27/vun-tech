import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { z } from "zod"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import fs from "fs/promises"
import path from "path"
import { Admin } from "../models/Admin.js"
import { BlogPost } from "../models/BlogPost.js"
import { Contact } from "../models/Contact.js"
import { Service } from "../models/Service.js"
import { Project } from "../models/Project.js"
import { ServiceCategory } from "../models/ServiceCategory.js"
import { ChatLead } from "../models/ChatLead.js"
import { Order } from "../models/Order.js"
import { TrendingProduct } from "../models/TrendingProduct.js"
import { SiteContent } from "../models/SiteContent.js"
import { requireAuth } from "../middleware/auth.js"
import {
  buildBlogMeta,
  buildExcerpt,
  calculateReadTime,
  sanitizeBlogHtml,
  slugifyBlogTitle,
} from "../utils/blog.js"

const router = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.mimetype)) {
      const error = new Error("Only JPG, PNG, and WEBP images are allowed")
      error.status = 400
      return cb(error)
    }
    cb(null, true)
  },
})

const uploadToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    stream.end(file.buffer)
  })

async function saveLocally(file, folder) {
  const uploadsDir = path.join(process.cwd(), "uploads", folder)
  await fs.mkdir(uploadsDir, { recursive: true })
  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-")
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`
  const relativePath = `/uploads/${folder}/${fileName}`
  await fs.writeFile(path.join(process.cwd(), "uploads", folder, fileName), file.buffer)
  return relativePath
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
})

const serviceSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().min(10).max(1000),
  includes: z.array(z.string().min(2).max(140)).optional().default([]),
  idealFor: z.string().max(200).optional().or(z.literal("")),
  visible: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  categoryId: z.string().optional().or(z.literal("")),
  icon: z.string().max(80).optional().or(z.literal("")),
  theme: z.enum(["blue", "blue-featured", "teal", "amber"]).optional().default("blue"),
  eyebrow: z.string().max(120).optional().or(z.literal("")),
  badgeLabel: z.string().max(40).optional().or(z.literal("")),
  tags: z.array(z.string().min(1).max(40)).optional().default([]),
  detailTabs: z
    .array(
      z.object({
        title: z.string().min(2).max(80),
        items: z.array(z.string().min(2).max(180)).min(1).max(6),
      })
    )
    .max(3)
    .optional()
    .default([]),
})

const projectSchema = z.object({
  name: z.string().min(2).max(140),
  description: z.string().min(10).max(1000),
  link: z.string().url().optional().or(z.literal("")),
  industry: z.string().max(120).optional().or(z.literal("")),
  domain: z.string().max(120).optional().or(z.literal("")),
  badgeLabel: z.string().max(40).optional().or(z.literal("")),
  accent: z
    .enum(["blue", "green", "amber", "purple", "pink"])
    .optional()
    .default("blue"),
  icon: z.string().max(80).optional().or(z.literal("")),
  summary: z.string().max(320).optional().or(z.literal("")),
  includes: z.array(z.string().min(2).max(140)).optional().default([]),
  outcome: z.string().max(240).optional().or(z.literal("")),
  idealFor: z.string().max(220).optional().or(z.literal("")),
  stack: z.array(z.string().min(2).max(80)).optional().default([]),
  featured: z.boolean().optional().default(false),
})

const aboutContentSchema = z.object({
  heroTitle: z.string().min(2).max(140),
  heroSubtitle: z.string().min(10).max(600),
  galleryImages: z.array(z.string().max(500)).optional().default([]),
  highlightTitle: z.string().max(140).optional().or(z.literal("")),
  highlightSubtitle: z.string().max(400).optional().or(z.literal("")),
  highlightPoints: z.array(z.string().max(160)).optional().default([]),
  approach: z
    .array(
      z.object({
        title: z.string().min(2).max(120),
        description: z.string().min(5).max(400),
      })
    )
    .optional()
    .default([]),
  team: z
    .array(
      z.object({
        name: z.string().min(2).max(120),
        role: z.string().min(2).max(120),
        bio: z.string().max(400).optional().or(z.literal("")),
        imageUrl: z.string().max(500).optional().or(z.literal("")),
        linkedinUrl: z.string().max(500).optional().or(z.literal("")),
      })
    )
    .optional()
    .default([]),
  closingNote: z.string().max(400).optional().or(z.literal("")),
})

const contactContentSchema = z.object({
  heroTitle: z.string().min(2).max(140),
  heroSubtitle: z.string().min(10).max(600),
  trustPoints: z.array(z.string().min(2).max(120)).optional().default([]),
  formTitle: z.string().max(120).optional().or(z.literal("")),
  formStatusLabel: z.string().max(80).optional().or(z.literal("")),
  serviceFieldLabel: z.string().max(80).optional().or(z.literal("")),
  directTitle: z.string().max(120).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  whatsappUrl: z.string().max(500).optional().or(z.literal("")),
  linkedinUrl: z.string().max(500).optional().or(z.literal("")),
  linkedinLabel: z.string().max(120).optional().or(z.literal("")),
  locationText: z.string().max(200).optional().or(z.literal("")),
  nextStepsTitle: z.string().max(120).optional().or(z.literal("")),
  nextSteps: z.array(z.string().min(2).max(140)).optional().default([]),
  requirementsTitle: z.string().max(120).optional().or(z.literal("")),
  requirements: z.array(z.string().min(2).max(140)).optional().default([]),
  attachmentHint: z.string().max(200).optional().or(z.literal("")),
  linkFieldLabel: z.string().max(120).optional().or(z.literal("")),
})

const homeContentSchema = z.object({
  hero_title: z.string().max(180).optional().or(z.literal("")),
  hero_subtitle: z.string().max(220).optional().or(z.literal("")),
  hero_description: z.string().max(500).optional().or(z.literal("")),
  hero_primary_button_text: z.string().max(80).optional().or(z.literal("")),
  hero_primary_button_link: z.string().max(500).optional().or(z.literal("")),
  hero_secondary_button_text: z.string().max(80).optional().or(z.literal("")),
  hero_secondary_button_link: z.string().max(500).optional().or(z.literal("")),
  brand_accent_color: z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/)
    .optional()
    .or(z.literal("")),
  trusted_badges: z.array(z.string().max(80)).optional().default([]),
  why_choose_items: z
    .array(
      z.object({
        icon: z.string().max(80).optional().or(z.literal("")),
        title: z.string().max(120).optional().or(z.literal("")),
        description: z.string().max(240).optional().or(z.literal("")),
      })
    )
    .optional()
    .default([]),
  stats: z
    .array(
      z.object({
        value: z.string().max(80).optional().or(z.literal("")),
        label: z.string().max(120).optional().or(z.literal("")),
      })
    )
    .optional()
    .default([]),
  heroCards: z
    .array(
      z.object({
        imageUrl: z.string().max(500).optional().or(z.literal("")),
        caption: z.string().max(200).optional().or(z.literal("")),
      })
    )
    .optional()
    .default([]),
  trustLabel: z.string().max(200).optional().or(z.literal("")),
  trustLogos: z.array(z.string().max(120)).optional().default([]),
  showTestimonials: z.boolean().optional().default(true),
  testimonials: z
    .array(
      z.object({
        quote: z.string().max(320).optional().or(z.literal("")),
        name: z.string().max(120).optional().or(z.literal("")),
        role: z.string().max(160).optional().or(z.literal("")),
      })
    )
    .optional()
    .default([]),
})

const workContentSchema = z.object({
  heroTitle: z.string().min(2).max(160),
  heroSubtitle: z.string().min(10).max(700),
  allProjectsLabel: z.string().max(80).optional().or(z.literal("")),
  ctaTitle: z.string().max(160).optional().or(z.literal("")),
  ctaSubtitle: z.string().max(320).optional().or(z.literal("")),
  primaryCtaLabel: z.string().max(80).optional().or(z.literal("")),
  primaryCtaUrl: z.string().max(500).optional().or(z.literal("")),
  secondaryCtaLabel: z.string().max(80).optional().or(z.literal("")),
  secondaryCtaUrl: z.string().max(500).optional().or(z.literal("")),
})

const blogPayloadSchema = z.object({
  title: z.string().min(2).max(180),
  slug: z.string().min(2).max(200).optional().or(z.literal("")),
  content: z.string().min(20),
  excerpt: z.string().max(420).optional().or(z.literal("")),
  featuredImage: z.string().max(1000).optional().or(z.literal("")),
  author: z.string().min(2).max(120),
  category: z.string().max(120).optional().or(z.literal("")),
  tags: z.array(z.string().min(1).max(60)).optional().default([]),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  seoTitle: z.string().max(180).optional().or(z.literal("")),
  seoDescription: z.string().max(320).optional().or(z.literal("")),
  publishedAt: z.union([z.string(), z.date()]).optional().nullable(),
})

async function uploadImageAsset(file, folder) {
  if (hasCloudinaryConfig()) {
    try {
      const result = await uploadToCloudinary(file, folder)
      return result.secure_url
    } catch (error) {
      console.warn(
        `Cloudinary upload failed for ${folder}, falling back to local storage.`,
        error.message
      )
    }
  }
  return saveLocally(file, folder)
}

async function ensureUniqueSlug(slug, currentId = null) {
  const existing = await BlogPost.findOne({
    slug,
    ...(currentId ? { _id: { $ne: currentId } } : {}),
  })
  if (existing) {
    const error = new Error("A blog post with this slug already exists")
    error.status = 409
    throw error
  }
}

function normalizePublishedAt(status, publishedAt, existingPublishedAt = null) {
  if (status === "draft") {
    return null
  }
  if (publishedAt) {
    return new Date(publishedAt)
  }
  return existingPublishedAt || new Date()
}

function buildBlogDocument(payload, existing = null) {
  const sanitizedContent = sanitizeBlogHtml(payload.content)
  const slug = slugifyBlogTitle(payload.slug || payload.title)
  const excerpt = buildExcerpt(sanitizedContent, payload.excerpt || "")
  const tags = [...new Set((payload.tags || []).map((tag) => tag.trim()).filter(Boolean))]
  const status = payload.status || "draft"
  const publishedAt = normalizePublishedAt(
    status,
    payload.publishedAt,
    existing?.publishedAt || null
  )

  return {
    title: payload.title.trim(),
    slug,
    content: sanitizedContent,
    excerpt,
    featuredImage: (payload.featuredImage || "").trim(),
    author: payload.author.trim(),
    category: (payload.category || "").trim(),
    tags,
    status,
    seoTitle: (payload.seoTitle || payload.title).trim(),
    seoDescription: (payload.seoDescription || excerpt).trim(),
    readTime: calculateReadTime(sanitizedContent),
    publishedAt,
  }
}

function shapeBlogResponse(post) {
  return {
    ...post.toObject(),
    meta: buildBlogMeta(post),
  }
}

router.post("/admin/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body)
    const admin = await Admin.findOne({ email: payload.email.toLowerCase() })
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    const valid = await bcrypt.compare(payload.password, admin.passwordHash)
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )
    res.json({ token })
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.get("/admin/contacts", requireAuth, async (req, res, next) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 })
    res.json(contacts)
  } catch (error) {
    next(error)
  }
})

router.get("/admin/chat-leads", requireAuth, async (req, res, next) => {
  try {
    const leads = await ChatLead.find({}).sort({ createdAt: -1 })
    res.json(leads)
  } catch (error) {
    next(error)
  }
})

router.delete("/admin/chat-leads/:id", requireAuth, async (req, res, next) => {
  try {
    const lead = await ChatLead.findByIdAndDelete(req.params.id)
    if (!lead) {
      return res.status(404).json({ message: "Not found" })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.get("/admin/orders", requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    next(error)
  }
})

router.patch("/admin/orders/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = z
      .object({
        status: z
          .enum(["pending_payment", "paid", "in_progress", "delivered", "cancelled"])
          .optional(),
        notes: z.string().max(2000).optional().or(z.literal("")),
      })
      .parse(req.body)
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: payload.status,
        notes: payload.notes,
      },
      { new: true }
    )
    if (!order) {
      return res.status(404).json({ message: "Not found" })
    }
    res.json(order)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.get("/admin/trending", requireAuth, async (req, res, next) => {
  try {
    const products = await TrendingProduct.find({}).sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    next(error)
  }
})

router.post("/admin/trending", requireAuth, async (req, res, next) => {
  try {
    const payload = z
      .object({
        title: z.string().min(2).max(140),
        price: z.number().int().positive(),
        description: z.string().min(10).max(1000),
        imageUrl: z.string().url().optional().or(z.literal("")),
        details: z.array(z.string().min(2).max(140)).optional().default([]),
        active: z.boolean().optional().default(true),
      })
      .parse(req.body)
    const product = await TrendingProduct.create({
      title: payload.title,
      price: payload.price,
      description: payload.description,
      imageUrl: payload.imageUrl || "",
      details: payload.details || [],
      active: payload.active ?? true,
    })
    res.status(201).json(product)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.put("/admin/trending/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = z
      .object({
        title: z.string().min(2).max(140),
        price: z.number().int().positive(),
        description: z.string().min(10).max(1000),
        imageUrl: z.string().url().optional().or(z.literal("")),
        details: z.array(z.string().min(2).max(140)).optional().default([]),
        active: z.boolean().optional().default(true),
      })
      .parse(req.body)
    const product = await TrendingProduct.findByIdAndUpdate(
      req.params.id,
      {
        title: payload.title,
        price: payload.price,
        description: payload.description,
        imageUrl: payload.imageUrl || "",
        details: payload.details || [],
        active: payload.active ?? true,
      },
      { new: true }
    )
    if (!product) {
      return res.status(404).json({ message: "Not found" })
    }
    res.json(product)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.delete("/admin/trending/:id", requireAuth, async (req, res, next) => {
  try {
    const product = await TrendingProduct.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Not found" })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.get("/admin/services", requireAuth, async (req, res, next) => {
  try {
    const services = await Service.find({})
      .populate("categoryId")
      .sort({ createdAt: -1 })
    res.json(services)
  } catch (error) {
    next(error)
  }
})

router.get("/admin/categories", requireAuth, async (req, res, next) => {
  try {
    const categories = await ServiceCategory.find({}).sort({ title: 1 })
    res.json(categories)
  } catch (error) {
    next(error)
  }
})

router.get("/admin/projects", requireAuth, async (req, res, next) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) {
    next(error)
  }
})

router.patch("/admin/contacts/:id/read", requireAuth, async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    )
    if (!contact) {
      return res.status(404).json({ message: "Not found" })
    }
    res.json(contact)
  } catch (error) {
    next(error)
  }
})

router.delete("/admin/contacts/:id", requireAuth, async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id)
    if (!contact) {
      return res.status(404).json({ message: "Not found" })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.post("/admin/services", requireAuth, async (req, res, next) => {
  try {
    const payload = serviceSchema.parse(req.body)
    const service = await Service.create({
      title: payload.title,
      description: payload.description,
      includes: payload.includes,
      idealFor: payload.idealFor || "",
      visible: payload.visible ?? true,
      featured: payload.featured ?? false,
      categoryId: payload.categoryId || null,
      icon: payload.icon || "",
      theme: payload.theme || "blue",
      eyebrow: payload.eyebrow || "",
      badgeLabel: payload.badgeLabel || "",
      tags: payload.tags || [],
      detailTabs: payload.detailTabs || [],
    })
    const populatedService = await Service.findById(service._id).populate("categoryId")
    res.status(201).json(populatedService)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.put("/admin/services/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = serviceSchema.parse(req.body)
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      {
        title: payload.title,
        description: payload.description,
        includes: payload.includes,
        idealFor: payload.idealFor || "",
        visible: payload.visible ?? true,
        featured: payload.featured ?? false,
        categoryId: payload.categoryId || null,
        icon: payload.icon || "",
        theme: payload.theme || "blue",
        eyebrow: payload.eyebrow || "",
        badgeLabel: payload.badgeLabel || "",
        tags: payload.tags || [],
        detailTabs: payload.detailTabs || [],
      },
      { new: true }
    )
    if (!service) {
      return res.status(404).json({ message: "Not found" })
    }
    const populatedService = await Service.findById(service._id).populate("categoryId")
    res.json(populatedService)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.post("/admin/categories", requireAuth, async (req, res, next) => {
  try {
    const payload = z
      .object({
        title: z.string().min(2).max(140),
        items: z.array(z.string().min(2).max(140)).optional().default([]),
      })
      .parse(req.body)
    const category = await ServiceCategory.create({
      title: payload.title,
      items: payload.items,
    })
    res.status(201).json(category)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.put("/admin/categories/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = z
      .object({
        title: z.string().min(2).max(140),
        items: z.array(z.string().min(2).max(140)).optional().default([]),
      })
      .parse(req.body)
    const category = await ServiceCategory.findByIdAndUpdate(
      req.params.id,
      { title: payload.title, items: payload.items },
      { new: true }
    )
    if (!category) {
      return res.status(404).json({ message: "Not found" })
    }
    res.json(category)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.delete("/admin/categories/:id", requireAuth, async (req, res, next) => {
  try {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ message: "Not found" })
    }
    await Service.updateMany(
      { categoryId: category._id },
      { $set: { categoryId: null } }
    )
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.post("/admin/projects", requireAuth, async (req, res, next) => {
  try {
    const payload = projectSchema.parse(req.body)
    const project = await Project.create({
      name: payload.name,
      description: payload.description,
      link: payload.link || "",
      industry: payload.industry || "",
      domain: payload.domain || "",
      badgeLabel: payload.badgeLabel || "",
      accent: payload.accent || "blue",
      icon: payload.icon || "",
      summary: payload.summary || "",
      includes: payload.includes || [],
      outcome: payload.outcome || "",
      idealFor: payload.idealFor || "",
      stack: payload.stack || [],
      featured: payload.featured ?? false,
    })
    res.status(201).json(project)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.put("/admin/projects/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = projectSchema.parse(req.body)
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name: payload.name,
        description: payload.description,
        link: payload.link || "",
        industry: payload.industry || "",
        domain: payload.domain || "",
        badgeLabel: payload.badgeLabel || "",
        accent: payload.accent || "blue",
        icon: payload.icon || "",
        summary: payload.summary || "",
        includes: payload.includes || [],
        outcome: payload.outcome || "",
        idealFor: payload.idealFor || "",
        stack: payload.stack || [],
        featured: payload.featured ?? false,
      },
      { new: true }
    )
    if (!project) {
      return res.status(404).json({ message: "Not found" })
    }
    res.json(project)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.delete("/admin/services/:id", requireAuth, async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id)
    if (!service) {
      return res.status(404).json({ message: "Not found" })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.delete("/admin/projects/:id", requireAuth, async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) {
      return res.status(404).json({ message: "Not found" })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.get("/admin/content", requireAuth, async (req, res, next) => {
  try {
    const content = await SiteContent.findOne({ key: "default" })
    if (!content) {
      const created = await SiteContent.create({ key: "default" })
      return res.json(created)
    }
    res.json(content)
  } catch (error) {
    next(error)
  }
})

router.put("/admin/content/about", requireAuth, async (req, res, next) => {
  try {
    const payload = aboutContentSchema.parse(req.body)
    const existing = await SiteContent.findOne({ key: "default" })
    const mergedPayload = { ...payload }
    if (
      (!payload.team || payload.team.length === 0) &&
      existing?.about?.team?.length
    ) {
      mergedPayload.team = existing.about.team
    }
    if (
      (!payload.galleryImages || payload.galleryImages.length === 0) &&
      existing?.about?.galleryImages?.length
    ) {
      mergedPayload.galleryImages = existing.about.galleryImages
    }
    const content = await SiteContent.findOneAndUpdate(
      { key: "default" },
      { $set: { about: mergedPayload } },
      { new: true, upsert: true }
    )
    res.json(content)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.put("/admin/content/contact", requireAuth, async (req, res, next) => {
  try {
    const payload = contactContentSchema.parse(req.body)
    const content = await SiteContent.findOneAndUpdate(
      { key: "default" },
      { $set: { contact: payload } },
      { new: true, upsert: true }
    )
    res.json(content)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.put("/admin/content/home", requireAuth, async (req, res, next) => {
  try {
    const payload = homeContentSchema.parse(req.body)
    const existing = await SiteContent.findOne({ key: "default" })
    const mergedPayload = { ...payload }
    if (
      (!payload.heroCards || payload.heroCards.length === 0) &&
      existing?.home?.heroCards?.length
    ) {
      mergedPayload.heroCards = existing.home.heroCards
    }
    if (
      (!payload.trustLogos || payload.trustLogos.length === 0) &&
      existing?.home?.trustLogos?.length
    ) {
      mergedPayload.trustLogos = existing.home.trustLogos
    }
    if (
      (!payload.testimonials || payload.testimonials.length === 0) &&
      existing?.home?.testimonials?.length
    ) {
      mergedPayload.testimonials = existing.home.testimonials
    }
    const content = await SiteContent.findOneAndUpdate(
      { key: "default" },
      { $set: { home: mergedPayload } },
      { new: true, upsert: true }
    )
    res.json(content)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.put("/admin/content/work", requireAuth, async (req, res, next) => {
  try {
    const payload = workContentSchema.parse(req.body)
    const content = await SiteContent.findOneAndUpdate(
      { key: "default" },
      { $set: { work: payload } },
      { new: true, upsert: true }
    )
    res.json(content)
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    next(error)
  }
})

router.post(
  "/admin/team/upload",
  requireAuth,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" })
      }
      const imageUrl = await uploadImageAsset(req.file, "team")
      res.json({ imageUrl })
    } catch (error) {
      console.error("Team upload error:", error)
      next(error)
    }
  }
)

router.post(
  "/admin/media/upload",
  requireAuth,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" })
      }
      const imageUrl = await uploadImageAsset(req.file, "media")
      res.json({ imageUrl })
    } catch (error) {
      console.error("Media upload error:", error)
      next(error)
    }
  }
)

router.get("/admin/blog", requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10))
    const search = (req.query.search || "").trim()
    const status = (req.query.status || "").trim()
    const sort = req.query.sort === "oldest" ? 1 : -1

    const filter = {}
    if (status === "draft" || status === "published") {
      filter.status = status
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ]
    }

    const [items, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: sort, createdAt: sort })
        .skip((page - 1) * limit)
        .limit(limit),
      BlogPost.countDocuments(filter),
    ])

    res.json({
      items: items.map(shapeBlogResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    next(error)
  }
})

router.get("/admin/blog/:id", requireAuth, async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: "Not found" })
    }
    res.json(shapeBlogResponse(post))
  } catch (error) {
    next(error)
  }
})

router.post("/blog", requireAuth, async (req, res, next) => {
  try {
    const payload = blogPayloadSchema.parse(req.body)
    const document = buildBlogDocument(payload)
    if (!document.slug) {
      return res.status(400).json({ message: "Slug is required" })
    }
    await ensureUniqueSlug(document.slug)
    const created = await BlogPost.create(document)
    res.status(201).json(shapeBlogResponse(created))
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid blog input" })
    }
    if (error?.code === 11000) {
      return res.status(409).json({ message: "A blog post with this slug already exists" })
    }
    next(error)
  }
})

router.put("/blog/:id", requireAuth, async (req, res, next) => {
  try {
    const payload = blogPayloadSchema.parse(req.body)
    const existing = await BlogPost.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: "Not found" })
    }

    const document = buildBlogDocument(payload, existing)
    if (!document.slug) {
      return res.status(400).json({ message: "Slug is required" })
    }
    await ensureUniqueSlug(document.slug, existing._id)

    Object.assign(existing, document)
    await existing.save()
    res.json(shapeBlogResponse(existing))
  } catch (error) {
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid blog input" })
    }
    if (error?.code === 11000) {
      return res.status(409).json({ message: "A blog post with this slug already exists" })
    }
    next(error)
  }
})

router.delete("/blog/:id", requireAuth, async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id)
    if (!post) {
      return res.status(404).json({ message: "Not found" })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.post(
  "/blog/upload",
  requireAuth,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" })
      }
      const imageUrl = await uploadImageAsset(req.file, "blog")
      res.json({ imageUrl })
    } catch (error) {
      next(error)
    }
  }
)

export default router
