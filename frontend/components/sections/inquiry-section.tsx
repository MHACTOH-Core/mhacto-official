"use client"

import { useState, type FormEvent } from "react"
import { Send } from "lucide-react"
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

export function InquirySection() {
  const [purpose, setPurpose] = useState("")

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      date: formData.get("date"),
      pax: formData.get("pax"),
      purpose,
      message: formData.get("message"),
    }
    console.log("Inquiry submitted:", data)
    alert("Inquiry sent successfully!")
    e.currentTarget.reset()
    setPurpose("")
  }

  return (
    <section id="inquiry" className="relative z-20 bg-primary/5 pt-32 pb-20 lg:pt-36 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center reveal-on-scroll">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Get in Touch
          </span>
          <h2 className="mt-2 text-balance text-3xl font-bold text-foreground md:text-4xl">
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
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
                  placeholder="1"
                  required
                />
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

            <Button type="submit" size="lg" className="w-full rounded-full gap-2">
              <Send className="h-4 w-4" />
              Submit Inquiry
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
