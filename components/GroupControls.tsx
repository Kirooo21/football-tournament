'use client'

import { useState } from 'react'
import { deleteGroup } from '@/lib/actions/teams'

export function DeleteGroupButton({ groupName }: { groupName: string }) {
  const [isConfirming, setIsConfirming] = useState(false)

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 bg-black/50 px-2 py-1 rounded">
        <span className="text-xs text-white uppercase font-bold">Sure?</span>
        <button 
          onClick={async () => {
            await deleteGroup(groupName)
            setIsConfirming(false)
          }} 
          className="text-red-500 hover:text-red-400 text-xs font-bold uppercase"
        >
          Yes
        </button>
        <button 
          onClick={() => setIsConfirming(false)} 
          className="text-gray-400 hover:text-white text-xs font-bold uppercase"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button 
      onClick={() => setIsConfirming(true)} 
      className="text-red-300 hover:text-white transition-colors p-1" 
      title="Delete Group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
    </button>
  )
}