'use client'

import { useState, useRef } from 'react'
import { updateMatchScore } from '@/lib/actions/teams'
import { useRouter } from 'next/navigation'
import Pitch from './Pitch'

type Player = { id: string; name: string; team_id: string }
type Event = { id: string; player_id: string; kind: string }

export default function MatchForm({ match, players, initialEvents }: { match: any, players: Player[], initialEvents: Event[] }) {
  const [events, setEvents] = useState<Event[]>(initialEvents || [])
  const [homeScore, setHomeScore] = useState<string>(match.home_score?.toString() || '0')
  const [awayScore, setAwayScore] = useState<string>(match.away_score?.toString() || '0')
  
  // State to handle scoreboard scoring popup
  const [scoringTeam, setScoringTeam] = useState<'home' | 'away' | null>(null)

  const router = useRouter()
  const isKnockout = match.stage !== 'group'
  
  const homePlayers = players.filter(p => p.team_id === match.home_team_id)
  const awayPlayers = players.filter(p => p.team_id === match.away_team_id)

  // Detect manual score input
  const handleHomeScoreChange = (val: string) => {
    const newVal = parseInt(val) || 0
    const oldVal = parseInt(homeScore) || 0
    setHomeScore(val)
    if (newVal > oldVal) setScoringTeam('home') // Open popup if score increases
  }

  const handleAwayScoreChange = (val: string) => {
    const newVal = parseInt(val) || 0
    const oldVal = parseInt(awayScore) || 0
    setAwayScore(val)
    if (newVal > oldVal) setScoringTeam('away') // Open popup if score increases
  }

  // Pitch click handler
  const handleAddEvent = (playerId: string, kind: string) => {
    setEvents([...events, { id: crypto.randomUUID(), player_id: playerId, kind }])
    
    if (kind === 'goal') {
      const isHomePlayer = homePlayers.some(p => p.id === playerId)
      if (isHomePlayer) setHomeScore(prev => (parseInt(prev) + 1).toString())
      else setAwayScore(prev => (parseInt(prev) + 1).toString())
    }
  }

  const handleRemoveEvent = (id: string) => {
    const eventToRemove = events.find(e => e.id === id)
    if (eventToRemove && eventToRemove.kind === 'goal') {
      const isHomePlayer = homePlayers.some(p => p.id === eventToRemove.player_id)
      if (isHomePlayer) setHomeScore(prev => Math.max(0, parseInt(prev) - 1).toString())
      else setAwayScore(prev => Math.max(0, parseInt(prev) - 1).toString())
    }
    setEvents(events.filter(e => e.id !== id))
  }

  // Handler for selecting scorer from Scoreboard Modal
  const assignGoalToPlayer = (playerId: string) => {
    setEvents([...events, { id: crypto.randomUUID(), player_id: playerId, kind: 'goal' }])
    setScoringTeam(null) // Close modal
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    formData.set('home_score', homeScore)
    formData.set('away_score', awayScore)
    formData.set('events', JSON.stringify(events.map(ev => ({ player_id: ev.player_id, kind: ev.kind }))))
    
    await updateMatchScore(formData)
    router.push('/admin/fixtures')
  }

  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown'

  return (
    <div className="space-y-6">
      
      {/* SCOREBOARD MODAL (Triggers when score is increased manually) */}
      {scoringTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-gray-700 p-6 rounded-xl shadow-2xl w-full max-w-sm animate-in zoom-in duration-200">
            <h3 className="text-xl font-black text-center mb-2 text-white uppercase tracking-wider">Who Scored?</h3>
            <p className="text-xs text-center text-gray-500 mb-6 uppercase tracking-widest">
              Select the player for {scoringTeam === 'home' ? match.home_team.name : match.away_team.name}
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {(scoringTeam === 'home' ? homePlayers : awayPlayers).map(player => (
                <button 
                  key={player.id}
                  type="button" 
                  onClick={() => assignGoalToPlayer(player.id)}
                  className="w-full text-left bg-gray-800 hover:bg-red-900/40 border border-gray-700 hover:border-red-500 px-4 py-3 rounded-lg font-bold text-sm transition-colors flex justify-between items-center group"
                >
                  {player.name}
                  <span className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">⚽</span>
                </button>
              ))}
              {(scoringTeam === 'home' ? homePlayers : awayPlayers).length === 0 && (
                <p className="text-center text-gray-500 text-sm italic py-4">No players in this team.</p>
              )}
            </div>

            <button 
              type="button" 
              onClick={() => setScoringTeam(null)} 
              className="mt-6 w-full bg-black text-gray-400 hover:text-white hover:bg-gray-900 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Skip (Own Goal / Unknown)
            </button>
          </div>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="match_id" value={match.id} />
        
        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-red-900/20 border-b border-red-900/50 px-6 py-2 flex justify-between items-center">
            <span className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">
              {match.stage === 'group' ? `Group ${match.group_name} - Match ${match.round}` : match.stage.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Live Match Center</span>
          </div>

          <div className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 w-full">
              <span className="text-xl md:text-2xl font-black uppercase tracking-wide mb-4 text-center truncate w-full">{match.home_team.name}</span>
              
              <div className="flex items-center gap-4">
<button type="button" onClick={() => handleHomeScoreChange(Math.max(0, parseInt(homeScore) - 1).toString())} className="w-8 h-8 rounded-full bg-gray-800 text-white font-bold hover:bg-gray-700">-</button>
                <input 
                  type="number" 
                  name="home_score" 
                  value={homeScore} 
                  onChange={e => handleHomeScoreChange(e.target.value)} 
                  min="0" 
                  required
                  className="w-24 h-24 md:w-28 md:h-28 text-center text-5xl md:text-6xl font-black bg-black border-2 border-gray-700 rounded-2xl focus:border-red-600 focus:outline-none transition-colors" 
                />
<button type="button" onClick={() => handleHomeScoreChange((parseInt(homeScore) + 1).toString())} className="w-8 h-8 rounded-full bg-gray-800 text-white font-bold hover:bg-gray-700">+</button>
              </div>
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-inner">
                <span className="text-lg font-black text-gray-500 italic">VS</span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 w-full">
              <span className="text-xl md:text-2xl font-black uppercase tracking-wide mb-4 text-center truncate w-full">{match.away_team.name}</span>
              
              <div className="flex items-center gap-4">
                 <button type="button" onClick={() => handleAwayScoreChange(Math.max(0, parseInt(awayScore) - 1).toString())} className="w-8 h-8 rounded-full bg-gray-800 text-white font-bold hover:bg-gray-700">-</button>
                <input 
                  type="number" 
                  name="away_score" 
                  value={awayScore} 
                  onChange={e => handleAwayScoreChange(e.target.value)} 
                  min="0" 
                  required
                  className="w-24 h-24 md:w-28 md:h-28 text-center text-5xl md:text-6xl font-black bg-black border-2 border-gray-700 rounded-2xl focus:border-red-600 focus:outline-none transition-colors" 
                />
                 <button type="button" onClick={() => handleAwayScoreChange((parseInt(awayScore) + 1).toString())} className="w-8 h-8 rounded-full bg-gray-800 text-white font-bold hover:bg-gray-700">+</button>
              </div>
            </div>
          </div>

          {isKnockout && (
            <div className="border-t border-gray-800 bg-black/30 px-6 py-4">
              <div className="flex justify-center items-center gap-8">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Penalties (if drawn)</span>
                <div className="flex gap-4">
                  <input type="number" name="home_pens" defaultValue={match.home_pens ?? ''} min="0" placeholder="Home"
                    className="w-16 p-2 text-center text-lg font-bold bg-black border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none" />
                  <input type="number" name="away_pens" defaultValue={match.away_pens ?? ''} min="0" placeholder="Away"
                    className="w-16 p-2 text-center text-lg font-bold bg-black border border-gray-700 rounded-lg focus:border-red-500 focus:outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={() => router.push('/admin/fixtures')} className="flex-1 bg-gray-800 hover:bg-gray-700 px-6 py-4 rounded-lg font-bold uppercase tracking-wider transition-colors text-gray-300">
            Cancel
          </button>
          <button type="submit" className="flex-[2] bg-red-700 hover:bg-red-600 text-white px-6 py-4 rounded-lg font-black uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            Save Result & Finish
          </button>
        </div>
      </form>

      {/* PITCH */}
      <div className="bg-[#111] border border-gray-800 p-4 md:p-8 rounded-xl shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Match Events</h3>
          <span className="text-xs font-mono text-gray-500">Click player to add event</span>
        </div>

        <Pitch 
          homeTeam={match.home_team}
          awayTeam={match.away_team}
          homePlayers={homePlayers}
          awayPlayers={awayPlayers}
          events={events}
          onAddEvent={handleAddEvent}
          onRemoveEvent={handleRemoveEvent}
        />

        <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-2">
          {events.map((ev) => (
            <div key={ev.id} className="flex justify-between items-center bg-black/50 p-3 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {ev.kind === 'goal' ? '⚽' : ev.kind === 'yellow' ? '🟨' : ev.kind === 'red' ? '🟥' : '⏱️'}
                </span>
                <span className="font-bold text-sm text-gray-200">{getPlayerName(ev.player_id)}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{ev.kind.replace('_', ' ')}</span>
              </div>
              <button type="button" onClick={() => handleRemoveEvent(ev.id)} className="text-red-500 hover:text-red-400 p-2">
                ✕
              </button>
            </div>
          ))}
          {events.length === 0 && <p className="text-gray-600 text-sm italic text-center py-4">No events recorded yet.</p>}
        </div>
      </div>
    </div>
  )
}