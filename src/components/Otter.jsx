export default function Otter({ mood = 'happy', size = 110 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">

      {/* ── 体（丸いシルエット） ── */}
      <ellipse cx="60" cy="78" rx="32" ry="36" fill="#2C2C3E"/>

      {/* ── おなか（白） ── */}
      <ellipse cx="60" cy="82" rx="20" ry="26" fill="#F0EEE8"/>

      {/* ── 羽（左右） ── */}
      <ellipse cx="28" cy="80" rx="10" ry="18" fill="#2C2C3E" transform="rotate(-12 28 80)"/>
      <ellipse cx="92" cy="80" rx="10" ry="18" fill="#2C2C3E" transform="rotate(12 92 80)"/>

      {/* ── 頭 ── */}
      <circle cx="60" cy="42" r="28" fill="#2C2C3E"/>

      {/* ── ほっぺ（ふわっとピンク） ── */}
      <ellipse cx="40" cy="52" rx="10" ry="8" fill="rgba(255,160,170,0.30)"/>
      <ellipse cx="80" cy="52" rx="10" ry="8" fill="rgba(255,160,170,0.30)"/>

      {/* ── くちばし ── */}
      <ellipse cx="60" cy="58" rx="7" ry="5" fill="#F5A623"/>

      {/* ── 足（ちょこん） ── */}
      <ellipse cx="48" cy="113" rx="10" ry="5" fill="#F5A623"/>
      <ellipse cx="72" cy="113" rx="10" ry="5" fill="#F5A623"/>

      {/* ── 目 ── */}
      <Eyes mood={mood} />

      {/* ── 持ち物 ── */}
      <Item mood={mood} />

    </svg>
  )
}

function Eyes({ mood }) {
  if (mood === 'worried') return (
    <>
      {/* 心配そうな眉 */}
      <line x1="42" y1="36" x2="52" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="78" y1="36" x2="68" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      {/* うるうる目 */}
      <ellipse cx="49" cy="46" rx="6" ry="7" fill="white"/>
      <ellipse cx="71" cy="46" rx="6" ry="7" fill="white"/>
      <ellipse cx="49" cy="46" rx="4" ry="5" fill="#2C2C3E"/>
      <ellipse cx="71" cy="46" rx="4" ry="5" fill="#2C2C3E"/>
      <circle cx="51" cy="44" r="1.8" fill="white"/>
      <circle cx="73" cy="44" r="1.8" fill="white"/>
    </>
  )

  if (mood === 'gentle' || mood === 'warm') return (
    <>
      {/* にっこりアーチ目 */}
      <path d="M42 46 Q49 40 56 46" fill="white"/>
      <path d="M64 46 Q71 40 78 46" fill="white"/>
    </>
  )

  // happy（キラキラ目）
  return (
    <>
      <ellipse cx="49" cy="45" rx="6.5" ry="7" fill="white"/>
      <ellipse cx="71" cy="45" rx="6.5" ry="7" fill="white"/>
      <ellipse cx="49" cy="45" rx="4.5" ry="5" fill="#2C2C3E"/>
      <ellipse cx="71" cy="45" rx="4.5" ry="5" fill="#2C2C3E"/>
      {/* キラキラ */}
      <circle cx="51.5" cy="42.5" r="2.2" fill="white"/>
      <circle cx="73.5" cy="42.5" r="2.2" fill="white"/>
      <circle cx="51"   cy="47"   r="1"   fill="white"/>
      <circle cx="73"   cy="47"   r="1"   fill="white"/>
    </>
  )
}

function Item({ mood }) {
  if (mood === 'warm') return (
    // あったかカップ☕ 羽で持つ
    <>
      <rect x="44" y="84" width="32" height="22" rx="6" fill="#E8C99A" stroke="#C09050" strokeWidth="1.4"/>
      <path d="M76 90 Q84 90 84 96 Q84 102 76 102" stroke="#C09050" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
      {/* 湯気 */}
      <path d="M52 82 Q54 76 52 70" stroke="#B8D4E4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M60 82 Q62 75 60 68" stroke="#B8D4E4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M68 82 Q70 76 68 70" stroke="#B8D4E4" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* ハート */}
      <path d="M52 92 Q54 89 56 92 Q58 89 60 92 Q58 96 56 98 Q54 96 52 92Z" fill="#E07080" opacity="0.8"/>
    </>
  )

  // happy / gentle / worried — 何も持たない（シンプル）
  return null
}
