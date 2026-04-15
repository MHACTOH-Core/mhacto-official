/**
 * credits.test.ts
 *
 * Enforces that the developer team credit link and page are never accidentally
 * (or intentionally) removed from the codebase.
 *
 * These tests run as part of the pre-commit hook and should be included in any
 * CI pipeline before merging to main/development.
 *
 * ⚠️  DO NOT DELETE OR MODIFY these tests without team consensus.
 *     Removing the developer credits violates the project agreement between
 *     MHACTO and STI College Balagtas.
 */

import { readFileSync } from "fs"
import { resolve } from "path"
import { describe, it, expect } from "vitest"

const ROOT = resolve(__dirname, "../../")

function read(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), "utf-8")
}

describe("Developer Credits — must never be removed", () => {
  it("footer.tsx contains the /developers link", () => {
    const footer = read("components/layout/footer.tsx")
    expect(footer).toContain('href="/developers"')
  })

  it("footer.tsx contains the 'Meet the Dev Team' text", () => {
    const footer = read("components/layout/footer.tsx")
    expect(footer).toContain("Meet the Dev Team")
  })

  it("footer.tsx contains the STI College Balagtas partnership notice", () => {
    const footer = read("components/layout/footer.tsx")
    expect(footer).toContain("STI")
  })

  it("developers page (app/developers/page.tsx) still exists and is non-empty", () => {
    const page = read("app/developers/page.tsx")
    expect(page.length).toBeGreaterThan(200)
  })

  it("developers page renders developer team content", () => {
    const page = read("app/developers/page.tsx")
    // Must contain at least one developer name or team-related keyword
    expect(page.toLowerCase()).toMatch(/developer|team|built by|created by|sti/i)
  })
})
