import { createClient } from '@/lib/supabase/server'
import { addMultiplePlayers, restoreGroup } from '@/lib/actions/teams'
import AddTeamForm from '@/components/AddTeamForm'
import { EditTeamButton, EditPlayerButton } from '@/components/EditButtons'
import { DeleteTeamButton, DeletePlayerButton } from '@/components/DeleteButtons'
import { DeleteGroupButton } from '@/components/GroupControls'

export const instant = false;

export default async function TeamsPage() {
  const supabase = await createClient()
  
  const { data: allTeams } = await supabase
    .from('teams')
    .select(`*, players (*)`)
    .order('group_name')
    .order('name')

  // Split into active and deleted
  const teams = allTeams?.filter(t => !t.is_deleted) || []
  const deletedTeams = allTeams?.filter(t => t.is_deleted) || []

  const activeGroups = Array.from(new Set(teams.map(t => t.group_name))).sort()
  const deletedGroups = Array.from(new Set(deletedTeams.map(t => t.group_name))).sort()
  const displayGroups = activeGroups.length > 0 ? activeGroups : ['A']

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-12 font-sans text-white">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Team <span className="text-red-600">Management</span></h1>
            <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-mono">Configure groups and rosters</p>
          </div>
          <a href="/admin" className="mt-4 md:mt-0 bg-gray-900 hover:bg-gray-800 border border-gray-700 px-6 py-2 rounded font-bold transition-all text-sm uppercase tracking-wider">
            Back to Dashboard
          </a>
        </div>

        <div className="bg-[#111] border border-gray-800 p-6 rounded-lg mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent"></div>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            Register New Team
          </h2>
          <AddTeamForm />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {displayGroups.map(group => {
            const groupTeams = teams.filter(t => t.group_name === group)
            
            return (
              <div key={group} className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
                
                <div className="bg-gradient-to-r from-red-900 to-red-700 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-black uppercase italic tracking-wider">Group {group}</h2>
                  
                  <div className="flex items-center gap-3">
                    <span className="bg-black/30 px-3 py-1 rounded text-xs font-mono">
                      {groupTeams.length} Teams
                    </span>
                    <DeleteGroupButton groupName={group} />
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {groupTeams.map(team => (
                    <div key={team.id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-5 relative group/card hover:border-gray-600 transition-colors">
                      
                      <div className="flex justify-between items-center mb-5 border-b border-gray-800 pb-3">
                        <h3 className="text-xl font-bold uppercase tracking-wide text-gray-100">{team.name}</h3>
                        <div className="flex items-center gap-2">
                          <EditTeamButton teamId={team.id} currentName={team.name} currentGroup={team.group_name} />
                          <DeleteTeamButton teamId={team.id} />
                        </div>
                      </div>
                      
                      <div className="mb-5">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">Roster ({team.players.length})</p>
                        <ul className="space-y-1.5">
                          {team.players.map((player: any) => (
                            <li key={player.id} className="text-gray-300 text-sm flex items-center justify-between group/player bg-[#222] px-3 py-2 rounded border border-transparent hover:border-gray-700">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-gray-500">#</span>
                                <span className="font-medium">{player.name}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover/player:opacity-100 transition-opacity">
                                <EditPlayerButton playerId={player.id} currentName={player.name} />
                                <DeletePlayerButton playerId={player.id} />
                              </div>
                            </li>
                          ))}
                          {team.players.length === 0 && <li className="text-gray-600 text-sm italic py-2">No players added yet.</li>}
                        </ul>
                      </div>

                      <form action={async (formData) => {
                        'use server'
                        const names = formData.get('names') as string
                        await addMultiplePlayers(team.id, names)
                      }} className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-800">
                        <input 
                          type="text" 
                          name="names" 
                          placeholder="Type names separated by commas..." 
                          required
                          className="w-full p-2.5 text-sm rounded bg-black border border-gray-700 focus:outline-none focus:border-red-500 text-white placeholder-gray-600 transition-colors"
                        />
                        <button type="submit" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-2 text-xs uppercase tracking-wider font-bold rounded transition-colors w-full">
                          + Add to Roster
                        </button>
                      </form>
                    </div>
                  ))}
                  
                  {groupTeams.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-lg">
                      <p className="text-gray-600 text-sm uppercase tracking-widest">No teams assigned</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Deleted Groups Section */}
        {deletedGroups.length > 0 && (
          <div className="mt-16 border-t border-gray-800 pt-8">
            <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-4">Deleted Groups</h3>
            <div className="flex flex-wrap gap-4">
              {deletedGroups.map(group => (
                <div key={group} className="bg-[#111] border border-gray-800 px-4 py-3 rounded-lg flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                  <span className="text-gray-400 font-mono text-sm">Group {group}</span>
                  <form action={async () => {
                    'use server'
                    await restoreGroup(group)
                  }}>
                    <button className="text-green-500 hover:text-green-400 text-xs uppercase font-bold">Restore</button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}