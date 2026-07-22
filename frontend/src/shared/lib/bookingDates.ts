/** UTC calendar date as YYYY-MM-DD */
export const utcTodayIso = (): string => new Date().toISOString().slice(0, 10)

export const nightsBetween = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) {
    return 0
  }

  const start = new Date(`${checkIn}T00:00:00Z`)
  const end = new Date(`${checkOut}T00:00:00Z`)
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000)

  return diff
}

export const formatMoney = (value: number): string => value.toFixed(2)
