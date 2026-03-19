export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: "site-curtain 0.6s cubic-bezier(0.22,1,0.36,1) both" }}>
      {children}
    </div>
  )
}
