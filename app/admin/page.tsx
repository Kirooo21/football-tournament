import { logout } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  async function handleLogout() {
    'use server'
    await logout()
    redirect('/admin/login')
  }

  return (
    <div className="p-6 md:p-12 relative overflow-hidden min-h-screen bg-[#050505] text-white">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-8 mb-12 gap-4">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-2">
              Admin <span className="text-red-600">Control</span>
            </h1>
            <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
              System Status: Online
            </p>
          </div>
          
          <form action={handleLogout}>
            <button className="group relative px-6 py-2 bg-transparent border border-gray-700 hover:border-red-500 rounded text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-all duration-300 overflow-hidden">
              <span className="relative z-10">Logout</span>
              <div className="absolute inset-0 bg-red-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </button>
          </form>
        </header>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Manage Teams Card */}
          <Link 
            href="/admin/teams"
            className="group relative bg-[#111] border border-gray-800 rounded-xl p-8 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-green-500 border border-gray-800 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <span className="text-gray-600 group-hover:text-green-500 transition-colors">→</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Manage Teams</h2>
            <p className="text-gray-500 text-sm">Add, edit, or remove teams and rosters.</p>
          </Link>

          {/* Manage Fixtures Card */}
          <Link 
            href="/admin/fixtures"
            className="group relative bg-[#111] border border-gray-800 rounded-xl p-8 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-red-600 border border-gray-800 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <span className="text-gray-600 group-hover:text-red-500 transition-colors">→</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Manage Fixtures</h2>
            <p className="text-gray-500 text-sm">Generate group stages and enter match scores.</p>
          </Link>

          {/* Public Standings Card */}
          <Link 
            href="/standings"
            className="group relative bg-[#111] border border-gray-800 rounded-xl p-8 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-blue-500 border border-gray-800 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
              </div>
              <span className="text-gray-600 group-hover:text-blue-500 transition-colors">→</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Public Standings</h2>
            <p className="text-gray-500 text-sm">View the live table as spectators see it.</p>
          </Link>

        </div>
      </div>
    </div>
  )
}