export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-page-transition">
      {children}
    </div>
  )
}
