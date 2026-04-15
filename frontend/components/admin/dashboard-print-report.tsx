"use client"

import { forwardRef } from "react"
import { resolveMediaUrl } from "@/lib/utils"
import {
  inquiryStatusLabels,
  inquiryTypeLabels,
  type InquiryStatus,
  type InquiryType,
} from "@/lib/data/admin-data"
import { format, parseISO } from "date-fns"

type ReportProps = {
  statCards: { label: string; value: number }[]
  pieData: { name: string; value: number }[]
  pieTotal: number
  topPages: { title: string; views: number }[]
  inquiryByType: { type: string; count: number; label: string }[]
  inquiryByStatus: { status: string; count: number; label: string }[]
  totalActiveInquiries: number
  recentActivity: { id: string; description: string; timestamp: string }[]
  generatedBy: string
  reportPeriod?: string
}

const DashboardPrintReport = forwardRef<HTMLDivElement, ReportProps>(
  (
    {
      statCards,
      pieData,
      pieTotal,
      topPages,
      inquiryByType,
      inquiryByStatus,
      totalActiveInquiries,
      recentActivity,
      generatedBy,
      reportPeriod,
    },
    ref,
  ) => {
    const now = new Date()
    const dateStr = format(now, "MMMM d, yyyy")
    const timeStr = format(now, "h:mm a")

    return (
      <div ref={ref} className="print-report">
        {/* ── Letterhead ── */}
        <div className="report-header">
          <img
            src={resolveMediaUrl("/uploads/images/logos/MHACTO_LOGO.png")}
            alt="MHACTo Logo"
            className="report-logo"
          />
          <div className="report-header-text">
            <p className="report-govt">Republic of the Philippines</p>
            <p className="report-municipality">Municipality of Bocaue, Bulacan</p>
            <h1 className="report-title">MHACTO Dashboard Summary Report</h1>
            <p className="report-date">
              Generated on {dateStr} at {timeStr}
            </p>
            {reportPeriod && (
              <p className="report-date" style={{ fontWeight: 600, marginTop: 4 }}>
                Report Period: {reportPeriod}
              </p>
            )}
          </div>
          <img
            src={resolveMediaUrl("/uploads/images/logos/Municipality_of_bocaue.png")}
            alt="Municipality of Bocaue Logo"
            className="report-logo"
          />
        </div>

        <hr className="report-divider" />

        {/* ── Section 1: Visitor Statistics ── */}
        <section className="report-section">
          <h2 className="report-section-title">I. Visitor Statistics</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {statCards.map((s) => (
                <tr key={s.label}>
                  <td>{s.label}</td>
                  <td>{s.value.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="report-total-row">
                <td><strong>Total Visitors</strong></td>
                <td><strong>{pieTotal.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ── Section 2: Visitor Engagement Breakdown ── */}
        <section className="report-section">
          <h2 className="report-section-title">II. Visitor Engagement Breakdown</h2>
          <table className="report-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {pieData.map((d) => {
                const pct = pieTotal > 0 ? ((d.value / pieTotal) * 100).toFixed(1) : "0.0"
                return (
                  <tr key={d.name}>
                    <td>{d.name}</td>
                    <td>{d.value.toLocaleString()}</td>
                    <td>{pct}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* ── Section 3: Most Popular Pages ── */}
        <section className="report-section">
          <h2 className="report-section-title">III. Most Popular Pages</h2>
          {topPages.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Page</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {topPages.slice(0, 10).map((p, i) => (
                  <tr key={p.title}>
                    <td>{i + 1}</td>
                    <td>{p.title}</td>
                    <td>{p.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="report-empty">No page view data available.</p>
          )}
        </section>

        {/* ── Section 4: Inquiry Summary ── */}
        <section className="report-section">
          <h2 className="report-section-title">IV. Inquiry Summary</h2>
          <p className="report-stat-line">
            Total Active Inquiries: <strong>{totalActiveInquiries}</strong>
          </p>

          <h3 className="report-subsection-title">By Type</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {inquiryByType.map((t) => {
                const pct =
                  totalActiveInquiries > 0
                    ? ((t.count / totalActiveInquiries) * 100).toFixed(1)
                    : "0.0"
                return (
                  <tr key={t.type}>
                    <td>{t.label}</td>
                    <td>{t.count}</td>
                    <td>{pct}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <h3 className="report-subsection-title">By Status</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {inquiryByStatus.map((s) => (
                <tr key={s.status}>
                  <td>{s.label}</td>
                  <td>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Section 5: Recent Activity ── */}
        <section className="report-section">
          <h2 className="report-section-title">V. Recent Activity Log</h2>
          {recentActivity.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Activity</th>
                  <th>Date &amp; Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((entry, i) => (
                  <tr key={entry.id}>
                    <td>{i + 1}</td>
                    <td>{entry.description}</td>
                    <td>{format(parseISO(entry.timestamp), "MMM d, yyyy · h:mm a")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="report-empty">No recent activity.</p>
          )}
        </section>

        {/* ── Footer ── */}
        <hr className="report-divider" />
        <div className="report-footer">
          <p>
            Prepared by: <strong>{generatedBy}</strong>
          </p>
          <p className="report-confidential">CONFIDENTIAL — For internal use only</p>
        </div>
      </div>
    )
  },
)

DashboardPrintReport.displayName = "DashboardPrintReport"
export default DashboardPrintReport
