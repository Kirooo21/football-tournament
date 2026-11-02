import { createClient } from '@/lib/supabase/server'

export const instant = false;

export default async function PublicMatchesPage() {
  const supabase = await createClient()
  
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, stage, group_name, round, status, home_score, away_score, home_pens, away_pens,
      home_team:teams!matches_home_team_id_fkey ( name ),
      away_team:teams!matches_away_team_id_fkey ( name )
    `)
    .order('created_at', { ascending: true })

  const allMatches = matches || []

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">
            Match <span className="text-red-600">Center</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
            Fixtures & Results
          </p>
        </header>

        <div className="space-y-8">
          {['semi', 'final', 'fifth_sixth'].map(stage => {
            const stageMatches = allMatches.filter(m => m.stage === stage)
            if (stageMatches.length === 0) return null

            return (
              <div key={stage} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-red-900 to-red-700 px-6 py-4">
                  <h2 className="text-xl font-black uppercase italic tracking-wider">
                    {stage === 'semi' ? 'Semi-Finals' : stage === 'final' ? 'Final' : '5th / 6th Place'}
                  </h2>
                </div>
                <div className="p-4 space-y-2">
                  {stageMatches.map((match: any) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )
          })}

          {Array.from(new Set(allMatches.filter(m => m.stage === 'group').map(m => m.group_name))).sort().map(group => {
            const groupMatches = allMatches.filter(m => m.stage === 'group' && m.group_name === group)
            if (groupMatches.length === 0) return null

            return (
              <div key={group} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-800">
                  <h2 className="text-xl font-black uppercase italic tracking-wider text-gray-300">Group {group}</h2>
                </div>
                <div className="p-4 space-y-2">
                  {groupMatches.map((match: any) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MatchCard({ match }: { match: any }) {
  const isFinished = match.status === 'finished'
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-[#1a1a1a] p-4 rounded-lg border border-gray-800 gap-4">
      
      <div className="flex items-center justify-center gap-4 md:gap-8 flex-1 w-full relative">
        
        {/* Home Team */}
        <span className="font-bold text-sm md:text-base text-right flex-1 truncate">{match.home_team?.name}</span>
        
        {/* Score / VS */}
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          {isFinished ? (
            <div className="px-3 py-1 bg-black border border-gray-700 rounded-lg flex items-center gap-2">
              <span className="text-xl font-black font-mono text-white">{match.home_score}</span>
              <span className="text-gray-500 text-xs">-</span>
              <span className="text-xl font-black font-mono text-white">{match.away_score}</span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-black border border-gray-700 flex items-center justify-center">
              <span className="text-xs font-black italic text-gray-500">VS</span>
            </div>
          )}
          {match.home_pens !== null && (
            <span className="text-[10px] font-mono text-yellow-500 font-bold mt-1">
              ({match.home_pens} - {match.away_pens} pens)
            </span>
          )}
        </div>

        {/* Away Team */}
        <span className="font-bold text-sm md:text-base text-left flex-1 truncate">{match.away_team?.name}</span>
      </div>

    </div>
  )
}