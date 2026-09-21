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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const date = searchParams.get('date')

    if (!latitude || !longitude || !date) {
      return NextResponse.json(
        {
          error: 'latitude、longitude、dateは必須です',
        },
        { status: 400 }
      )
    }

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${encodeURIComponent(latitude)}` +
      `&longitude=${encodeURIComponent(longitude)}` +
      `&daily=weather_code,precipitation_probability_max,wind_speed_10m_mean` +
      `&wind_speed_unit=ms` +
      `&timezone=Asia%2FTokyo` +
      `&start_date=${encodeURIComponent(date)}` +
      `&end_date=${encodeURIComponent(date)}`

    const response = await fetch(url)
    if (!response.ok) {
      const errorText = await response.text()
      
      console.error('Open-Meteo APIエラー:', {
        status: response.status,
        statusText: response.statusText,
        url,
        errorText,
      })
      return NextResponse.json(
        {
          error: 'Open-Meteo APIの取得に失敗しました',
          details: errorText,
        },
        { status: 502 }
      )
    }

    const data = await response.json()

    const weatherCode = data.daily?.weather_code?.[0] ?? null
    const rain =
      data.daily?.precipitation_probability_max?.[0] ?? null
    const wind =
      data.daily?.wind_speed_10m_mean?.[0] ?? null

    return NextResponse.json({
      date,
      weatherCode,
      weather: getWeatherText(weatherCode),
      rain,
      wind,
    })
  } catch (error) {
    console.error('天気情報の取得に失敗しました:', error)

    return NextResponse.json(
      {
        error: '天気情報の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}