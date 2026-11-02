import { createClient } from '@/lib/supabase/server'

export const instant = false;

export default async function ScorersPage() {
  const supabase = await createClient()
  
  // Fetch players, teams, and only 'goal' events
  const [{ data: players }, { data: teams }, { data: events }] = await Promise.all([
    supabase.from('players').select('*'),
    supabase.from('teams').select('*'),
    supabase.from('match_events').select('*').eq('kind', 'goal')
  ])

  const allPlayers = players || []
  const allTeams = teams || []
  const goalEvents = events || []

  // Calculate goals per player
  const scorersMap = new Map<string, number>()
  
  goalEvents.forEach(event => {
    const currentGoals = scorersMap.get(event.player_id) || 0
    scorersMap.set(event.player_id, currentGoals + 1)
  })

  // Create sorted array of top scorers
  const topScorers = Array.from(scorersMap.entries())
    .map(([playerId, goals]) => {
      const player = allPlayers.find(p => p.id === playerId)
      const team = allTeams.find(t => t.id === player?.team_id)
      return {
        name: player?.name || 'Unknown',
        teamName: team?.name || 'Unknown',
        goals
      }
    })
    .sort((a, b) => b.goals - a.goals)

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-yellow-600/10 to-transparent pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">
            Golden <span className="text-yellow-500">Boot</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
            Top Goalscorers
          </p>
        </header>

        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-black/50 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold text-center w-16">Rank</th>
                <th className="px-6 py-4 font-bold">Player</th>
                <th className="px-6 py-4 font-bold">Team</th>
                <th className="px-6 py-4 text-center font-black text-white">Goals</th>
              </tr>
            </thead>
            <tbody>
              {topScorers.map((scorer, index) => (
                <tr key={index} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-center font-mono text-gray-500 font-bold">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-200">
                    {scorer.name}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs uppercase tracking-wider font-mono">
                    {scorer.teamName}
                  </td>
                  <td className="px-6 py-4 text-center font-black text-yellow-500 text-xl">
                    {scorer.goals}
                  </td>
                </tr>
              ))}
              {topScorers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    No goals scored yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}