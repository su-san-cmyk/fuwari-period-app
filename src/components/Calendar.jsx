import { useState } from 'react'
import { formatDate, getAverageCycleLength, getAveragePeriodLength, getOvulationDates, getPredictedPeriods, toDateStr } from '../lib/cycle'

export default function Calendar({ periods }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  // 実際の生理日
  const periodDates = new Set()
  periods.forEach(p => {
    const start = new Date(p.start_date + 'T00:00:00')
    const end = p.end_date ? new Date(p.end_date + 'T00:00:00') : new Date(p.start_date + 'T00:00:00')
    const d = new Date(start)
    while (d <= end) { periodDates.add(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1) }
  })

  // 予測生理 + 可能性ウィンドウ（統合）：予測開始日 -3〜+3 の7日間
  const predictedSet = new Set()
  getPredictedPeriods(periods, 13).forEach(p => {
    const coreStart = new Date(p.start_date + 'T00:00:00')
    const winStart = new Date(coreStart); winStart.setDate(winStart.getDate() - 3)
    const winEnd   = new Date(coreStart); winEnd.setDate(winEnd.getDate() + 3)
    const d = new Date(winStart)
    while (d <= winEnd) { predictedSet.add(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1) }
  })

  // 排卵・妊娠しやすい時期
  const ovInfo = getOvulationDates(periods)
  const ovulationDate = ovInfo?.ovulationDate
  const fertileSet = new Set()
  if (ovInfo) {
    const fs = new Date(ovInfo.fertileStart + 'T00:00:00')
    const fe = new Date(ovInfo.fertileEnd + 'T00:00:00')
    const d = new Date(fs)
    while (d <= fe) { fertileSet.add(d.toISOString().slice(0, 10)); d.setDate(d.getDate() + 1) }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const todayStr = toDateStr(today)
  const avgCycle = getAverageCycleLength(periods)
  const avgDuration = getAveragePeriodLength(periods)
  const hasEnoughData = periods.length >= 2
  const hasEndData = periods.filter(p => p.end_date).length >= 1

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>
      <div style={cardStyle}>

        {/* 月ナビ */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <span style={{ fontWeight: 800, fontSize: 16, color: '#d06080' }}>
            {viewYear}年{viewMonth + 1}月
          </span>
          <button onClick={nextMonth} style={navBtn}>›</button>
        </div>

        {/* 曜日ヘッダー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
          {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, paddingBottom: 6, color: i === 0 ? '#f87171' : i === 6 ? '#60a5fa' : '#c9a0b0' }}>
              {d}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px 0' }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isPeriod    = periodDates.has(dateStr)
            const isPredicted = !isPeriod && predictedSet.has(dateStr)
            const isOvulation = !isPeriod && !isPredicted && dateStr === ovulationDate
            const isFertile   = !isPeriod && !isPredicted && fertileSet.has(dateStr) && !isOvulation
            const isToday     = dateStr === todayStr

            // アイコン選択（排卵日はなし）
            let icon = null
            if (isPeriod)  icon = '🥚'
            else if (isFertile) icon = '·'

            // セル背景
            let cellBg = 'transparent'
            if (isPeriod)         cellBg = 'rgba(255,154,178,0.22)'
            else if (isPredicted) cellBg = 'rgba(255,182,193,0.28)'
            else if (isFertile)   cellBg = 'rgba(233,213,255,0.2)'

            // 数字の色
            let numColor = '#5a3a4a'
            if (isPeriod)         numColor = '#e05070'
            else if (isPredicted) numColor = '#e07090'
            else if (isFertile)   numColor = '#b090d0'

            return (
              <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 46, borderRadius: 12, background: cellBg, position: 'relative' }}>
                {/* 今日のリング（生理日とは別の見た目） */}
                {isToday && (
                  <div style={{ position: 'absolute', inset: 2, borderRadius: 10, border: '2px solid #fb7185', pointerEvents: 'none' }} />
                )}
                {/* 日付数字 */}
                <span style={{ fontSize: 13, fontWeight: (isPeriod || isToday) ? 700 : 400, color: isToday && !isPeriod ? '#fb7185' : numColor, lineHeight: 1 }}>
                  {day}
                </span>
                {/* アイコン */}
                {icon && (
                  <span style={{ fontSize: icon === '·' ? 14 : 11, lineHeight: 1, marginTop: 1, color: isFertile ? '#b090d0' : undefined }}>
                    {icon}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* 凡例 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginTop: 16 }}>
          <LegendIcon icon="🥚" label="生理期間" color="rgba(255,154,178,0.22)" />
          <LegendIcon icon="" label="生理予測" color="rgba(255,182,193,0.28)" textOnly="#e07090" />
          <LegendIcon icon="·" label="排卵前後" color="rgba(233,213,255,0.2)" dot />
          <LegendToday label="今日" />
        </div>
      </div>

      {/* サイクル統計 */}
      <div style={{ ...cardStyle, marginTop: 12 }}>
        <p style={{ fontSize: 12, color: '#c9a0b0', fontWeight: 500, margin: '0 0 12px' }}>あなたのサイクル</p>
        <div style={{ display: 'flex', gap: 0 }}>
          <InfoBlock
            emoji="🌙"
            label="平均サイクル"
            value={hasEnoughData ? `${avgCycle}日` : null}
            note={!hasEnoughData ? `あと${2 - periods.length}回分記録すると\n表示されます` : null}
          />
          <div style={{ width: 1, background: '#fce7f3', margin: '4px 0' }} />
          <InfoBlock
            emoji="🥚"
            label="平均生理期間"
            value={hasEndData ? `${avgDuration}日` : null}
            note={!hasEndData ? '「終わった」を記録すると\n表示されます' : null}
          />
        </div>
      </div>

      {/* 記録一覧 */}
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 12, color: '#c9a0b0', marginBottom: 10, paddingLeft: 4, fontWeight: 500 }}>記録した生理</p>
        {periods.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '32px 20px' }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🌸</p>
            <p style={{ fontSize: 14, color: '#c9a0b0' }}>まだ記録がありません</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {periods.slice(0, 12).map(p => {
              const duration = p.end_date
                ? Math.round((new Date(p.end_date) - new Date(p.start_date)) / 86400000) + 1
                : null
              return (
                <div key={p.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px' }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#5a3a4a' }}>{formatDate(p.start_date)}</span>
                    {p.end_date && <span style={{ fontSize: 13, color: '#c9a0b0' }}> 〜 {formatDate(p.end_date)}</span>}
                  </div>
                  <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'linear-gradient(135deg,#fff0f5,#fde8f0)', color: '#e05070', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {duration ? `${duration}日間` : '生理中 🌸'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function LegendIcon({ icon, label, color, dot, textOnly }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: color || 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: dot ? 14 : 12, color: textOnly || undefined, fontWeight: textOnly ? 700 : undefined }}>
        {icon || (textOnly ? '日' : '')}
      </div>
      <span style={{ fontSize: 11, color: '#9a7080' }}>{label}</span>
    </div>
  )
}

function LegendToday({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid #fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fb7185', fontWeight: 700 }}>
        1
      </div>
      <span style={{ fontSize: 11, color: '#9a7080' }}>{label}</span>
    </div>
  )
}

function InfoBlock({ emoji, label, value, note, purple }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px' }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
      <div>
        <p style={{ fontSize: 11, color: '#c9a0b0', margin: '0 0 3px' }}>{label}</p>
        {value
          ? <p style={{ fontSize: 20, fontWeight: 800, color: purple ? '#9060d0' : '#e05070', margin: 0 }}>{value}</p>
          : <p style={{ fontSize: 11, color: '#d0b0b8', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{note}</p>
        }
      </div>
    </div>
  )
}

const cardStyle = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(8px)',
  borderRadius: 24,
  padding: 20,
  boxShadow: '0 2px 20px rgba(251,113,133,0.07)',
}
const navBtn = {
  width: 36, height: 36, borderRadius: 999,
  background: 'linear-gradient(135deg,#fff0f5,#ffe4ec)',
  border: '1px solid #fecdd3', color: '#e05070',
  fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1, padding: 0,
}
