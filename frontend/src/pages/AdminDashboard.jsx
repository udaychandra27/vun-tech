import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Container } from "@/components/layout/Container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { apiFetch, setAuthToken, API_URL } from "@/lib/api"
import { OptimizedImage } from "@/components/OptimizedImage"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const tabs = [
  "contacts",
  "chat leads",
  "orders",
  "trending",
  "services",
  "work",
  "pages",
]

const serviceIconOptions = [
  "Monitor",
  "ShieldCheck",
  "PenTool",
  "Cloud",
  "Code2",
  "Workflow",
  "Sparkles",
  "BadgeCheck",
  "Lock",
  "ScanSearch",
  "LayoutPanelTop",
  "ServerCog",
  "Globe",
]

const projectIconOptions = [
  "Monitor",
  "ShieldCheck",
  "PenTool",
  "Cloud",
  "Code2",
  "Workflow",
  "Sparkles",
  "Lock",
  "ScanSearch",
  "LayoutPanelTop",
  "ServerCog",
  "Globe",
]

const pageEditorSections = [
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
  { id: "work", label: "Work" },
  { id: "home", label: "Home" },
]

const serviceDetailSections = ["Included", "Process", "Deliverables"]

const emptyServiceTabs = serviceDetailSections.map((title) => ({
  title,
  itemsText: "",
}))

const defaultHomeHeroCards = [
  { imageUrl: "", caption: "" },
  { imageUrl: "", caption: "" },
]

const defaultWhyChooseItems = [
  {
    icon: "Workflow",
    title: "Fast Delivery",
    description: "Rapid development cycles without compromising quality",
  },
  {
    icon: "Sparkles",
    title: "Startup-Friendly Pricing",
    description: "Affordable solutions designed for growing businesses",
  },
  {
    icon: "Code2",
    title: "Modern Tech Stack",
    description: "Built using latest secure and scalable technologies",
  },
  {
    icon: "BadgeCheck",
    title: "Direct Expert Support",
    description: "Work directly with developers, not middlemen",
  },
  {
    icon: "ShieldCheck",
    title: "Secure by Design",
    description: "Security integrated from day one",
  },
]

const defaultHomeStats = [
  { value: "20+", label: "Projects Delivered" },
  { value: "10+", label: "Technologies Used" },
  { value: "24/7", label: "Support" },
  { value: "Startup-Friendly", label: "Pricing" },
]

const emptyHomeTestimonial = { quote: "", name: "", role: "" }

const defaultHomeTestimonials = [
  emptyHomeTestimonial,
  emptyHomeTestimonial,
  emptyHomeTestimonial,
]

function buildHomeLogoSlots(items = [], count = 4) {
  return Array.from({ length: count }, (_, index) => items[index] || "")
}

function buildWhyChooseSlots(items = [], count = defaultWhyChooseItems.length) {
  return Array.from(
    { length: count },
    (_, index) => items[index] || { ...defaultWhyChooseItems[index] }
  )
}

function buildHomeStatSlots(items = [], count = defaultHomeStats.length) {
  return Array.from(
    { length: count },
    (_, index) => items[index] || { ...defaultHomeStats[index] }
  )
}

function buildHomeTestimonialSlots(items = [], count = 3) {
  return Array.from(
    { length: count },
    (_, index) => items[index] || { ...defaultHomeTestimonials[index] }
  )
}

