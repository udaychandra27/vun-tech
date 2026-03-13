import { useMemo, useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { apiFetch } from "@/lib/api"

const defaultFaq = [
  {
    q: "What services do you offer?",
    a: "Websites, MERN projects, UI/UX design, content writing, and academic support. See Services for the full list.",
  },
  {
    q: "How do we start?",
    a: "Share your goal and timeline on the Contact page. We respond with next steps in 1-2 business days.",
  },
  {
    q: "Do you work with students?",
    a: "Yes. We help with mini projects, final-year projects, resumes, and presentation support.",
  },
  {
    q: "What is the pricing?",
    a: "Pricing depends on scope. We confirm a clear quote after a short brief or call.",
  },
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [lead, setLead] = useState({ name: "", email: "" })
  const [userInput, setUserInput] = useState("")
  const [leadSaved, setLeadSaved] = useState(false)
  const [leadError, setLeadError] = useState("")

  const suggested = useMemo(() => defaultFaq, [])

  const keywordAnswers = [
    { keys: ["pricing", "price", "cost", "budget"], a: defaultFaq[3].a },
    { keys: ["services", "offer", "service"], a: defaultFaq[0].a },
    { keys: ["start", "begin", "contact", "reach"], a: defaultFaq[1].a },
    { keys: ["student", "college", "final year", "project"], a: defaultFaq[2].a },
  ]

  const handleSelect = (item) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: item.q },
      { role: "bot", text: item.a },
    ])
  }

  const handleLeadSubmit = async (event) => {
    event.preventDefault()
    if (!lead.name.trim()) {
      setLeadError("Please enter your name.")
      return
    }
    if (!lead.email.trim()) {
      setLeadError("Please enter your email.")
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(lead.email)) {
      setLeadError("Please enter a valid email.")
      return
    }
    setLeadError("")
    try {
      await apiFetch("/api/chat/leads", {
        method: "POST",
        body: JSON.stringify({ name: lead.name, email: lead.email }),
      })
      setLeadSaved(true)
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `Thanks ${lead.name}! How can we help you?` },
      ])
    } catch (error) {
      setLeadError(error.message || "Unable to save your details.")
    }
  }

  const handleAsk = (event) => {
    event.preventDefault()
    const text = userInput.trim()
    if (!text) return
    const lower = text.toLowerCase()
    const match = keywordAnswers.find((item) =>
      item.keys.some((key) => lower.includes(key))
    )
    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      {
        role: "bot",
        text: match
          ? match.a
          : "Thanks! We will reach out to you shortly.",
      },
    ])
    setUserInput("")
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-fog bg-white shadow-xl sm:w-80">
          <div className="flex items-center justify-between border-b border-fog p-3">
            <div className="text-sm font-semibold">Quick Help</div>
            <button
              type="button"
              className="rounded-full p-1 hover:bg-fog"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-64 space-y-2 overflow-auto p-3 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`break-words rounded-lg px-3 py-2 ${
                  msg.role === "bot"
                    ? "bg-fog text-ink"
                    : "bg-moss text-white ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="border-t border-fog p-3 space-y-3">
            {!leadSaved ? (
              <form onSubmit={handleLeadSubmit} className="space-y-2">
                <input
                  className="h-9 w-full rounded-md border border-fog px-3 text-sm"
                  placeholder="Your name"
                  value={lead.name}
                  onChange={(e) =>
                    setLead((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <input
                  className="h-9 w-full rounded-md border border-fog px-3 text-sm"
                  placeholder="Email address"
                  value={lead.email}
                  onChange={(e) =>
                    setLead((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                {leadError && (
                  <div className="text-xs text-red-600">{leadError}</div>
                )}
                <button
                  type="submit"
                  className="w-full rounded-md bg-ink px-3 py-2 text-xs font-medium text-white"
                >
                  Start chat
                </button>
              </form>
            ) : (
              <form onSubmit={handleAsk} className="space-y-2">
                <input
                  className="h-9 w-full rounded-md border border-fog px-3 text-sm"
                  placeholder="Type your question..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-ink px-3 py-2 text-xs font-medium text-white"
                >
                  Send
                </button>
              </form>
            )}
            {leadSaved && (
              <>
                <div className="text-xs text-slate">Suggested questions</div>
                <div className="flex flex-wrap gap-2">
                  {suggested.map((item) => (
                    <button
                      key={item.q}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="rounded-full border border-fog px-3 py-1 text-xs text-slate hover:border-moss hover:text-moss"
                    >
                      {item.q}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
