import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { lsStartPeriod, lsEndPeriod, lsGetPeriods } from '../lib/storage'
import { getCycleStatus, getAverageCycleLength, getAveragePeriodLength, toDateStr } from '../lib/cycle'
import { getStatusInfo, SYMPTOMS, TIPS } from '../lib/messages'
import { requestPermission, canNotify } from '../lib/notify'
import Otter from './Otter'

const CARD_THEMES = {
  rose:   { bg: 'linear-gradient(135deg,#fff0f5 0%,#ffe4ec 100%)', border: 'rgba(254,205,211,0.8)', title: '#e05070' },
  purple: { bg: 'linear-gradient(135deg,#faf5ff 0%,#f0e8ff 100%)', border: 'rgba(233,213,255,0.8)', title: '#9060d0' },
  green:  { bg: 'linear-gradient(135deg,#f0fff8 0%,#e0faf0 100%)', border: 'rgba(167,243,208,0.8)', title: '#30a060' },
  sky:    { bg: 'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)', border: 'rgba(186,230,253,0.8)', title: '#0890c0' },
}

function todayMinus(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return toDateStr(d)
}

function fmtLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日（${'日月火水木金土'[d.getDay()]}）`
}

export default function Home({ user, periods, setPeriods, periodsLoaded, notifPermission, onNotifGranted }) {
  const [selectedSymptom, setSelectedSymptom] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [datePicker, setDatePicker] = useState(null) // 'start' | 'end' | null
  const [pickedDate, setPickedDate] = useState('')
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])

  const showNotifBanner = canNotify() && notifPermission === 'default'

  async function handleNotifRequest() {
    const granted = await requestPermission()
    if (granted) onNotifGranted()
  }

  const status = getCycleStatus(periods)
  const info = getStatusInfo(status)
  const theme = CARD_THEMES[info.color] || CARD_THEMES.rose

  // ラッコちゃんの表情
  const otterMood = (() => {
    if (status.type === 'on_period') {
      if (status.day <= 2) return 'warm'   // つらい時期→温かいカップ持参
      if (status.day <= 4) return 'gentle' // 中盤→やさしく
      return 'happy'                        // 終盤→励まし
    }
    if (status.type === 'late') {
      return status.daysLate >= 4 ? 'worried' : 'gentle'
    }
    if (status.type === 'waiting' && status.daysUntil <= 2) return 'gentle'
    return 'happy'
  })()
  const activePeriod = periods.find(p => !p.end_date)
  const symptomInfo = SYMPTOMS.find(s => s.id === selectedSymptom)

  const showSymptoms = status.type === 'on_period'
    || (status.type === 'waiting' && status.daysUntil <= 3)
    || status.type === 'late'

  function openPicker(type) {
    setPickedDate(toDateStr(new Date()))
    setDatePicker(type)
  }

  async function confirmDate() {
    if (!pickedDate) return
    setDatePicker(null)
    setActionLoading(true)

    if (datePicker === 'start') {
      if (supabase && user) {
        const { data } = await supabase.from('periods')
          .insert({ user_id: user.id, start_date: pickedDate }).select().single()
        if (data) setPeriods(prev => [data, ...prev].sort((a, b) => b.start_date.localeCompare(a.start_date)))
      } else {
        lsStartPeriod(pickedDate)
        setPeriods(lsGetPeriods())
      }
    } else if (datePicker === 'end' && activePeriod) {
      if (supabase && user) {
        const { data } = await supabase.from('periods')
          .update({ end_date: pickedDate }).eq('id', activePeriod.id).select().single()
        if (data) setPeriods(prev => prev.map(p => p.id === data.id ? data : p))
      } else {
        lsEndPeriod(activePeriod.id, pickedDate)
        setPeriods(lsGetPeriods())
      }
    }
    setActionLoading(false)
  }

  if (!periodsLoaded) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 36 }}>🌸</span>
    </div>
  }

  const today = toDateStr(new Date())
  const yesterday = todayMinus(1)
  const dayBefore = todayMinus(2)
  const pickerTitle = datePicker === 'start' ? 'いつ来ましたか？' : 'いつ終わりましたか？'
  const maxDate = datePicker === 'end' && activePeriod ? today : today

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ステータスカード */}
      <div style={{ background: theme.bg, border: `1.5px solid ${theme.border}`, borderRadius: 28, padding: '24px 20px', boxShadow: '0 4px 24px rgba(251,113,133,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          {/* ラッコちゃん */}
          <div style={{ flexShrink: 0, filter: 'drop-shadow(0 4px 8px rgba(160,105,58,0.18))' }}>
            <Otter mood={otterMood} size={92} />
          </div>
          {/* メッセージ */}
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: theme.title, marginBottom: 10, marginTop: 0, lineHeight: 1.3 }}>
              {info.title}
            </h2>
            <p style={{ fontSize: 13, color: '#7a5060', lineHeight: 1.85, margin: 0 }}>
              {info.message}
            </p>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      {!activePeriod ? (
        <button onClick={() => openPicker('start')} disabled={actionLoading} className="btn-primary">
          🌸　生理が来ました
        </button>
      ) : (
        <button onClick={() => openPicker('end')} disabled={actionLoading} className="btn-secondary">
          ✅　生理が終わりました
        </button>
      )}

      {/* 症状ボタン */}
      {showSymptoms && (
        <div>
          <p style={sectionLabel}>今の体調はいかがですか？</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {SYMPTOMS.map(s => {
              const sel = selectedSymptom === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSymptom(sel ? null : s.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', padding: '12px 4px', borderRadius: 20,
                    border: sel ? 'none' : '1.5px solid #fecdd3',
                    background: sel ? 'linear-gradient(135deg,#ff9eb5,#fb7185)' : 'rgba(255,255,255,0.85)',
                    color: sel ? 'white' : '#b07080',
                    fontFamily: 'inherit', cursor: 'pointer',
                    boxShadow: sel ? '0 4px 16px rgba(251,113,133,0.3)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: sel ? 700 : 400 }}>{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* アドバイスカード */}
      {symptomInfo && (
        <div style={{ background: 'linear-gradient(135deg,#fff0f5,#fdf4ff)', border: '1.5px solid #fecdd3', borderRadius: 24, padding: 20, boxShadow: '0 2px 20px rgba(251,113,133,0.07)' }}>
          <p style={{ fontSize: 14, color: '#7a5060', lineHeight: 1.85, margin: 0 }}>
            {symptomInfo.advice}
          </p>
        </div>
      )}

      {/* サイクル統計 */}
      {periods.length >= 1 && (
        <div style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 20, padding: '14px 16px', display: 'flex', gap: 0, boxShadow: '0 2px 12px rgba(251,113,133,0.06)' }}>
          <StatPill
            emoji="🌙"
            label="平均サイクル"
            value={periods.length >= 2 ? `${getAverageCycleLength(periods)}日` : null}
            note={`あと${Math.max(0, 2 - periods.length)}回`}
          />
          <div style={{ width: 1, background: '#fce7f3' }} />
          <StatPill
            emoji="🥚"
            label="平均生理期間"
            value={periods.filter(p => p.end_date).length >= 1 ? `${getAveragePeriodLength(periods)}日` : null}
            note="終了記録待ち"
          />
        </div>
      )}

      {/* 豆知識 */}
      <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 24, padding: 20, boxShadow: '0 2px 20px rgba(251,113,133,0.07)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>{tip.emoji}</span>
        <p style={{ fontSize: 13, color: '#9a7080', lineHeight: 1.75, margin: 0 }}>{tip.text}</p>
      </div>

      {/* 通知許可バナー */}
      {showNotifBanner && (
        <div style={{ background: 'linear-gradient(135deg,#faf5ff,#f3e8ff)', border: '1.5px solid #e9d5ff', borderRadius: 24, padding: 20, boxShadow: '0 2px 20px rgba(168,85,247,0.08)' }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: '#9060d0', marginBottom: 6, marginTop: 0 }}>
            🔔　通知を受け取りますか？
          </p>
          <p style={{ fontSize: 13, color: '#7a6090', lineHeight: 1.75, marginBottom: 14, marginTop: 0 }}>
            生理予定日の4日前になったら「ナプキンを準備してください」などのお知らせをお送りします。
          </p>
          <button
            onClick={handleNotifRequest}
            style={{
              width: '100%', padding: '13px', borderRadius: 999,
              background: 'linear-gradient(135deg,#c084fc,#a855f7)',
              color: 'white', border: 'none', fontFamily: 'inherit',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(168,85,247,0.3)',
            }}
          >
            通知を許可する
          </button>
        </div>
      )}

      {/* 通知ONの確認 */}
      {notifPermission === 'granted' && (
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🔔</span>
          <p style={{ fontSize: 12, color: '#a0a0b0', margin: 0 }}>
            通知はONです。生理予定日の4日〜1日前にお知らせします。
          </p>
        </div>
      )}

      {/* 日付ピッカー モーダル */}
      {datePicker && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(90,40,60,0.35)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={() => setDatePicker(null)}
        >
          <div
            style={{ background: 'white', borderRadius: '28px 28px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 430, boxShadow: '0 -8px 40px rgba(251,113,133,0.15)' }}
            onClick={e => e.stopPropagation()}
          >
            <p style={{ fontSize: 16, fontWeight: 800, color: '#d06080', textAlign: 'center', marginBottom: 20, marginTop: 0 }}>
              📅　{pickerTitle}
            </p>

            {/* クイック選択 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                { label: `今日　${fmtLabel(today)}`, value: today },
                { label: `昨日　${fmtLabel(yesterday)}`, value: yesterday },
                { label: `一昨日　${fmtLabel(dayBefore)}`, value: dayBefore },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPickedDate(opt.value)}
                  style={{
                    padding: '13px 18px', borderRadius: 16, textAlign: 'left',
                    fontFamily: 'inherit', fontSize: 14, fontWeight: pickedDate === opt.value ? 700 : 400,
                    background: pickedDate === opt.value ? 'linear-gradient(135deg,#fff0f5,#fde4ec)' : '#f9f4f6',
                    border: pickedDate === opt.value ? '2px solid #fecdd3' : '2px solid transparent',
                    color: pickedDate === opt.value ? '#e05070' : '#7a5060',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* カスタム日付 */}
            <p style={{ fontSize: 12, color: '#c9a0b0', marginBottom: 6, fontWeight: 500 }}>それ以前の日付</p>
            <input
              type="date"
              value={pickedDate}
              max={maxDate}
              onChange={e => setPickedDate(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 16, border: '1.5px solid #fecdd3', background: '#fff8fa', fontSize: 14, color: '#5a3a4a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
            />

            <button
              onClick={confirmDate}
              disabled={!pickedDate}
              className="btn-primary"
            >
              この日付で記録する
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatPill({ emoji, label, value, note }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '2px 10px' }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
      <div>
        <p style={{ fontSize: 10, color: '#c9a0b0', margin: '0 0 2px', fontWeight: 500 }}>{label}</p>
        {value
          ? <p style={{ fontSize: 18, fontWeight: 800, color: '#e05070', margin: 0 }}>{value}</p>
          : <p style={{ fontSize: 11, color: '#d8b8c0', margin: 0 }}>{note}</p>
        }
      </div>
    </div>
  )
}

const sectionLabel = {
  fontSize: 12, color: '#c9a0b0', marginBottom: 8, paddingLeft: 4, fontWeight: 500,
}
