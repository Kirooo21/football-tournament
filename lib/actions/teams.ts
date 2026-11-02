'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { roundRobin } from '@/lib/fixtures'
import { computeGroupStandings } from '@/lib/standings'

export async function addTeam(formData: FormData) {
  const name = formData.get('name') as string
  const group_name = formData.get('group_name') as string
  
  if (!name || !group_name) return

  const supabase = await createClient()
  const { error } = await supabase.from('teams').insert({ 
    name, 
    group_name, 
    is_deleted: false 
  })
  
  if (error) throw new Error('Failed to add team: ' + error.message)
  revalidatePath('/', 'layout')
}

export async function addPlayer(formData: FormData) {
  const name = formData.get('name') as string
  const team_id = formData.get('team_id') as string
  
  if (!name || !team_id) throw new Error('Missing name or team_id!')

  const supabase = await createClient()
  const { error } = await supabase.from('players').insert({ name, team_id })
  
  if (error) throw new Error('Supabase error: ' + error.message)
  revalidatePath('/', 'layout')
}

export async function deleteTeam(teamId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('teams').delete().eq('id', teamId)
  if (error) throw new Error('Failed to delete team: ' + error.message)
  revalidatePath('/', 'layout')
}

export async function deletePlayer(playerId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('players').delete().eq('id', playerId)
  if (error) throw new Error('Failed to delete player: ' + error.message)
  revalidatePath('/', 'layout')
}

export async function updateTeam(teamId: string, newName: string, newGroup: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('teams')
    .update({ name: newName, group_name: newGroup })
    .eq('id', teamId)
    
  if (error) throw new Error('Failed to update team: ' + error.message)
  revalidatePath('/', 'layout')
}

export async function updatePlayer(playerId: string, newName: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('players')
    .update({ name: newName })
    .eq('id', playerId)
    
  if (error) throw new Error('Failed to update player: ' + error.message)
  revalidatePath('/', 'layout')
}

export async function addMultiplePlayers(teamId: string, namesString: string) {
  if (!namesString.trim()) return
  
  const names = namesString.split(',').map(n => n.trim()).filter(Boolean)
  if (names.length === 0) return

  const supabase = await createClient()
  const playersToInsert = names.map(name => ({ team_id: teamId, name }))
  
  const { error } = await supabase.from('players').insert(playersToInsert)
  
  if (error) throw new Error('Failed to add players: ' + error.message)
  revalidatePath('/', 'layout')
}

export async function deleteGroup(groupName: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('teams')
    .update({ is_deleted: true })
    .eq('group_name', groupName)
  
  if (error) throw new Error('Failed to delete group: ' + error.message)
  revalidatePath('/', 'layout')
}

export async function restoreGroup(groupName: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('teams')
    .update({ is_deleted: false })
    .eq('group_name', groupName)
  
  if (error) throw new Error('Failed to restore group: ' + error.message)
  revalidatePath('/', 'layout')
}

export async function updateMatchScore(formData: FormData) {
  const supabase = await createClient()
  
  const matchId = formData.get('match_id') as string
  if (!matchId) throw new Error('Match ID is missing')

  const homeScore = parseInt(formData.get('home_score') as string) || 0
  const awayScore = parseInt(formData.get('away_score') as string) || 0
  
  const homePensRaw = formData.get('home_pens') as string
  const awayPensRaw = formData.get('away_pens') as string
  const homePens = homePensRaw ? parseInt(homePensRaw) : null
  const awayPens = awayPensRaw ? parseInt(awayPensRaw) : null

  if (homePens !== null && awayPens !== null && homePens === awayPens) {
    throw new Error('Penalties cannot be a draw!')
  }

  const { error: matchError } = await supabase
    .from('matches')
    .update({ 
      home_score: homeScore, 
      away_score: awayScore,
      home_pens: homePens,
      away_pens: awayPens,
      status: 'finished'
    })
    .eq('id', matchId)
    
  if (matchError) throw new Error('Failed to save score: ' + matchError.message)

  await supabase.from('match_events').delete().eq('match_id', matchId)

  const eventsJson = formData.get('events') as string
  if (eventsJson) {
    const events = JSON.parse(eventsJson)
    if (events.length > 0) {
      const eventsToInsert = events.map((e: any) => ({
        match_id: matchId,
        player_id: e.player_id,
        kind: e.kind
      }))
      const { error: eventsError } = await supabase.from('match_events').insert(eventsToInsert)
      if (eventsError) throw new Error('Failed to save events: ' + eventsError.message)
    }
  }

  revalidatePath('/', 'layout')
}

