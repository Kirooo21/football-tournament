'use client'

import { useState } from 'react'
import { generateFinal } from '@/lib/actions/teams'

export default function GenerateFinalButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      await generateFinal()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center mt-8">
      <button 
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="bg-yellow-600 hover:bg-yellow-500 text-black px-8 py-4 rounded-lg font-black uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(202,138,4,0.4)] disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Final Match'}
      </button>
      {error && <p className="text-red-500 text-sm mt-3 font-bold max-w-md text-center">{error}</p>}
    </div>
  )
}