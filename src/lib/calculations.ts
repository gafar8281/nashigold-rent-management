export function calcRentalTermMonths(startISO: string, endISO: string): number {
  const [sy, sm, sd] = startISO.split('-').map(Number)
  const [ey, em, ed] = endISO.split('-').map(Number)
  let months = (ey - sy) * 12 + (em - sm)
  if (ed < sd) months -= 1
  return Math.max(0, months)
}

export function splitRentalTerm(totalMonths: number): { years: number; months: number } {
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12 }
}
