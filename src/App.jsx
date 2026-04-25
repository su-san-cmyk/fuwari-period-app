import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { lsGetPeriods } from './lib/storage'
import { getCycleStatus } from './lib/cycle'
import { checkAndSendNotification, getPermission } from './lib/notify'
import Auth from './components/Auth'
import Home from './components/Home'
import Calendar from './components/Calendar'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('home')
  const [periods, setPeriods] = useState([])
  const [periodsLoaded, setPeriodsLoaded] = useState(false)
  const [notifPermission, setNotifPermission] = useState(getPermission())

  const isDemo = !supabase

  // サービスワーカー登録
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (isDemo) {
      setPeriods(lsGetPeriods())
      setPeriodsLoaded(true)
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session || !supabase) return
    supabase.from('periods').select('*')
      .eq('user_id', session.user.id)
      .order('start_date', { ascending: false })
      .then(({ data }) => { setPeriods(data || []); setPeriodsLoaded(true) })
  }, [session])

  // periodsロード後に通知チェック
  useEffect(() => {
    if (!periodsLoaded || periods.length === 0) return
    const status = getCycleStatus(periods)
    checkAndSendNotification(status)
  }, [periodsLoaded])

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 40, animation: 'pulse 1.5s infinite' }}>🌸</span>
      </div>
    )
  }

  if (!isDemo && !session) return <Auth />

  const TABS = [
    { key: 'home',     label: 'ホーム',      icon: HomeIcon },
    { key: 'calendar', label: 'カレンダー',  icon: CalendarIcon },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

      {/* ヘッダー */}
      <div style={headerStyle}>
        <span style={logoStyle}>🌸 ふわり</span>
        {isDemo ? (
          <span style={demoBadge}>デモ中</span>
        ) : (
          <button onClick={() => supabase.auth.signOut()} style={logoutBtn}>ログアウト</button>
        )}
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'home' && (
          <Home
            user={session?.user}
            periods={periods}
            setPeriods={setPeriods}
            periodsLoaded={periodsLoaded}
            notifPermission={notifPermission}
            onNotifGranted={() => setNotifPermission('granted')}
          />
        )}
        {activeTab === 'calendar' && <Calendar periods={periods} />}
      </div>

      {/* ボトムタブ */}
      <div style={tabBarStyle}>
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = activeTab === key
          return (
            <button key={key} onClick={() => setActiveTab(key)} style={tabBtnStyle}>
              <div style={{ ...tabIndicator, background: active ? 'linear-gradient(135deg,#ff9eb5,#fb7185)' : 'transparent', borderRadius: 16, padding: '6px 20px', transition: 'all 0.2s' }}>
                <Icon active={active} />
              </div>
              <span style={{ fontSize: 11, color: active ? '#fb7185' : '#d1a3ad', fontWeight: active ? 700 : 400 }}>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const headerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 20px',
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(254,205,211,0.5)',
  position: 'sticky', top: 0, zIndex: 10,
}
const logoStyle = {
  fontSize: 20, fontWeight: 800,
  background: 'linear-gradient(135deg, #ff9eb5, #c084fc)',
  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
}
const demoBadge = {
  fontSize: 11, padding: '4px 10px', borderRadius: 999,
  background: 'linear-gradient(135deg,#ff9eb5,#fb7185)', color: 'white', fontWeight: 700,
}
const logoutBtn = { fontSize: 12, color: '#d1a3ad', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }
const tabBarStyle = {
  position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
  width: '100%', maxWidth: 430,
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(16px)',
  borderTop: '1px solid rgba(254,205,211,0.4)',
  display: 'flex',
  paddingBottom: 'env(safe-area-inset-bottom)',
}
const tabBtnStyle = {
  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '8px 0 6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  gap: 2,
}
const tabIndicator = { display: 'flex', alignItems: 'center', justifyContent: 'center' }

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={active ? 'white' : 'none'}
      stroke={active ? 'white' : '#d1a3ad'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function CalendarIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill="none"
      stroke={active ? 'white' : '#d1a3ad'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
