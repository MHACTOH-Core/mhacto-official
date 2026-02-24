"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAdmin } from "@/components/providers/admin-provider"
import { asset } from "@/lib/utils"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Save, User, Globe, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { isLoggedIn, settings, updateSettings, adminEmail } = useAdmin()

  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) router.push("/admin")
  }, [isLoggedIn, router])

  useEffect(() => {
    setForm(settings)
  }, [settings])

  if (!isLoggedIn) return null

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const hasChanges = JSON.stringify(form) !== JSON.stringify(settings)

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your site configuration and preferences.
              </p>
            </div>
            <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 p-6">
          {/* Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Admin Profile</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Account information
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Image
                    src={asset("/images/logos/MHACTO_LOGO.png")}
                    alt="Admin"
                    width={48}
                    height={48}
                    className="rounded-full object-contain"
                  />
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">MHACTO Admin</p>
                  <p className="text-sm text-muted-foreground">{adminEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Site Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <CardTitle className="text-base">Website Settings</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    General site configuration
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  value={form.siteName}
                  onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Site Description</Label>
                <Textarea
                  value={form.siteDescription}
                  onChange={(e) =>
                    setForm({ ...form, siteDescription: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) =>
                      setForm({ ...form, contactEmail: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={form.contactPhone}
                    onChange={(e) =>
                      setForm({ ...form, contactPhone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Office Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
                  <Bell className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Notification preferences
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Inquiry Notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new inquiry is received
                  </p>
                </div>
                <Switch
                  checked={form.enableInquiryNotifications}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, enableInquiryNotifications: checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Analytics Tracking
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Track page views and visitor statistics
                  </p>
                </div>
                <Switch
                  checked={form.enableAnalytics}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, enableAnalytics: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <CardTitle className="text-base">Advanced</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Danger zone settings
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Maintenance Mode
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable the public website
                  </p>
                </div>
                <Switch
                  checked={form.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, maintenanceMode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
