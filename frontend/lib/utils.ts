import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/MHACTO-PROJECT'

/** Prefix a public asset path with the basePath so it resolves on GitHub Pages */
export function asset(path: string): string {
  if (!path.startsWith('/')) return path
  return `${BASE_PATH}${path}`
}
