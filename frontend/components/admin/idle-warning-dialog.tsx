"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { useIdleTimer } from "@/hooks/use-idle-timer"
import { Clock, LogOut } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function IdleWarningDialog() {
  const pathname = usePathname()
  const { isLoggedIn, logout } = useAuth()
  const isLoginPage = pathname === "/admin" || pathname === "/admin/"
  const enabled = isLoggedIn && !isLoginPage
  const { isWarning, isTimedOut, remainingSeconds, reset } = useIdleTimer(enabled)
  const hasLoggedOut = useRef(false)

  // Auto-logout when countdown expires
  useEffect(() => {
    if (isTimedOut && !hasLoggedOut.current) {
      hasLoggedOut.current = true
      sessionStorage.setItem("afk_logout", "true")
      logout()
    }
  }, [isTimedOut, logout])

  // Reset the ref when user logs in again
  useEffect(() => {
    if (isLoggedIn) hasLoggedOut.current = false
  }, [isLoggedIn])

  if (!enabled || !isWarning) return null

  const handleStay = () => {
    reset()
  }

  const handleLogout = () => {
    logout()
  }

  const urgencyClass = remainingSeconds <= 60
    ? "text-red-500"
    : remainingSeconds <= 120
      ? "text-amber-500"
      : "text-primary"

  return (
    <AlertDialog open>
      <AlertDialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AlertDialogHeader className="items-center text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <AlertDialogTitle className="text-xl">
            Wait, stay for a moment or log out.
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground pt-2">
            You&apos;ve been inactive for a while. For security, you&apos;ll be logged out automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col items-center py-4">
          <p className="text-sm text-muted-foreground mb-1">Time remaining</p>
          <p className={`text-4xl font-black tabular-nums tracking-wider ${urgencyClass} transition-colors duration-300`}>
            {formatTime(remainingSeconds)}
          </p>
        </div>

        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button onClick={handleStay} className="w-full cursor-pointer">
            Stay
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
