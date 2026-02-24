"use client"

import Link from "next/link"
import { ArrowLeft, Send } from "lucide-react"
import { useState, type FormEvent } from "react"
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

export default function InquirePage() {
  const [purpose, setPurpose] = useState("")

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      contact: formData.get("contact"),
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
    <main className="min-h-screen bg-background">

      {/* Page header */}
      <section className="border-b border-border bg-card mt-14 pt-8 pb-8 sm:mt-16 sm:pt-12 sm:pb-10 md:mt-20 md:pt-14 lg:mt-28 lg:pt-18 lg:pb-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="mb-6 gap-1 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <div className="text-center animate-fade-in-up">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Get in Touch
            </span>
            <h1 className="mt-2 text-3xl font-bold text-card-foreground md:text-4xl lg:text-5xl">
              Tourist Inquiry & Registration
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Fill out the form below and we will get back to you with all the
              information you need for a smooth and enjoyable visit.
            </p>
          </div>
        </div>
      </section>

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
                    <div className="space-y-2">
                      <Label htmlFor="contact" className="text-card-foreground">
                        Contact Number
                      </Label>
                      <Input
                        id="contact"
                        name="contact"
                        type="tel"
                        placeholder="(+63) 9XX-XXX-XXXX"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6">
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
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
