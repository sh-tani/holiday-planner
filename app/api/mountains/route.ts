import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('query')?.trim() ?? ''
    const id = searchParams.get('id')?.trim() ?? ''
    const list = searchParams.get('list')?.trim() ?? ''

    const supabase = await createClient()

    // ----------------------------------------
    // ID検索
    // ----------------------------------------
    if (id) {
      const { data, error } = await supabase
        .from('mountains')
        .select(
          'id, name, area, prefecture, municipality, latitude, longitude, elevation'
        )
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

    // ----------------------------------------
    // リスト指定がある場合
    // ----------------------------------------
    let mountainIds: string[] | null = null

    if (list) {
      // リスト名から list_id を取得
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

      // リストに所属する mountain_id を取得
      const { data: memberData, error: memberError } = await supabase
        .from('mountain_list_members')
        .select('mountain_id')
        .eq('list_id', listData.id)

      if (memberError) {
        console.error('山リストの所属情報取得に失敗しました:', memberError)

        return NextResponse.json(
          { error: '山リストの取得に失敗しました' },
          { status: 500 }
        )
      }

      mountainIds = (memberData ?? []).map(
        (member) => member.mountain_id
      )

      // リストに山がない場合
      if (mountainIds.length === 0) {
        return NextResponse.json([])
      }
    }

    // ----------------------------------------
    // 山マスタ検索
    // ----------------------------------------
    let mountainQuery = supabase
      .from('mountains')
      .select(
        'id, name, area, prefecture, municipality, latitude, longitude, elevation'
      )
      .order('name')

    // 山名検索
    if (query) {
      mountainQuery = mountainQuery.ilike('name', `%${query}%`)
    }

    // リスト検索
    if (mountainIds !== null) {
      mountainQuery = mountainQuery.in('id', mountainIds)
    }

    // 最大10件
    const { data, error } = await mountainQuery.limit(10)

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