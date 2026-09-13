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

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error(error)

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
      mountain,
      area,
      date,
      day,
      weather,
      rain,
      wind,
      fixed,
    } = body

    if (!mountain?.trim() || !area?.trim()) {
      return NextResponse.json(
        { error: '山名とエリアは必須です。' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('schedule')
      .insert({
        mountain: mountain.trim(),
        area: area.trim(),
        date: date || null,
        day: day || null,
        weather: weather ?? '晴れ',
        rain: rain ?? 20,
        wind: wind ?? 3,
        fixed: fixed ?? true,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('予定の登録に失敗しました:', error)

      return NextResponse.json(
        { error: '予定の登録に失敗しました。' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}