export async function generateFixtures() {
  const supabase = await createClient()
  
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .eq('is_deleted', false)

  if (teamsError || !teams) throw new Error('Could not fetch teams')

  const groups: Record<string, string[]> = {}
  teams.forEach(t => {
    if (!groups[t.group_name]) groups[t.group_name] = []
    groups[t.group_name].push(t.id)
  })

  const matchesToInsert: any[] = []

  for (const [groupName, teamIds] of Object.entries(groups)) {
    if (teamIds.length < 2) continue
    
    const fixtures = roundRobin(teamIds)
    fixtures.forEach(f => {
      matchesToInsert.push({
        stage: 'group',
        group_name: groupName,
        round: f.round,
        home_team_id: f.home,
        away_team_id: f.away,
        status: 'scheduled'
      })
    })
  }

  if (matchesToInsert.length > 0) {
    await supabase.from('matches').delete().in('stage', ['group', 'semi', 'fifth_sixth', 'final'])
    const { error } = await supabase.from('matches').insert(matchesToInsert)
    if (error) throw new Error('Failed to generate fixtures: ' + error.message)
  }

  revalidatePath('/', 'layout')
}

export async function generateKnockouts() {
  const supabase = await createClient()
  
  // 1. Fetch data
  const [{ data: teams }, { data: matches }, { data: players }, { data: events }] = await Promise.all([
    supabase.from('teams').select('*').eq('is_deleted', false),
    supabase.from('matches').select('*'),
    supabase.from('players').select('*'),
    supabase.from('match_events').select('*')
  ])

  if (!teams || !matches) throw new Error('Missing data')

  const activeTeams = teams
  const allMatches = matches
  const allPlayers = players || []
  const allEvents = events || []

  // 2. Ensure Group Stage is actually finished
  const groupMatches = allMatches.filter(m => m.stage === 'group')
  const allGroupsFinished = groupMatches.length > 0 && groupMatches.every(m => m.status === 'finished')
  
  if (!allGroupsFinished) {
    throw new Error('All group matches must be finished before generating knockouts!')
  }

  const groups = Array.from(new Set(activeTeams.map(t => t.group_name))).sort()
  if (groups.length < 2) throw new Error('Need at least 2 groups to generate knockouts')
  
  const groupA = groups[0]
  const groupB = groups[1]

  // 3. Compute standings
  const standingsA = computeGroupStandings(groupA, activeTeams, allMatches, allEvents, allPlayers)
  const standingsB = computeGroupStandings(groupB, activeTeams, allMatches, allEvents, allPlayers)

  if (standingsA.length < 3 || standingsB.length < 3) {
    throw new Error('Not enough teams in groups to generate knockouts')
  }

  const a1 = standingsA[0].team_id
  const a2 = standingsA[1].team_id
  const a3 = standingsA[2].team_id

  const b1 = standingsB[0].team_id
  const b2 = standingsB[1].team_id
  const b3 = standingsB[2].team_id

  // 4. Create matches
  const knockoutMatches = [
    { stage: 'semi', home_team_id: a1, away_team_id: b2, status: 'scheduled' },
    { stage: 'semi', home_team_id: b1, away_team_id: a2, status: 'scheduled' },
    { stage: 'fifth_sixth', home_team_id: a3, away_team_id: b3, status: 'scheduled' }
  ]

  // 5. Delete old knockouts and insert new ones
  await supabase.from('matches').delete().in('stage', ['semi', 'fifth_sixth', 'final'])
  
  const { error } = await supabase.from('matches').insert(knockoutMatches)
  
  if (error) {
    console.error("Knockout Generation Error:", error)
    throw new Error('Failed to generate knockouts: ' + error.message)
  }

  revalidatePath('/', 'layout')
}

export async function generateFinal() {
  const supabase = await createClient()
  
  // 1. Fetch the semi-final matches
  const { data: semis } = await supabase
    .from('matches')
    .select('*')
    .eq('stage', 'semi')

  if (!semis || semis.length !== 2) {
    throw new Error('Semi-finals must be generated first.')
  }

  if (semis.some(m => m.status !== 'finished')) {
    throw new Error('Both semi-finals must be finished first.')
  }

  // 2. Determine winners (including penalties if drawn)
  const getWinner = (match: any) => {
    if (match.home_score > match.away_score) return match.home_team_id
    if (match.away_score > match.home_score) return match.away_team_id
    // If drawn, use penalties
    if (match.home_pens > match.away_pens) return match.home_team_id
    return match.away_team_id
  }

  const winner1 = getWinner(semis[0])
  const winner2 = getWinner(semis[1])

  // 3. Delete existing final (if any) and insert the new one
  await supabase.from('matches').delete().eq('stage', 'final')
  
  const { error } = await supabase.from('matches').insert({
    stage: 'final',
    home_team_id: winner1,
    away_team_id: winner2,
    status: 'scheduled'
  })

  if (error) throw new Error('Failed to generate final: ' + error.message)

  revalidatePath('/', 'layout')
}