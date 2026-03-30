export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-page-transition flex flex-1 min-h-0">
      {children}
    </div>
  )
}