function buildServiceTabsForm(detailTabs = []) {
  return emptyServiceTabs.map((fallback, index) => {
    const tab = detailTabs[index]
    return {
      title: fallback.title,
      itemsText: Array.isArray(tab?.items) ? tab.items.join("\n") : "",
    }
  })
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const [active, setActive] = useState("contacts")
  const [contacts, setContacts] = useState([])
  const [chatLeads, setChatLeads] = useState([])
  const [orders, setOrders] = useState([])
  const [trending, setTrending] = useState([])
  const [services, setServices] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [serviceForm, setServiceForm] = useState({
    id: null,
    title: "",
    description: "",
    includes: "",
    idealFor: "",
    eyebrow: "",
    badgeLabel: "",
    icon: "Monitor",
    theme: "blue",
    tags: "",
    detailTabs: buildServiceTabsForm(),
    visible: true,
    featured: false,
  })

  const [projectForm, setProjectForm] = useState({
    id: null,
    name: "",
    description: "",
    link: "",
    industry: "",
    domain: "",
    badgeLabel: "",
    accent: "blue",
    icon: "Monitor",
    summary: "",
    includes: "",
    outcome: "",
    idealFor: "",
    stack: "",
    featured: false,
  })

  const [aboutForm, setAboutForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    approachText: "",
    closingNote: "",
    galleryImages: [],
    highlightTitle: "",
    highlightSubtitle: "",
    highlightPointsText: "",
  })

  const [contactForm, setContactForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    trustPointsText: "",
    formTitle: "",
    formStatusLabel: "",
    serviceFieldLabel: "",
    directTitle: "",
    email: "",
    whatsappUrl: "",
    linkedinUrl: "",
    linkedinLabel: "",
    nextStepsTitle: "",
    nextStepsText: "",
    requirementsTitle: "",
    requirementsText: "",
    attachmentHint: "",
    linkFieldLabel: "",
  })

  const [homeForm, setHomeForm] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_description: "",
    hero_primary_button_text: "",
    hero_primary_button_link: "",
    hero_secondary_button_text: "",
    hero_secondary_button_link: "",
    brand_accent_color: "#2F6BFF",
    trusted_badges: buildHomeLogoSlots([], 5),
    why_choose_items: buildWhyChooseSlots(),
    stats: buildHomeStatSlots(),
    heroCards: defaultHomeHeroCards,
    trustLabel: "",
    trustLogos: buildHomeLogoSlots(),
    showTestimonials: true,
    testimonials: buildHomeTestimonialSlots(),
  })
  const [workForm, setWorkForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    allProjectsLabel: "",
    ctaTitle: "",
    ctaSubtitle: "",
    primaryCtaLabel: "",
    primaryCtaUrl: "",
    secondaryCtaLabel: "",
    secondaryCtaUrl: "",
  })
  const [activePageEditor, setActivePageEditor] = useState("about")

  const [teamMembers, setTeamMembers] = useState([])
  const [teamForm, setTeamForm] = useState({
    id: null,
    name: "",
    role: "",
    imageUrl: "",
    linkedinUrl: "",
  })

  const [cropOpen, setCropOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState("")
  const [cropAspect, setCropAspect] = useState(4 / 3)
  const [cropTarget, setCropTarget] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedPixels, setCroppedPixels] = useState(null)

  const [trendingForm, setTrendingForm] = useState({
    id: null,
    title: "",
    price: "",
    description: "",
    imageUrl: "",
    details: "",
    active: true,
  })

  const fetchAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [
        contactsData,
        chatLeadsData,
        ordersData,
        trendingData,
        servicesData,
        projectsData,
        contentData,
      ] =
        await Promise.all([
          apiFetch("/api/admin/contacts"),
          apiFetch("/api/admin/chat-leads"),
          apiFetch("/api/admin/orders"),
          apiFetch("/api/admin/trending"),
          apiFetch("/api/admin/services"),
          apiFetch("/api/admin/projects"),
          apiFetch("/api/admin/content"),
        ])
      setContacts(contactsData)
      setChatLeads(chatLeadsData)
      setOrders(ordersData)
      setTrending(trendingData)
      setServices(servicesData)
      setProjects(projectsData)
      if (contentData?.about) {
        setAboutForm({
          heroTitle: contentData.about.heroTitle || "",
          heroSubtitle: contentData.about.heroSubtitle || "",
          approachText: (contentData.about.approach || [])
            .map((item) => `${item.title} | ${item.description}`)
            .join("\n"),
          closingNote: contentData.about.closingNote || "",
          galleryImages: contentData.about.galleryImages || [],
          highlightTitle: contentData.about.highlightTitle || "",
          highlightSubtitle: contentData.about.highlightSubtitle || "",
          highlightPointsText: (contentData.about.highlightPoints || []).join("\n"),
        })
        setTeamMembers(contentData.about.team || [])
      }
      if (contentData?.contact) {
        setContactForm({
          heroTitle: contentData.contact.heroTitle || "",
          heroSubtitle: contentData.contact.heroSubtitle || "",
          trustPointsText: (contentData.contact.trustPoints || []).join("\n"),
          formTitle: contentData.contact.formTitle || "",
          formStatusLabel: contentData.contact.formStatusLabel || "",
          serviceFieldLabel: contentData.contact.serviceFieldLabel || "",
          directTitle: contentData.contact.directTitle || "",
          email: contentData.contact.email || "",
          whatsappUrl: contentData.contact.whatsappUrl || "",
          linkedinUrl: contentData.contact.linkedinUrl || "",
          linkedinLabel: contentData.contact.linkedinLabel || "",
          nextStepsTitle: contentData.contact.nextStepsTitle || "",
          nextStepsText: (contentData.contact.nextSteps || []).join("\n"),
          requirementsTitle: contentData.contact.requirementsTitle || "",
          requirementsText: (contentData.contact.requirements || []).join("\n"),
          attachmentHint: contentData.contact.attachmentHint || "",
          linkFieldLabel: contentData.contact.linkFieldLabel || "",
        })
      }
      if (contentData?.home) {
        const heroCards = Array.isArray(contentData.home.heroCards)
          ? contentData.home.heroCards
          : []
        const trustLogos = Array.isArray(contentData.home.trustLogos)
          ? contentData.home.trustLogos
          : []
        const testimonials = Array.isArray(contentData.home.testimonials)
          ? contentData.home.testimonials
          : []
        setHomeForm({
          hero_title: contentData.home.hero_title || "",
          hero_subtitle: contentData.home.hero_subtitle || "",
          hero_description: contentData.home.hero_description || "",
          hero_primary_button_text: contentData.home.hero_primary_button_text || "",
          hero_primary_button_link: contentData.home.hero_primary_button_link || "",
          hero_secondary_button_text: contentData.home.hero_secondary_button_text || "",
          hero_secondary_button_link: contentData.home.hero_secondary_button_link || "",
          brand_accent_color: contentData.home.brand_accent_color || "#2F6BFF",
          trusted_badges: buildHomeLogoSlots(contentData.home.trusted_badges || [], 5),
          why_choose_items: buildWhyChooseSlots(contentData.home.why_choose_items || []),
          stats: buildHomeStatSlots(contentData.home.stats || []),
          heroCards:
            heroCards.length > 0
              ? heroCards
              : defaultHomeHeroCards,
          trustLabel: contentData.home.trustLabel || "",
          trustLogos: buildHomeLogoSlots(trustLogos),
          showTestimonials: contentData.home.showTestimonials ?? true,
          testimonials: buildHomeTestimonialSlots(testimonials),
        })
      }
      if (contentData?.work) {
        setWorkForm({
          heroTitle: contentData.work.heroTitle || "",
          heroSubtitle: contentData.work.heroSubtitle || "",
          allProjectsLabel: contentData.work.allProjectsLabel || "",
          ctaTitle: contentData.work.ctaTitle || "",
          ctaSubtitle: contentData.work.ctaSubtitle || "",
          primaryCtaLabel: contentData.work.primaryCtaLabel || "",
          primaryCtaUrl: contentData.work.primaryCtaUrl || "",
          secondaryCtaLabel: contentData.work.secondaryCtaLabel || "",
          secondaryCtaUrl: contentData.work.secondaryCtaUrl || "",
        })
      }
    } catch (err) {
      setError(err.message || "Failed to load data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleLogout = () => {
    setAuthToken(null)
    navigate("/admin")
  }

  const handleContactRead = async (id) => {
    await apiFetch(`/api/admin/contacts/${id}/read`, { method: "PATCH" })
    setContacts((prev) =>
      prev.map((item) => (item._id === id ? { ...item, read: true } : item))
    )
  }

  const handleContactDelete = async (id) => {
    await apiFetch(`/api/admin/contacts/${id}`, { method: "DELETE" })
    setContacts((prev) => prev.filter((item) => item._id !== id))
  }

  const handleServiceSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      title: serviceForm.title,
      description: serviceForm.description,
      includes: serviceForm.includes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      idealFor: serviceForm.idealFor,
      eyebrow: serviceForm.eyebrow.trim(),
      badgeLabel: serviceForm.badgeLabel.trim(),
      icon: serviceForm.icon,
      theme: serviceForm.theme,
      tags: serviceForm.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      detailTabs: serviceForm.detailTabs
        .map((tab) => ({
          title: tab.title.trim(),
          items: tab.itemsText
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 6),
        }))
        .filter((tab) => tab.title && tab.items.length > 0)
        .slice(0, 3),
      visible: serviceForm.visible,
      featured: serviceForm.featured,
    }

    if (serviceForm.id) {
      const updated = await apiFetch(`/api/admin/services/${serviceForm.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      setServices((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      )
    } else {
      const created = await apiFetch("/api/admin/services", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      setServices((prev) => [created, ...prev])
    }

    setServiceForm({
      id: null,
      title: "",
      description: "",
      includes: "",
      idealFor: "",
      eyebrow: "",
      badgeLabel: "",
      icon: "Monitor",
      theme: "blue",
      tags: "",
      detailTabs: buildServiceTabsForm(),
      visible: true,
      featured: false,
    })
  }

  const handleProjectSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      name: projectForm.name,
      description: projectForm.description,
      link: projectForm.link,
      industry: projectForm.industry,
      domain: projectForm.domain,
      badgeLabel: projectForm.badgeLabel,
      accent: projectForm.accent,
      icon: projectForm.icon,
      summary: projectForm.summary,
      includes: projectForm.includes
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      outcome: projectForm.outcome,
      idealFor: projectForm.idealFor,
      stack: projectForm.stack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      featured: projectForm.featured,
    }
    if (projectForm.id) {
      const updated = await apiFetch(`/api/admin/projects/${projectForm.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      setProjects((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      )
    } else {
      const created = await apiFetch("/api/admin/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      setProjects((prev) => [created, ...prev])
    }
    setProjectForm({
      id: null,
      name: "",
      description: "",
      link: "",
      industry: "",
      domain: "",
      badgeLabel: "",
      accent: "blue",
      icon: "Monitor",
      summary: "",
      includes: "",
      outcome: "",
      idealFor: "",
      stack: "",
      featured: false,
    })
  }

  const parseList = (text) =>
    text
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)

  const parseApproach = (text) =>
    parseList(text)
      .map((line) => {
        let title = ""
        let description = ""
        if (line.includes("|")) {
          const parts = line.split("|").map((part) => part.trim())
          title = parts[0]
          description = parts.slice(1).join(" | ")
        } else if (line.includes(" - ")) {
          const parts = line.split(" - ").map((part) => part.trim())
          title = parts[0]
          description = parts.slice(1).join(" - ")
        } else {
          return null
        }
        if (!title || !description) return null
        return { title, description }
      })
      .filter(Boolean)

  const resolveImageUrl = (url) => {
    if (!url) return ""
    if (url.startsWith("http") || url.startsWith("data:")) return url
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`
    return url
  }

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (error) => reject(error))
      image.setAttribute("crossOrigin", "anonymous")
      image.src = url
    })

  const getCroppedBlob = async (imageSrc, pixelCrop, maxWidth, maxHeight) => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    let targetWidth = pixelCrop.width
    let targetHeight = pixelCrop.height
    if (maxWidth || maxHeight) {
      const widthLimit = maxWidth || pixelCrop.width
      const heightLimit = maxHeight || pixelCrop.height
      const ratio = Math.min(
        widthLimit / pixelCrop.width,
        heightLimit / pixelCrop.height,
        1
      )
      targetWidth = Math.round(pixelCrop.width * ratio)
      targetHeight = Math.round(pixelCrop.height * ratio)
    }
    canvas.width = targetWidth
    canvas.height = targetHeight
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    )
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9)
    })
  }

  const openCropper = (file, target, aspect = 4 / 3) => {
    const reader = new FileReader()
    reader.onload = () => {
      setCropImageSrc(reader.result?.toString() || "")
      setCropAspect(aspect)
      setCropTarget(target)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedPixels(null)
      setCropOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropSave = async () => {
    if (!cropImageSrc || !croppedPixels || !cropTarget) return
    try {
      const maxSize =
        cropTarget.section === "about"
          ? { w: 1400, h: 1050 }
          : { w: 1600, h: 900 }
      const blob = await getCroppedBlob(
        cropImageSrc,
        croppedPixels,
        maxSize.w,
        maxSize.h
      )
      if (!blob) return
      const formData = new FormData()
      formData.append("image", new File([blob], "crop.jpg", { type: blob.type }))
      const data = await apiFetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      })
      if (data?.imageUrl) {
        if (cropTarget.section === "about") {
          setAboutForm((prev) => {
            const next = [...(prev.galleryImages || [])]
            next[cropTarget.index] = data.imageUrl
            return { ...prev, galleryImages: next }
          })
        }
        if (cropTarget.section === "home") {
          setHomeForm((prev) => {
            const next = [...(prev.heroCards || [])]
            if (!next[cropTarget.index]) {
              next[cropTarget.index] = { imageUrl: "", caption: "" }
            }
            next[cropTarget.index] = {
              ...next[cropTarget.index],
              imageUrl: data.imageUrl,
            }
            return { ...prev, heroCards: next }
          })
        }
      }
      setCropOpen(false)
      setCropImageSrc("")
      setCropTarget(null)
      setError("")
    } catch (err) {
      setError(err.message || "Failed to crop image.")
    }
  }

  const saveAboutContent = async (nextTeamMembers = teamMembers) => {
    const payload = {
      heroTitle: aboutForm.heroTitle,
      heroSubtitle: aboutForm.heroSubtitle,
      approach: parseApproach(aboutForm.approachText),
      closingNote: aboutForm.closingNote,
      galleryImages: aboutForm.galleryImages || [],
      highlightTitle: aboutForm.highlightTitle,
      highlightSubtitle: aboutForm.highlightSubtitle,
      highlightPoints: parseList(aboutForm.highlightPointsText || ""),
      team: nextTeamMembers,
    }
    try {
      const updated = await apiFetch("/api/admin/content/about", {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      if (updated?.about) {
        setAboutForm({
          heroTitle: updated.about.heroTitle || "",
          heroSubtitle: updated.about.heroSubtitle || "",
          approachText: (updated.about.approach || [])
            .map((item) => `${item.title} | ${item.description}`)
            .join("\n"),
          closingNote: updated.about.closingNote || "",
          galleryImages: updated.about.galleryImages || [],
          highlightTitle: updated.about.highlightTitle || "",
          highlightSubtitle: updated.about.highlightSubtitle || "",
          highlightPointsText: (updated.about.highlightPoints || []).join("\n"),
        })
        setTeamMembers(updated.about.team || [])
      }
      setError("")
    } catch (err) {
      setError(err.message || "Failed to save about content.")
    }
  }

  const saveContactContent = async () => {
    const payload = {
      heroTitle: contactForm.heroTitle,
      heroSubtitle: contactForm.heroSubtitle,
      trustPoints: parseList(contactForm.trustPointsText),
      formTitle: contactForm.formTitle,
      formStatusLabel: contactForm.formStatusLabel,
      serviceFieldLabel: contactForm.serviceFieldLabel,
      directTitle: contactForm.directTitle,
      email: contactForm.email,
      whatsappUrl: contactForm.whatsappUrl,
      linkedinUrl: contactForm.linkedinUrl,
      linkedinLabel: contactForm.linkedinLabel,
      nextStepsTitle: contactForm.nextStepsTitle,
      nextSteps: parseList(contactForm.nextStepsText),
      requirementsTitle: contactForm.requirementsTitle,
      requirements: parseList(contactForm.requirementsText),
      attachmentHint: contactForm.attachmentHint,
      linkFieldLabel: contactForm.linkFieldLabel,
    }
    try {
      const updated = await apiFetch("/api/admin/content/contact", {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      if (updated?.contact) {
        setContactForm({
          heroTitle: updated.contact.heroTitle || "",
          heroSubtitle: updated.contact.heroSubtitle || "",
          trustPointsText: (updated.contact.trustPoints || []).join("\n"),
          formTitle: updated.contact.formTitle || "",
          formStatusLabel: updated.contact.formStatusLabel || "",
          serviceFieldLabel: updated.contact.serviceFieldLabel || "",
          directTitle: updated.contact.directTitle || "",
          email: updated.contact.email || "",
          whatsappUrl: updated.contact.whatsappUrl || "",
          linkedinUrl: updated.contact.linkedinUrl || "",
          linkedinLabel: updated.contact.linkedinLabel || "",
          nextStepsTitle: updated.contact.nextStepsTitle || "",
          nextStepsText: (updated.contact.nextSteps || []).join("\n"),
          requirementsTitle: updated.contact.requirementsTitle || "",
          requirementsText: (updated.contact.requirements || []).join("\n"),
          attachmentHint: updated.contact.attachmentHint || "",
          linkFieldLabel: updated.contact.linkFieldLabel || "",
        })
      }
      setError("")
    } catch (err) {
      setError(err.message || "Failed to save contact content.")
    }
  }

  const saveHomeContent = async () => {
    const payload = {
      hero_title: homeForm.hero_title.trim(),
      hero_subtitle: homeForm.hero_subtitle.trim(),
      hero_description: homeForm.hero_description.trim(),
      hero_primary_button_text: homeForm.hero_primary_button_text.trim(),
      hero_primary_button_link: homeForm.hero_primary_button_link.trim(),
      hero_secondary_button_text: homeForm.hero_secondary_button_text.trim(),
      hero_secondary_button_link: homeForm.hero_secondary_button_link.trim(),
      brand_accent_color: homeForm.brand_accent_color.trim(),
      trusted_badges: (homeForm.trusted_badges || []).map((item) => item.trim()).filter(Boolean),
      why_choose_items: (homeForm.why_choose_items || [])
        .map((item) => ({
          icon: (item.icon || "").trim(),
          title: (item.title || "").trim(),
          description: (item.description || "").trim(),
        }))
        .filter((item) => item.title || item.description || item.icon),
      stats: (homeForm.stats || [])
        .map((item) => ({
          value: (item.value || "").trim(),
          label: (item.label || "").trim(),
        }))
        .filter((item) => item.value || item.label),
      heroCards: homeForm.heroCards,
      trustLabel: homeForm.trustLabel,
      trustLogos: (homeForm.trustLogos || []).map((item) => item.trim()).filter(Boolean),
      showTestimonials: homeForm.showTestimonials,
      testimonials: (homeForm.testimonials || [])
        .map((item) => ({
          quote: item.quote.trim(),
          name: item.name.trim(),
          role: item.role.trim(),
        }))
        .filter((item) => item.quote || item.name || item.role),
    }
    try {
      const updated = await apiFetch("/api/admin/content/home", {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      if (updated?.home) {
        setHomeForm({
          hero_title: updated.home.hero_title || "",
          hero_subtitle: updated.home.hero_subtitle || "",
          hero_description: updated.home.hero_description || "",
          hero_primary_button_text: updated.home.hero_primary_button_text || "",
          hero_primary_button_link: updated.home.hero_primary_button_link || "",
          hero_secondary_button_text: updated.home.hero_secondary_button_text || "",
          hero_secondary_button_link: updated.home.hero_secondary_button_link || "",
          brand_accent_color: updated.home.brand_accent_color || "#2F6BFF",
          trusted_badges: buildHomeLogoSlots(updated.home.trusted_badges || [], 5),
          why_choose_items: buildWhyChooseSlots(updated.home.why_choose_items || []),
          stats: buildHomeStatSlots(updated.home.stats || []),
          heroCards: updated.home.heroCards?.length
            ? updated.home.heroCards
            : defaultHomeHeroCards,
          trustLabel: updated.home.trustLabel || "",
          trustLogos: buildHomeLogoSlots(updated.home.trustLogos || []),
          showTestimonials: updated.home.showTestimonials ?? true,
          testimonials:
            updated.home.testimonials?.length > 0
              ? updated.home.testimonials.map((item) => ({ ...emptyHomeTestimonial, ...item }))
              : buildHomeTestimonialSlots(),
        })
      }
      setError("")
    } catch (err) {
      setError(err.message || "Failed to save home content.")
    }
  }

  const saveWorkContent = async () => {
    const payload = {
      heroTitle: workForm.heroTitle,
      heroSubtitle: workForm.heroSubtitle,
      allProjectsLabel: workForm.allProjectsLabel,
      ctaTitle: workForm.ctaTitle,
      ctaSubtitle: workForm.ctaSubtitle,
      primaryCtaLabel: workForm.primaryCtaLabel,
      primaryCtaUrl: workForm.primaryCtaUrl,
      secondaryCtaLabel: workForm.secondaryCtaLabel,
      secondaryCtaUrl: workForm.secondaryCtaUrl,
    }
    try {
      const updated = await apiFetch("/api/admin/content/work", {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      if (updated?.work) {
        setWorkForm({
          heroTitle: updated.work.heroTitle || "",
          heroSubtitle: updated.work.heroSubtitle || "",
          allProjectsLabel: updated.work.allProjectsLabel || "",
          ctaTitle: updated.work.ctaTitle || "",
          ctaSubtitle: updated.work.ctaSubtitle || "",
          primaryCtaLabel: updated.work.primaryCtaLabel || "",
          primaryCtaUrl: updated.work.primaryCtaUrl || "",
          secondaryCtaLabel: updated.work.secondaryCtaLabel || "",
          secondaryCtaUrl: updated.work.secondaryCtaUrl || "",
        })
      }
      setError("")
    } catch (err) {
      setError(err.message || "Failed to save work content.")
    }
  }

  const handleTeamSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      name: teamForm.name.trim(),
      role: teamForm.role.trim(),
      imageUrl: teamForm.imageUrl.trim(),
      linkedinUrl: teamForm.linkedinUrl.trim(),
    }
    const tempId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}`
    const nextTeam =
      teamForm.id !== null
        ? teamMembers.map((member) =>
            member._id === teamForm.id ? { ...member, ...payload } : member
          )
        : [{ _id: tempId, ...payload }, ...teamMembers]

    await saveAboutContent(nextTeam)
    setTeamForm({ id: null, name: "", role: "", imageUrl: "", linkedinUrl: "" })
  }

  const handleTeamDelete = async (id) => {
    const nextTeam = teamMembers.filter((member) => member._id !== id)
    await saveAboutContent(nextTeam)
  }

  const handleTeamImageUpload = async (file) => {
    try {
      const formData = new FormData()
      formData.append("image", file)
      const data = await apiFetch("/api/admin/team/upload", {
        method: "POST",
        body: formData,
      })
      if (data?.imageUrl) {
        setTeamForm((prev) => ({ ...prev, imageUrl: data.imageUrl }))
      }
      setError("")
    } catch (err) {
      setError(err.message || "Failed to upload image.")
    }
  }

  const stats = useMemo(
    () => ({
      unread: contacts.filter((c) => !c.read).length,
      chatLeads: chatLeads.length,
      orders: orders.length,
      trending: trending.length,
      services: services.length,
      projects: projects.length,
    }),
    [contacts, chatLeads, orders, trending, services, projects]
  )

  return (
    <div className="min-h-screen bg-sand">
      <Container className="py-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Admin dashboard</h1>
            <p className="text-sm text-slate">Manage inquiries and content.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate("/admin/blog")}>
              Manage blog
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <aside className="space-y-3 rounded-xl border border-fog bg-white p-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActive(tab)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  active === tab ? "bg-fog text-ink" : "text-slate hover:bg-sand"
                }`}
              >
                <span className="capitalize">{tab}</span>
                {tab === "contacts" && stats.unread > 0 && (
                  <Badge variant="success">{stats.unread}</Badge>
                )}
                {tab === "chat leads" && stats.chatLeads > 0 && (
                  <Badge variant="outline">{stats.chatLeads}</Badge>
                )}
                {tab === "orders" && stats.orders > 0 && (
                  <Badge variant="outline">{stats.orders}</Badge>
                )}
                {tab === "trending" && stats.trending > 0 && (
                  <Badge variant="outline">{stats.trending}</Badge>
                )}
              </button>
            ))}
          </aside>

          <section className="space-y-6">
            {loading && <div className="text-sm text-slate">Loading data...</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}

            {active === "contacts" && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact inquiries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contacts.length === 0 && (
                    <div className="text-sm text-slate">No inquiries yet.</div>
                  )}
                  {contacts.map((contact) => (
                    <div
                      key={contact._id}
                      className="rounded-lg border border-fog bg-sand p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">
                            {contact.name} • {contact.email}
                          </div>
                          <div className="text-xs text-slate">
                            {contact.phone}
                          </div>
                          {contact.serviceNeeded ? (
                            <div className="text-xs text-slate">
                              Service: {contact.serviceNeeded}
                            </div>
                          ) : null}
                          <div className="text-xs text-slate">
                            {new Date(contact.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!contact.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContactRead(contact._id)}
                            >
                              Mark read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleContactDelete(contact._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate">
                        {contact.message}
                      </p>
                      {(contact.company || contact.referenceLink || contact.attachmentUrl) && (
                        <div className="mt-3 space-y-1 text-xs text-slate">
                          {contact.company ? <div>Company: {contact.company}</div> : null}
                          {contact.referenceLink ? (
                            <div>
                              Reference link:{" "}
                              <a
                                href={contact.referenceLink}
                                className="font-medium text-moss"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {contact.referenceLink}
                              </a>
                            </div>
                          ) : null}
                          {contact.attachmentUrl ? (
                            <div>
                              Attachment:{" "}
                              <a
                                href={`${API_URL}${contact.attachmentUrl}`}
                                className="font-medium text-moss"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {contact.attachmentName || "View file"}
                              </a>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {active === "chat leads" && (
              <Card>
                <CardHeader>
                  <CardTitle>Chatbot leads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {chatLeads.length === 0 && (
                    <div className="text-sm text-slate">No leads yet.</div>
                  )}
                  {chatLeads.map((lead) => (
                    <div
                      key={lead._id}
                      className="rounded-lg border border-fog bg-sand p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">
                            {lead.name} • {lead.email}
                          </div>
                          <div className="text-xs text-slate">
                            {new Date(lead.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await apiFetch(`/api/admin/chat-leads/${lead._id}`, {
                              method: "DELETE",
                            })
                            setChatLeads((prev) =>
                              prev.filter((item) => item._id !== lead._id)
                            )
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {active === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders.length === 0 && (
                    <div className="text-sm text-slate">No orders yet.</div>
                  )}
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-lg border border-fog bg-sand p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">
                            {order.product} • INR {Math.round(order.amount / 100)}
                          </div>
                          <div className="text-xs text-slate">
                            {order.name} • {order.email} • {order.phone}
                          </div>
                          <div className="text-xs text-slate">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-[180px_1fr]">
                        <select
                          className="h-9 w-full rounded-md border border-fog bg-white px-3 text-sm"
                          value={order.status}
                          onChange={async (e) => {
                            const updated = await apiFetch(
                              `/api/admin/orders/${order._id}`,
                              {
                                method: "PATCH",
                                body: JSON.stringify({ status: e.target.value }),
                              }
                            )
                            setOrders((prev) =>
                              prev.map((item) =>
                                item._id === updated._id ? updated : item
                              )
                            )
                          }}
                        >
                          <option value="pending_payment">Pending payment</option>
                          <option value="paid">Paid</option>
                          <option value="in_progress">In progress</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <Input
                          placeholder="Admin notes / delivery info"
                          value={order.notes || ""}
                          onChange={async (e) => {
                            const updated = await apiFetch(
                              `/api/admin/orders/${order._id}`,
                              {
                                method: "PATCH",
                                body: JSON.stringify({ notes: e.target.value }),
                              }
                            )
                            setOrders((prev) =>
                              prev.map((item) =>
                                item._id === updated._id ? updated : item
                              )
                            )
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {active === "trending" && (
              <Card>
                <CardHeader>
                  <CardTitle>Trending products</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form
                    className="grid gap-3"
                    onSubmit={async (event) => {
                      event.preventDefault()
                      const payload = {
                        title: trendingForm.title,
                        price: Number(trendingForm.price),
                        description: trendingForm.description,
                        imageUrl: trendingForm.imageUrl,
                        details: trendingForm.details
                          .split("\n")
                          .map((item) => item.trim())
                          .filter(Boolean),
                        active: trendingForm.active,
                      }
                      if (trendingForm.id) {
                        const updated = await apiFetch(
                          `/api/admin/trending/${trendingForm.id}`,
                          {
                            method: "PUT",
                            body: JSON.stringify(payload),
                          }
                        )
                        setTrending((prev) =>
                          prev.map((item) =>
                            item._id === updated._id ? updated : item
                          )
                        )
                      } else {
                        const created = await apiFetch("/api/admin/trending", {
                          method: "POST",
                          body: JSON.stringify(payload),
                        })
                        setTrending((prev) => [created, ...prev])
                      }
                      setTrendingForm({
                        id: null,
                        title: "",
                        price: "",
                        description: "",
                        imageUrl: "",
                        details: "",
                        active: true,
                      })
                    }}
                  >
                    <Input
                      placeholder="Product title"
                      value={trendingForm.title}
                      onChange={(e) =>
                        setTrendingForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Price (INR)"
                      value={trendingForm.price}
                      onChange={(e) =>
                        setTrendingForm((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                    />
                    <Textarea
                      placeholder="Short description"
                      value={trendingForm.description}
                      onChange={(e) =>
                        setTrendingForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                    <Textarea
                      placeholder="Details (one per line)"
                      value={trendingForm.details}
                      onChange={(e) =>
                        setTrendingForm((prev) => ({
                          ...prev,
                          details: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Image URL"
                      value={trendingForm.imageUrl}
                      onChange={(e) =>
                        setTrendingForm((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                    />
                    <label className="flex items-center gap-2 text-sm text-slate">
                      <input
                        type="checkbox"
                        checked={trendingForm.active}
                        onChange={(e) =>
                          setTrendingForm((prev) => ({
                            ...prev,
                            active: e.target.checked,
                          }))
                        }
                      />
                      Active on site
                    </label>
                    <Button type="submit">
                      {trendingForm.id ? "Update product" : "Add product"}
                    </Button>
                  </form>

                  <div className="space-y-3">
                    {trending.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-lg border border-fog bg-sand p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-xs text-slate">
                              INR {item.price}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setTrendingForm({
                                  id: item._id,
                                  title: item.title,
                                  price: item.price,
                                  description: item.description,
                                  imageUrl: item.imageUrl || "",
                                  details: (item.details || []).join("\n"),
                                  active: item.active,
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                await apiFetch(`/api/admin/trending/${item._id}`, {
                                  method: "DELETE",
                                })
                                setTrending((prev) =>
                                  prev.filter((entry) => entry._id !== item._id)
                                )
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate">{item.description}</p>
                        {item.details?.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-slate">
                            {item.details.map((detail) => (
                              <li key={detail}>• {detail}</li>
                            ))}
                          </ul>
                        )}
                        {item.imageUrl && (
                          <p className="mt-2 text-xs text-ink/60">
                            Image: {item.imageUrl}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {active === "services" && (
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form className="grid gap-3" onSubmit={handleServiceSubmit}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Service title"
                        value={serviceForm.title}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Ideal client type"
                        value={serviceForm.idealFor}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            idealFor: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Eyebrow label"
                        value={serviceForm.eyebrow}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            eyebrow: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Badge label"
                        value={serviceForm.badgeLabel}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            badgeLabel: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <select
                        className="h-10 w-full rounded-md border border-fog bg-white px-3 text-sm"
                        value={serviceForm.icon}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            icon: e.target.value,
                          }))
                        }
                      >
                        {serviceIconOptions.map((iconName) => (
                          <option key={iconName} value={iconName}>
                            {iconName}
                          </option>
                        ))}
                      </select>
                      <select
                        className="h-10 w-full rounded-md border border-fog bg-white px-3 text-sm"
                        value={serviceForm.theme}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            theme: e.target.value,
                          }))
                        }
                      >
                        <option value="blue">Blue</option>
                        <option value="blue-featured">Blue Featured</option>
                        <option value="teal">Teal</option>
                        <option value="amber">Amber</option>
                      </select>
                      <Input
                        placeholder="Tags (comma separated)"
                        value={serviceForm.tags}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            tags: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Short description"
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Includes (comma separated)"
                      value={serviceForm.includes}
                      onChange={(e) =>
                        setServiceForm((prev) => ({
                          ...prev,
                          includes: e.target.value,
                        }))
                      }
                    />
                    <div className="rounded-lg border border-fog bg-sand p-4">
                      <div className="mb-3 text-sm font-semibold text-ink">
                        Service details
                      </div>
                      <div className="grid gap-4">
                        {serviceForm.detailTabs.map((tab, index) => (
                          <div
                            key={`service-tab-${index}`}
                            className="rounded-lg border border-fog bg-white p-4"
                          >
                            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
                              {tab.title}
                            </div>
                            <Input
                              readOnly
                              value={tab.title}
                            />
                            <Textarea
                              className="mt-3"
                              placeholder={`${tab.title} items (one per line, up to 6)`}
                              value={tab.itemsText}
                              onChange={(e) =>
                                setServiceForm((prev) => {
                                  const nextTabs = [...prev.detailTabs]
                                  nextTabs[index] = {
                                    ...nextTabs[index],
                                    itemsText: e.target.value,
                                  }
                                  return { ...prev, detailTabs: nextTabs }
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate">
                      <input
                        type="checkbox"
                        checked={serviceForm.visible}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            visible: e.target.checked,
                          }))
                        }
                      />
                      Visible on site
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate">
                      <input
                        type="checkbox"
                        checked={serviceForm.featured}
                        onChange={(e) =>
                          setServiceForm((prev) => ({
                            ...prev,
                            featured: e.target.checked,
                          }))
                        }
                      />
                      Featured on home
                    </label>
                    <Button type="submit">
                      {serviceForm.id ? "Update service" : "Add service"}
                    </Button>
                  </form>

                  <div className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service._id}
                        className="rounded-lg border border-fog bg-sand p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{service.title}</div>
                            <div className="text-xs text-slate">
                              {service.idealFor}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setServiceForm({
                                  id: service._id,
                                  title: service.title,
                                  description: service.description,
                                  includes: service.includes.join(", "),
                                  idealFor: service.idealFor,
                                  eyebrow: service.eyebrow || "",
                                  badgeLabel: service.badgeLabel || "",
                                  icon: service.icon || "Monitor",
                                  theme: service.theme || "blue",
                                  tags: (service.tags || []).join(", "),
                                  detailTabs: buildServiceTabsForm(service.detailTabs || []),
                                  visible: service.visible,
                                  featured: service.featured,
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                await apiFetch(`/api/admin/services/${service._id}`, {
                                  method: "DELETE",
                                })
                                setServices((prev) =>
                                  prev.filter((item) => item._id !== service._id)
                                )
                              }}
                            >
                              Delete
                            </Button>
                            <Badge variant={service.visible ? "success" : "outline"}>
                              {service.visible ? "Visible" : "Hidden"}
                            </Badge>
                            {service.featured && (
                              <Badge variant="outline">Featured</Badge>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate">
                          {service.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {service.icon ? <Badge variant="outline">{service.icon}</Badge> : null}
                          {service.theme ? <Badge variant="outline">{service.theme}</Badge> : null}
                          {service.badgeLabel ? <Badge variant="outline">{service.badgeLabel}</Badge> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {active === "work" && (
              <Card>
                <CardHeader>
                  <CardTitle>Work</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form className="grid gap-3" onSubmit={handleProjectSubmit}>
                    <Input
                      placeholder="Project name"
                      value={projectForm.name}
                      onChange={(e) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Industry"
                      value={projectForm.industry}
                      onChange={(e) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          industry: e.target.value,
                        }))
                      }
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Domain label"
                        value={projectForm.domain}
                        onChange={(e) =>
                          setProjectForm((prev) => ({
                            ...prev,
                            domain: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Badge label"
                        value={projectForm.badgeLabel}
                        onChange={(e) =>
                          setProjectForm((prev) => ({
                            ...prev,
                            badgeLabel: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <select
                        className="h-10 w-full rounded-md border border-fog bg-white px-3 text-sm"
                        value={projectForm.icon}
                        onChange={(e) =>
                          setProjectForm((prev) => ({
                            ...prev,
                            icon: e.target.value,
                          }))
                        }
                      >
                        {projectIconOptions.map((iconName) => (
                          <option key={iconName} value={iconName}>
                            {iconName}
                          </option>
                        ))}
                      </select>
                      <select
                        className="h-10 w-full rounded-md border border-fog bg-white px-3 text-sm"
                        value={projectForm.accent}
                        onChange={(e) =>
                          setProjectForm((prev) => ({
                            ...prev,
                            accent: e.target.value,
                          }))
                        }
                      >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="amber">Amber</option>
                        <option value="purple">Purple</option>
                        <option value="pink">Pink</option>
                      </select>
                    </div>
                    <Textarea
                      placeholder="Project description"
                      value={projectForm.description}
                      onChange={(e) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                    <Textarea
                      placeholder="Short summary"
                      value={projectForm.summary}
                      onChange={(e) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          summary: e.target.value,
                        }))
                      }
                    />
                    <Textarea
                      placeholder="Includes (one per line)"
                      value={projectForm.includes}
                      onChange={(e) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          includes: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Outcome (short, honest)"
                      value={projectForm.outcome}
                      onChange={(e) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          outcome: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Ideal for"
                      value={projectForm.idealFor}
                      onChange={(e) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          idealFor: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Stack (comma separated)"
                      value={projectForm.stack}
                      onChange={(e) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          stack: e.target.value,
                        }))
                      }
                    />
                    <Input
                      placeholder="Link or GitHub URL"
                      value={projectForm.link}
                      onChange={(e) =>
                        setProjectForm((prev) => ({
                          ...prev,
                          link: e.target.value,
                        }))
                      }
                    />
                    <label className="flex items-center gap-2 text-sm text-slate">
                      <input
                        type="checkbox"
                        checked={projectForm.featured}
                        onChange={(e) =>
                          setProjectForm((prev) => ({
                            ...prev,
                            featured: e.target.checked,
                          }))
                        }
                      />
                      Featured on home page
                    </label>
                    <Button type="submit">
                      {projectForm.id ? "Update project" : "Add project"}
                    </Button>
                  </form>

                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div
                        key={project._id}
                        className="rounded-lg border border-fog bg-sand p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{project.name}</div>
                            <div className="text-xs text-slate">
                              {project.industry || "General"} • {project.link || "No link"}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setProjectForm({
                                  id: project._id,
                                  name: project.name,
                                  description: project.description,
                                  link: project.link,
                                  industry: project.industry || "",
                                  domain: project.domain || "",
                                  badgeLabel: project.badgeLabel || "",
                                  accent: project.accent || "blue",
                                  icon: project.icon || "Monitor",
                                  summary: project.summary || "",
                                  includes: (project.includes || []).join("\n"),
                                  outcome: project.outcome || "",
                                  idealFor: project.idealFor || "",
                                  stack: (project.stack || []).join(", "),
                                  featured: project.featured || false,
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                await apiFetch(`/api/admin/projects/${project._id}`, {
                                  method: "DELETE",
                                })
                                setProjects((prev) =>
                                  prev.filter((item) => item._id !== project._id)
                                )
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate">
                          {project.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {project.domain ? <Badge variant="outline">{project.domain}</Badge> : null}
                          {project.badgeLabel ? (
                            <Badge variant="outline">{project.badgeLabel}</Badge>
                          ) : null}
                          {project.accent ? <Badge variant="outline">{project.accent}</Badge> : null}
                        </div>
                        {project.summary && (
                          <p className="mt-2 text-sm text-ink/80">
                            {project.summary}
                          </p>
                        )}
                        {project.outcome && (
                          <p className="mt-2 text-sm text-ink">
                            Outcome: {project.outcome}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {active === "pages" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Page editor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {pageEditorSections.map((section) => (
                        <Button
                          key={section.id}
                          type="button"
                          variant={activePageEditor === section.id ? "default" : "outline"}
                          onClick={() => setActivePageEditor(section.id)}
                        >
                          {section.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {activePageEditor === "about" && (
                <Card>
                  <CardHeader>
                    <CardTitle>About page</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form
                      className="grid gap-3"
                      onSubmit={async (event) => {
                        event.preventDefault()
                        await saveAboutContent()
                      }}
                    >
                      <Input
                        placeholder="Hero title"
                        value={aboutForm.heroTitle}
                        onChange={(e) =>
                          setAboutForm((prev) => ({
                            ...prev,
                            heroTitle: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Hero subtitle"
                        value={aboutForm.heroSubtitle}
                        onChange={(e) =>
                          setAboutForm((prev) => ({
                            ...prev,
                            heroSubtitle: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Approach (one per line, format: Title | Description)"
                        value={aboutForm.approachText}
                        onChange={(e) =>
                          setAboutForm((prev) => ({
                            ...prev,
                            approachText: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Closing note"
                        value={aboutForm.closingNote}
                        onChange={(e) =>
                          setAboutForm((prev) => ({
                            ...prev,
                            closingNote: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Highlight section title"
                        value={aboutForm.highlightTitle}
                        onChange={(e) =>
                          setAboutForm((prev) => ({
                            ...prev,
                            highlightTitle: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Highlight section subtitle"
                        value={aboutForm.highlightSubtitle}
                        onChange={(e) =>
                          setAboutForm((prev) => ({
                            ...prev,
                            highlightSubtitle: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Highlight points (one per line)"
                        value={aboutForm.highlightPointsText}
                        onChange={(e) =>
                          setAboutForm((prev) => ({
                            ...prev,
                            highlightPointsText: e.target.value,
                          }))
                        }
                      />
                      <Button type="submit">Save about content</Button>
                    </form>
                  </CardContent>
                </Card>
                )}

                {activePageEditor === "about" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Team members</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form className="grid gap-3" onSubmit={handleTeamSubmit}>
                      <Input
                        placeholder="Name"
                        value={teamForm.name}
                        onChange={(e) =>
                          setTeamForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Role"
                        value={teamForm.role}
                        onChange={(e) =>
                          setTeamForm((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Image URL (optional)"
                        value={teamForm.imageUrl}
                        onChange={(e) =>
                          setTeamForm((prev) => ({
                            ...prev,
                            imageUrl: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="LinkedIn profile URL (optional)"
                        value={teamForm.linkedinUrl}
                        onChange={(e) =>
                          setTeamForm((prev) => ({
                            ...prev,
                            linkedinUrl: e.target.value,
                          }))
                        }
                      />
                      <div className="grid gap-2">
                        <label className="text-sm text-slate">
                          Upload team image (JPG/PNG/WEBP, max 2MB)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleTeamImageUpload(file)
                            }
                          }}
                        />
                        {teamForm.imageUrl && (
                          <div className="text-xs text-ink/70">
                            Uploaded: {teamForm.imageUrl}
                          </div>
                        )}
                      </div>
                      <Button type="submit">
                        {teamForm.id ? "Update team member" : "Add team member"}
                      </Button>
                    </form>

                    <div className="space-y-3">
                      {teamMembers.map((member) => (
                        <div
                          key={member._id}
                          className="rounded-lg border border-fog bg-sand p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="font-semibold">{member.name}</div>
                              <div className="text-xs text-slate">{member.role}</div>
                              {member.imageUrl && (
                                <div className="mt-1 text-xs text-ink/60">
                                  Image: {member.imageUrl}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setTeamForm({
                                    id: member._id,
                                    name: member.name,
                                    role: member.role,
                                    imageUrl: member.imageUrl || "",
                                    linkedinUrl: member.linkedinUrl || "",
                                  })
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTeamDelete(member._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                )}

                {activePageEditor === "contact" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact page</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form
                      className="grid gap-3"
                      onSubmit={async (event) => {
                        event.preventDefault()
                        await saveContactContent()
                      }}
                    >
                      <Input
                        placeholder="Hero title"
                        value={contactForm.heroTitle}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            heroTitle: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Hero subtitle"
                        value={contactForm.heroSubtitle}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            heroSubtitle: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Trust points (one per line)"
                        value={contactForm.trustPointsText}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            trustPointsText: e.target.value,
                          }))
                        }
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Form title"
                          value={contactForm.formTitle}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              formTitle: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Form status label"
                          value={contactForm.formStatusLabel}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              formStatusLabel: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Service field label"
                          value={contactForm.serviceFieldLabel}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              serviceFieldLabel: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Direct contact title"
                          value={contactForm.directTitle}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              directTitle: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Input
                        placeholder="Contact email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="WhatsApp URL"
                        value={contactForm.whatsappUrl}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            whatsappUrl: e.target.value,
                          }))
                        }
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="LinkedIn URL"
                          value={contactForm.linkedinUrl}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              linkedinUrl: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="LinkedIn label"
                          value={contactForm.linkedinLabel}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              linkedinLabel: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Input
                        placeholder="Next steps title"
                        value={contactForm.nextStepsTitle}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            nextStepsTitle: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Next steps (one per line)"
                        value={contactForm.nextStepsText}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            nextStepsText: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Requirements title"
                        value={contactForm.requirementsTitle}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            requirementsTitle: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Requirements (one per line)"
                        value={contactForm.requirementsText}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            requirementsText: e.target.value,
                          }))
                        }
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Attachment helper text"
                          value={contactForm.attachmentHint}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              attachmentHint: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Link field label"
                          value={contactForm.linkFieldLabel}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              linkFieldLabel: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button type="submit">Save contact content</Button>
                    </form>
                  </CardContent>
                </Card>
                )}

                {activePageEditor === "work" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Work page</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form
                      className="grid gap-3"
                      onSubmit={async (event) => {
                        event.preventDefault()
                        await saveWorkContent()
                      }}
                    >
                      <Input
                        placeholder="Hero title"
                        value={workForm.heroTitle}
                        onChange={(e) =>
                          setWorkForm((prev) => ({
                            ...prev,
                            heroTitle: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Hero subtitle"
                        value={workForm.heroSubtitle}
                        onChange={(e) =>
                          setWorkForm((prev) => ({
                            ...prev,
                            heroSubtitle: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="All projects filter label"
                        value={workForm.allProjectsLabel}
                        onChange={(e) =>
                          setWorkForm((prev) => ({
                            ...prev,
                            allProjectsLabel: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="CTA title"
                        value={workForm.ctaTitle}
                        onChange={(e) =>
                          setWorkForm((prev) => ({
                            ...prev,
                            ctaTitle: e.target.value,
                          }))
                        }
                      />
                      <Textarea
                        placeholder="CTA subtitle"
                        value={workForm.ctaSubtitle}
                        onChange={(e) =>
                          setWorkForm((prev) => ({
                            ...prev,
                            ctaSubtitle: e.target.value,
                          }))
                        }
                      />
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Primary CTA label"
                          value={workForm.primaryCtaLabel}
                          onChange={(e) =>
                            setWorkForm((prev) => ({
                              ...prev,
                              primaryCtaLabel: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Primary CTA URL"
                          value={workForm.primaryCtaUrl}
                          onChange={(e) =>
                            setWorkForm((prev) => ({
                              ...prev,
                              primaryCtaUrl: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Secondary CTA label"
                          value={workForm.secondaryCtaLabel}
                          onChange={(e) =>
                            setWorkForm((prev) => ({
                              ...prev,
                              secondaryCtaLabel: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Secondary CTA URL"
                          value={workForm.secondaryCtaUrl}
                          onChange={(e) =>
                            setWorkForm((prev) => ({
                              ...prev,
                              secondaryCtaUrl: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button type="submit">Save work content</Button>
                    </form>
                  </CardContent>
                </Card>
                )}

                {activePageEditor === "home" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Home content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form
                      className="grid gap-4"
                      onSubmit={async (event) => {
                        event.preventDefault()
                        await saveHomeContent()
                      }}
                    >
                      <div className="grid gap-4 rounded-xl border border-fog bg-[#f8fbff] p-4">
                        <div className="text-sm font-medium text-ink">Hero copy</div>
                        <Input
                          placeholder="Hero title"
                          value={homeForm.hero_title}
                          onChange={(e) =>
                            setHomeForm((prev) => ({
                              ...prev,
                              hero_title: e.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Hero subtitle"
                          value={homeForm.hero_subtitle}
                          onChange={(e) =>
                            setHomeForm((prev) => ({
                              ...prev,
                              hero_subtitle: e.target.value,
                            }))
                          }
                        />
                        <Textarea
                          placeholder="Hero description"
                          value={homeForm.hero_description}
                          onChange={(e) =>
                            setHomeForm((prev) => ({
                              ...prev,
                              hero_description: e.target.value,
                            }))
                          }
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            placeholder="Primary button text"
                            value={homeForm.hero_primary_button_text}
                            onChange={(e) =>
                              setHomeForm((prev) => ({
                                ...prev,
                                hero_primary_button_text: e.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Primary button link"
                            value={homeForm.hero_primary_button_link}
                            onChange={(e) =>
                              setHomeForm((prev) => ({
                                ...prev,
                                hero_primary_button_link: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            placeholder="Secondary button text"
                            value={homeForm.hero_secondary_button_text}
                            onChange={(e) =>
                              setHomeForm((prev) => ({
                                ...prev,
                                hero_secondary_button_text: e.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Secondary button link"
                            value={homeForm.hero_secondary_button_link}
                            onChange={(e) =>
                              setHomeForm((prev) => ({
                                ...prev,
                                hero_secondary_button_link: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <Input
                          placeholder="Brand accent color (#2F6BFF)"
                          value={homeForm.brand_accent_color}
                          onChange={(e) =>
                            setHomeForm((prev) => ({
                              ...prev,
                              brand_accent_color: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid gap-3 rounded-xl border border-fog bg-[#f8fbff] p-4">
                        <div className="text-sm font-medium text-ink">Trusted badges</div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {(homeForm.trusted_badges || []).map((badge, index) => (
                            <Input
                              key={`trusted-badge-${index}`}
                              placeholder={`Trusted badge ${index + 1}`}
                              value={badge || ""}
                              onChange={(e) =>
                                setHomeForm((prev) => {
                                  const next = [...(prev.trusted_badges || [])]
                                  next[index] = e.target.value
                                  return { ...prev, trusted_badges: next }
                                })
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 rounded-xl border border-fog bg-[#f8fbff] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-ink">Why choose items</div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setHomeForm((prev) => ({
                                ...prev,
                                why_choose_items: [
                                  ...(prev.why_choose_items || []),
                                  { icon: "ShieldCheck", title: "", description: "" },
                                ],
                              }))
                            }
                          >
                            + Add item
                          </Button>
                        </div>
                        <div className="grid gap-4">
                          {(homeForm.why_choose_items || []).map((item, index) => (
                            <div
                              key={`why-choose-${index}`}
                              className="rounded-xl border border-fog bg-white p-4"
                            >
                              <div className="grid gap-3">
                                <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                                  <select
                                    className="flex h-11 w-full rounded-[12px] border border-[#cbd5e1] bg-white px-4 py-2 text-[14px] text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2 ring-offset-sand"
                                    value={item.icon || "ShieldCheck"}
                                    onChange={(e) =>
                                      setHomeForm((prev) => {
                                        const next = [...(prev.why_choose_items || [])]
                                        next[index] = { ...next[index], icon: e.target.value }
                                        return { ...prev, why_choose_items: next }
                                      })
                                    }
                                  >
                                    {serviceIconOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                  <Input
                                    placeholder="Card title"
                                    value={item.title || ""}
                                    onChange={(e) =>
                                      setHomeForm((prev) => {
                                        const next = [...(prev.why_choose_items || [])]
                                        next[index] = { ...next[index], title: e.target.value }
                                        return { ...prev, why_choose_items: next }
                                      })
                                    }
                                  />
                                </div>
                                <Textarea
                                  placeholder="Card description"
                                  value={item.description || ""}
                                  onChange={(e) =>
                                    setHomeForm((prev) => {
                                      const next = [...(prev.why_choose_items || [])]
                                      next[index] = {
                                        ...next[index],
                                        description: e.target.value,
                                      }
                                      return { ...prev, why_choose_items: next }
                                    })
                                  }
                                />
                                <div className="flex justify-end">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                      setHomeForm((prev) => ({
                                        ...prev,
                                        why_choose_items: prev.why_choose_items.filter(
                                          (_, itemIndex) => itemIndex !== index
                                        ),
                                      }))
                                    }
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 rounded-xl border border-fog bg-[#f8fbff] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-ink">Stats</div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setHomeForm((prev) => ({
                                ...prev,
                                stats: [...(prev.stats || []), { value: "", label: "" }],
                              }))
                            }
                          >
                            + Add stat
                          </Button>
                        </div>
                        <div className="grid gap-4">
                          {(homeForm.stats || []).map((item, index) => (
                            <div
                              key={`stat-${index}`}
                              className="rounded-xl border border-fog bg-white p-4"
                            >
                              <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
                                <Input
                                  placeholder="Value"
                                  value={item.value || ""}
                                  onChange={(e) =>
                                    setHomeForm((prev) => {
                                      const next = [...(prev.stats || [])]
                                      next[index] = { ...next[index], value: e.target.value }
                                      return { ...prev, stats: next }
                                    })
                                  }
                                />
                                <Input
                                  placeholder="Label"
                                  value={item.label || ""}
                                  onChange={(e) =>
                                    setHomeForm((prev) => {
                                      const next = [...(prev.stats || [])]
                                      next[index] = { ...next[index], label: e.target.value }
                                      return { ...prev, stats: next }
                                    })
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() =>
                                    setHomeForm((prev) => ({
                                      ...prev,
                                      stats: prev.stats.filter((_, itemIndex) => itemIndex !== index),
                                    }))
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <Input
                          placeholder="Legacy trust strip label"
                          value={homeForm.trustLabel}
                          onChange={(e) =>
                            setHomeForm((prev) => ({
                              ...prev,
                              trustLabel: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid gap-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-ink">Testimonials</div>
                          <label className="flex items-center gap-2 text-sm text-slate">
                            <input
                              type="checkbox"
                              checked={homeForm.showTestimonials}
                              onChange={(e) =>
                                setHomeForm((prev) => ({
                                  ...prev,
                                  showTestimonials: e.target.checked,
                                }))
                              }
                            />
                            Show section
                          </label>
                        </div>
                        <div className="grid gap-4">
                          {(homeForm.testimonials || []).map((testimonial, index) => (
                            <div
                              key={`testimonial-${index}`}
                              className="rounded-xl border border-fog bg-white p-4"
                            >
                              <div className="grid gap-3">
                                <Textarea
                                  placeholder="Client quote"
                                  value={testimonial.quote || ""}
                                  onChange={(e) =>
                                    setHomeForm((prev) => {
                                      const next = [...(prev.testimonials || [])]
                                      if (!next[index]) {
                                        next[index] = { quote: "", name: "", role: "" }
                                      }
                                      next[index] = {
                                        ...next[index],
                                        quote: e.target.value,
                                      }
                                      return { ...prev, testimonials: next }
                                    })
                                  }
                                />
                                <div className="grid gap-3 md:grid-cols-2">
                                  <Input
                                    placeholder="Client name"
                                    value={testimonial.name || ""}
                                    onChange={(e) =>
                                      setHomeForm((prev) => {
                                        const next = [...(prev.testimonials || [])]
                                        if (!next[index]) {
                                          next[index] = { quote: "", name: "", role: "" }
                                        }
                                        next[index] = {
                                          ...next[index],
                                          name: e.target.value,
                                        }
                                        return { ...prev, testimonials: next }
                                      })
                                    }
                                  />
                                  <Input
                                    placeholder="Client role or company"
                                    value={testimonial.role || ""}
                                    onChange={(e) =>
                                      setHomeForm((prev) => {
                                        const next = [...(prev.testimonials || [])]
                                        if (!next[index]) {
                                          next[index] = { quote: "", name: "", role: "" }
                                        }
                                        next[index] = {
                                          ...next[index],
                                          role: e.target.value,
                                        }
                                        return { ...prev, testimonials: next }
                                      })
                                    }
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                      setHomeForm((prev) => ({
                                        ...prev,
                                        testimonials: prev.testimonials.filter(
                                          (_, itemIndex) => itemIndex !== index
                                        ),
                                      }))
                                    }
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setHomeForm((prev) => ({
                              ...prev,
                              testimonials: [...(prev.testimonials || []), { ...emptyHomeTestimonial }],
                            }))
                          }
                        >
                          + Add testimonial
                        </Button>
                      </div>

                      <Button type="submit">Save home content</Button>
                    </form>
                  </CardContent>
                </Card>
                )}
              </div>
            )}
          </section>
        </div>
      </Container>

      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative h-[360px] w-full overflow-hidden rounded-xl bg-slate-900">
              {cropImageSrc && (
                <Cropper
                  image={cropImageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={cropAspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(area, pixels) => setCroppedPixels(pixels)}
                />
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCropOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCropSave}>Save crop</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
