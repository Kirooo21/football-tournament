'use client'

import { deleteTeam, deletePlayer } from '@/lib/actions/teams'

export function DeleteTeamButton({ teamId }: { teamId: string }) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this team and ALL its players?')) {
      await deleteTeam(teamId)
    }
  }
  return (
    <button onClick={handleDelete} className="text-red-500 hover:text-red-400 text-sm p-1" title="Delete Team">🗑️</button>
  )
}

export function DeletePlayerButton({ playerId }: { playerId: string }) {
  const handleDelete = async () => {
    if (confirm('Delete this player?')) {
      await deletePlayer(playerId)
    }
  }
  return (
    <button onClick={handleDelete} className="text-red-500 hover:text-red-400 text-sm p-1 opacity-50 hover:opacity-100 transition-opacity" title="Delete Player">✕</button>
  )
}