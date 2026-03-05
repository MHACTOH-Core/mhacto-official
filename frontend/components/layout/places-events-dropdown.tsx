"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

// Mock data for the dropdown items
const dropdownItems = [
  {
    id: 1,
    title: "History Wonders",
    href: "/places/category/history",
    description: "Explore historical landmarks and heritage sites",
  },
  {
    id: 2,
    title: "Arts and Business Wonders",
    href: "/places/category/arts-business",
    description: "Discover art galleries and business districts",
  },
  {
    id: 3,
    title: "Tourism Wonders",
    href: "/places/category/tourism",
    description: "Visit top tourist attractions and destinations",
  },
  {
    id: 4,
    title: "Culinary Wonders",
    href: "/places/category/culinary",
    description: "Experience local cuisines and dining experiences",
  },
]

interface PlacesEventsDropdownProps {
  isActive: boolean
}

export function PlacesEventsDropdown({ isActive }: PlacesEventsDropdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative"
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`text-sm lg:text-base font-medium transition-colors flex items-center gap-1 hover:text-primary ${
              isActive ? "text-primary" : "text-foreground"
            }`}
            aria-label="Places & Events menu"
          >
            Places & Events
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-full sm:w-72 md:w-80">
          <div className="p-2 space-y-1">
            {dropdownItems.map((item) => (
              <DropdownMenuItem key={item.id} asChild>
                <Link
                  href={item.href}
                  className="w-full p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-sm text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
