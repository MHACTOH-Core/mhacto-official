"use client"

import { useState, type FormEvent, type ChangeEvent } from "react"
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiCreateInquiry } from "@/lib/api"

function isValidName(name: string): boolean {
  if (!name.trim()) return false
  if (name.trim().length > 18) return false
  return /^[A-Za-z\u00C0-\u00FF\u00F1\u00D1\s]+$/.test(name.trim())
}

function isValidEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return false
  const domain = email.split("@")[1]?.toLowerCase()
  const allowedDomains = [
    "gmail.com", "yahoo.com", "yahoo.com.ph", "outlook.com", "hotmail.com",
    "live.com", "icloud.com", "me.com", "aol.com", "protonmail.com",
    "proton.me", "zoho.com", "mail.com", "ymail.com", "msn.com",
    "rocketmail.com", "gmx.com", "fastmail.com",
  ]
  return allowedDomains.includes(domain)
}

export function InquirySection() {
  const [purpose, setPurpose] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameWarning, setNameWarning] = useState<string | null>(null)
  const [emailWarning, setEmailWarning] = useState<string | null>(null)

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value && value.length > 18) {
      setNameWarning("Name must be 18 characters or less.")
    } else if (value && !isValidName(value)) {
      setNameWarning("Letters and spaces only, no special characters.")
    } else {
      setNameWarning(null)
    }
  }

  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value && value.includes("@") && !isValidEmail(value)) {
      setEmailWarning("Please use a valid email (Gmail, Outlook, Yahoo, etc.).")
    } else {
      setEmailWarning(null)
    }
  }

  const purposeToType: Record<string, string> = {
    leisure: "tour_booking",
    pilgrimage: "tour_booking",
    event: "general_contact",
    official: "partnership",
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(form)
    const name = (formData.get("name") as string).trim()
    const email = (formData.get("email") as string).trim()
    const paxValue = formData.get("pax") ? Number(formData.get("pax")) : 0

    if (!isValidName(name)) {
      setError(name.length > 18 ? "Name must be 18 characters or less." : "Please enter a valid name (letters and spaces only).")
      setSubmitting(false)
      return
    }
    if (!isValidEmail(email)) {
      setError("Please use a valid email address (Gmail, Outlook, Yahoo, etc.).")
      setSubmitting(false)
      return
    }
    if (paxValue > 20) {
      setError("Number of people cannot exceed 20.")
      setSubmitting(false)
      return
    }

    try {
      await apiCreateInquiry({
        name,
        email,
        inquiryType: purposeToType[purpose] || "general_contact",
        dateOfVisit: (formData.get("date") as string) || undefined,
        numberOfPax: paxValue || undefined,
        message: (formData.get("message") as string) || "",
        additionalDetails: purpose ? { purposeOfVisit: purpose } : undefined,
      })
      setSuccess(true)
      form.reset()
      setPurpose("")
      setNameWarning(null)
      setEmailWarning(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit inquiry. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="inquiry" className="relative z-20 bg-primary/5 pt-32 pb-20 lg:pt-36 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center reveal-on-scroll">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Get in Touch
          </span>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground md:text-4xl font-heading">
            Tourist Inquiry &amp; Registration
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground">
            Fill out the form below and we will get back to you with all the
            information you need for a smooth and enjoyable visit.
          </p>
        </div>

        <div className="mx-auto max-w-2xl reveal-on-scroll delay-100">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-card-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Juan Dela Cruz"
                  required
                  maxLength={18}
                  onChange={handleNameChange}
                />
                {nameWarning && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {nameWarning}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@gmail.com"
                  required
                  onChange={handleEmailChange}
                />
                <p className="text-[11px] text-muted-foreground">
                  Gmail, Outlook, Yahoo, iCloud, etc.
                </p>
                {emailWarning && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {emailWarning}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-card-foreground">
                  Date of Visit
                </Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pax" className="text-card-foreground">
                  Number of Pax
                </Label>
                <Input
                  id="pax"
                  name="pax"
                  type="number"
                  min={1}
                  max={20}
                  placeholder="1"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Maximum of 20 people
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-card-foreground">Purpose of Visit</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leisure">Leisure</SelectItem>
                  <SelectItem value="pilgrimage">Pilgrimage</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="official">Official Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-card-foreground">
                Message / Special Requests
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Let us know if you have any special requests or questions..."
                rows={4}
              />
            </div>

            <Button type="submit" size="lg" className="w-full rounded-full gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Inquiry
                </>
              )}
            </Button>

            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>Your inquiry has been submitted successfully! We&apos;ll get back to you soon.</span>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
