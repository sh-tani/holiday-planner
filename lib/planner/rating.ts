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
 * 活動時間帯を必ず表示し、活動時間帯より評価が低い往路・復路を併記する
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

  const outbound = plan.outboundTravelMinutes
  const activity = plan.activityMinutes
  const returning = plan.returnTravelMinutes

  if (
    outbound === null ||
    activity === null ||
    returning === null ||
    outbound < 0 ||
    activity <= 0 ||
    returning < 0 ||
    (!plan.departureTime && !plan.returnTime)
  ) {
    return getRating(plan)
  }

  function toAbsoluteMinutes(
    date: string,
    time: string
  ): number | null {
    const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    const timeMatch = time.match(/^(\d{2}):(\d{2})/)

    if (!dateMatch || !timeMatch) {
      return null
    }

    const [, year, month, day] = dateMatch
    const [, hour, minute] = timeMatch

    const y = Number(year)
    const m = Number(month)
    const d = Number(day)
    const h = Number(hour)
    const min = Number(minute)

    if (
      m < 1 || m > 12 ||
      d < 1 || d > 31 ||
      h < 0 || h > 23 ||
      min < 0 || min > 59
    ) {
      return null
    }

    return Date.UTC(y, m - 1, d, h, min) / 60000
  }

  const totalDuration = outbound + activity + returning
  let departureMinutes: number | null = null

  if (plan.departureTime) {
    departureMinutes = toAbsoluteMinutes(
      plan.date,
      plan.departureTime
    )
  } else if (plan.returnTime) {
    const returnMinutes = toAbsoluteMinutes(
      plan.date,
      plan.returnTime
    )

    if (returnMinutes !== null) {
      departureMinutes = returnMinutes - totalDuration
    }
  }

  if (departureMinutes === null) {
    return getRating(plan)
  }

  const segments = [
    {
      label: '往路',
      start: departureMinutes,
      end: departureMinutes + outbound,
    },
    {
      label: '活動時間帯',
      start: departureMinutes + outbound,
      end: departureMinutes + outbound + activity,
    },
    {
      label: '復路',
      start: departureMinutes + outbound + activity,
      end: departureMinutes + totalDuration,
    },
  ]

  function getSegmentRating(
    segment: (typeof segments)[number]
  ): RatingResult | null {
    if (segment.start >= segment.end) {
      return null
    }

    const matchingHours = hourly.filter((weather) => {
      const match = weather.time.match(
        /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/
      )

      if (!match) {
        return false
      }

      const hourStart = toAbsoluteMinutes(
        match[1],
        `${match[2]}:${match[3]}`
      )

      if (hourStart === null) {
        return false
      }

      return (
        hourStart < segment.end &&
        hourStart + 60 > segment.start
      )
    })

    if (matchingHours.length === 0) {
      return null
    }

    const ratings = matchingHours.map((weather) => {
      if (
        weather.weatherCode === null ||
        weather.rain === null ||
        weather.wind === null
      ) {
        return {
          label: '予報待ち',
          tone: 'caution' as const,
          score: 0,
          reason: '天気予報を取得できていません',
        }
      }

      return getWeatherRating(
        weather.weatherCode,
        weather.rain,
        weather.wind
      )
    })

    return ratings.reduce((worst, current) =>
      current.score < worst.score ? current : worst
    )
  }

  const activitySegment = segments[1]
  const activityRating = getSegmentRating(activitySegment)

  if (!activityRating) {
    return {
      label: '予報待ち',
      tone: 'caution',
      score: 0,
      reason: '活動時間帯の天気予報を取得できていません',
    }
  }

  const reasons = [
    `活動時間帯：${activityRating.reason}`,
  ]

  for (const segment of [segments[0], segments[2]]) {
    const segmentRating = getSegmentRating(segment)

    if (
      segmentRating &&
      segmentRating.label !== '予報待ち' &&
      activityRating.label !== '予報待ち' &&
      segmentRating.score < activityRating.score
    ) {
      reasons.push(`${segment.label}：${segmentRating.reason}`)
    }
  }

  return {
    ...activityRating,
    reason: reasons.join(' / '),
  }
}