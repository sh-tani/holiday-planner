import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const list = searchParams.get('list')?.trim() ?? ''

    const supabase = await createClient()

    let mountainIds: string[] | null = null

    // リスト指定がある場合
    if (list) {
      const { data: listData, error: listError } = await supabase
        .from('mountain_lists')
        .select('id')
        .eq('name', list)
        .single()

      if (listError) {
        console.error('山リストの取得に失敗しました:', listError)

        return NextResponse.json(
          { error: '指定された山リストが見つかりません' },
          { status: 404 }
        )
      }

      const { data: memberData, error: memberError } =
        await supabase
          .from('mountain_list_members')
          .select('mountain_id')
          .eq('list_id', listData.id)

      if (memberError) {
        console.error(
          '山リストの所属情報取得に失敗しました:',
          memberError
        )

        return NextResponse.json(
          { error: '山リストの取得に失敗しました' },
          { status: 500 }
        )
      }

      mountainIds = (memberData ?? []).map(
        (member) => member.mountain_id
      )

      if (mountainIds.length === 0) {
        return NextResponse.json([])
      }
    }

    let mountainQuery = supabase
      .from('mountains')
      .select(
        'id, name, area, prefecture, municipality, latitude, longitude, elevation'
      )
      .order('name')

    if (mountainIds !== null) {
      mountainQuery = mountainQuery.in('id', mountainIds)
    }

    const { data, error } = await mountainQuery

    if (error) {
      console.error('マップ用山情報の取得に失敗しました:', error)

      return NextResponse.json(
        { error: 'マップ用山情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error(
      'マップ用山情報APIでエラーが発生しました:',
      error
    )

    return NextResponse.json(
      { error: 'マップ用山情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}