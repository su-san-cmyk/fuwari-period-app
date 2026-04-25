// Supabase未設定時のローカルストレージ版

const KEY = 'fuwari_periods'

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function save(periods) {
  localStorage.setItem(KEY, JSON.stringify(periods))
}

export function lsGetPeriods() {
  return load().sort((a, b) => b.start_date.localeCompare(a.start_date))
}

export function lsStartPeriod(start_date) {
  const periods = load()
  const record = { id: crypto.randomUUID(), start_date, end_date: null, created_at: new Date().toISOString() }
  save([...periods, record])
  return record
}

export function lsEndPeriod(id, end_date) {
  const periods = load().map(p => p.id === id ? { ...p, end_date } : p)
  save(periods)
  return periods.find(p => p.id === id)
}
