import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const name = searchParams.get('name')
    const area = searchParams.get('area')

    if (!name || !area) {
      return NextResponse.json(
        {
          error: 'nameとareaは必須です',
        },
        { status: 400 }
      )
    }

    // 山名だけで検索する
    const url =
      `https://geocoding-api.open-meteo.com/v1/search` +
      `?name=${encodeURIComponent(name)}` +
      `&count=10` +
      `&language=ja` +
      `&countryCode=JP` +
      `&format=json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        'Open-Meteo Geocoding APIの取得に失敗しました'
      )
    }

    const data = await response.json()

    const results = data.results ?? []

    if (results.length === 0) {
      return NextResponse.json(
        {
          error: '指定された山が見つかりませんでした',
        },
        { status: 404 }
      )
    }

    // 都道府県・地域が一致する候補を探す
    const matchedResult = results.find(
      (result: any) =>
        result.admin1 === area ||
        result.admin2 === area
    )

    if (!matchedResult) {
      return NextResponse.json(
        {
          error: '指定されたエリアの山が見つかりませんでした',
          candidates: results.map((result: any) => ({
            name: result.name,
            latitude: result.latitude,
            longitude: result.longitude,
            elevation: result.elevation ?? null,
            admin1: result.admin1 ?? null,
            admin2: result.admin2 ?? null,
          })),
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      name: matchedResult.name,
      latitude: matchedResult.latitude,
      longitude: matchedResult.longitude,
      elevation: matchedResult.elevation ?? null,
      country: matchedResult.country ?? null,
      admin1: matchedResult.admin1 ?? null,
      admin2: matchedResult.admin2 ?? null,
      featureCode: matchedResult.feature_code ?? null,
    })
  } catch (error) {
    console.error('位置情報の取得に失敗しました:', error)

    return NextResponse.json(
      {
        error: '位置情報の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}