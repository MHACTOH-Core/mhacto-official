"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdmin } from "@/components/providers/admin-provider"
import {
  type AdminUser,
  type UserRole,
  ROLE_LABELS,
} from "@/lib/data/admin-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Pencil,
  Archive,
  RotateCcw,
  Shield,
  ShieldCheck,
  User,
  Users,
  Mail,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { format, parseISO } from "date-fns"

type UserFormData = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}

const EMPTY_FORM: UserFormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "admin",
}

export default function AccountsPage() {
  const router = useRouter()
  const {
    isLoggedIn,
    isHydrated,
    currentUser,
    users,
    createUser,
    updateUser,
    archiveUser,
    restoreUser,
    refreshUsers,
    archiveRequests,
    refreshArchiveRequests,
    approveArchiveRequest,
    denyArchiveRequest,
  } = useAdmin()

  const [search, setSearch] = useState("")
  const [filterTab, setFilterTab] = useState<"active" | "archived">("active")

  // Dialog state
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM)
  const [formError, setFormError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  // Archive / Restore confirm
  const [archiveTarget, setArchiveTarget] = useState<AdminUser | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<AdminUser | null>(null)

  useEffect(() => {
    if (isHydrated && !isLoggedIn) router.push("/admin")
  }, [isHydrated, isLoggedIn, router])

  useEffect(() => {
    if (isLoggedIn) refreshUsers()
  }, [isLoggedIn, refreshUsers])

  if (!isHydrated || !isLoggedIn || !currentUser) return null

  // Only super_admin and admin can access accounts
  if (currentUser.role === "content_manager") {
    return (
      <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Access Restricted</h2>
            <p className="mt-2 text-muted-foreground">You don&apos;t have permission to manage accounts.</p>
          </div>
        </main>
    )
  }

  const filtered = users.filter((u) => {
    if (filterTab === "active" && u.status !== "active") return false
    if (filterTab === "archived" && u.status !== "archived") return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (u.full_name ?? "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q)
      )
    }
    return true
  })

  const openCreate = () => {
    setEditingUser(null)
    setForm(EMPTY_FORM)
    setFormError("")
    setShowPassword(false)
    setDialogOpen(true)
  }

  const openEdit = (user: AdminUser) => {
    setEditingUser(user)
    setForm({
      fullName: user.full_name ?? "",
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
    })
    setFormError("")
    setShowPassword(false)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setFormError("")

    if (!form.fullName.trim()) {
      setFormError("Full name is required.")
      return
    }
    if (!form.email.trim()) {
      setFormError("Email is required.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError("Please enter a valid email address.")
      return
    }

    if (!editingUser) {
      // Creating — password required
      if (!form.password) {
        setFormError("Password is required for new accounts.")
        return
      }
      if (form.password.length < 8) {
        setFormError("Password must be at least 8 characters.")
        return
      }
      if (form.password !== form.confirmPassword) {
        setFormError("Passwords do not match.")
        return
      }
    } else {
      // Editing — password optional but must match if provided
      if (form.password && form.password.length < 8) {
        setFormError("Password must be at least 8 characters.")
        return
      }
      if (form.password && form.password !== form.confirmPassword) {
        setFormError("Passwords do not match.")
        return
      }
    }

    // Non-super_admin cannot create super_admin accounts
    if (currentUser.role !== "super_admin" && form.role === "super_admin") {
      setFormError("Only Super Admins can assign the Super Admin role.")
      return
    }

    setSaving(true)
    try {
      if (editingUser) {
        const updateData: Record<string, unknown> = {
          full_name: form.fullName,
          email: form.email,
          role: form.role,
        }
        if (form.password) {
          updateData.password = form.password
        }
        const result = await updateUser(editingUser.user_id, updateData)
        if (!result.success) {
          toast({ title: "Update failed", description: result.error ?? "Email may already be in use.", variant: "destructive" })
          setSaving(false)
          return
        }
        toast({ title: "Account updated", description: `${form.fullName}'s account has been updated.`, variant: "success" })
      } else {
        const result = await createUser({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role,
        })
        if (!result.success) {
          toast({ title: "Create failed", description: result.error ?? "Email may already be in use.", variant: "destructive" })
          setSaving(false)
          return
        }
        toast({ title: "Account created", description: `Account for ${form.fullName} has been created.`, variant: "success" })
      }
      setDialogOpen(false)
    } catch {
      setFormError("An unexpected error occurred.")
    } finally {
      setSaving(false)
    }
  }

  const confirmArchive = async () => {
    if (archiveTarget) {
      const result = await archiveUser(archiveTarget.user_id)
      if (result.requiresApproval) {
        toast({
          title: "Approval Requested",
          description: `A request to archive ${archiveTarget.full_name || archiveTarget.email} has been sent to Super Admins for review.`,
        })
        refreshArchiveRequests()
      } else if (result.success) {
        toast({ title: "Account deactivated", description: `${archiveTarget.full_name}'s account has been deactivated.` })
      }
      setArchiveTarget(null)
    }
  }

  const confirmRestore = async () => {
    if (restoreTarget) {
      await restoreUser(restoreTarget.user_id)
      toast({ title: "Account restored", description: `${restoreTarget.full_name}'s account has been restored.` })
      setRestoreTarget(null)
    }
  }

  const roleColor: Record<UserRole, string> = {
    super_admin: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    content_manager: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  }

  const roleIcon = (role: UserRole) => {
    if (role === "super_admin") return <ShieldCheck className="h-3.5 w-3.5" />
    if (role === "admin") return <Shield className="h-3.5 w-3.5" />
    return <User className="h-3.5 w-3.5" />
  }

  // Determine which roles the current user can assign
  const assignableRoles: UserRole[] =
    currentUser.role === "super_admin"
      ? ["super_admin", "admin", "content_manager"]
      : ["admin", "content_manager"]

  return (
    <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Account Management</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage admin accounts, roles, and access permissions.
              </p>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> New Account
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as "active" | "archived")}>
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Summary */}
          <div className="grid gap-3 sm:grid-cols-3">
            {(["super_admin", "admin", "content_manager"] as UserRole[]).map((role) => {
              const count = users.filter((u) => u.role === role && u.status === "active").length
              return (
                <Card key={role} className="border-border">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      role === "super_admin" ? "bg-red-100 dark:bg-red-900/30" :
                      role === "admin" ? "bg-blue-100 dark:bg-blue-900/30" :
                      "bg-green-100 dark:bg-green-900/30"
                    }`}>
                      {roleIcon(role)}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">{count}</p>
                      <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pending Archive Requests (super_admin only) */}
          {currentUser.role === "super_admin" && archiveRequests.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-semibold text-card-foreground">
                    Pending Archive Requests ({archiveRequests.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {archiveRequests.map((req) => (
                    <div
                      key={req.request_id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-card-foreground">
                          Archive <span className="text-orange-600 dark:text-orange-400">{req.target_name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Requested by {req.requester_name} &middot;{" "}
                          {req.created_at ? format(parseISO(req.created_at), "MMM d, yyyy h:mm a") : "N/A"}
                        </p>
                        {req.reason && (
                          <p className="text-xs text-muted-foreground mt-1 italic">&ldquo;{req.reason}&rdquo;</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                          onClick={async () => {
                            const ok = await approveArchiveRequest(req.request_id)
                            if (ok) toast({ title: "Request approved", description: `${req.target_name} has been archived.` })
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          onClick={async () => {
                            const ok = await denyArchiveRequest(req.request_id)
                            if (ok) toast({ title: "Request denied", description: `Archive request for ${req.target_name} was denied.` })
                          }}
                        >
                          <XCircle className="h-4 w-4" /> Deny
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users list */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-card-foreground">No accounts found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filterTab === "archived" ? "No archived accounts." : "Create a new account to get started."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((u) => {
                const isMainSuperAdmin = u.user_id === 1
                const isCurrentUser = u.user_id === currentUser.id
                const canEdit =
                  currentUser.role === "super_admin" ||
                  (currentUser.role === "admin" && u.role !== "super_admin") ||
                  isCurrentUser
                const canArchive =
                  !isMainSuperAdmin &&
                  !isCurrentUser &&
                  (currentUser.role === "super_admin" || currentUser.role === "admin")
                const needsApproval =
                  currentUser.role !== "super_admin" && u.role === "super_admin"

                return (
                  <Card key={u.user_id} className={`border-border transition-colors ${u.status === "archived" ? "opacity-60" : ""}`}>
                    <CardContent className="flex items-center gap-4 p-4">
                      {/* Avatar */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        u.role === "super_admin" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                        u.role === "admin" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      }`}>
                        {roleIcon(u.role)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-card-foreground truncate">
                            {u.full_name || u.username}
                          </p>
                          {isMainSuperAdmin && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Primary</Badge>
                          )}
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Joined {u.created_at ? format(parseISO(u.created_at), "MMM d, yyyy") : "N/A"}
                        </p>
                      </div>

                      {/* Role badge */}
                      <Badge className={`${roleColor[u.role]} border-0 gap-1`}>
                        {roleIcon(u.role)}
                        {ROLE_LABELS[u.role]}
                      </Badge>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {u.status === "active" && canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(u)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {u.status === "active" && canArchive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${needsApproval ? "text-orange-600 dark:text-orange-400" : "text-yellow-600 dark:text-yellow-400"}`}
                            onClick={() => setArchiveTarget(u)}
                            title={needsApproval ? "Request Archive Approval" : "Archive"}
                          >
                            {needsApproval ? <Clock className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                          </Button>
                        )}
                        {u.status === "archived" && currentUser.role === "super_admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 dark:text-green-400"
                            onClick={() => setRestoreTarget(u)}
                            title="Restore"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Create / Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit Account" : "Create New Account"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. juan@mhacto.gov.ph"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                {editingUser?.user_id === 1 ? (
                  <Input value="Super Admin" readOnly className="bg-muted cursor-not-allowed" />
                ) : (
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label>{editingUser ? "New Password (leave blank to keep)" : "Password"}</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingUser ? "Leave blank to keep current" : "Min. 8 characters"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {(form.password || !editingUser) && (
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                  />
                </div>
              )}
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingUser ? "Update Account" : "Create Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Confirmation */}
        <AlertDialog open={!!archiveTarget} onOpenChange={(open) => !open && setArchiveTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {archiveTarget?.role === "super_admin" && currentUser.role !== "super_admin"
                  ? "Request Archive Approval"
                  : "Archive Account"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {archiveTarget?.role === "super_admin" && currentUser.role !== "super_admin" ? (
                  <>
                    <strong>{archiveTarget?.full_name || archiveTarget?.email}</strong> is a Super Admin.
                    Your request will be sent to a Super Admin for approval.
                  </>
                ) : (
                  <>
                    Are you sure you want to archive <strong>{archiveTarget?.full_name || archiveTarget?.email}</strong>?
                    They will no longer be able to log in. This can be reversed by a Super Admin.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmArchive} className="bg-yellow-600 hover:bg-yellow-700">
                {archiveTarget?.role === "super_admin" && currentUser.role !== "super_admin"
                  ? "Submit Request"
                  : "Archive"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Restore Confirmation */}
        <AlertDialog open={!!restoreTarget} onOpenChange={(open) => !open && setRestoreTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restore Account</AlertDialogTitle>
              <AlertDialogDescription>
                Restore <strong>{restoreTarget?.full_name || restoreTarget?.email}</strong> to active status?
                They will be able to log in again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRestore}>Restore</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </main>
  )
}
