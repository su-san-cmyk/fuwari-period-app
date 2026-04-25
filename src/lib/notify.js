const LAST_NOTIFY_KEY = 'fuwari_last_notify_date'

export function canNotify() {
  return 'Notification' in window
}

export function getPermission() {
  if (!canNotify()) return 'unsupported'
  return Notification.permission // 'default' | 'granted' | 'denied'
}

export async function requestPermission() {
  if (!canNotify()) return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function checkAndSendNotification(status) {
  if (!canNotify() || Notification.permission !== 'granted') return

  const today = new Date().toISOString().slice(0, 10)
  if (localStorage.getItem(LAST_NOTIFY_KEY) === today) return // 1日1回のみ

  let message = null

  if (status.type === 'waiting') {
    if (status.daysUntil === 4) {
      message = {
        title: '🌸 生理予定日まであと4日です',
        body: 'バッグにナプキンを入れておくといいかもしれません。お腹も冷やさないようにしてくださいね💕',
      }
    } else if (status.daysUntil === 3) {
      message = {
        title: '🌸 生理予定日まであと3日です',
        body: '準備をしておいてくださいね。温かくして過ごしてください🌿',
      }
    } else if (status.daysUntil === 2) {
      message = {
        title: '🌸 生理予定日まであと2日です',
        body: 'もうすぐですね。ナプキンの確認をしておいてください🌙',
      }
    } else if (status.daysUntil <= 1) {
      message = {
        title: '🌙 もうすぐ生理かもしれません',
        body: 'いつ来てもいいように準備しておいてくださいね。',
      }
    }
  } else if (status.type === 'late' && status.daysLate === 1) {
    message = {
      title: '🌿 生理が少し遅れています',
      body: '体には個人差があります。ゆっくり様子を見ましょう。',
    }
  }

  if (message) {
    localStorage.setItem(LAST_NOTIFY_KEY, today)
    new Notification(message.title, {
      body: message.body,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: 'fuwari-period',
    })
  }
}
