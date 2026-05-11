import { useState, useRef, useCallback } from "react"
import { apiUploadMedia } from "@/lib/api"
import type { CropSaveMode } from "@/components/ui/image-crop-dialog"

const MIN_PASSWORD_LENGTH = 8
// Delay before auto-closing the success dialog so the user sees the confirmation
const SUCCESS_CLOSE_DELAY_MS = 1500

interface UsePasswordFormOptions {
  changePassword: (oldPassword: string, newPassword: string) => Promise<string | true>
  onSuccess?: () => void
  onError?: (msg: string) => void
}

export function usePasswordForm({ changePassword, onSuccess, onError }: UsePasswordFormOptions) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPw, setShowOldPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = () => {
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess(false)
    setShowOldPw(false)
    setShowNewPw(false)
    setDialogOpen(true)
  }

  const submit = useCallback(async () => {
    setError("")
    if (newPassword.length < MIN_PASSWORD_LENGTH) { setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`); return }
    if (!/[A-Za-z]/.test(newPassword)) { setError("New password must contain at least one letter."); return }
    if (!/[0-9]/.test(newPassword)) { setError("New password must contain at least one number."); return }
    if (newPassword !== confirmPassword) { setError("New passwords do not match."); return }
    setSaving(true)
    try {
      const result = await changePassword(oldPassword, newPassword)
      if (result === true) {
        setSuccess(true)
        onSuccess?.()
        closeTimerRef.current = setTimeout(() => setDialogOpen(false), SUCCESS_CLOSE_DELAY_MS)
      } else {
        setError(result)
        onError?.(result)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldPassword, newPassword, confirmPassword, changePassword, onSuccess, onError])

  return {
    dialogOpen,
    setDialogOpen: (v: boolean) => {
      if (!v) clearTimeout(closeTimerRef.current!)
      setDialogOpen(v)
    },
    oldPassword, setOldPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    showOldPw, setShowOldPw,
    showNewPw, setShowNewPw,
    error,
    saving,
    success,
    open,
    submit,
  }
}

interface UseProfilePictureOptions {
  updateProfile: (data: { profile_picture?: string | null }) => Promise<boolean>
  onSuccess?: () => void
  onError?: () => void
}

export function useProfilePicture({ updateProfile, onSuccess, onError }: UseProfilePictureOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // _mode is ignored here: profile pictures always create a new upload, never replace
  const handleCroppedUpload = async (blob: Blob, _mode?: CropSaveMode) => {
    setCropDialogOpen(false)
    setCropSrc(null)
    setUploading(true)
    try {
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" })
      const result = await apiUploadMedia([file], "image", { category: "profiles" })
      if (result.uploaded?.length) {
        await updateProfile({ profile_picture: result.uploaded[0].url })
        onSuccess?.()
      }
    } catch (err) {
      console.error("Picture upload error:", err)
      onError?.()
    } finally {
      setUploading(false)
    }
  }

  const closeCropDialog = () => {
    setCropDialogOpen(false)
    setCropSrc(null)
  }

  return {
    fileInputRef,
    uploading,
    cropSrc,
    cropDialogOpen,
    setCropDialogOpen: (open: boolean) => { setCropDialogOpen(open); if (!open) setCropSrc(null) },
    handleSelect,
    handleCroppedUpload,
  }
}
