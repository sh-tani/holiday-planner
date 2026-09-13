import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = {
  params: Promise<{
    id: string
  }>
}

// PATCH /api/plans/:id
export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // ログインユーザーを取得
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

    const { data, error } = await supabase
      .from('schedule')
      .update({
        mountain: mountain?.trim(),
        area: area?.trim(),
        date: date || null,
        day: day || null,
        weather: weather ?? '晴れ',
        rain: rain ?? 20,
        wind: wind ?? 3,
        fixed: fixed ?? true,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('予定の更新に失敗しました:', error)

      return NextResponse.json(
        { error: '予定の更新に失敗しました。' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}

// DELETE /api/plans/:id
export async function DELETE(
  _request: Request,
  { params }: Params
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // ログインユーザーを取得
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
        { error: '予定の削除に失敗しました。' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    )
  }
}