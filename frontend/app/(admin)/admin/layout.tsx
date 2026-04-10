import type { Metadata } from "next"
import { AdminProvider } from "@/components/providers/admin-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AdminShell } from "@/components/layout/admin-shell"

export const metadata: Metadata = {
  title: "MHACTO Admin",
  description: "MHACTO Administration Panel — Bocaue, Bulacan",
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <AdminProvider>
        <style>{`body { overflow: hidden; }`}</style>
        <AdminShell>
          {children}
        </AdminShell>
        <Toaster />
      </AdminProvider>
    </ThemeProvider>
  )
}
