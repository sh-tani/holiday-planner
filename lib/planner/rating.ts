import type { Plan } from '@/lib/types'

export type RatingResult = {
  label: string
  tone: 'good' | 'caution' | 'bad'
  score: number
}

/**
 * 天気情報からおすすめ度を計算
 */
export function getRating(plan: Plan): RatingResult {
  // 日程未定
  if (!plan.date) {
    return {
      label: '日程未定',
      tone: 'caution',
      score: 0,
    }
  }

  // 天気情報が取得できていない
  if (plan.weatherCode === null) {
    return {
      label: '予報待ち',
      tone: 'caution',
      score: 0,
    }
  }

  const { weatherCode, rain, wind } = plan

  // 雷雨
  if ([95, 96, 99].includes(weatherCode)) {
    return {
      label: 'おすすめしない',
      tone: 'bad',
      score: 10,
    }
  }

  // 大雨・強いにわか雨・大雪・強い雪
  if ([65, 67, 75, 82, 86].includes(weatherCode)) {
    return {
      label: 'おすすめしない',
      tone: 'bad',
      score: 20,
    }
  }

  // 強風
  if (wind > 10) {
    return {
      label: 'おすすめしない',
      tone: 'bad',
      score: 25,
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
      }
    }

    return {
      label: '注意して計画',
      tone: 'caution',
      score: 55,
    }
  }

  // 晴れ・くもり
  if ([0, 1, 2, 3].includes(weatherCode)) {
    if (rain <= 20 && wind <= 4) {
      return {
        label: 'おすすめ',
        tone: 'good',
        score: 92,
      }
    }

    if (rain <= 40 && wind <= 7) {
      return {
        label: '注意して計画',
        tone: 'caution',
        score: 70,
      }
    }

    return {
      label: 'おすすめしない',
      tone: 'bad',
      score: 40,
    }
  }

  // 想定外のweatherCode
  return {
    label: '判定不可',
    tone: 'caution',
    score: 0,
  }
}