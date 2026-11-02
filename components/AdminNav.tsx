'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Teams', href: '/admin/teams' },
    { name: 'Manage Fixtures', href: '/admin/fixtures' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex flex-wrap gap-4 md:gap-8 justify-center text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
      {navItems.map((item) => {
        // Check if active (exact match for dashboard, startsWith for others)
        const isActive = item.href === '/admin' 
          ? pathname === '/admin' 
          : pathname.startsWith(item.href)

        return (
          <Link 
            key={item.name}
            href={item.href} 
            className={`transition-colors pb-1 border-b-2 ${
              isActive 
                ? 'text-white border-red-600' 
                : 'border-transparent hover:text-white'
            }`}
          >
            {item.name}
          </Link>
        )
      })}
      
      <div className="w-px h-5 bg-gray-700 hidden md:block"></div>
      
      <Link href="/" className="hover:text-white transition-colors text-gray-500">Public Site ↗</Link>
    </nav>
  )
}