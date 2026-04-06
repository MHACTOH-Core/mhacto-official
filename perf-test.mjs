/**
 * MHACTO API + System Performance Test
 *
 * Tests:
 *   1. Baseline system resource snapshot (CPU, RAM, disk)
 *   2. Single-request latency per API endpoint (20 req each → min/avg/p95/max)
 *   3. Concurrent load simulation (10 → 25 → 50 concurrent users)
 *   4. System resource usage mid-load
 *   5. POST /api/inquiries throughput (public write path)
 *   6. Frontend Next.js page load timing
 *
 * Run:  node perf-test.mjs
 */

import { readFileSync } from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const PHP_BASE = 'http://localhost:8000'
const NEXT_BASE = 'http://localhost:3000'

// ANSI colours
const C = {
  reset: '\x1b[0m',
  bold:  '\x1b[1m',
  dim:   '\x1b[2m',
  green: '\x1b[32m',
  yellow:'\x1b[33m',
  red:   '\x1b[31m',
  cyan:  '\x1b[36m',
  blue:  '\x1b[34m',
  white: '\x1b[37m',
}

function colour(val, warn, crit) {
  if (val >= crit) return `${C.red}${val}${C.reset}`
  if (val >= warn) return `${C.yellow}${val}${C.reset}`
  return `${C.green}${val}${C.reset}`
}

function label(text) {
  const pad = 60
  const line = '─'.repeat(pad)
  console.log(`\n${C.bold}${C.cyan}┌${line}┐${C.reset}`)
  console.log(`${C.bold}${C.cyan}│${C.reset} ${C.bold}${text.padEnd(pad - 2)}${C.reset} ${C.cyan}│${C.reset}`)
  console.log(`${C.bold}${C.cyan}└${line}┘${C.reset}`)
}

function bar(val, max = 100, width = 30) {
  const filled = Math.round((val / max) * width)
  const empty  = width - filled
  const block  = '█'.repeat(Math.max(0, filled))
  const space  = '░'.repeat(Math.max(0, empty))
  const pct    = `${val.toFixed(1)}%`
  const barStr = `${block}${space}`
  if (val >= 80) return `${C.red}${barStr}${C.reset} ${C.red}${pct}${C.reset}`
  if (val >= 50) return `${C.yellow}${barStr}${C.reset} ${C.yellow}${pct}${C.reset}`
  return `${C.green}${barStr}${C.reset} ${C.green}${pct}${C.reset}`
}

// ── System resources ────────────────────────────────────────────────────
async function getSystemResources() {
  const [cpuOut, memOut, diskOut, phpOut, nextOut] = await Promise.all([
    execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2+$4}'").catch(() => ({ stdout: '?' })),
    execAsync("free -m | awk '/^Mem:/{print $2, $3, $4}'").catch(() => ({ stdout: '?' })),
    execAsync("df -h / | awk 'NR==2{print $2, $3, $5}'").catch(() => ({ stdout: '?' })),
    execAsync("ps aux | grep 'php -S' | grep -v grep | awk '{sum+=$3} END{printf \"%.1f\", sum}'").catch(() => ({ stdout: '0.0' })),
    execAsync("ps aux | grep 'next-server' | grep -v grep | awk '{sum+=$3} END{printf \"%.1f\", sum}'").catch(() => ({ stdout: '0.0' })),
  ])

  const cpuPct  = parseFloat(cpuOut.stdout.trim()) || 0
  const [memTotal, memUsed, memFree] = (memOut.stdout.trim().split(' ')).map(Number)
  const memPct  = (memUsed / memTotal) * 100
  const [diskTotal, diskUsed, diskPct] = diskOut.stdout.trim().split(' ')

  return { cpuPct, memTotal, memUsed, memFree, memPct, diskTotal, diskUsed, diskPct, phpCpu: phpOut.stdout.trim(), nextCpu: nextOut.stdout.trim() }
}

function printResources(r, tag = '') {
  console.log(`\n  ${C.bold}System Resources${tag ? ' — ' + tag : ''}${C.reset}`)
  console.log(`  CPU Usage   ${bar(r.cpuPct)}`)
  console.log(`  RAM Usage   ${bar(r.memPct)}  (${r.memUsed} / ${r.memTotal} MB — ${r.memFree} MB free)`)
  console.log(`  Disk (/)    ${r.diskUsed} used of ${r.diskTotal}  (${r.diskPct})`)
  console.log(`  PHP-backend CPU share : ${C.bold}${r.phpCpu}%${C.reset}`)
  console.log(`  Next.js CPU share     : ${C.bold}${r.nextCpu}%${C.reset}`)
}

