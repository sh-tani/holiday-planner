import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/plans/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    if (!mountainId) {
      return NextResponse.json(
        { error: '山の選択は必須です。' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('schedule')
      .update({
        title: title ?? '',
        mountain_id: mountainId,
        date: date || null,
        weather: weather ?? '不明',
        weather_code: weatherCode ?? null,
        rain: rain ?? 0,
        wind: wind ?? 0,
        fixed: fixed ?? true,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('予定の更新に失敗しました:', error)

      return NextResponse.json(
        {
          error: '予定の更新に失敗しました。',
          details: error.message,
        },
        { status: 500 }
      )
    }

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

    return NextResponse.json(plan)
  } catch (error) {
    console.error('予定更新APIでエラーが発生しました:', error)

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}

// DELETE /api/plans/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    const { error } = await supabase
      .from('schedule')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('予定の削除に失敗しました:', error)

      return NextResponse.json(
        {
          error: '予定の削除に失敗しました。',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('予定削除APIでエラーが発生しました:', error)

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}