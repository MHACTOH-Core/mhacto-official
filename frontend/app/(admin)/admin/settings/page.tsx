"use client"

import { useState, useEffect, useRef } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { Save, User, Globe, Bell, Shield, Camera, Eye, EyeOff, KeyRound, Pencil, Check, X } from "lucide-react"
import { ROLE_LABELS } from "@/lib/data/admin-data"
import { apiUploadMedia } from "@/lib/api"
import { ProfilePictureCropDialog } from "@/components/ui/profile-picture-crop"
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

  const { toast } = useToast()

  const isSuperAdmin = currentUser?.role === "super_admin"

  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false)

  // Profile editing state
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState("")
  const [nameSaving, setNameSaving] = useState(false)

  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPw, setShowOldPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)

  // Profile picture state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)

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

  // Profile picture: open file picker → show crop dialog
  const handlePictureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCropSrc(reader.result as string)
      setCropDialogOpen(true)
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // After cropping, upload the cropped blob
  const handleCroppedUpload = async (blob: Blob) => {
    setCropDialogOpen(false)
    setCropSrc(null)
    setUploadingPicture(true)
    try {
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" })
      const result = await apiUploadMedia([file], "image", { category: "profiles" })
      if (result.uploaded?.length) {
        await updateProfile({ profile_picture: result.uploaded[0].url })
        toast({ title: "Profile picture updated", description: "Your profile picture has been changed." })
      }
    } catch (err) {
      console.error("Picture upload error:", err)
      toast({ title: "Upload failed", description: "Failed to upload profile picture.", variant: "destructive" })
    }
    setUploadingPicture(false)
  }

  // Password change
  const openPasswordDialog = () => {
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPwError("")
    setPwSuccess(false)
    setShowOldPw(false)
    setShowNewPw(false)
    setPasswordDialogOpen(true)
  }
  const submitPasswordChange = async () => {
    setPwError("")
    if (newPassword.length < 6) { setPwError("New password must be at least 6 characters."); return }
    if (newPassword !== confirmPassword) { setPwError("New passwords do not match."); return }
    setPwSaving(true)
    const result = await changePassword(oldPassword, newPassword)
    setPwSaving(false)
    if (result === true) {
      setPwSuccess(true)
      toast({ title: "Password changed", description: "Your password has been updated successfully." })
      setTimeout(() => setPasswordDialogOpen(false), 1500)
    } else {
      setPwError(result)
      toast({ title: "Password change failed", description: result, variant: "destructive" })
    }
  }

  const profilePicSrc = currentUser?.profilePicture
    ? (currentUser.profilePicture.startsWith("http") ? currentUser.profilePicture : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${currentUser.profilePicture}`)
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
                  onOpenChange={(open) => { setCropDialogOpen(open); if (!open) setCropSrc(null) }}
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
                    else toast({ title: "Failed to save", description: "Could not update preferences.", variant: "destructive" })
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
                    else toast({ title: "Failed to save", description: "Could not update preferences.", variant: "destructive" })
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