// ── Single timed fetch with abort ───────────────────────────────────────
async function timedFetch(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const t0 = performance.now()
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    const body = await res.text()
    const ms = performance.now() - t0
    return { ok: res.ok || res.status < 500, status: res.status, ms, bytes: body.length, error: null }
  } catch (err) {
    const ms = performance.now() - t0
    return { ok: false, status: 0, ms, bytes: 0, error: err.name === 'AbortError' ? 'TIMEOUT' : err.message }
  } finally {
    clearTimeout(timer)
  }
}

// ── Statistical helpers ─────────────────────────────────────────────────
function stats(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const sum = arr.reduce((s, v) => s + v, 0)
  const avg = sum / arr.length
  const p95 = sorted[Math.ceil(arr.length * 0.95) - 1]
  const p99 = sorted[Math.ceil(arr.length * 0.99) - 1]
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg,
    p95,
    p99,
    count: arr.length,
  }
}

// ── Sequential latency test (N serial requests) ─────────────────────────
async function sequentialLatency(name, url, n = 20, options = {}) {
  const times = []
  const statuses = []
  const errors = []
  for (let i = 0; i < n; i++) {
    const r = await timedFetch(url, options)
    times.push(r.ms)
    statuses.push(r.status)
    if (r.error) errors.push(r.error)
  }
  const s = stats(times)
  const ok = statuses.filter(c => c >= 200 && c < 500).length
  const errLabel = errors.length ? ` ${C.red}[${errors[0]}]${C.reset}` : ''
  const grade = s.avg < 50 ? '●' : s.avg < 150 ? '●' : s.avg < 400 ? '●' : '●'
  const gradeColour = s.avg < 50 ? C.green : s.avg < 150 ? C.green : s.avg < 400 ? C.yellow : C.red

  console.log(
    `  ${C.bold}${name.padEnd(38)}${C.reset}` +
    `  min:${colour(s.min.toFixed(0), 150, 400).padEnd(17)}` +
    `  avg:${colour(s.avg.toFixed(0), 150, 400).padEnd(17)}` +
    `  p95:${colour(s.p95.toFixed(0), 300, 600).padEnd(17)}` +
    `  max:${colour(s.max.toFixed(0), 500, 1000).padEnd(17)}` +
    `  ok:${ok}/${n}${errLabel}`
  )
  return s
}

