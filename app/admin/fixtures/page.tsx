import { createClient } from '@/lib/supabase/server'
import { generateFixtures } from '@/lib/actions/teams'
import GenerateKnockoutsButton from '@/components/GenerateKnockoutsButton'
import GenerateFinalButton from '@/components/GenerateFinalButton'
import Link from 'next/link'

export const instant = false;

export default async function FixturesAdminPage() {
  const supabase = await createClient()
  
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, stage, group_name, round, status, home_score, away_score, home_pens, away_pens,
      home_team:teams!matches_home_team_id_fkey ( name ),
      away_team:teams!matches_away_team_id_fkey ( name )
    `)
    .order('created_at', { ascending: true })

  const hasMatches = matches && matches.length > 0
  const groupMatchesExist = matches?.some(m => m.stage === 'group')

  return (
    <div className="p-4 md:p-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic mb-1">
              Group <span className="text-red-600">Fixtures</span>
            </h1>
            <p className="text-gray-400 font-mono text-xs tracking-widest uppercase">Generate and manage matches</p>
          </div>
          <Link href="/admin" className="bg-gray-900 hover:bg-gray-800 border border-gray-700 px-4 py-2 rounded text-xs font-bold transition-all uppercase tracking-wider">
            Back to Dashboard
          </Link>
        </header>

        {/* ADMIN ONLY: Generate Knockouts Button */}
        {hasMatches && groupMatchesExist && !matches.some(m => m.stage !== 'group') && (
          <div className="bg-gradient-to-r from-red-900/40 to-black border border-red-900/50 p-6 rounded-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-1">Group Stage Complete?</h3>
              <p className="text-sm text-gray-400">Generate the Semi-Finals and 5th/6th place match based on the standings.</p>
            </div>
            <GenerateKnockoutsButton />
          </div>
        )}

        {/* ADMIN ONLY: Generate Final Button */}
        {matches?.some(m => m.stage === 'semi') && !matches.some(m => m.stage === 'final') && (
          <GenerateFinalButton />
        )}

        {!hasMatches ? (
          <div className="bg-[#111] border border-gray-800 p-8 rounded-xl text-center shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
             <h2 className="text-xl font-bold mb-2">Ready to kick off?</h2>
             <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">Generate a round-robin schedule for all active groups.</p>
             <form action={generateFixtures}>
               <button type="submit" className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)] text-sm">
                 Generate Fixtures
               </button>
             </form>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Knockouts */}
            {['semi', 'fifth_sixth', 'final'].map(stage => {
              const stageMatches = matches.filter(m => m.stage === stage)
              if (stageMatches.length === 0) return null

              return (
                <div key={stage} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl mb-6">
                  <div className="bg-gradient-to-r from-red-900 to-red-700 px-4 py-3">
                    <h2 className="text-lg font-black uppercase italic tracking-wider">
                      {stage === 'semi' ? 'Semi-Finals' : stage === 'final' ? 'Final' : '5th / 6th Place'}
                    </h2>
                  </div>
                  <div className="p-3 md:p-4 space-y-3">
                    {stageMatches.map((match: any) => (
                      <div key={match.id} className="flex flex-col bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
                        <div className="p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="flex items-center justify-center gap-3 md:gap-6 flex-1 w-full">
                            <span className="font-bold text-sm md:text-base text-right flex-1 truncate">{match.home_team?.name}</span>
                            {match.status === 'finished' ? (
                              <div className="flex flex-col items-center justify-center flex-shrink-0">
                                <div className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg flex items-center gap-2">
                                  <span className="text-lg font-black font-mono text-white">{match.home_score}</span>
                                  <span className="text-gray-500 text-xs">-</span>
                                  <span className="text-lg font-black font-mono text-white">{match.away_score}</span>
                                </div>
                                {match.home_pens !== null && match.away_pens !== null && (
                                  <span className="text-[10px] font-mono text-yellow-500 mt-1 font-bold">
                                    ({match.home_pens} - {match.away_pens} pens)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-black italic text-gray-500">VS</span>
                              </div>
                            )}
                            <span className="font-bold text-sm md:text-base text-left flex-1 truncate">{match.away_team?.name}</span>
                          </div>
                          <Link href={`/admin/match/${match.id}`} className="w-full md:w-auto text-center px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold uppercase tracking-wider transition-colors">
                            {match.status === 'finished' ? 'Edit' : 'Enter Result'}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Group Stages */}
            {Array.from(new Set(matches.filter(m => m.stage === 'group').map(m => m.group_name))).sort().map(group => {
              const groupMatches = matches.filter(m => m.stage === 'group' && m.group_name === group)
              if (groupMatches.length === 0) return null

              return (
                <div key={group} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 border-b border-gray-800">
                    <h2 className="text-lg font-black uppercase italic tracking-wider text-gray-300">Group {group} Matches</h2>
                  </div>
                  <div className="p-3 md:p-4 space-y-3">
                    {groupMatches.map((match: any) => (
                      <div key={match.id} className="flex flex-col bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
                        <div className="bg-black/30 px-3 py-1.5 flex justify-between items-center border-b border-gray-800/50">
                          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Round {match.round}</span>
                          {match.status === 'finished' && (
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Finished</span>
                          )}
                        </div>
                        <div className="p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="flex items-center justify-center gap-3 md:gap-6 flex-1 w-full">
                            <span className="font-bold text-sm md:text-base text-right flex-1 truncate">{match.home_team?.name}</span>
                            {match.status === 'finished' ? (
                              <div className="flex flex-col items-center justify-center flex-shrink-0">
                                <div className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-lg flex items-center gap-2">
                                  <span className="text-lg font-black font-mono text-white">{match.home_score}</span>
                                  <span className="text-gray-500 text-xs">-</span>
                                  <span className="text-lg font-black font-mono text-white">{match.away_score}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-black italic text-gray-500">VS</span>
                              </div>
                            )}
                            <span className="font-bold text-sm md:text-base text-left flex-1 truncate">{match.away_team?.name}</span>
                          </div>
                          <div className="w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-gray-800 md:border-0 flex justify-center">
                            <Link 
                              href={`/admin/match/${match.id}`} 
                              className={`w-full md:w-auto text-center px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                                match.status === 'finished' 
                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                                : 'bg-red-700 hover:bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.2)]'
                              }`}
                            >
                              {match.status === 'finished' ? 'Edit' : 'Enter Result'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            
            <div className="text-center pt-6 border-t border-gray-800">
              <form action={generateFixtures}>
                <button type="submit" className="text-gray-500 hover:text-red-500 text-xs underline transition-colors">
                  Reset and regenerate ALL fixtures
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}