import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Container } from "@/components/layout/Container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { apiFetch, setAuthToken, API_URL } from "@/lib/api"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const tabs = [
  "contacts",
  "chat leads",
  "orders",
  "trending",
  "services",
  "categories",
  "work",
  "pages",
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const [active, setActive] = useState("contacts")
  const [contacts, setContacts] = useState([])
  const [chatLeads, setChatLeads] = useState([])
  const [orders, setOrders] = useState([])
  const [trending, setTrending] = useState([])
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [serviceForm, setServiceForm] = useState({
    id: null,
    title: "",
    description: "",
    includes: "",
    idealFor: "",
    visible: true,
    featured: false,
    categoryId: "",
  })

  const [projectForm, setProjectForm] = useState({
    id: null,
    name: "",
    description: "",
    link: "",
    industry: "",
    outcome: "",
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
    email: "",
    whatsappUrl: "",
    locationText: "",
    nextStepsText: "",
    requirementsText: "",
  })

  const [homeForm, setHomeForm] = useState({
    heroCards: [
      { imageUrl: "", caption: "" },
      { imageUrl: "", caption: "" },
    ],
  })

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

  const [categoryForm, setCategoryForm] = useState({
    id: null,
    title: "",
    items: "",
  })

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
        categoriesData,
        projectsData,
        contentData,
      ] =
        await Promise.all([
          apiFetch("/api/admin/contacts"),
          apiFetch("/api/admin/chat-leads"),
          apiFetch("/api/admin/orders"),
          apiFetch("/api/admin/trending"),
          apiFetch("/api/admin/services"),
          apiFetch("/api/admin/categories"),
          apiFetch("/api/admin/projects"),
          apiFetch("/api/admin/content"),
        ])
      setContacts(contactsData)
      setChatLeads(chatLeadsData)
      setOrders(ordersData)
      setTrending(trendingData)
      setServices(servicesData)
      setCategories(categoriesData)
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
          email: contentData.contact.email || "",
          whatsappUrl: contentData.contact.whatsappUrl || "",
          locationText: contentData.contact.locationText || "",
          nextStepsText: (contentData.contact.nextSteps || []).join("\n"),
          requirementsText: (contentData.contact.requirements || []).join("\n"),
        })
      }
      if (contentData?.home) {
        const heroCards = Array.isArray(contentData.home.heroCards)
          ? contentData.home.heroCards
          : []
        setHomeForm({
          heroCards:
            heroCards.length > 0
              ? heroCards
              : [
                  { imageUrl: "", caption: "" },
                  { imageUrl: "", caption: "" },
                ],
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
      visible: serviceForm.visible,
      featured: serviceForm.featured,
      categoryId: serviceForm.categoryId,
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
      visible: true,
      featured: false,
      categoryId: "",
    })
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()
    const payload = {
      title: categoryForm.title,
      items: categoryForm.items
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    }

    if (categoryForm.id) {
      const updated = await apiFetch(`/api/admin/categories/${categoryForm.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      setCategories((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      )
    } else {
      const created = await apiFetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      setCategories((prev) => [created, ...prev])
    }

    setCategoryForm({ id: null, title: "", items: "" })
  }

  const handleProjectSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      name: projectForm.name,
      description: projectForm.description,
      link: projectForm.link,
      industry: projectForm.industry,
      outcome: projectForm.outcome,
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
      outcome: "",
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
      email: contactForm.email,
      whatsappUrl: contactForm.whatsappUrl,
      locationText: contactForm.locationText,
      nextSteps: parseList(contactForm.nextStepsText),
      requirements: parseList(contactForm.requirementsText),
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
          email: updated.contact.email || "",
          whatsappUrl: updated.contact.whatsappUrl || "",
          locationText: updated.contact.locationText || "",
          nextStepsText: (updated.contact.nextSteps || []).join("\n"),
          requirementsText: (updated.contact.requirements || []).join("\n"),
        })
      }
      setError("")
    } catch (err) {
      setError(err.message || "Failed to save contact content.")
    }
  }

  const saveHomeContent = async () => {
    const payload = {
      heroCards: homeForm.heroCards,
    }
    try {
      const updated = await apiFetch("/api/admin/content/home", {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      if (updated?.home) {
        setHomeForm({
          heroCards: updated.home.heroCards || [],
        })
      }
      setError("")
    } catch (err) {
      setError(err.message || "Failed to save home content.")
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
      categories: categories.length,
      projects: projects.length,
    }),
    [contacts, chatLeads, orders, trending, services, categories, projects]
  )

  return (
    <div className="min-h-screen bg-sand">
      <Container className="py-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Admin dashboard</h1>
            <p className="text-sm text-slate">Manage inquiries and content.</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Log out
          </Button>
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
                {tab === "categories" && stats.categories > 0 && (
                  <Badge variant="outline">{stats.categories}</Badge>
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
                    <select
                      className="h-10 w-full rounded-md border border-fog bg-white px-3 text-sm"
                      value={serviceForm.categoryId}
                      onChange={(e) =>
                        setServiceForm((prev) => ({
                          ...prev,
                          categoryId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Category (optional)</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
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
                                  visible: service.visible,
                                  featured: service.featured,
                                  categoryId: service.categoryId?._id || "",
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
                        {service.categoryId?.title && (
                          <p className="mt-2 text-xs text-ink/60">
                            Category: {service.categoryId.title}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {active === "categories" && (
              <Card>
                <CardHeader>
                  <CardTitle>Service categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form className="grid gap-3" onSubmit={handleCategorySubmit}>
                    <Input
                      placeholder="Category title"
                      value={categoryForm.title}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                    <Textarea
                      placeholder="Items (one per line)"
                      value={categoryForm.items}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          items: e.target.value,
                        }))
                      }
                    />
                    <Button type="submit">
                      {categoryForm.id ? "Update category" : "Add category"}
                    </Button>
                  </form>

                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="rounded-lg border border-fog bg-sand p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{category.title}</div>
                            <div className="text-xs text-slate">
                              {category.items?.length || 0} items
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setCategoryForm({
                                  id: category._id,
                                  title: category.title,
                                  items: (category.items || []).join("\n"),
                                })
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                await apiFetch(`/api/admin/categories/${category._id}`, {
                                  method: "DELETE",
                                })
                                setCategories((prev) =>
                                  prev.filter((item) => item._id !== category._id)
                                )
                              }}
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
                                  outcome: project.outcome || "",
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
                      <Input
                        placeholder="Location line"
                        value={contactForm.locationText}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            locationText: e.target.value,
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
                      <Button type="submit">Save contact content</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Home hero images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form
                      className="grid gap-4"
                      onSubmit={async (event) => {
                        event.preventDefault()
                        await saveHomeContent()
                      }}
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[0, 1].map((index) => {
                          const card = homeForm.heroCards?.[index] || {
                            imageUrl: "",
                            caption: "",
                          }
                          return (
                            <div
                              key={`home-hero-${index}`}
                              className="rounded-xl border border-fog bg-white p-3"
                            >
                              <div className="mb-3 aspect-[16/9] w-full overflow-hidden rounded-lg bg-sand">
                                {card.imageUrl ? (
                                  <img
                                    src={resolveImageUrl(card.imageUrl)}
                                    alt={`Hero ${index + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-ink/40">
                                    No image
                                  </div>
                                )}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    openCropper(file, { section: "home", index }, 16 / 9)
                                  }
                                }}
                              />
                              <Input
                                className="mt-3"
                                placeholder="Caption"
                                value={card.caption || ""}
                                onChange={(e) =>
                                  setHomeForm((prev) => {
                                    const next = [...(prev.heroCards || [])]
                                    if (!next[index]) {
                                      next[index] = { imageUrl: "", caption: "" }
                                    }
                                    next[index] = {
                                      ...next[index],
                                      caption: e.target.value,
                                    }
                                    return { ...prev, heroCards: next }
                                  })
                                }
                              />
                            </div>
                          )
                        })}
                      </div>
                      <Button type="submit">Save home images</Button>
                    </form>
                  </CardContent>
                </Card>
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
