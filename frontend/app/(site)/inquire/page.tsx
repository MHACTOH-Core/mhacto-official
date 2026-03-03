"use client"

import Link from "next/link"
import { asset } from "@/lib/utils"
import { ArrowLeft, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { PageHero } from "@/components/sections/page-hero"
import { useState, type FormEvent, type ChangeEvent } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCreateInquiry } from "@/lib/api"

// ─── Validation helpers ──────────────────────────────────────────────

/** Today's date in YYYY-MM-DD format (for min attribute on date inputs) */
function getTodayISO(): string {
  return new Date().toISOString().split("T")[0]
}

/**
 * Validates a Philippine mobile number.
 * Must start with +63 followed by 10 digits.
 * Accepted formats: +639XXXXXXXXX, +639XX-XXX-XXXX
 * Returns true if valid (or empty — field is optional).
 */
function isValidPHPhoneNumber(phone: string): boolean {
  if (!phone) return true // optional field
  const digitsOnly = phone.replace(/[\s\-()+ ]/g, "")
  // Must be 639XXXXXXXXX (12 digits starting with 639)
  return /^639\d{9}$/.test(digitsOnly)
}

/**
 * Validates that a name contains only letters and spaces.
 * Max 18 characters. No numbers, special characters, hyphens, or periods.
 */
function isValidName(name: string): boolean {
  if (!name.trim()) return false
  if (name.trim().length > 18) return false
  return /^[A-Za-zÀ-ÿñÑ\s]+$/.test(name.trim())
}

/**
 * Validates email — must be from a real email provider.
 */
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

