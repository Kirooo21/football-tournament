'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PublicNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Standings', href: '/standings' },
    { name: 'Matches', href: '/matches' },
    { name: 'Top Scorers', href: '/scorers', color: 'text-yellow-500' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex flex-wrap gap-4 md:gap-8 justify-center text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link 
            key={item.name}
            href={item.href} 
            className={`transition-colors pb-1 border-b-2 ${
              isActive 
                ? `text-white border-red-600 ${item.color ? item.color : ''}` // Active state
                : `border-transparent hover:text-white ${item.color ? item.color : ''}` // Inactive state
            }`}
          >
            {item.name}
          </Link>
        )
      })}
      <Link href="/admin" className="hover:text-red-500 transition-colors ml-auto hidden md:block">Admin</Link>
    </nav>
  )
}