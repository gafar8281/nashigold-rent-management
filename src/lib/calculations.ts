import type { BillingCycle, RentalTermStatus } from '@/types'

export type GeneratedTerm = {
  termLabel: string
  dueDate: string
  amount: number
  status: RentalTermStatus
}

export function generateRentalTerms(
  startDate: string,
  endDate: string,
  billingCycle: BillingCycle,
  rentAmount: number,
): GeneratedTerm[] {
  const [startY, startM] = startDate.split('-').map(Number)
  const increment = billingCycle === 'Monthly' ? 1 : billingCycle === 'Quarterly' ? 3 : 12
  const terms: GeneratedTerm[] = []
  let y = startY
  let m = startM // 1-indexed

  while (true) {
    const periodEndMonthOffset = increment - 1
    const totalMonths = (m - 1) + periodEndMonthOffset
    const periodEndY = y + Math.floor(totalMonths / 12)
    const periodEndM = (totalMonths % 12) + 1 // 1-indexed

    // Last day of period-end month
    const lastDayDate = new Date(periodEndY, periodEndM, 0)
    const dueDateISO = `${periodEndY}-${String(periodEndM).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`

    if (dueDateISO > endDate) break

    let termLabel: string
    if (billingCycle === 'Monthly') {
      termLabel = lastDayDate.toLocaleString('en-US', { month: 'short' }) + ' ' + periodEndY
    } else if (billingCycle === 'Quarterly') {
      termLabel = `Q${Math.ceil(m / 3)} ${y}`
    } else {
      termLabel = String(y)
    }

    terms.push({ termLabel, dueDate: dueDateISO, amount: rentAmount, status: 'Pending' })

    const nextMTotal = m - 1 + increment
    y = y + Math.floor(nextMTotal / 12)
    m = (nextMTotal % 12) + 1
  }

  return terms
}

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
