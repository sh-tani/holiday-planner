import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/plans
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です。' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('予定の取得に失敗しました:', error)

      return NextResponse.json(
        { error: '予定の取得に失敗しました。' },
        { status: 500 }
      )
    }

    // DBのカラム名をPlan型に合わせる
    const plans = (data ?? []).map((plan) => ({
      id: plan.id,
      title: plan.title ?? '',
      mountainId: plan.mountain_id,
      date: plan.date,
      weather: plan.weather ?? '不明',
      weatherCode: plan.weather_code ?? null,
      rain: plan.rain ?? 0,
      wind: plan.wind ?? 0,
      fixed: plan.fixed ?? true,
    }))

    return NextResponse.json(plans)
  } catch (error) {
    console.error('予定取得APIでエラーが発生しました:', error)

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}

// POST /api/plans
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'ログインが必要です。' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const {
      title,
      mountainId,
      date,
      weather,
      weatherCode,
      rain,
      wind,
      fixed,
    } = body

    // 必須チェック
    if (!mountainId) {
      return NextResponse.json(
        { error: '山の選択は必須です。' },
        { status: 400 }
      )
    }

    // 登録
    const { data, error } = await supabase
      .from('schedule')
      .insert({
        title: title ?? '',
        mountain_id: mountainId,
        date: date || null,
        weather: weather ?? '不明',
        weather_code: weatherCode ?? null,
        rain: rain ?? 0,
        wind: wind ?? 0,
        fixed: fixed ?? true,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('予定の登録に失敗しました:', error)

      return NextResponse.json(
        {
          error: '予定の登録に失敗しました。',
          details: error.message,
        },
        { status: 500 }
      )
    }

    // DBのカラム名をPlan型に合わせる
    const plan = {
      id: data.id,
      title: data.title ?? '',
      mountainId: data.mountain_id,
      date: data.date,
      weather: data.weather ?? '不明',
      weatherCode: data.weather_code ?? null,
      rain: data.rain ?? 0,
      wind: data.wind ?? 0,
      fixed: data.fixed ?? true,
    }

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('予定登録APIでエラーが発生しました:', error)

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}