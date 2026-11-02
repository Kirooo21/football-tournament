'use client'

import { useState } from 'react'
import { updateTeam, updatePlayer } from '@/lib/actions/teams'

// We'll share a common modal wrapper to make the code cleaner
function Modal({ title, onClose, onSave, children }: { title: string, onClose: () => void, onSave: () => void, children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-gray-700 p-6 rounded-xl w-full max-w-sm shadow-2xl">
        <h3 className="text-xl font-black uppercase tracking-wider mb-6 text-white border-b border-gray-800 pb-2">{title}</h3>
        {children}
        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-5 py-2 rounded font-bold uppercase tracking-wider text-xs text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={onSave} className="px-5 py-2 rounded bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-wider text-xs transition-colors shadow-lg">Save</button>
        </div>
      </div>
    </div>
  )
}

export function EditTeamButton({ teamId, currentName, currentGroup }: { teamId: string, currentName: string, currentGroup: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(currentName)
  const [group, setGroup] = useState(currentGroup)

  const handleSave = async () => {
    if (!name.trim()) return
    await updateTeam(teamId, name, group)
    setIsOpen(false)
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-gray-400 hover:text-white text-sm p-1 transition-colors" title="Edit Team">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
      </button>

      {isOpen && (
        <Modal title="Edit Team" onClose={() => setIsOpen(false)} onSave={handleSave}>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 mb-4 rounded bg-black text-white border border-gray-700 focus:outline-none focus:border-red-500" />
          <select value={group} onChange={e => setGroup(e.target.value)} className="w-full p-3 rounded bg-black text-white border border-gray-700 focus:outline-none focus:border-red-500 font-bold uppercase tracking-wider">
            <option value="A">Group A</option>
            <option value="B">Group B</option>
          </select>
        </Modal>
      )}
    </>
  )
}

export function EditPlayerButton({ playerId, currentName }: { playerId: string, currentName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(currentName)

  const handleSave = async () => {
    if (!name.trim()) return
    await updatePlayer(playerId, name)
    setIsOpen(false)
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-gray-500 hover:text-white text-xs p-1 transition-colors" title="Edit Player">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
      </button>

      {isOpen && (
        <Modal title="Edit Player" onClose={() => setIsOpen(false)} onSave={handleSave}>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded bg-black text-white border border-gray-700 focus:outline-none focus:border-red-500" />
        </Modal>
      )}
    </>
  )
}