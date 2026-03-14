import express from "express"
import helmet from "helmet"
import cors from "cors"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"
import path from "path"
import publicRoutes from "./routes/public.js"
import adminRoutes from "./routes/admin.js"
import { connectDatabase } from "./config/db.js"
import { errorHandler } from "./middleware/error.js"
import { Admin } from "./models/Admin.js"
import bcrypt from "bcrypt"
import { Service } from "./models/Service.js"
import { ServiceCategory } from "./models/ServiceCategory.js"
import { Project } from "./models/Project.js"
import { TrendingProduct } from "./models/TrendingProduct.js"
import { SiteContent } from "./models/SiteContent.js"
import {
  defaultServices,
  defaultProjects,
  defaultCategories,
  defaultTrendingProducts,
  defaultSiteContent,
} from "./seed/defaultData.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
)

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"]

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)

app.use(express.json({ limit: "1mb" }))

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
})

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
})

app.use("/api", generalLimiter)
app.use("/api/contact", contactLimiter)
app.use("/api/admin/login", loginLimiter)

app.use("/api", publicRoutes)
app.use("/api", adminRoutes)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    maxAge: "7d",
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin")
    },
  })
)

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.use(errorHandler)

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    return
  }
  const existing = await Admin.findOne({ email: email.toLowerCase() })
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10)
    await Admin.create({ email: email.toLowerCase(), passwordHash })
    console.log("Default admin created.")
  }
}

async function ensureSeedData() {
  if (process.env.SEED_ON_START !== "true") {
    return
  }
  const categoryCount = await ServiceCategory.countDocuments()
  const serviceCount = await Service.countDocuments()
  const projectCount = await Project.countDocuments()
  const trendingCount = await TrendingProduct.countDocuments()
  const contentCount = await SiteContent.countDocuments()

  if (categoryCount === 0) {
    await ServiceCategory.insertMany(defaultCategories)
    console.log("Seeded default categories.")
  }
  if (serviceCount === 0) {
    const categories = await ServiceCategory.find({})
    const categoryMap = new Map(
      categories.map((category) => [category.title, category._id])
    )
    const servicesToInsert = defaultServices.map((service) => ({
      ...service,
      categoryId: categoryMap.get(service.categoryTitle) || null,
    }))
    await Service.insertMany(servicesToInsert)
    console.log("Seeded default services.")
  }
  if (projectCount === 0) {
    await Project.insertMany(defaultProjects)
    console.log("Seeded default projects.")
  }
  if (trendingCount === 0) {
    await TrendingProduct.insertMany(defaultTrendingProducts)
    console.log("Seeded trending products.")
  }
  if (contentCount === 0) {
    await SiteContent.create({ key: "default", ...defaultSiteContent })
    console.log("Seeded site content.")
  }
}

connectDatabase(process.env.MONGO_URI)
  .then(async () => {
    await ensureAdmin()
    await ensureSeedData()
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err)
    process.exit(1)
  })
