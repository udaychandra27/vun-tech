import dotenv from "dotenv"
import express from "express"
import { z } from "zod"
import { Contact } from "../models/Contact.js"
import { Service } from "../models/Service.js"
import { Project } from "../models/Project.js"
import { ServiceCategory } from "../models/ServiceCategory.js"
import { ChatLead } from "../models/ChatLead.js"
import { Order } from "../models/Order.js"
import { TrendingProduct } from "../models/TrendingProduct.js"
import { SiteContent } from "../models/SiteContent.js"
import Razorpay from "razorpay"
import crypto from "crypto"

dotenv.config()

const router = express.Router()

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  company: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10).max(2000),
})

router.post("/contact", async (req, res, next) => {
  try {
    const payload = contactSchema.parse(req.body)
    const contact = await Contact.create({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      company: payload.company || "",
      message: payload.message,
    })
    res.status(201).json({ id: contact._id })
  } catch (error) {
    console.error("Contact error:", error)
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    return res.status(500).json({ message: "Contact submission failed" })
  }
})

router.post("/chat/leads", async (req, res, next) => {
  try {
    const payload = z
      .object({
        name: z.string().min(2).max(120),
        email: z.string().email(),
      })
      .parse(req.body)
    const lead = await ChatLead.create({
      name: payload.name,
      email: payload.email,
    })
    res.status(201).json({ id: lead._id })
  } catch (error) {
    console.error("Chat lead error:", error)
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    return res.status(500).json({ message: "Lead submission failed" })
  }
})

router.post("/payments/order", async (req, res, next) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: "Payments not configured" })
    }
    const payload = z
      .object({
        amount: z.number().int().positive(),
        currency: z.string().default("INR"),
        product: z.string().min(2).max(120),
        name: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().min(7).max(20),
      })
      .parse(req.body)

    const order = await razorpay.orders.create({
      amount: payload.amount,
      currency: payload.currency,
      notes: {
        product: payload.product,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
      },
    })

    await Order.create({
      product: payload.product,
      amount: payload.amount,
      currency: payload.currency,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      status: "pending_payment",
      razorpayOrderId: order.id,
    })

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("Razorpay order error:", error)
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    return res.status(500).json({
      message:
        error?.error?.description ||
        error?.error?.reason ||
        error?.message ||
        "Payment error",
    })
  }
})

router.post("/payments/verify", async (req, res, next) => {
  try {
    const payload = z
      .object({
        orderId: z.string(),
        paymentId: z.string(),
        signature: z.string(),
      })
      .parse(req.body)

    const body = `${payload.orderId}|${payload.paymentId}`
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex")

    if (expected !== payload.signature) {
      return res.status(400).json({ message: "Invalid signature" })
    }

    await Order.findOneAndUpdate(
      { razorpayOrderId: payload.orderId },
      {
        status: "paid",
        razorpayPaymentId: payload.paymentId,
      }
    )

    res.json({ status: "verified" })
  } catch (error) {
    console.error("Razorpay verify error:", error)
    if (error?.issues) {
      return res.status(400).json({ message: "Invalid input" })
    }
    return res.status(500).json({ message: error?.message || "Verification error" })
  }
})

router.get("/services", async (req, res, next) => {
  try {
    const services = await Service.find({ visible: true })
      .populate("categoryId")
      .sort({ createdAt: -1 })
    res.json(services)
  } catch (error) {
    next(error)
  }
})

router.get("/categories", async (req, res, next) => {
  try {
    const categories = await ServiceCategory.find({}).sort({ title: 1 })
    res.json(categories)
  } catch (error) {
    next(error)
  }
})

router.get("/projects", async (req, res, next) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) {
    next(error)
  }
})

router.get("/trending", async (req, res, next) => {
  try {
    const products = await TrendingProduct.find({ active: true }).sort({
      createdAt: -1,
    })
    res.json(products)
  } catch (error) {
    next(error)
  }
})

router.get("/content/about", async (req, res, next) => {
  try {
    const content = await SiteContent.findOne({ key: "default" })
    res.json(content?.about || null)
  } catch (error) {
    next(error)
  }
})

router.get("/content/contact", async (req, res, next) => {
  try {
    const content = await SiteContent.findOne({ key: "default" })
    res.json(content?.contact || null)
  } catch (error) {
    next(error)
  }
})

export default router
