import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchForm from '@/components/MatchForm'

export const instant = false;

export default async function MatchEntryPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object
  const { id } = await params

  const supabase = await createClient()
  
  const { data: match } = await supabase
    .from('matches')
    .select(`*, home_team:teams!matches_home_team_id_fkey ( name ), away_team:teams!matches_away_team_id_fkey ( name )`)
    .eq('id', id) // Use the unwrapped id here
    .single()

  if (!match) redirect('/admin/fixtures')

  // Fetch players for both teams
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .in('team_id', [match.home_team_id, match.away_team_id])

  // Fetch existing events (for editing)
  const { data: events } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', match.id)

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-12 font-sans text-white flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-2">
            {match.stage !== 'group' ? 'Knockout Stage' : `Group Stage - Group ${match.group_name}`}
          </h1>
          <p className="text-gray-400 text-sm font-mono uppercase tracking-widest">Round {match.round}</p>
        </div>

        <MatchForm 
          match={match} 
          players={players || []} 
          initialEvents={events?.map(e => ({ id: e.id, player_id: e.player_id, kind: e.kind })) || []} 
        />
      </div>
    </div>
  )
}