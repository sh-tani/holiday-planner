import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('query')?.trim() ?? ''
    const id = searchParams.get('id')?.trim() ?? ''

    const supabase = await createClient()

    // ID検索
    if (id) {
      const { data, error } = await supabase
        .from('mountains')
        .select('id, name, area, latitude, longitude, elevation')
        .eq('id', id)
        .single()

      if (error) {
        console.error('山情報の取得に失敗しました:', error)

        return NextResponse.json(
          { error: '山情報の取得に失敗しました' },
          { status: 404 }
        )
      }

      return NextResponse.json(data)
    }

    // キーワード検索
    if (!query) {
      return NextResponse.json([])
    }

    const { data, error } = await supabase
      .from('mountains')
      .select('id, name, area, latitude, longitude, elevation')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10)

    if (error) {
      console.error('山情報の取得に失敗しました:', error)

      return NextResponse.json(
        { error: '山情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('山検索APIでエラーが発生しました:', error)

    return NextResponse.json(
      { error: '山検索に失敗しました' },
      { status: 500 }
    )
  }
}