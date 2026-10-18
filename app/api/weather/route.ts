import { NextResponse } from 'next/server'

function getWeatherText(weatherCode: number | null) {
  if (weatherCode === null) {
    return '不明'
  }

  if (weatherCode === 0) {
    return '快晴'
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return '晴れ・曇り'
  }

  if ([45, 48].includes(weatherCode)) {
    return '霧'
  }

  if ([51, 53, 55, 56, 57].includes(weatherCode)) {
    return '霧雨'
  }

  if ([61, 63, 65, 66, 67].includes(weatherCode)) {
    return '雨'
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return '雪'
  }

  if ([80, 81, 82].includes(weatherCode)) {
    return 'にわか雨'
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return '雷雨'
  }

  return '不明'
}

function isValidDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false
  }

  const [year, month, day] = date.split('-').map(Number)
  const parsedDate = new Date(`${date}T00:00:00Z`)

  return (
    Number.isFinite(parsedDate.getTime()) &&
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() + 1 === month &&
    parsedDate.getUTCDate() === day
  )
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const latitudeParam = searchParams.get('latitude')
    const longitudeParam = searchParams.get('longitude')
    const date = searchParams.get('date')

    if (
      latitudeParam === null ||
      longitudeParam === null ||
      date === null
    ) {
      return NextResponse.json(
        { error: 'latitude、longitude、dateは必須です' },
        { status: 400 }
      )
    }

    const latitude = Number(latitudeParam)
    const longitude = Number(longitudeParam)

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180 ||
      !isValidDate(date)
    ) {
      return NextResponse.json(
        { error: '緯度・経度または日付が不正です' },
        { status: 400 }
      )
    }

    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      daily:
        'weather_code,precipitation_probability_max,wind_speed_10m_mean',
      hourly:
        'weather_code,precipitation_probability,wind_speed_10m',
      wind_speed_unit: 'ms',
      timezone: 'Asia/Tokyo',
      start_date: date,
      end_date: date,
    })

    const url = `https://api.open-meteo.com/v1/forecast?${params}`

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      console.error('Open-Meteo APIエラー:', {
        status: response.status,
        statusText: response.statusText,
      })

      return NextResponse.json(
        { error: '天気情報の取得に失敗しました' },
        { status: 502 }
      )
    }

    const data = await response.json()

    const weatherCode = data.daily?.weather_code?.[0] ?? null
    const rain =
      data.daily?.precipitation_probability_max?.[0] ?? null
    const wind =
      data.daily?.wind_speed_10m_mean?.[0] ?? null

    const hourly = (data.hourly?.time ?? []).map(
      (time: string, index: number) => ({
        time,
        weatherCode: data.hourly?.weather_code?.[index] ?? null,
        rain:
          data.hourly?.precipitation_probability?.[index] ?? null,
        wind:
          data.hourly?.wind_speed_10m?.[index] ?? null,
      })
    )

    return NextResponse.json({
      date,
      weatherCode,
      weather: getWeatherText(weatherCode),
      rain,
      wind,
      hourly,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error('Open-Meteo APIがタイムアウトしました')

      return NextResponse.json(
        { error: '天気情報の取得がタイムアウトしました' },
        { status: 504 }
      )
    }

    console.error('天気情報の取得に失敗しました:', error)

    return NextResponse.json(
      { error: '天気情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}