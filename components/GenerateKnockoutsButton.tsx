'use client'

import { useState } from 'react'
import { generateKnockouts } from '@/lib/actions/teams'

export default function GenerateKnockoutsButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      await generateKnockouts()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end">
      <button 
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)] whitespace-nowrap disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Knockouts'}
      </button>
      {error && <p className="text-red-500 text-xs mt-2 font-bold max-w-xs text-right">{error}</p>}
    </div>
  )
}