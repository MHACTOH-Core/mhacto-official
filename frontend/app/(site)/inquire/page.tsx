"use client"

import { Send, Loader2, CheckCircle, AlertCircle, GraduationCap, MapPin, Compass, Utensils, Landmark, Users } from "lucide-react"
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
  // "tourist" | "student" — controls whether the school name field is shown
  const [visitorType, setVisitorType] = useState<"tourist" | "student">("tourist")
  const [schoolName, setSchoolName] = useState("")
  const [messageLength, setMessageLength] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Per-field validation warnings
  const [nameWarning, setNameWarning] = useState<string | null>(null)
  const [emailWarning, setEmailWarning] = useState<string | null>(null)
  const [phoneWarning, setPhoneWarning] = useState<string | null>(null)
  const [dateWarning, setDateWarning] = useState<string | null>(null)
  const [schoolWarning, setSchoolWarning] = useState<string | null>(null)

  /** Validate name on change — letters/spaces only, max 18 chars */
  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value && value.length > 100) {
      setNameWarning("Name must be 100 characters or less.")
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

    // Validate school name when student is selected
    if (visitorType === "student" && !schoolName.trim()) {
      setError("Please enter your school name.")
      setSchoolWarning("School name is required for student visitors.")
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
    // Always store visitor type so admin can see Tourist vs Student
    additionalDetails.visitorType = visitorType
    if (visitorType === "student" && schoolName.trim()) {
      additionalDetails.schoolName = schoolName.trim()
    }

    // Map purpose → inquiryType; students on educational trips map to tour_booking
    const purposeToType: Record<string, string> = {
      student: "tour_booking",
      tourist: "tour_booking",
      leisure: "tour_booking",
      pilgrimage: "tour_booking",
      event: "general_contact",
      official: "partnership",
      educational: "tour_booking",
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
      setSchoolWarning(null)
      form.reset()
      setPurpose("")
      setVisitorType("tourist")
      setSchoolName("")
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

      {/* Main content */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        {/* Subtle background texture */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-cyan-50/40 dark:to-cyan-950/10" />
        <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-100/40 blur-3xl dark:bg-cyan-900/10" />

        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16 items-start">

            {/* ── Left panel ──────────────────────────────── */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary ring-1 ring-primary/20">
                  <Compass className="h-3 w-3" />
                  Plan Your Visit
                </span>
                <h2 className="mt-4 text-3xl font-black text-foreground md:text-4xl leading-tight">
                  Ready to Explore<br />
                  <span className="text-primary">Bocaue?</span>
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Bocaue welcomes all visitors with open arms. Whether you're coming for leisure, pilgrimage, or business, we're here to make your visit memorable and hassle-free.
                </p>
              </div>

              {/* What to expect cards */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What to Expect</p>
                {[
                  { icon: Users,    text: "Warm hospitality from our local community" },
                  { icon: Landmark, text: "Rich cultural experiences and heritage sites" },
                  { icon: Utensils, text: "Delicious traditional cuisine and local delicacies" },
                  { icon: Compass,  text: "Professional assistance from MHACTO staff" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 backdrop-blur-sm">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug pt-1">{text}</p>
                  </div>
                ))}
              </div>

              {/* Response time note */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold text-primary mb-1">Response Time</p>
                <p className="text-sm text-muted-foreground">
                  We typically respond within <strong className="text-foreground">1–2 business days</strong> after receiving your inquiry.
                </p>
              </div>
            </div>

            {/* ── Right panel — Form ───────────────────────── */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-border bg-card shadow-xl shadow-black/5 overflow-hidden">

                {/* Form header */}
                <div className="bg-gradient-to-r from-primary to-cyan-500 px-8 py-6">
                  <h3 className="text-xl font-black text-white">Inquiry Form</h3>
                  <p className="mt-1 text-sm text-white/80">Fill in the details below to get started</p>
                </div>

                <div className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-7">

                    {/* ── Step 1: Personal Info ── */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-foreground">1</span>
                        <span className="text-sm font-bold text-foreground uppercase tracking-wide">Personal Information</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Full Name */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                            Full Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Juan Dela Cruz"
                            required
                            maxLength={100}
                            onChange={handleNameChange}
                            pattern="^[A-Za-z\u00C0-\u00FF\u00F1\u00D1\s]+$"
                            title="Letters and spaces only, max 100 characters"
                            className="rounded-xl"
                          />
                          {nameWarning && (
                            <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{nameWarning}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                            Email Address <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@gmail.com"
                            required
                            onChange={handleEmailChange}
                            className="rounded-xl"
                          />
                          <p className="text-[11px] text-muted-foreground">Gmail, Outlook, Yahoo, iCloud, etc.</p>
                          {emailWarning && (
                            <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{emailWarning}
                            </p>
                          )}
                        </div>

                        {/* Contact Number */}
                        <div className="space-y-1.5">
                          <Label htmlFor="contact" className="text-sm font-semibold text-foreground">
                            Contact Number
                          </Label>
                          <Input
                            id="contact"
                            name="contact"
                            type="tel"
                            placeholder="+639XXXXXXXXX"
                            onChange={handlePhoneChange}
                            className="rounded-xl"
                          />
                          <p className="text-[11px] text-muted-foreground">Must start with +63</p>
                          {phoneWarning && (
                            <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{phoneWarning}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Step 2: Visit Details ── */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-foreground">2</span>
                        <span className="text-sm font-bold text-foreground uppercase tracking-wide">Visit Details</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Date of Visit */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-sm font-semibold text-foreground">
                            Date of Visit <span className="text-destructive">*</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="date-from" className="text-[11px] text-muted-foreground">From</Label>
                              <Input
                                id="date-from"
                                name="date-from"
                                type="date"
                                min={getTodayISO()}
                                required
                                onChange={handleDateFromChange}
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="date-to" className="text-[11px] text-muted-foreground">To</Label>
                              <Input
                                id="date-to"
                                name="date-to"
                                type="date"
                                min={getTodayISO()}
                                required
                                onChange={handleDateToChange}
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                          {dateWarning && (
                            <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{dateWarning}
                            </p>
                          )}
                        </div>

                        {/* Number of People */}
                        <div className="space-y-1.5">
                          <Label htmlFor="pax" className="text-sm font-semibold text-foreground">
                            Number of People <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="pax"
                            name="pax"
                            type="number"
                            min={1}
                            max={20}
                            placeholder="1"
                            required
                            className="rounded-xl"
                          />
                          <p className="text-[11px] text-muted-foreground">Maximum of 20 people per inquiry</p>
                        </div>

                        {/* Inquiry Category */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-semibold text-foreground">
                            Inquiry Category <span className="text-destructive">*</span>
                          </Label>
                          <Select value={purpose} onValueChange={setPurpose} required>
                            <SelectTrigger className="w-full rounded-xl">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="tourist">Tourist</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* ── Step 3: Visitor Type ── */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-foreground">3</span>
                        <span className="text-sm font-bold text-foreground uppercase tracking-wide">Visitor Type</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => { setVisitorType("tourist"); setSchoolName(""); setSchoolWarning(null) }}
                          className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all duration-200 ${
                            visitorType === "tourist"
                              ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10"
                              : "border-border hover:border-muted-foreground/40 text-muted-foreground"
                          }`}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            visitorType === "tourist" ? "bg-primary/15" : "bg-muted"
                          }`}>
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-none">Tourist</p>
                            <p className="mt-1 text-[11px] opacity-70">Leisure / personal visit</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVisitorType("student")}
                          className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all duration-200 ${
                            visitorType === "student"
                              ? "border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10"
                              : "border-border hover:border-muted-foreground/40 text-muted-foreground"
                          }`}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            visitorType === "student" ? "bg-primary/15" : "bg-muted"
                          }`}>
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-none">Student</p>
                            <p className="mt-1 text-[11px] opacity-70">Field trip / educational</p>
                          </div>
                        </button>
                      </div>

                      {visitorType === "student" && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                          <Label htmlFor="school-name" className="text-sm font-semibold text-foreground">
                            School / University Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="school-name"
                            name="school-name"
                            placeholder="e.g. Bocaue National High School"
                            value={schoolName}
                            onChange={(e) => { setSchoolName(e.target.value); if (e.target.value.trim()) setSchoolWarning(null) }}
                            className={`rounded-xl ${schoolWarning ? "border-amber-500 focus-visible:ring-amber-500" : ""}`}
                            autoFocus
                          />
                          {schoolWarning ? (
                            <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{schoolWarning}
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground">This helps us prepare the right information for your class.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Step 4: Inquiry Details ── */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-black text-primary-foreground">4</span>
                        <span className="text-sm font-bold text-foreground uppercase tracking-wide">Message</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="message" className="text-sm font-semibold text-foreground">Inquiry Details</Label>
                          <span className={`text-[11px] tabular-nums ${messageLength > 3800 ? "text-amber-600" : "text-muted-foreground"}`}>
                            {messageLength} / 4000
                          </span>
                        </div>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Describe your inquiry, itinerary preferences, or any special requests..."
                          rows={5}
                          maxLength={4000}
                          onChange={(e) => setMessageLength(e.target.value.length)}
                          className="rounded-xl resize-none"
                        />
                      </div>
                    </div>

                    {/* ── Submit ── */}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={submitting}
                      className="w-full rounded-2xl gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {submitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>
                      ) : (
                        <><Send className="h-4 w-4" />Submit Inquiry</>
                      )}
                    </Button>

                    {success && (
                      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 p-4 text-emerald-800 dark:text-emerald-300">
                        <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Inquiry submitted successfully!</p>
                          <p className="text-xs mt-0.5 opacity-80">We&apos;ll get back to you within 1–2 business days.</p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-start gap-3 rounded-2xl bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800 p-4 text-red-700 dark:text-red-400">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
