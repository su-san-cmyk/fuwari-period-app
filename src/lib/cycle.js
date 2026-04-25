export function getAverageCycleLength(periods) {
  if (periods.length < 2) return 28
  const sorted = [...periods].sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
  const gaps = []
  for (let i = 1; i < sorted.length; i++) {
    const days = Math.round(
      (new Date(sorted[i].start_date) - new Date(sorted[i - 1].start_date)) / 86400000
    )
    if (days > 0 && days < 90) gaps.push(days)
  }
  if (gaps.length === 0) return 28
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
}

export function getCycleStatus(periods) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (periods.length === 0) return { type: 'no_data' }

  const sorted = [...periods].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
  const latest = sorted[0]
  const latestStart = new Date(latest.start_date)
  latestStart.setHours(0, 0, 0, 0)

  // 現在生理中かチェック
  if (!latest.end_date) {
    const day = Math.floor((today - latestStart) / 86400000) + 1
    return { type: 'on_period', day }
  }

  const latestEnd = new Date(latest.end_date)
  latestEnd.setHours(0, 0, 0, 0)
  if (today <= latestEnd) {
    const day = Math.floor((today - latestStart) / 86400000) + 1
    return { type: 'on_period', day }
  }

  const avgCycle = getAverageCycleLength(periods)
  const nextDate = new Date(latestStart)
  nextDate.setDate(nextDate.getDate() + avgCycle)

  const daysUntil = Math.floor((nextDate - today) / 86400000)

  if (daysUntil >= 0) {
    return { type: 'waiting', daysUntil, nextDate, avgCycle }
  } else {
    return { type: 'late', daysLate: Math.abs(daysUntil), nextDate, avgCycle }
  }
}

export function getAveragePeriodLength(periods) {
  const withEnd = periods.filter(p => p.end_date)
  if (withEnd.length === 0) return 5
  const lengths = withEnd.map(p =>
    Math.round((new Date(p.end_date) - new Date(p.start_date + 'T00:00:00')) / 86400000) + 1
  )
  return Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
}

export function getPredictedPeriods(periods, monthsAhead = 3) {
  if (periods.length === 0) return []
  const avgCycle = getAverageCycleLength(periods)
  const avgDuration = getAveragePeriodLength(periods)
  const sorted = [...periods].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
  const latestStart = new Date(sorted[0].start_date + 'T00:00:00')

  const predictions = []
  for (let i = 1; i <= monthsAhead; i++) {
    const start = new Date(latestStart)
    start.setDate(start.getDate() + avgCycle * i)
    const end = new Date(start)
    end.setDate(end.getDate() + avgDuration - 1)
    predictions.push({ start_date: toDateStr(start), end_date: toDateStr(end) })
  }
  return predictions
}

export function getOvulationDates(periods) {
  if (periods.length === 0) return null
  const avgCycle = getAverageCycleLength(periods)
  const sorted = [...periods].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
  const latestStart = new Date(sorted[0].start_date + 'T00:00:00')

  // 次回生理予定日を起点に逆算（周期-14日が排卵日）
  const nextPeriod = new Date(latestStart)
  nextPeriod.setDate(nextPeriod.getDate() + avgCycle)

  const ovulation = new Date(nextPeriod)
  ovulation.setDate(ovulation.getDate() - 14)

  // 妊娠しやすい時期：排卵日の5日前〜1日後
  const fertileStart = new Date(ovulation)
  fertileStart.setDate(fertileStart.getDate() - 5)
  const fertileEnd = new Date(ovulation)
  fertileEnd.setDate(fertileEnd.getDate() + 1)

  return {
    ovulationDate: toDateStr(ovulation),
    fertileStart: toDateStr(fertileStart),
    fertileEnd: toDateStr(fertileEnd),
  }
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function toDateStr(date) {
  return date.toISOString().slice(0, 10)
}
