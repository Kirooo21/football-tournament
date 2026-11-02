'use client'

import { useState } from 'react'

type Player = { id: string; name: string; team_id: string }
type Event = { id: string; player_id: string; kind: string }

export default function Pitch({ 
  homeTeam, 
  awayTeam, 
  homePlayers, 
  awayPlayers, 
  events, 
  onAddEvent 
}: { 
  homeTeam: any, awayTeam: any, homePlayers: Player[], awayPlayers: Player[], 
  events: Event[], onAddEvent: (playerId: string, kind: string) => void, onRemoveEvent: (id: string) => void 
}) {
  const [activePlayer, setActivePlayer] = useState<Player | null>(null)

  const getEventIcon = (kind: string) => {
    switch(kind) {
      case 'goal': return '⚽'
      case 'yellow': return '🟨'
      case 'red': return '🟥'
      case 'sin_bin': return '⏱️'
      default: return ''
    }
  }

  const homePositions = [
    'top-[50%] left-[8%]',
    'top-[15%] left-[25%]',
    'top-[38%] left-[25%]',
    'top-[62%] left-[25%]',
    'top-[85%] left-[25%]',
    'top-[25%] left-[38%]',
    'top-[50%] left-[38%]',
    'top-[75%] left-[38%]',
    'top-[15%] left-[42%]',
    'top-[50%] left-[42%]',
    'top-[85%] left-[42%]'
  ]

  const awayPositions = [
    'top-[50%] right-[8%]',   
    'top-[15%] right-[25%]',  
    'top-[38%] right-[25%]',  
    'top-[62%] right-[25%]',  
    'top-[85%] right-[25%]',  
    'top-[25%] right-[38%]',  
    'top-[50%] right-[38%]',  
    'top-[75%] right-[38%]',  
    'top-[15%] right-[42%]',  
    'top-[50%] right-[42%]',  
    'top-[85%] right-[42%]'   
  ]

  const renderPlayer = (player: Player, index: number, isHome: boolean) => {
    const posClass = isHome 
      ? (homePositions[index] || `top-[50%] left-[${10 + index}%]`) 
      : (awayPositions[index] || `top-[50%] right-[${10 + index}%]`)
    
    const playerEvents = events.filter(e => e.player_id === player.id)
    const isGoalkeeper = index === 0;

    return (
      <div key={player.id} className={`absolute ${posClass} -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 group`}>
        
        {/* Player Circle */}
        <button 
          type="button"
          onClick={() => setActivePlayer(player)}
          className={`${isGoalkeeper ? 'bg-yellow-600' : 'bg-gray-900/90'} w-7 h-7 md:w-10 md:h-10 rounded-full border-2 border-white/20 flex items-center justify-center shadow-xl hover:scale-110 hover:border-red-500 transition-all backdrop-blur-sm relative`}
        >
          <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-tighter">
            {player.name.substring(0, 2)}
          </span>

          {/* Event Badges (Anchored to the top-right of the circle) */}
          {playerEvents.length > 0 && (
            <div className="absolute -top-1 -right-2 flex flex-col gap-0.5 pointer-events-none">
              {playerEvents.map((e, i) => (
                <span key={i} className="text-[10px] md:text-[14px] drop-shadow-md leading-none">{getEventIcon(e.kind)}</span>
              ))}
            </div>
          )}
        </button>
        
        {/* Player Name (Anchored directly under the circle) */}
        <span className="absolute top-full mt-1 text-[7px] md:text-[9px] font-bold bg-black/80 px-1 py-0.5 rounded text-white whitespace-nowrap shadow-sm max-w-[50px] md:max-w-[60px] truncate pointer-events-none">
          {player.name}
        </span>
      </div>
    )
  }

    return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-[16/10] bg-[#1e2b23] border border-[#2a3d31] rounded-xl overflow-hidden shadow-2xl mb-8">
        
        {/* Team Names Overlay (Broadcast Style) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-white font-black uppercase tracking-widest text-xs md:text-sm">
            {homeTeam.name}
          </span>
        </div>

        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 shadow-lg flex-row-reverse">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-white font-black uppercase tracking-widest text-xs md:text-sm">
            {awayTeam.name}
          </span>
        </div>

        {/* Pitch Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-[2px] h-full bg-white/20 -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 md:w-48 md:h-48 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 w-16 h-48 md:w-24 md:h-64 border-2 border-l-0 border-white/20 -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-16 h-48 md:w-24 md:h-64 border-2 border-r-0 border-white/20 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 w-8 h-24 md:w-12 md:h-32 border-2 border-l-0 border-white/20 -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-8 h-24 md:w-12 md:h-32 border-2 border-r-0 border-white/20 -translate-y-1/2"></div>
        </div>

        <div className="absolute inset-0">
          {homePlayers.map((p, i) => renderPlayer(p, i, true))}
          {awayPlayers.map((p, i) => renderPlayer(p, i, false))}
        </div>

        {/* Popup Modal */}
        {activePlayer && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="bg-[#111] border border-gray-700 p-4 md:p-6 rounded-xl shadow-2xl w-full max-w-xs md:max-w-sm">
              <h3 className="text-lg md:text-xl font-bold text-center mb-1 text-white">{activePlayer.name}</h3>
              <p className="text-[10px] text-center text-gray-500 mb-3 uppercase tracking-widest">
                {activePlayer.team_id === homeTeam.id ? homeTeam.name : awayTeam.name}
              </p>
              
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <button type="button" onClick={() => { onAddEvent(activePlayer.id, 'goal'); setActivePlayer(null) }} className="bg-gray-800 hover:bg-gray-700 p-2 md:p-3 rounded-lg flex flex-col items-center gap-1 border border-gray-700 transition-colors">
                  <span className="text-xl md:text-2xl">⚽</span> <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Goal</span>
                </button>
                <button type="button" onClick={() => { onAddEvent(activePlayer.id, 'yellow'); setActivePlayer(null) }} className="bg-gray-800 hover:bg-gray-700 p-2 md:p-3 rounded-lg flex flex-col items-center gap-1 border border-gray-700 transition-colors">
                  <span className="text-xl md:text-2xl">🟨</span> <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Yellow</span>
                </button>
                <button type="button" onClick={() => { onAddEvent(activePlayer.id, 'red'); setActivePlayer(null) }} className="bg-gray-800 hover:bg-gray-700 p-2 md:p-3 rounded-lg flex flex-col items-center gap-1 border border-gray-700 transition-colors">
                  <span className="text-xl md:text-2xl">🟥</span> <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Red</span>
                </button>
                <button type="button" onClick={() => { onAddEvent(activePlayer.id, 'sin_bin'); setActivePlayer(null) }} className="bg-gray-800 hover:bg-gray-700 p-2 md:p-3 rounded-lg flex flex-col items-center gap-1 border border-gray-700 transition-colors">
                  <span className="text-xl md:text-2xl">⏱️</span> <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">2 Min</span>
                </button>
              </div>
              
              <button type="button" onClick={() => setActivePlayer(null)} className="mt-4 w-full bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 py-2 md:py-3 rounded-lg text-[10px] md:text-sm font-bold uppercase tracking-wider transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}