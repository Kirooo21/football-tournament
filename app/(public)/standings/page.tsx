import { createClient } from '@/lib/supabase/server'
import { computeGroupStandings } from '@/lib/standings'

export const instant = false;

export default async function PublicStandingsPage() {
  const supabase = await createClient()
  
  const [{ data: teams }, { data: matches }, { data: players }, { data: events }] = await Promise.all([
    supabase.from('teams').select('*').eq('is_deleted', false),
    supabase.from('matches').select('*'),
    supabase.from('players').select('*'),
    supabase.from('match_events').select('*')
  ])

  const activeTeams = teams || []
  const allMatches = matches || []
  const allPlayers = players || []
  const allEvents = events || []

  const groups = Array.from(new Set(activeTeams.map(t => t.group_name))).sort()

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-900/20 to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">
            Tournament <span className="text-red-600">Standings</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
            Live Group Stage Results
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {groups.map(group => {
            const standings = computeGroupStandings(group, activeTeams, allMatches, allEvents, allPlayers)
            
            return (
              <div key={group} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                
                <div className="bg-gradient-to-r from-red-900 to-red-700 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-black uppercase italic tracking-wider">Group {group}</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-black/50 border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-3 font-bold">Pos</th>
                        <th className="px-4 py-3 font-bold">Team</th>
                        <th className="px-2 py-3 text-center font-bold" title="Played">P</th>
                        <th className="px-2 py-3 text-center font-bold" title="Won">W</th>
                        <th className="px-2 py-3 text-center font-bold" title="Drawn">D</th>
                        <th className="px-2 py-3 text-center font-bold" title="Lost">L</th>
                        <th className="px-2 py-3 text-center font-bold" title="Goals For">GF</th>
                        <th className="px-2 py-3 text-center font-bold" title="Goals Against">GA</th>
                        <th className="px-2 py-3 text-center font-bold" title="Goal Difference">GD</th>
                        <th className="px-4 py-3 text-center font-black text-white" title="Points">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row, index) => (
                        <tr key={row.team_id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 font-mono text-gray-500">{index + 1}</td>
                          <td className="px-4 py-4 font-bold text-gray-200">{row.name}</td>
                          <td className="px-2 py-4 text-center text-gray-400">{row.played}</td>
                          <td className="px-2 py-4 text-center text-gray-400">{row.won}</td>
                          <td className="px-2 py-4 text-center text-gray-400">{row.drawn}</td>
                          <td className="px-2 py-4 text-center text-gray-400">{row.lost}</td>
                          <td className="px-2 py-4 text-center text-gray-400">{row.gf}</td>
                          <td className="px-2 py-4 text-center text-gray-400">{row.ga}</td>
                          <td className="px-2 py-4 text-center font-mono text-gray-400">
                            {row.gd > 0 ? `+${row.gd}` : row.gd}
                          </td>
                          <td className="px-4 py-4 text-center font-black text-red-500 text-lg">{row.points}</td>
                        </tr>
                      ))}
                      {standings.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-gray-500 italic">
                            No matches played yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}