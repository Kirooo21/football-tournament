import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const instant = false;

export default async function LandingPage() {
  const supabase = await createClient()
  
  // Fetch ALL finished matches
  const { data: recentMatches } = await supabase
    .from('matches')
    .select(`
      id, stage, group_name, status, home_score, away_score, home_pens, away_pens, created_at,
      home_team:teams!matches_home_team_id_fkey ( name ),
      away_team:teams!matches_away_team_id_fkey ( name )
    `)
    .eq('status', 'finished')

  // Sort them manually to guarantee the latest show up first
  const sortedMatches = (recentMatches || []).sort((a: any, b: any) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Grab the top 4
  const results = sortedMatches.slice(0, 4)

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center pt-20 p-6 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-4xl w-full">
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic mb-4">
          Local <span className="text-red-600">Tournament</span>
        </h1>
        <p className="text-gray-400 font-mono text-sm md:text-lg tracking-widest uppercase mb-12">
          Live Results & Fixtures
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
          <Link 
            href="/standings"
            className="bg-red-700 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105"
          >
            View Standings
          </Link>
          
          <Link 
            href="/matches"
            className="bg-gray-900 border border-gray-700 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-widest transition-all hover:scale-105"
          >
            Match Center
          </Link>
        </div>

        {/* Recent Results */}
        <div className="text-left w-full max-w-2xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-800 pb-2">Latest Results</h2>
          
          <div className="space-y-4">
            {results.map((match: any) => (
              <div key={match.id} className="bg-[#111] border border-gray-800 rounded-lg p-5 flex flex-col items-center relative overflow-hidden group hover:border-gray-600 transition-colors">
                
                {/* Match Stage Badge */}
                <div className="mb-3 px-3 py-1 bg-gray-800 border border-gray-700 text-[10px] font-black uppercase tracking-widest text-red-400 rounded-full">
                  {match.stage === 'group' ? `Group ${match.group_name}` : 
                   match.stage === 'semi' ? 'Semi-Final' : 
                   match.stage === 'final' ? 'Final' : 
                   match.stage === 'fifth_sixth' ? '5th/6th Place' : 'Match'}
                </div>

                <div className="flex items-center justify-between flex-1 w-full">
                  <span className="font-bold text-sm md:text-lg w-1/3 text-right truncate text-gray-200">{match.home_team?.name}</span>
                  
                  <div className="flex flex-col items-center justify-center w-1/3 mx-2">
                    <div className="bg-black px-4 py-1.5 rounded-lg border border-gray-700 font-mono font-black text-xl text-white shadow-inner">
                      {match.home_score} - {match.away_score}
                    </div>
                    {match.home_pens !== null && (
                      <span className="text-[10px] text-yellow-500 font-mono mt-1.5 font-bold">
                        ({match.home_pens}-{match.away_pens} pens)
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-sm md:text-lg w-1/3 text-left truncate text-gray-200">{match.away_team?.name}</span>
                </div>

              </div>
            ))}
            
            {results.length === 0 && (
              <p className="text-gray-600 text-sm italic text-center py-4">No matches played yet.</p>
            )}
          </div>
          
          <div className="text-center mt-6">
            <Link href="/matches" className="text-xs text-gray-400 hover:text-white uppercase tracking-widest underline decoration-gray-600 underline-offset-4">
              View all matches
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}