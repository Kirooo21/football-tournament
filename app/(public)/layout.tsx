import { ReactNode } from 'react'
import PublicNav from '@/components/PublicNav'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white">
      <PublicNav />
      {/* The animate-page class is added here */}
      <div className="animate-page">
        {children}
      </div>
    </div>
  )
}