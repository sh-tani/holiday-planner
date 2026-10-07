import type { HourlyWeather, Plan } from '@/lib/types'

export type RatingResult = {
  label: string
  tone: 'good' | 'caution' | 'bad'
  score: number
  reason: string
}

function getWeatherRating(
  weatherCode: number,
  rain: number,
  wind: number
): RatingResult {
  // 雷雨
  if ([95, 96, 99].includes(weatherCode)) {
    return {
      label: 'おすすめしない',
      tone: 'bad',
      score: 10,
      reason: '雷雨が予想されています',
    }
  }

  // 大雨・強いにわか雨・大雪・強い雪
  if ([65, 67, 75, 82, 86].includes(weatherCode)) {
    return {
      label: 'おすすめしない',
      tone: 'bad',
      score: 20,
      reason: '強い雨や雪が予想されています',
    }
  }

  // 強風
  if (wind > 10) {
    return {
      label: 'おすすめしない',
      tone: 'bad',
      score: 25,
      reason: '強い風が予想されています',
    }
  }

  // 雨・にわか雨・雪・霧雨など
  if (
    [
      45, 48,
      51, 53, 55, 56, 57,
      61, 63, 66,
      71, 73, 77,
      80, 81, 85,
    ].includes(weatherCode)
  ) {
    if (rain >= 50 || wind > 7) {
      return {
        label: 'おすすめしない',
        tone: 'bad',
        score: 35,
        reason: '降水確率または風が強めです',
      }
    }

    return {
      label: '注意して計画',
      tone: 'caution',
      score: 55,
      reason: '雨や雪が予想されています',
    }
  }

  // 晴れ・くもり
  if ([0, 1, 2, 3].includes(weatherCode)) {
    if (rain <= 20 && wind <= 4) {
      return {
        label: 'おすすめ',
        tone: 'good',
        score: 92,
        reason: '降水確率が低く、風も穏やかです',
      }
    }

    if (rain <= 40 && wind <= 7) {
      return {
        label: '注意して計画',
        tone: 'caution',
        score: 70,
        reason: '降水確率または風がやや高めです',
      }
    }

    return {
      label: 'おすすめしない',
      tone: 'bad',
      score: 40,
      reason: '降水確率または風が強めです',
    }
  }

  return {
    label: '判定不可',
    tone: 'caution',
    score: 0,
    reason: '天候を判定できません',
  }
}

/**
 * 日別の天気情報からおすすめ度を計算
 */
export function getRating(plan: Plan): RatingResult {
  if (!plan.date) {
    return {
      label: '日程未定',
      tone: 'caution',
      score: 0,
      reason: '日程を設定するとおすすめ度を判定できます',
    }
  }

  if (plan.weatherCode === null) {
    return {
      label: '予報待ち',
      tone: 'caution',
      score: 0,
      reason: '天気予報を取得できていません',
    }
  }

  return getWeatherRating(
    plan.weatherCode,
    plan.rain,
    plan.wind
  )
}

/**
 * 活動時間帯の時間別天気からおすすめ度を計算
 */
export function getHourlyRating(
  plan: Plan,
  hourly: HourlyWeather[]
): RatingResult {
  if (!plan.date) {
    return {
      label: '日程未定',
      tone: 'caution',
      score: 0,
      reason: '日程を設定するとおすすめ度を判定できます',
    }
  }

  if (
    !plan.departureTime ||
    plan.outboundTravelMinutes === null ||
    plan.activityMinutes === null
  ) {
    return getRating(plan)
  }

  const [departureHour, departureMinute] =
    plan.departureTime.split(':').map(Number)

  const activityStart =
    departureHour * 60 +
    departureMinute +
    plan.outboundTravelMinutes

  const activityEnd =
    activityStart + plan.activityMinutes

  const activityHours = hourly.filter((weather) => {
    const match = weather.time.match(/T(\d{2}):(\d{2})/)
    if (!match) {
      return false
    }

    const hour = Number(match[1])
    const minute = Number(match[2])
    const hourStart = hour * 60 + minute
    const hourEnd = hourStart + 60

    return (
      hourStart < activityEnd &&
      hourEnd > activityStart
    )
  })

  if (activityHours.length === 0) {
    return {
      label: '予報待ち',
      tone: 'caution',
      score: 0,
      reason: '活動時間帯の天気予報を取得できていません',
    }
  }

  const ratings = activityHours.map((weather) => {
    if (
      weather.weatherCode === null ||
      weather.rain === null ||
      weather.wind === null
    ) {
      return {
        label: '予報待ち',
        tone: 'caution' as const,
        score: 0,
        reason: '活動時間帯の天気予報を取得できていません',
      }
    }

    return getWeatherRating(
      weather.weatherCode,
      weather.rain,
      weather.wind
    )
  })

  const worstRating = ratings.reduce((worst, current) =>
    current.score < worst.score ? current : worst
  )

  return {
    ...worstRating,
    reason: `活動時間帯：${worstRating.reason}`,
  }
}