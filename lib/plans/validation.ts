export type PlanInput = {
  title: string
  mountainId: string
  date: string | null
  weather: string
  weatherCode: number | null
  rain: number
  wind: number
  fixed: boolean
  departureTime: string | null
  returnTime: string | null
  outboundTravelMinutes: number | null
  activityMinutes: number | null
  returnTravelMinutes: number | null
}

type ValidationResult =
  | { success: true; data: PlanInput }
  | { success: false; error: string }

const isRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value)

const isNullableNumber = (
  value: unknown
): value is number | null =>
  value === null ||
  (typeof value === 'number' && Number.isFinite(value))

const isDate = (value: unknown): value is string => {
  if (typeof value !== 'string') return false

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

const isNullableTime = (value: unknown): value is string | null =>
  value === null ||
  (typeof value === 'string' &&
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?$/.test(value))

const isNullableDuration = (
  value: unknown,
  minimum: number
): value is number | null =>
  value === null ||
  (typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= minimum)

export function validatePlanInput(
  body: unknown
): ValidationResult {
  if (!isRecord(body)) {
    return { success: false, error: '入力データの形式が不正です。' }
  }

  const {
    title,
    mountainId,
    date,
    weather,
    weatherCode,
    rain,
    wind,
    fixed,
    departureTime,
    returnTime,
    outboundTravelMinutes,
    activityMinutes,
    returnTravelMinutes,
  } = body

  if (
    typeof mountainId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(mountainId)
  ) {
    return { success: false, error: '山の選択は必須です。' }
  }

  if (
    title !== undefined &&
    title !== null &&
    typeof title !== 'string'
  ) {
    return { success: false, error: 'タイトルの形式が不正です。' }
  }

  if (
    weather !== undefined &&
    weather !== null &&
    typeof weather !== 'string'
  ) {
    return { success: false, error: '天気の形式が不正です。' }
  }

  if (
    date !== undefined &&
    date !== null &&
    !isDate(date)
  ) {
    return { success: false, error: '日付の形式が不正です。' }
  }

  if (
    fixed !== undefined &&
    fixed !== null &&
    typeof fixed !== 'boolean'
  ) {
    return { success: false, error: '日程確定状態の形式が不正です。' }
  }

  if (
    weatherCode !== undefined &&
    !isNullableNumber(weatherCode)
  ) {
    return { success: false, error: '天気コードの形式が不正です。' }
  }

  if (
    weatherCode !== undefined &&
    weatherCode !== null &&
    !Number.isInteger(weatherCode)
  ) {
    return { success: false, error: '天気コードは整数で指定してください。' }
  }

  if (
    rain !== undefined &&
    !isNullableNumber(rain)
  ) {
    return { success: false, error: '降水確率の形式が不正です。' }
  }

  if (
    rain !== undefined &&
    rain !== null &&
    (rain < 0 || rain > 100)
  ) {
    return { success: false, error: '降水確率は0〜100で指定してください。' }
  }

  if (
    wind !== undefined &&
    !isNullableNumber(wind)
  ) {
    return { success: false, error: '風速の形式が不正です。' }
  }

  if (
    wind !== undefined &&
    wind !== null &&
    wind < 0
  ) {
    return { success: false, error: '風速は0以上で指定してください。' }
  }

  if (
    departureTime !== undefined &&
    !isNullableTime(departureTime)
  ) {
    return { success: false, error: '出発時刻の形式が不正です。' }
  }

  if (
    returnTime !== undefined &&
    !isNullableTime(returnTime)
  ) {
    return { success: false, error: '帰宅時刻の形式が不正です。' }
  }

  if (
    outboundTravelMinutes !== undefined &&
    !isNullableDuration(outboundTravelMinutes, 0)
  ) {
    return { success: false, error: '往路の移動時間は0以上の整数で指定してください。' }
  }

  if (
    activityMinutes !== undefined &&
    !isNullableDuration(activityMinutes, 1)
  ) {
    return { success: false, error: '活動時間は1以上の整数で指定してください。' }
  }

  if (
    returnTravelMinutes !== undefined &&
    !isNullableDuration(returnTravelMinutes, 0)
  ) {
    return { success: false, error: '復路の移動時間は0以上の整数で指定してください。' }
  }

  return {
    success: true,
    data: {
      title: title == null ? '' : title as string,
      mountainId,
      date: date === undefined ? null : date as string | null,
      weather: weather == null ? '不明' : weather as string,
      weatherCode: weatherCode === undefined ? null : weatherCode as number | null,
      rain: rain == null ? 0 : rain as number,
      wind: wind == null ? 0 : wind as number,
      fixed: fixed == null ? true : fixed as boolean,
      departureTime: departureTime === undefined ? null : departureTime as string | null,
      returnTime: returnTime === undefined ? null : returnTime as string | null,
      outboundTravelMinutes: outboundTravelMinutes === undefined ? null : outboundTravelMinutes as number | null,
      activityMinutes: activityMinutes === undefined ? null : activityMinutes as number | null,
      returnTravelMinutes: returnTravelMinutes === undefined ? null : returnTravelMinutes as number | null,
    },
  }
}
