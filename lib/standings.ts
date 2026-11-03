export type Team = { id: string; name: string; group_name: string };
export type Match = {
  id: string; stage: string; group_name: string | null;
  home_team_id: string; away_team_id: string;
  home_score: number | null; away_score: number | null;
  status: string;
};
export type Event = { match_id: string; player_id: string; kind: string };
export type Player = { id: string; team_id: string; name: string };

export type StandingRow = {
  team_id: string;
  name: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; gd: number;
  points: number;
  fair_play: number; 
};

const FP = { yellow: 1, sin_bin: 2, red: 4 };

export function computeGroupStandings(
  group: string,
  teams: Team[],
  matches: Match[],
  events: Event[],
  players: Player[]
): StandingRow[] {
  // Filter active teams in this group
  const gTeams = teams.filter(t => t.group_name === group);
  
  // Get finished matches for this group
  const gMatches = matches.filter(
    m => m.stage === 'group' && m.group_name === group && m.status === 'finished'
  );

  const p2t = new Map(players.map(p => [p.id, p.team_id]));
  const fp = new Map<string, number>(gTeams.map(t => [t.id, 0]));
  const gMatchIds = new Set(gMatches.map(m => m.id));
  
  for (const e of events) {
    if (!gMatchIds.has(e.match_id)) continue;
    const tid = p2t.get(e.player_id);
    if (!tid || !fp.has(tid)) continue;
    fp.set(tid, (fp.get(tid) ?? 0) + (FP[e.kind as keyof typeof FP] || 0));
  }

  const base = new Map<string, StandingRow>();
  for (const t of gTeams) {
    base.set(t.id, {
      team_id: t.id, name: t.name,
      played: 0, won: 0, drawn: 0, lost: 0,
      gf: 0, ga: 0, gd: 0, points: 0,
      fair_play: fp.get(t.id) ?? 0,
    });
  }

  for (const m of gMatches) {
    if (m.home_score == null || m.away_score == null) continue;
    
    // SAFETY CHECK: Ensure both teams still exist in the active list
    const h = base.get(m.home_team_id);
    const a = base.get(m.away_team_id);
    if (!h || !a) continue; // Skip match if a team was deleted

    h.played++; a.played++;
    h.gf += m.home_score; h.ga += m.away_score;
    a.gf += m.away_score; a.ga += m.home_score;
    
    if (m.home_score > m.away_score) { h.won++; a.lost++; h.points += 3; }
    else if (m.home_score < m.away_score) { a.won++; h.lost++; a.points += 3; }
    else { h.drawn++; a.drawn++; h.points++; a.points++; }
  }
  for (const r of base.values()) r.gd = r.gf - r.ga;

  const rows = [...base.values()];

  function h2hSort(bucket: StandingRow[]): StandingRow[] {
    if (bucket.length <= 1) return bucket;
    const ids = new Set(bucket.map(b => b.team_id));
    const mini = new Map<string, { pts: number; gd: number; gf: number }>();
    for (const b of bucket) mini.set(b.team_id, { pts: 0, gd: 0, gf: 0 });
    
    for (const m of gMatches) {
      if (!ids.has(m.home_team_id) || !ids.has(m.away_team_id)) continue;
      if (m.home_score == null || m.away_score == null) continue;
      
      const homeScore: number = m.home_score;
      const awayScore: number = m.away_score;
      
      const h = mini.get(m.home_team_id);
      const a = mini.get(m.away_team_id);
      if (!h || !a) continue;
      
      h.gf += homeScore; h.gd += homeScore - awayScore;
      a.gf += awayScore; a.gd += awayScore - homeScore;
      
      if (homeScore > awayScore) h.pts += 3;
      else if (homeScore < awayScore) a.pts += 3;
      else { h.pts++; a.pts++; }
    }
    
    return [...bucket].sort((x, y) => {
      const mx = mini.get(x.team_id)!, my = mini.get(y.team_id)!;
      if (my.pts !== mx.pts) return my.pts - mx.pts;
      if (my.gd !== mx.gd) return my.gd - mx.gd;
      if (my.gf !== mx.gf) return my.gf - mx.gf;
      if (y.gd !== x.gd) return y.gd - x.gd;
      if (y.gf !== x.gf) return y.gf - x.gf;
      return x.fair_play - y.fair_play; 
    });
  }

  const pointsMap = new Map<number, StandingRow[]>();
  for (const r of rows) {
    if (!pointsMap.has(r.points)) pointsMap.set(r.points, []);
    pointsMap.get(r.points)!.push(r);
  }

  const ordered: StandingRow[] = [];
  const sortedPoints = Array.from(pointsMap.keys()).sort((a, b) => b - a);
  
  for (const pts of sortedPoints) {
    const bucket = pointsMap.get(pts)!;
    ordered.push(...h2hSort(bucket));
  }
  
  return ordered;
}