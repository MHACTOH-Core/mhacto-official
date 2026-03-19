export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: "admin-fade-in 0.3s cubic-bezier(0.25,0.1,0.25,1) both" }}>
      {children}
    </div>
  )
}
