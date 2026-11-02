'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const success = await login(password)
      if (success) {
        router.push('/admin')
        router.refresh() 
      } else {
        setError('Access Denied.')
        setLoading(false)
      }
    } catch (err) {
      setError('System Error.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm bg-[#111] border border-gray-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">Admin <span className="text-red-600">Login</span></h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest font-mono mt-2">Restricted Access</p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <input
              type="password"
              placeholder="Enter Access Code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg bg-black text-white border border-gray-700 focus:outline-none focus:border-red-500 transition-colors placeholder:text-gray-600 font-mono"
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm font-bold text-center animate-pulse">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}