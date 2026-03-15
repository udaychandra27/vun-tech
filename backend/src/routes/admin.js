import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { z } from "zod"
import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { Admin } from "../models/Admin.js"
import { Contact } from "../models/Contact.js"
import { Service } from "../models/Service.js"
import { Project } from "../models/Project.js"
import { ServiceCategory } from "../models/ServiceCategory.js"
import { ChatLead } from "../models/ChatLead.js"
import { Order } from "../models/Order.js"
import { TrendingProduct } from "../models/TrendingProduct.js"
import { SiteContent } from "../models/SiteContent.js"
import { requireAuth } from "../middleware/auth.js"

const router = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
})

const projectSchema = z.object({
  name: z.string().min(2).max(140),
  description: z.string().min(10).max(1000),
  link: z.string().url().optional().or(z.literal("")),
  industry: z.string().max(120).optional().or(z.literal("")),
  outcome: z.string().max(240).optional().or(z.literal("")),
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
  email: z.string().email().optional().or(z.literal("")),
  whatsappUrl: z.string().max(500).optional().or(z.literal("")),
  locationText: z.string().max(200).optional().or(z.literal("")),
  nextSteps: z.array(z.string().min(2).max(140)).optional().default([]),
  requirements: z.array(z.string().min(2).max(140)).optional().default([]),
})

const homeContentSchema = z.object({
  heroCards: z
    .array(
      z.object({
        imageUrl: z.string().max(500).optional().or(z.literal("")),
        caption: z.string().max(200).optional().or(z.literal("")),
      })
    )
    .optional()
    .default([]),
})

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
    })
    res.status(201).json(service)
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
      },
      { new: true }
    )
    if (!service) {
      return res.status(404).json({ message: "Not found" })
    }
    res.json(service)
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
      outcome: payload.outcome || "",
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
        outcome: payload.outcome || "",
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

router.post(
  "/admin/team/upload",
  requireAuth,
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" })
      }
      const result = await uploadToCloudinary(req.file, "team")
      res.json({ imageUrl: result.secure_url })
    } catch (error) {
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
      const result = await uploadToCloudinary(req.file, "media")
      res.json({ imageUrl: result.secure_url })
    } catch (error) {
      next(error)
    }
  }
)

export default router
