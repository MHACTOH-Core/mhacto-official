"use client"

import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"
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
import Link from "next/link"

// Validation helpers

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0]
}

function isValidName(name: string): boolean {
  if (!name.trim()) return false
  if (name.trim().length > 18) return false
  return /^[A-Za-zA-\u00FF\u00F1\u00D1\s]+$/.test(name.trim())
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

const MAX_DETAILS = 4000

export default function InquirePage() {
  const [inquiryCategory, setInquiryCategory] = useState<"tourist" | "student" | "">("") 
  const [detailsCount, setDetailsCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nameWarning, setNameWarning] = useState<string | null>(null)
  const [emailWarning, setEmailWarning] = useState<string | null>(null)
  const [dateWarning, setDateWarning] = useState<string | null>(null)

  function handleNameChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value && value.length > 18) {
      setNameWarning("Name must be 18 characters or less.")
    } else if (value && !isValidName(value)) {
      setNameWarning("Name must contain only letters and spaces.")
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
    const email = (formData.get("email") as string).trim()
    const dateFrom = formData.get("date-from") as string
    const dateTo = formData.get("date-to") as string
    const paxValue = formData.get("pax") ? Number(formData.get("pax")) : 0
    const details = (formData.get("details") as string) || ""

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
    if (!inquiryCategory) {
      setError("Please select an Inquiry Category (Student or Tourist).")
      setSubmitting(false)
      return
    }
    if (dateFrom && dateTo && dateTo < dateFrom) {
      setError("The end date cannot be before the start date.")
      setSubmitting(false)
      return
    }
    if (details.length > MAX_DETAILS) {
      setError(`Inquiry Details must not exceed ${MAX_DETAILS} characters.`)
      setSubmitting(false)
      return
    }

    const additionalDetails: Record<string, unknown> = { inquiryCategory }
    if (dateTo && dateTo !== dateFrom) additionalDetails.dateToVisit = dateTo

    try {
      await apiCreateInquiry({
        name,
        email,
        inquiryType: "tour_booking",
        dateOfVisit: dateFrom || undefined,
        numberOfPax: paxValue || undefined,
        message: details,
        additionalDetails,
      })
      setSuccess(true)
      setNameWarning(null)
      setEmailWarning(null)
      setDateWarning(null)
      setDetailsCount(0)
      setInquiryCategory("")
      form.reset()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit inquiry. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
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

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 lg:gap-12 grid-cols-1 lg:grid-cols-2 items-start">

            {/* Left side */}
            <div className="space-y-6 animate-fade-in-left">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Plan Your Visit
                </span>
                <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
                  Ready to Explore Bocaue?
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  Bocaue welcomes all visitors with open arms. Whether you&apos;re a student on a field trip or a tourist exploring our heritage, we&apos;re here to make your visit memorable.
                </p>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                {["Warm hospitality from our local community", "Rich cultural experiences and heritage sites", "Delicious traditional cuisine and local delicacies", "Professional assistance from MHACTO staff"].map(item => (
                  <li key={item} className="flex gap-3">
                    <span className="text-primary font-bold">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-xl border border-border bg-muted/40 p-5 space-y-2">
                <p className="text-sm font-semibold text-foreground">Need help planning?</p>
                <p className="text-sm text-muted-foreground">
                  Visit the <Link href="/tourism-office" className="text-primary hover:underline font-medium">Tourism Office page</Link> for contact details and office hours, or browse <Link href="/places/tourism-wonders" className="text-primary hover:underline font-medium">Tourism Wonders</Link> for inspiration.
                </p>
              </div>
            </div>

            {/* Right side — Form */}
            <div className="animate-fade-in-right delay-100">
              <Card className="border-border shadow-lg sticky top-32">
                <CardHeader className="bg-primary/5">
                  <CardTitle>Inquiry Form</CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                      <Input id="name" name="name" placeholder="Juan Dela Cruz" required maxLength={18} onChange={handleNameChange} />
                      {nameWarning && (
                        <p className="flex items-center gap-1.5 text-xs text-amber-600">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{nameWarning}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                      <Input id="email" name="email" type="email" placeholder="you@gmail.com" required onChange={handleEmailChange} />
                      <p className="text-[11px] text-muted-foreground">Gmail, Outlook, Yahoo, iCloud, etc.</p>
                      {emailWarning && (
                        <p className="flex items-center gap-1.5 text-xs text-amber-600">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{emailWarning}
                        </p>
                      )}
                    </div>

                    {/* Inquiry Category */}
                    <div className="space-y-2">
                      <Label>Inquiry Category <span className="text-destructive">*</span></Label>
                      <Select value={inquiryCategory} onValueChange={(val) => setInquiryCategory(val as "tourist" | "student")}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tourist">Tourist</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground">
                        {inquiryCategory === "student"
                          ? "Educational / field trip visit — we will prepare learning materials for your group."
                          : inquiryCategory === "tourist"
                          ? "Leisure or personal visit — welcome to Bocaue!"
                          : "Select whether you are visiting as a Tourist or a Student."}
                      </p>
                    </div>

                    {/* Number of People (Pax) */}
                    <div className="space-y-2">
                      <Label htmlFor="pax">Number of People (Pax) <span className="text-destructive">*</span></Label>
                      <Input id="pax" name="pax" type="number" min={1} placeholder="e.g. 5" required />
                      <p className="text-[11px] text-muted-foreground">How many people are in your group?</p>
                    </div>

                    {/* Estimated Tour Dates */}
                    <div className="space-y-2">
                      <Label>Estimated Tour Dates <span className="text-destructive">*</span></Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="date-from" className="text-[11px] text-muted-foreground">From</Label>
                          <Input id="date-from" name="date-from" type="date" min={getTodayISO()} required onChange={handleDateFromChange} />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="date-to" className="text-[11px] text-muted-foreground">To</Label>
                          <Input id="date-to" name="date-to" type="date" min={getTodayISO()} required onChange={handleDateToChange} />
                        </div>
                      </div>
                      {dateWarning && (
                        <p className="flex items-center gap-1.5 text-xs text-amber-600">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{dateWarning}
                        </p>
                      )}
                    </div>

                    {/* Inquiry Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="details">Inquiry Details <span className="text-destructive">*</span></Label>
                        <span className={`text-[11px] tabular-nums ${detailsCount > MAX_DETAILS * 0.9 ? "text-amber-600" : "text-muted-foreground"}`}>
                          {detailsCount} / {MAX_DETAILS}
                        </span>
                      </div>
                      <Textarea
                        id="details"
                        name="details"
                        placeholder="Tell us about your planned visit, any special requests, interests, or questions you may have..."
                        rows={6}
                        maxLength={MAX_DETAILS}
                        required
                        onChange={(e) => setDetailsCount(e.target.value.length)}
                      />
                      <p className="text-[11px] text-muted-foreground">Up to {MAX_DETAILS.toLocaleString()} characters.</p>
                    </div>

                    <Button type="submit" size="lg" className="w-full rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting}>
                      {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting&hellip;</> : <><Send className="h-4 w-4" />Submit Inquiry</>}
                    </Button>

                    {success && (
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        <span>Your inquiry has been submitted successfully! We&apos;ll get back to you soon.</span>
                      </div>
                    )}
                    {error && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm">{error}</div>
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
