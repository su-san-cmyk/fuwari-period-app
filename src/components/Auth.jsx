import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('確認メールを送ったよ🌸 メールを確認してね。')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('メールアドレスかパスワードが違うみたい🌿')
      } else if (err.message?.includes('User already registered')) {
        setError('このメールはすでに登録されてるよ。ログインしてみてね🌸')
      } else {
        setError('エラーが起きたよ。もう一度試してみてね🙏')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!supabase) {
    return (
      <div style={styles.wrap}>
        <div style={styles.deco}>🌸</div>
        <h1 style={styles.logo}>ふわり</h1>
        <p style={styles.tagline}>あなたのリズムを、そっと見守るよ</p>
        <div style={styles.card}>
          <p style={{ color: '#b07080', fontSize: 14, lineHeight: 1.7, textAlign: 'center' }}>
            Supabaseの設定が必要です。<br />
            <code style={{ background: '#fff0f5', padding: '2px 6px', borderRadius: 6, fontSize: 12 }}>.env</code> ファイルを設定してね。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.wrap}>
      {/* デコレーション */}
      <div style={styles.topDeco}>
        <span style={{ fontSize: 56, filter: 'drop-shadow(0 4px 12px rgba(251,113,133,0.3))' }}>🌸</span>
        <div style={styles.petals}>
          <span style={{ fontSize: 20, opacity: 0.4, transform: 'rotate(-20deg)', display: 'inline-block' }}>🌸</span>
          <span style={{ fontSize: 14, opacity: 0.3, transform: 'rotate(15deg)', display: 'inline-block' }}>🌷</span>
          <span style={{ fontSize: 18, opacity: 0.35, transform: 'rotate(5deg)', display: 'inline-block' }}>🌸</span>
        </div>
      </div>

      <h1 style={styles.logo}>ふわり</h1>
      <p style={styles.tagline}>あなたのリズムを、そっと見守るよ</p>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>{isSignUp ? '新しくはじめる 🌱' : 'おかえり 🌸'}</h2>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            style={styles.input}
          />

          <label style={styles.label}>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="6文字以上"
            required
            minLength={6}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
            {loading ? '...' : isSignUp ? 'はじめる ✨' : 'ログイン'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
          style={styles.switchBtn}
        >
          {isSignUp ? 'すでにアカウントがある → ログイン' : 'はじめて使う → アカウント作成'}
        </button>
      </div>

      <p style={styles.note}>
        機種変更しても、同じメールで全データを引き継げるよ 🌿
      </p>
    </div>
  )
}

const styles = {
  wrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    minHeight: '100dvh',
  },
  topDeco: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
  },
  petals: {
    display: 'flex',
    gap: 8,
    marginTop: 4,
  },
  logo: {
    fontSize: 36,
    fontWeight: 800,
    background: 'linear-gradient(135deg, #ff9eb5, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '4px 0',
    letterSpacing: '0.05em',
  },
  tagline: {
    fontSize: 13,
    color: '#c9a0b0',
    marginBottom: 28,
    letterSpacing: '0.03em',
  },
  card: {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    borderRadius: 28,
    padding: '28px 24px',
    width: '100%',
    maxWidth: 360,
    boxShadow: '0 4px 32px rgba(251,113,133,0.12), 0 1px 8px rgba(251,113,133,0.06)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#d06080',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: 12,
    color: '#c9a0b0',
    marginBottom: 6,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 16,
    border: '1.5px solid #fecdd3',
    background: '#fff8fa',
    fontSize: 14,
    color: '#5a3a4a',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: 14,
    boxSizing: 'border-box',
  },
  error: { color: '#fb7185', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  success: { color: '#4ade80', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  switchBtn: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#e8a0b0',
    fontSize: 13,
    marginTop: 14,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: '#c9a0b0',
    marginTop: 28,
    textAlign: 'center',
    lineHeight: 1.7,
  },
  deco: { fontSize: 56, marginBottom: 8 },
}