export default function InquirePage() {
  const [purpose, setPurpose] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Per-field validation warnings
  const [nameWarning, setNameWarning] = useState<string | null>(null)
  const [emailWarning, setEmailWarning] = useState<string | null>(null)
  const [phoneWarning, setPhoneWarning] = useState<string | null>(null)
  const [dateWarning, setDateWarning] = useState<string | null>(null)

  /** Validate name on change — letters/spaces only, max 18 chars */
  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value && value.length > 18) {
      setNameWarning("Name must be 18 characters or less.")
    } else if (value && !isValidName(value)) {
      setNameWarning("Name must contain only letters and spaces (no numbers or special characters).")
    } else {
      setNameWarning(null)
    }
  }

  /** Validate email provider on change */
  function handleEmailChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value && value.includes("@") && !isValidEmail(value)) {
      setEmailWarning("Please use a valid email (Gmail, Outlook, Yahoo, etc.).")
    } else {
      setEmailWarning(null)
    }
  }

  /** Validate PH phone number format on change — must start with +63 */
  function handlePhoneChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value && !isValidPHPhoneNumber(value)) {
      setPhoneWarning("Please enter a valid PH number starting with +63 (e.g. +639XXXXXXXXX).")
    } else {
      setPhoneWarning(null)
    }
  }

  /** Ensure the end date is not before the start date */
  function handleDateFromChange(e: ChangeEvent<HTMLInputElement>) {
    const startDate = e.target.value
    const endDateInput = document.getElementById("date-to") as HTMLInputElement | null
    if (endDateInput && endDateInput.value && startDate > endDateInput.value) {
      setDateWarning("The end date cannot be before the start date.")
    } else {
      setDateWarning(null)
    }
  }

  function handleDateToChange(e: ChangeEvent<HTMLInputElement>) {
    const endDate = e.target.value
    const startDateInput = document.getElementById("date-from") as HTMLInputElement | null
    if (startDateInput && startDateInput.value && endDate < startDateInput.value) {
      setDateWarning("The end date cannot be before the start date.")
    } else {
      setDateWarning(null)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(form)
    const name = (formData.get("name") as string).trim()
    const contactNumber = (formData.get("contact") as string) || ""
    const dateFrom = formData.get("date-from") as string
    const dateTo = formData.get("date-to") as string

    // Client-side validation
    if (!isValidName(name)) {
      setError(name.length > 18 ? "Name must be 18 characters or less." : "Please enter a valid name (letters and spaces only, no special characters).")
      setSubmitting(false)
      return
    }

    const email = (formData.get("email") as string).trim()
    if (!isValidEmail(email)) {
      setError("Please use a valid email address (Gmail, Outlook, Yahoo, etc.).")
      setSubmitting(false)
      return
    }

    if (contactNumber && !isValidPHPhoneNumber(contactNumber)) {
      setError("Please enter a valid Philippine number starting with +63 (e.g. +639XXXXXXXXX).")
      setSubmitting(false)
      return
    }

    const paxValue = formData.get("pax") ? Number(formData.get("pax")) : 0
    if (paxValue > 20) {
      setError("Number of people cannot exceed 20.")
      setSubmitting(false)
      return
    }

    if (dateFrom && dateTo && dateTo < dateFrom) {
      setError("The end date cannot be before the start date.")
      setSubmitting(false)
      return
    }

    // Send only the start date as dateOfVisit (DB column is DATE).
    // If the user picked an end date, store it in additionalDetails.
    const dateOfVisit = dateFrom || undefined
    const additionalDetails: Record<string, unknown> = {}
    if (dateTo && dateTo !== dateFrom) {
      additionalDetails.dateToVisit = dateTo
    }
    if (purpose) {
      additionalDetails.purposeOfVisit = purpose
    }

    // Map purpose → inquiryType so the admin panel type labels work
    const purposeToType: Record<string, string> = {
      leisure: "tour_booking",
      pilgrimage: "tour_booking",
      event: "general_contact",
      official: "partnership",
    }

    try {
      await apiCreateInquiry({
        name,
        email,
        contactNumber: contactNumber || undefined,
        inquiryType: purposeToType[purpose] || "general_contact",
        dateOfVisit,
        numberOfPax: paxValue || undefined,
        message: (formData.get("message") as string) || "",
        additionalDetails: Object.keys(additionalDetails).length > 0 ? additionalDetails : undefined,
      })
      setSuccess(true)
      setNameWarning(null)
      setEmailWarning(null)
      setPhoneWarning(null)
      setDateWarning(null)
      form.reset()
      setPurpose("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit inquiry. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">

      {/* Hero */}
      <PageHero
        pageSlug="inquire"
        fallbackImage="/images/places/river-festival.jpg"
        fallbackAccentColor="cyan-300"
        fallbackLabel="Tourism"
        fallbackTitle="Tourist Inquiry & Registration"
        fallbackDescription="Fill out the form below and we will get back to you with all the information you need for a smooth and enjoyable visit."
        showBackButton
        alignBottom

      />

      {/* Inquiry Form */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 lg:gap-12 grid-cols-1 lg:grid-cols-2 items-start">
            {/* Left side - Plan Your Visit Content */}
            <div className="space-y-6 animate-fade-in-left">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Plan Your Visit
                </span>
                <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
                  Ready to Explore Bocaue?
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Bocaue welcomes all visitors with open arms. Whether you're coming for leisure, pilgrimage, or business, we're here to make your visit memorable and hassle-free.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  What to Expect
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Warm hospitality from our local community</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Rich cultural experiences and heritage sites</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Delicious traditional cuisine and local delicacies</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">✓</span>
                    <span>Professional assistance from MHACTO staff</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="animate-fade-in-right delay-100">
            <Card className="border-border shadow-lg sticky top-32">
              <CardHeader className="bg-primary/5">
                <CardTitle>Inquiry Form</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6">
                    {/* Full Name — letters/spaces only, max 18 chars */}
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
                        pattern="^[A-Za-z\u00C0-\u00FF\u00F1\u00D1\s]+$"
                        title="Letters and spaces only, max 18 characters"
                      />
                      {nameWarning && (
                        <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {nameWarning}
                        </p>
                      )}
                    </div>

                    {/* Email */}
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

                    {/* Contact Number — PH format validation */}
                    <div className="space-y-2">
                      <Label htmlFor="contact" className="text-card-foreground">
                        Contact Number
                      </Label>
                      <Input
                        id="contact"
                        name="contact"
                        type="tel"
                        placeholder="+639XXXXXXXXX"
                        onChange={handlePhoneChange}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Must start with +63 (e.g. +639XXXXXXXXX)
                      </p>
                      {phoneWarning && (
                        <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {phoneWarning}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date range — from / to */}
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-card-foreground">
                        Date of Visit
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="date-from" className="text-[11px] text-muted-foreground">
                            From
                          </Label>
                          <Input
                            id="date-from"
                            name="date-from"
                            type="date"
                            min={getTodayISO()}
                            required
                            onChange={handleDateFromChange}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="date-to" className="text-[11px] text-muted-foreground">
                            To
                          </Label>
                          <Input
                            id="date-to"
                            name="date-to"
                            type="date"
                            min={getTodayISO()}
                            required
                            onChange={handleDateToChange}
                          />
                        </div>
                      </div>
                      {dateWarning && (
                        <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {dateWarning}
                        </p>
                      )}
                    </div>

                    {/* Number of People (was "Number of Pax") */}
                    <div className="space-y-2">
                      <Label htmlFor="pax" className="text-card-foreground">
                        Number of People
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
                        Maximum of 20 people per inquiry
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
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
