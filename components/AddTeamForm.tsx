'use client'

import { useState } from 'react'
import { addTeam } from '@/lib/actions/teams'

export default function AddTeamForm() {
  const [group, setGroup] = useState('A')
  const [teamName, setTeamName] = useState('')

  async function handleSubmit(formData: FormData) {
    formData.set('group_name', group)
    await addTeam(formData)
    setTeamName('') 
  }

  return (
    <form action={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center">
      <input 
        type="text" 
        name="name" 
        placeholder="Enter Team Name" 
        required
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        className="p-3 rounded bg-black border border-gray-700 focus:outline-none focus:border-red-500 flex-1 w-full text-white placeholder-gray-600 transition-colors"
      />
      
      {/* Changed from select to text input so you can type any group */}
      <input 
        type="text" 
        name="group_name" 
        placeholder="Group (e.g. A)" 
        required
        value={group}
        onChange={(e) => setGroup(e.target.value.toUpperCase())}
        maxLength={2}
        className="p-3 rounded bg-black border border-gray-700 focus:outline-none focus:border-red-500 text-white font-bold uppercase tracking-wider w-full md:w-32 text-center"
      />

      <button type="submit" className="bg-red-700 hover:bg-red-600 text-white px-8 py-3 rounded font-black uppercase tracking-widest transition-colors w-full md:w-auto shadow-[0_0_15px_rgba(220,38,38,0.3)]">
        Add Team
      </button>
    </form>
  )
}