// ── Concurrent load burst ───────────────────────────────────────────────
async function concurrentBurst(name, url, concurrency, totalRequests) {
  const allTimes = []
  const allStatuses = []
  let errors = 0
  let idx = 0
  const wallStart = performance.now()

  async function worker() {
    while (idx < totalRequests) {
      idx++
      const r = await timedFetch(url)
      allTimes.push(r.ms)
      allStatuses.push(r.status)
      if (!r.ok) errors++
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  const wallMs = performance.now() - wallStart
  const rps = (totalRequests / (wallMs / 1000)).toFixed(1)
  const s = stats(allTimes)
  const ok = allStatuses.filter(c => c >= 200 && c < 500).length

  const rpsColour = parseFloat(rps) >= 20 ? C.green : parseFloat(rps) >= 8 ? C.yellow : C.red

  console.log(
    `  ${C.bold}${name.padEnd(22)}${C.reset}` +
    `  c:${String(concurrency).padEnd(4)}` +
    `  total:${String(totalRequests).padEnd(5)}` +
    `  avg:${colour(s.avg.toFixed(0), 300, 800).padEnd(17)}` +
    `  p95:${colour(s.p95.toFixed(0), 600, 1200).padEnd(17)}` +
    `  rps:${rpsColour}${rps}${C.reset}` +
    `  ok:${ok}/${totalRequests}` +
    (errors ? `  ${C.red}err:${errors}${C.reset}` : '')
  )
  return { s, rps: parseFloat(rps), errors, ok }
}

// ────────────────────────────────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────────────────────────────────
async function main() {
  const startTime = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })
  console.log(`\n${C.bold}${C.blue}═══════════════════════════════════════════════════════╗${C.reset}`)
  console.log(`${C.bold}${C.blue}  MHACTO Performance Test Report${C.reset}`)
  console.log(`${C.bold}${C.blue}  ${startTime}${C.reset}`)
  console.log(`${C.bold}${C.blue}  PHP  → ${PHP_BASE}${C.reset}`)
  console.log(`${C.bold}${C.blue}  Next → ${NEXT_BASE}${C.reset}`)
  console.log(`${C.bold}${C.blue}═══════════════════════════════════════════════════════╝${C.reset}`)

  // ── 1. BASELINE RESOURCES ──────────────────────────────────────────────
  label('1 · BASELINE SYSTEM RESOURCES')
  const baseline = await getSystemResources()
  printResources(baseline, 'idle')

  const HEADERS = { headers: { 'Accept': 'application/json' } }

  // ── 2. SEQUENTIAL LATENCY — PHP API ────────────────────────────────────
  label('2 · PHP API ENDPOINT LATENCY  (20 serial requests each)')
  console.log(`\n  ${'Endpoint'.padEnd(38)}  ${'min(ms)'.padEnd(10)}  ${'avg(ms)'.padEnd(10)}  ${'p95(ms)'.padEnd(10)}  ${'max(ms)'.padEnd(10)}  success`)
  console.log('  ' + '─'.repeat(120))

  await sequentialLatency('GET /api/posts [label=schools]',
    `${PHP_BASE}/api/posts?label=schools&status=published`, 20, HEADERS)
  await sequentialLatency('GET /api/posts [label=hospitals]',
    `${PHP_BASE}/api/posts?label=hospitals&status=published`, 20, HEADERS)
  await sequentialLatency('GET /api/posts [label=destinations]',
    `${PHP_BASE}/api/posts?label=destinations&status=published`, 20, HEADERS)
  await sequentialLatency('GET /api/posts [label=news]',
    `${PHP_BASE}/api/posts?label=news&status=published`, 20, HEADERS)
  await sequentialLatency('GET /api/posts [label=events]',
    `${PHP_BASE}/api/posts?label=events&status=published`, 20, HEADERS)
  await sequentialLatency('GET /api/posts [label=travel-tours]',
    `${PHP_BASE}/api/posts?label=travel-tours&status=published`, 20, HEADERS)
  await sequentialLatency('GET /api/posts [all published]',
    `${PHP_BASE}/api/posts?status=published`, 20, HEADERS)
  await sequentialLatency('GET /api/home',
    `${PHP_BASE}/api/home`, 20, HEADERS)
  await sequentialLatency('GET /api/settings',
    `${PHP_BASE}/api/settings`, 20, HEADERS)
  await sequentialLatency('GET /api/heroes',
    `${PHP_BASE}/api/heroes`, 20, HEADERS)
  await sequentialLatency('GET /api/destinations',
    `${PHP_BASE}/api/destinations`, 20, HEADERS)
  await sequentialLatency('GET /api/tour_guides',
    `${PHP_BASE}/api/tour_guides`, 20, HEADERS)
  await sequentialLatency('GET /api/analytics/dashboard',
    `${PHP_BASE}/api/analytics/dashboard`, 20, HEADERS)

  // ── 3. PUBLIC WRITE — POST /api/inquiries ──────────────────────────────
  label('3 · PUBLIC WRITE   POST /api/inquiries')
  console.log(`\n  ${'Endpoint'.padEnd(38)}  ${'min(ms)'.padEnd(10)}  ${'avg(ms)'.padEnd(10)}  ${'p95(ms)'.padEnd(10)}  ${'max(ms)'.padEnd(10)}  success`)
  console.log('  ' + '─'.repeat(120))

  await sequentialLatency('POST /api/inquiries [tour_booking]',
    `${PHP_BASE}/api/inquiries`, 10, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        inquiry_type: 'tour_booking',
        full_name: 'Perf Test User',
        email_address: `perf.test+${Date.now()}@test.com`,
        contact_number: '+639170000000',
        date_of_visit: '2026-07-15',
        number_of_pax: 5,
        message: 'Performance test inquiry — please ignore.',
        additional_details: { visitorType: 'tourist', purposeOfVisit: 'Perf Test' }
      })
    })

  // ── 4. NEXT.JS PAGE LOAD TIMING ────────────────────────────────────────
  label('4 · NEXT.JS PAGE LOAD LATENCY  (10 serial requests each)')
  console.log(`\n  ${'Page'.padEnd(38)}  ${'min(ms)'.padEnd(10)}  ${'avg(ms)'.padEnd(10)}  ${'p95(ms)'.padEnd(10)}  ${'max(ms)'.padEnd(10)}  success`)
  console.log('  ' + '─'.repeat(120))

  await sequentialLatency('GET / (home)',
    `${NEXT_BASE}/`, 10)
  await sequentialLatency('GET /community/schools',
    `${NEXT_BASE}/community/schools`, 10)
  await sequentialLatency('GET /community/hospitals',
    `${NEXT_BASE}/community/hospitals`, 10)
  await sequentialLatency('GET /destinations',
    `${NEXT_BASE}/destinations`, 10)
  await sequentialLatency('GET /news',
    `${NEXT_BASE}/news`, 10)
  await sequentialLatency('GET /events',
    `${NEXT_BASE}/events`, 10)
  await sequentialLatency('GET /inquire',
    `${NEXT_BASE}/inquire`, 10)

  // ── 5. CONCURRENT LOAD TEST — PHP API ─────────────────────────────────
  label('5 · CONCURRENT LOAD TEST  (escalating concurrency)')
  console.log(`\n  Resources BEFORE load test:`)
  const beforeLoad = await getSystemResources()
  printResources(beforeLoad, 'pre-load')

  console.log(`\n  ${'Target'.padEnd(22)}  ${'c'.padEnd(6)}  ${'total'.padEnd(7)}  ${'avg(ms)'.padEnd(10)}  ${'p95(ms)'.padEnd(10)}  rps        ok/total`)
  console.log('  ' + '─'.repeat(100))

  const endpointToLoad = `${PHP_BASE}/api/posts?label=destinations&status=published`
  const endpointName   = '/api/posts[destinations]'

  await concurrentBurst(endpointName, endpointToLoad, 5, 50)
  await concurrentBurst(endpointName, endpointToLoad, 10, 100)
  await concurrentBurst(endpointName, endpointToLoad, 25, 200)
  await concurrentBurst(endpointName, endpointToLoad, 50, 400)

  // Resources mid load
  console.log(`\n  Resources AFTER load test:`)
  const afterLoad = await getSystemResources()
  printResources(afterLoad, 'post-load')

  // CPU delta
  const cpuDelta = afterLoad.cpuPct - baseline.cpuPct
  const memDelta = afterLoad.memUsed - baseline.memUsed
  console.log(`\n  ${C.bold}Delta from baseline:${C.reset}`)
  console.log(`  CPU  : ${cpuDelta >= 0 ? '+' : ''}${cpuDelta.toFixed(1)}%   (baseline ${baseline.cpuPct.toFixed(1)}% → peak ${afterLoad.cpuPct.toFixed(1)}%)`)
  console.log(`  RAM  : ${memDelta >= 0 ? '+' : ''}${memDelta} MB   (baseline ${baseline.memUsed} MB → peak ${afterLoad.memUsed} MB)`)

  // ── 6. CONCURRENT HOME PAGE (full stack request chain) ──────────────────
  label('6 · FULL-STACK LOAD  (Next.js → PHP API → MariaDB)')
  console.log(`\n  Target: GET /api/home  (queries 5 DB tables in one request)`)
  console.log(`\n  ${'Target'.padEnd(22)}  ${'c'.padEnd(6)}  ${'total'.padEnd(7)}  ${'avg(ms)'.padEnd(10)}  ${'p95(ms)'.padEnd(10)}  rps        ok/total`)
  console.log('  ' + '─'.repeat(100))

  await concurrentBurst('GET /api/home', `${PHP_BASE}/api/home`, 5,  50)
  await concurrentBurst('GET /api/home', `${PHP_BASE}/api/home`, 10, 100)
  await concurrentBurst('GET /api/home', `${PHP_BASE}/api/home`, 25, 200)

  // ── 7. SUMMARY ────────────────────────────────────────────────────────
  label('7 · PERFORMANCE SUMMARY')
  const final = await getSystemResources()
  printResources(final, 'final idle')

  console.log(`\n  ${C.bold}Thresholds used:${C.reset}`)
  console.log(`  ${C.green}●${C.reset} Green   avg < 150ms   p95 < 300ms   rps ≥ 20`)
  console.log(`  ${C.yellow}●${C.reset} Yellow  avg < 400ms   p95 < 600ms   rps ≥ 8`)
  console.log(`  ${C.red}●${C.reset} Red     avg ≥ 400ms   p95 ≥ 600ms   rps < 8`)
  console.log(`\n  ${C.dim}All times in milliseconds. Tests ran from localhost (no network latency).${C.reset}`)
  console.log(`  ${C.dim}PHP built-in server is single-threaded — concurrent rps is intentionally lower${C.reset}`)
  console.log(`  ${C.dim}than production Apache/Nginx with PHP-FPM.${C.reset}\n`)
}

main().catch(err => {
  console.error(`\n${C.red}Fatal: ${err.message}${C.reset}`)
  process.exit(1)
})
