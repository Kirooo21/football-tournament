import { ReactNode } from 'react'
import AdminNav from '@/components/AdminNav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white">
      <AdminNav />
      {/* The animate-page class is added here */}
      <div className="animate-page">
        {children}
      </div>
    </div>
  )
}