import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('mountain_lists')
      .select('id, name')
      .order('name')

    if (error) {
      console.error('山リストの取得に失敗しました:', error)

      return NextResponse.json(
        { error: '山リストの取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json(data ?? [])
  } catch (error) {
    console.error('山リストAPIでエラーが発生しました:', error)

    return NextResponse.json(
      { error: '山リストの取得に失敗しました' },
      { status: 500 }
    )
  }
}