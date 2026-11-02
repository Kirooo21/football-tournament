export function roundRobin(teamIds: string[]): { round: number; home: string; away: string }[] {
  const ids = [...teamIds];
  if (ids.length % 2 !== 0) ids.push('BYE'); // Handle odd number of teams
  
  const n = ids.length;
  const rounds = n - 1;
  const half = n / 2;
  const arr = [...ids];
  const out: { round: number; home: string; away: string }[] = [];

  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i], b = arr[n - 1 - i];
      if (a === 'BYE' || b === 'BYE') continue;
      
      // Alternate home/away for fairness
      const home = (r + i) % 2 === 0 ? a : b;
      const away = (r + i) % 2 === 0 ? b : a;
      out.push({ round: r + 1, home, away });
    }
    // Rotate array
    arr.splice(1, 0, arr.pop()!);
  }
  return out;
}