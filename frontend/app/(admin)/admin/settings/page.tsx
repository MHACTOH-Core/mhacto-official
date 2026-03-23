"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAdmin } from "@/components/providers/admin-provider"
import { asset, resolveMediaUrl } from "@/lib/utils"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Save, User, Globe, Bell, Shield, Camera, Eye, EyeOff, KeyRound, Pencil, Check, X, Palette, Upload } from "lucide-react"
import { ROLE_LABELS } from "@/lib/data/admin-data"
import { API_BASE } from "@/lib/api"
import { ProfilePictureCropDialog } from "@/components/ui/profile-picture-crop"
import { MediaPicker } from "@/components/ui/media-picker"
import { usePasswordForm, useProfilePicture } from "@/hooks/use-settings-forms"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const router = useRouter()
  const { isLoggedIn, isHydrated, settings, updateSettings, adminEmail, currentUser, updateProfile, changePassword, notificationPrefs, updateNotificationPrefs } = useAdmin()

  const isSuperAdmin = currentUser?.role === "super_admin"

  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)

  // Profile editing state
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState("")
  const [nameSaving, setNameSaving] = useState(false)

  // Password change hook
  const {
    dialogOpen: passwordDialogOpen,
    setDialogOpen: setPasswordDialogOpen,
    oldPassword, setOldPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    showOldPw, setShowOldPw,
    showNewPw, setShowNewPw,
    error: pwError,
    saving: pwSaving,
    success: pwSuccess,
    open: openPasswordDialog,
    submit: submitPasswordChange,
  } = usePasswordForm({
    changePassword,
    onSuccess: () => toast({ title: "Password changed", description: "Your password has been updated successfully." }),
    onError: () => toast({ title: "Something went wrong", variant: "destructive" }),
  })

  // Profile picture hook
  const {
    fileInputRef,
    uploading: uploadingPicture,
    cropSrc,
    cropDialogOpen,
    setCropDialogOpen,
    handleSelect: handlePictureSelect,
    handleCroppedUpload,
  } = useProfilePicture({
    updateProfile,
    onSuccess: () => toast({ title: "Profile picture updated", description: "Your profile picture has been changed." }),
    onError: () => toast({ title: "Something went wrong", variant: "destructive" }),
  })

  // Branding media picker state
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"loginBg" | "navLogo" | "navSecondaryLogo" | null>(null)

  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.push("/admin")
  }, [isHydrated, isLoggedIn, router])

  useEffect(() => {
    setForm(settings)
  }, [settings])

  if (!isHydrated || !isLoggedIn) return null

  const handleSave = () => {
    setSaveConfirmOpen(true)
  }

  const executeSave = () => {
    setSaveConfirmOpen(false)
    updateSettings(form)
    setSaved(true)
    toast({ title: "Settings saved", description: "Website settings have been updated." })
    setTimeout(() => setSaved(false), 2500)
  }

  const hasChanges = JSON.stringify(form) !== JSON.stringify(settings)

  // Profile name edit
  const startEditName = () => {
    setNameValue(currentUser?.fullName || "")
    setEditingName(true)
  }
  const saveName = async () => {
    if (!nameValue.trim()) return
    setNameSaving(true)
    await updateProfile({ full_name: nameValue.trim() })
    setNameSaving(false)
    setEditingName(false)
    toast({ title: "Profile updated", description: "Your name has been updated." })
  }

  const profilePicSrc = currentUser?.profilePicture
    ? (currentUser.profilePicture.startsWith("http") ? currentUser.profilePicture : `${API_BASE}${currentUser.profilePicture}`)
    : null

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
                  <CardTitle className="text-base">My Profile</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage your account information
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar + Upload */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden border-2 border-border">
                    {profilePicSrc ? (
                      <Image
                        src={profilePicSrc}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={resolveMediaUrl("/uploads/images/logos/MHACTO_LOGO.png")}
                        alt="Admin"
                        width={56}
                        height={56}
                        className="rounded-full object-contain"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPicture}
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                    title="Change profile picture"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePictureSelect}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        className="h-9 max-w-[260px]"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false) }}
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={saveName} disabled={nameSaving}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingName(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-card-foreground truncate">{currentUser?.fullName || "MHACTO Admin"}</p>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={startEditName} title="Edit name">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground truncate">{adminEmail}</p>
                  {currentUser && (
                    <p className="text-xs text-muted-foreground mt-0.5">Role: {ROLE_LABELS[currentUser.role]}</p>
                  )}
                </div>
              </div>

              {uploadingPicture && (
                <p className="text-xs text-muted-foreground animate-pulse">Uploading picture...</p>
              )}

              {/* Crop dialog */}
              {cropSrc && (
                <ProfilePictureCropDialog
                  open={cropDialogOpen}
                  onOpenChange={setCropDialogOpen}
                  imageSrc={cropSrc}
                  onCropComplete={handleCroppedUpload}
                />
              )}

              <Separator />

              {/* Change Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                    <KeyRound className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Password</p>
                    <p className="text-xs text-muted-foreground">Change your account password</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={openPasswordDialog}>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Personal Notification Preferences — all roles */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
                  <Bell className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <CardTitle className="text-base">My Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Personal notification preferences
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Email Notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for important updates
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs.enableEmailNotifications}
                  onCheckedChange={async (checked) => {
                    const ok = await updateNotificationPrefs({ enableEmailNotifications: checked })
                    if (ok) toast({ title: "Preference saved", description: `Email notifications ${checked ? "enabled" : "disabled"}.` })
                    else toast({ title: "Something went wrong", variant: "destructive" })
                  }}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    Inquiry Alerts
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new inquiries are submitted
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs.enableInquiryAlerts}
                  onCheckedChange={async (checked) => {
                    const ok = await updateNotificationPrefs({ enableInquiryAlerts: checked })
                    if (ok) toast({ title: "Preference saved", description: `Inquiry alerts ${checked ? "enabled" : "disabled"}.` })
                    else toast({ title: "Something went wrong", variant: "destructive" })
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Site Settings — super_admin only */}
          {isSuperAdmin && (
          <>
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
                    type="tel"
                    value={form.contactPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9+()\-\s]/g, '')
                      setForm({ ...form, contactPhone: val })
                    }}
                    placeholder="e.g. (044) 123-4567"
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
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Facebook URL</Label>
                  <Input
                    type="url"
                    value={form.facebookUrl}
                    onChange={(e) =>
                      setForm({ ...form, facebookUrl: e.target.value })
                    }
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram URL</Label>
                  <Input
                    type="url"
                    value={form.instagramUrl}
                    onChange={(e) =>
                      setForm({ ...form, instagramUrl: e.target.value })
                    }
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding — super_admin only */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                  <Palette className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <CardTitle className="text-base">Branding</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Customize logos, images, and branding elements
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Login Background Image */}
              <div className="space-y-2">
                <Label>Login Background Image</Label>
                <p className="text-xs text-muted-foreground">Image shown on the left panel of the admin login page.</p>
                <div className="flex items-center gap-3">
                  {form.loginBackgroundImage ? (
                    <div className="relative h-20 w-32 rounded-lg overflow-hidden border border-border bg-muted">
                      <Image
                        src={resolveMediaUrl(form.loginBackgroundImage)}
                        alt="Login background"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 text-muted-foreground/40">
                      <Upload className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setMediaPickerTarget("loginBg")}>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      {form.loginBackgroundImage ? "Change" : "Upload"}
                    </Button>
                    {form.loginBackgroundImage && (
                      <Button variant="ghost" size="sm" className="text-destructive h-7 px-2" onClick={() => setForm({ ...form, loginBackgroundImage: "" })}>
                        <X className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Navbar Logo (Left - MHACTO) */}
              <div className="space-y-2">
                <Label>Navbar Logo (Left — MHACTO)</Label>
                <p className="text-xs text-muted-foreground">Primary logo shown on the left side of the navbar.</p>
                <div className="flex items-center gap-3">
                  {form.navbarLogoUrl ? (
                    <div className="relative h-12 w-32 rounded-lg overflow-hidden border border-border bg-muted p-1">
                      <Image
                        src={resolveMediaUrl(form.navbarLogoUrl)}
                        alt="Navbar logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 text-muted-foreground/40">
                      <Upload className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setMediaPickerTarget("navLogo")}>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      {form.navbarLogoUrl ? "Change" : "Upload"}
                    </Button>
                    {form.navbarLogoUrl && (
                      <Button variant="ghost" size="sm" className="text-destructive h-7 px-2" onClick={() => setForm({ ...form, navbarLogoUrl: "" })}>
                        <X className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Navbar Logo (Right - Bocaue) */}
              <div className="space-y-2">
                <Label>Navbar Logo (Right — Bocaue)</Label>
                <p className="text-xs text-muted-foreground">Secondary logo shown on the right side of the navbar.</p>
                <div className="flex items-center gap-3">
                  {form.navbarSecondaryLogoUrl ? (
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border bg-muted p-1">
                      <Image
                        src={resolveMediaUrl(form.navbarSecondaryLogoUrl)}
                        alt="Secondary navbar logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 text-muted-foreground/40">
                      <Upload className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => setMediaPickerTarget("navSecondaryLogo")}>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      {form.navbarSecondaryLogoUrl ? "Change" : "Upload"}
                    </Button>
                    {form.navbarSecondaryLogoUrl && (
                      <Button variant="ghost" size="sm" className="text-destructive h-7 px-2" onClick={() => setForm({ ...form, navbarSecondaryLogoUrl: "" })}>
                        <X className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Navbar Title Text */}
              <div className="space-y-2">
                <Label>Navbar Title Text</Label>
                <Input
                  value={form.navbarTitle}
                  onChange={(e) => setForm({ ...form, navbarTitle: e.target.value })}
                  placeholder="Municipality of Bocaue"
                />
                <p className="text-xs text-muted-foreground">Text displayed next to the secondary (right) navbar logo.</p>
              </div>
            </CardContent>
          </Card>

          {/* Media Picker for branding uploads */}
          <MediaPicker
            open={!!mediaPickerTarget}
            onOpenChange={(open) => { if (!open) setMediaPickerTarget(null) }}
            accept="image"
            onSelect={(url) => {
              if (mediaPickerTarget === "loginBg") setForm({ ...form, loginBackgroundImage: url })
              else if (mediaPickerTarget === "navLogo") setForm({ ...form, navbarLogoUrl: url })
              else if (mediaPickerTarget === "navSecondaryLogo") setForm({ ...form, navbarSecondaryLogoUrl: url })
              setMediaPickerTarget(null)
            }}
          />

          {/* Notifications — super_admin only */}
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

          {/* Maintenance — super_admin only */}
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
          </>
          )}
        </div>
      </main>

      {/* Save Confirmation */}
      <AlertDialog open={saveConfirmOpen} onOpenChange={setSaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to save?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the site settings. Please make sure all changes are correct.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {pwSuccess ? (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-700 dark:text-green-300">
                <Check className="h-4 w-4" />
                Password changed successfully!
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showOldPw ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowOldPw(!showOldPw)}>
                      {showOldPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNewPw(!showNewPw)}>
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type={showNewPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>
                {pwError && (
                  <p className="text-sm text-destructive">{pwError}</p>
                )}
              </>
            )}
          </div>
          {!pwSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitPasswordChange} disabled={pwSaving || !oldPassword || !newPassword || !confirmPassword}>
                {pwSaving ? "Saving..." : "Change Password"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
