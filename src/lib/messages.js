export function getStatusInfo(status) {
  switch (status.type) {
    case 'no_data':
      return {
        title: 'はじめましょう',
        message: '生理がきたら「生理きた」を押して記録してみてください。続けることで次回の予測精度が上がっていきます。',
        color: 'rose',
      }

    case 'on_period':
      if (status.day === 1)
        return {
          title: '生理 1日目',
          message: 'きましたね。体を大切にしてください。お腹を冷やさないよう、温かくして過ごしてくださいね。',
          color: 'rose',
        }
      if (status.day <= 2)
        return {
          title: `生理 ${status.day}日目`,
          message: '一番つらい時期かもしれません。無理しないでくださいね。温かい飲み物やカイロで体を温めてみてください。ゆっくり過ごしてくださいね。',
          color: 'rose',
        }
      if (status.day <= 4)
        return {
          title: `生理 ${status.day}日目`,
          message: '中盤ですね。少し楽になってきましたか？まだ無理は禁物です。体を温めながらゆっくり過ごしてください。',
          color: 'rose',
        }
      return {
        title: `生理 ${status.day}日目`,
        message: 'もう少しで終わりそうですね。お疲れ様です。終わりましたら「終わった」を押してください。',
        color: 'rose',
      }

    case 'waiting':
      if (status.daysUntil === 0)
        return {
          title: 'そろそろかもしれません',
          message: 'もしかしたら今日くるかもしれません。バッグにナプキンを入れておくといいですよ。お腹も冷やさないようにしてください。',
          color: 'purple',
        }
      if (status.daysUntil <= 2)
        return {
          title: `あと約${status.daysUntil}日`,
          message: 'もうすぐかもしれません。ナプキンの準備をしておいてくださいね。お腹を冷やさないようにしてください。',
          color: 'purple',
        }
      if (status.daysUntil <= 5)
        return {
          title: `あと約${status.daysUntil}日`,
          message: 'もうすぐですね。体調の変化に気づいたら無理しないでください。準備しておくといいかもしれません。',
          color: 'purple',
        }
      return {
        title: `あと約${status.daysUntil}日`,
        message: 'まだ余裕がありますね。元気に過ごしてください。',
        color: 'sky',
      }

    case 'late':
      if (status.daysLate <= 3)
        return {
          title: `${status.daysLate}日、遅れているかもしれません`,
          message: '少し遅れているようですね。でも大丈夫ですよ。体には個人差がありますし、ストレスや疲れ、寝不足で遅れることもよくあります。ゆっくり様子を見ましょう。',
          color: 'green',
        }
      if (status.daysLate <= 7)
        return {
          title: `${status.daysLate}日、遅れているかもしれません`,
          message: '遅れているのが続いていますね。気にしすぎると余計ストレスになることもあります。もし心配が続くようであれば、産婦人科に相談するのも全然ありですよ。行くことは普通のことですから。',
          color: 'green',
        }
      return {
        title: `${status.daysLate}日、遅れているかもしれません`,
        message: '体がゆっくりしているのかもしれませんね。自分を責めないでくださいね。心配が続くようであれば、産婦人科で診ていただくのも良い選択です。一人で抱え込まないでください。',
        color: 'green',
      }

    default:
      return { title: '', message: '', color: 'rose' }
  }
}

export const SYMPTOMS = [
  {
    id: 'stomachache',
    label: '腹痛',
    emoji: '🤕',
    advice: 'おつらいですね。カイロやホットドリンクでお腹を温めてみてください。ゆっくり深呼吸も効くことがあります。無理せず横になってくださいね🍵',
  },
  {
    id: 'backache',
    label: '腰痛',
    emoji: '😰',
    advice: '腰もおつらいですね。温かいシャワーやお風呂が楽になるかもしれません。横になって腰の下に枕を置くと楽になることも。ゆっくり休んでください🛁',
  },
  {
    id: 'tired',
    label: 'だるい',
    emoji: '😴',
    advice: '体が重い時期ですね。いつもより少し多く休んでいただいて大丈夫ですよ。今日は自分に優しくしてください✨',
  },
  {
    id: 'irritated',
    label: 'イライラ',
    emoji: '😤',
    advice: 'ホルモンの影響ですから、自分を責めないでくださいね。好きな音楽を聴いたり、甘いものを食べたり、自分が落ち着けることをしてみてください🌸',
  },
  {
    id: 'nausea',
    label: '気持ち悪い',
    emoji: '🤢',
    advice: '無理に食べなくて大丈夫ですよ。温かいお茶や生姜湯から始めてみてください。横になって楽な姿勢で休んでくださいね🍵',
  },
  {
    id: 'headache',
    label: '頭痛',
    emoji: '😣',
    advice: '頭が痛いですね。暗くて静かな場所で横になってみてください。冷たいタオルを額に当てるのも効くことがあります。つらければ鎮痛剤を使っても大丈夫ですよ。',
  },
]

export const TIPS = [
  { emoji: '🌡️', text: '体を温めることは生理中の強い味方です。カイロや温かい飲み物を活用してみてください。' },
  { emoji: '💊', text: '鎮痛剤は痛みが強くなる前に飲むと効果的なことが多いです。' },
  { emoji: '🧘', text: '軽いストレッチや深呼吸が腹痛を和らげることもあります。無理のない範囲でどうぞ。' },
  { emoji: '😴', text: 'いつもより眠くなるのは当然のことです。体が回復しようとしているので、無理しないでください。' },
  { emoji: '🥤', text: '温かい飲み物は体を温めて、気持ちも少し楽にしてくれます。' },
  { emoji: '🛁', text: 'ぬるめのお風呂でゆっくり体を温めると、痛みが和らぐことがあります。' },
]
