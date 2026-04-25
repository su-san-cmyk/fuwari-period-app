// ラッコちゃん - 状態によって表情が変わる
export default function Otter({ mood = 'happy', size = 96 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 110 115" fill="none">
      {/* 耳 */}
      <ellipse cx="24" cy="34" rx="13" ry="12" fill="#A0693A"/>
      <ellipse cx="24" cy="34" rx="8" ry="7" fill="#C8915A"/>
      <ellipse cx="86" cy="34" rx="13" ry="12" fill="#A0693A"/>
      <ellipse cx="86" cy="34" rx="8" ry="7" fill="#C8915A"/>

      {/* 体（頭部） */}
      <circle cx="55" cy="62" r="40" fill="#A0693A"/>

      {/* 顔のクリーム色エリア */}
      <ellipse cx="55" cy="67" rx="28" ry="24" fill="#EDD9BE"/>

      {/* ほっぺの赤み */}
      <ellipse cx="34" cy="68" rx="9" ry="7" fill="rgba(255,140,140,0.22)"/>
      <ellipse cx="76" cy="68" rx="9" ry="7" fill="rgba(255,140,140,0.22)"/>

      {/* 目 */}
      <Eyes mood={mood} />

      {/* 鼻 */}
      <ellipse cx="55" cy="64" rx="5.5" ry="3.5" fill="#2D1606"/>

      {/* ひげ */}
      <line x1="26" y1="67" x2="47" y2="68" stroke="#2D1606" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="26" y1="71" x2="47" y2="71" stroke="#2D1606" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="63" y1="68" x2="84" y2="67" stroke="#2D1606" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="63" y1="71" x2="84" y2="71" stroke="#2D1606" strokeWidth="1.2" strokeLinecap="round"/>

      {/* 口 */}
      <Mouth mood={mood} />

      {/* 持ち物 */}
      <Item mood={mood} />
    </svg>
  )
}

function Eyes({ mood }) {
  if (mood === 'sleepy') return (
    <>
      {/* 半目 */}
      <path d="M40 54 Q46 49 52 54" fill="#2D1606"/>
      <path d="M40 54 Q46 57 52 54" fill="#EDD9BE"/>
      <path d="M58 54 Q64 49 70 54" fill="#2D1606"/>
      <path d="M58 54 Q64 57 70 54" fill="#EDD9BE"/>
    </>
  )
  if (mood === 'worried') return (
    <>
      <circle cx="45" cy="54" r="6" fill="#2D1606"/>
      <circle cx="65" cy="54" r="6" fill="#2D1606"/>
      <circle cx="47" cy="52" r="2.2" fill="white"/>
      <circle cx="67" cy="52" r="2.2" fill="white"/>
      {/* 眉 */}
      <line x1="40" y1="46" x2="49" y2="48" stroke="#2D1606" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="70" y1="48" x2="61" y2="46" stroke="#2D1606" strokeWidth="1.8" strokeLinecap="round"/>
    </>
  )
  if (mood === 'gentle') return (
    <>
      {/* にっこり目（弧） */}
      <path d="M39 54 Q45 48 51 54" fill="#2D1606"/>
      <path d="M59 54 Q65 48 71 54" fill="#2D1606"/>
    </>
  )
  // happy (default)
  return (
    <>
      <circle cx="45" cy="54" r="6" fill="#2D1606"/>
      <circle cx="65" cy="54" r="6" fill="#2D1606"/>
      <circle cx="47" cy="52" r="2.2" fill="white"/>
      <circle cx="67" cy="52" r="2.2" fill="white"/>
    </>
  )
}

function Mouth({ mood }) {
  if (mood === 'worried') return (
    <path d="M48 74 Q55 70 62 74" stroke="#2D1606" strokeWidth="2" fill="none" strokeLinecap="round"/>
  )
  if (mood === 'sleepy') return (
    <path d="M49 73 Q55 76 61 73" stroke="#2D1606" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
  )
  if (mood === 'gentle') return (
    <path d="M48 73 Q55 78 62 73" stroke="#2D1606" strokeWidth="2" fill="none" strokeLinecap="round"/>
  )
  // happy
  return (
    <path d="M46 73 Q55 80 64 73" stroke="#2D1606" strokeWidth="2" fill="none" strokeLinecap="round"/>
  )
}

function Item({ mood }) {
  if (mood === 'warm') return (
    // 温かいカップ ☕
    <>
      <rect x="40" y="88" width="30" height="20" rx="5" fill="#E8C49A" stroke="#A0693A" strokeWidth="1.5"/>
      <path d="M70 94 Q78 94 78 100 Q78 106 70 106" stroke="#A0693A" strokeWidth="1.5" fill="none"/>
      {/* 湯気 */}
      <path d="M48 86 Q50 82 48 78" stroke="#C8D8E8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M55 86 Q57 81 55 76" stroke="#C8D8E8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M62 86 Q64 82 62 78" stroke="#C8D8E8" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </>
  )
  // default: 貝殻 🐚
  return (
    <>
      <ellipse cx="55" cy="100" rx="16" ry="11" fill="#F0D080" stroke="#C8A040" strokeWidth="1.2"/>
      <path d="M41 100 Q55 92 69 100" stroke="#C8A040" strokeWidth="1" fill="none"/>
      <path d="M43 104 Q55 96 67 104" stroke="#C8A040" strokeWidth="1" fill="none"/>
      <line x1="55" y1="89" x2="55" y2="111" stroke="#C8A040" strokeWidth="1"/>
    </>
  )
}
