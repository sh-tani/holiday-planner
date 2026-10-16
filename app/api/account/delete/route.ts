
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function DELETE(request: Request) {
  try {
    // 同一オリジンからのリクエストであることを確認
    const origin = request.headers.get("origin")
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!origin || !appUrl) {
      return NextResponse.json(
        { error: "リクエストを検証できませんでした" },
        { status: 403 },
      )
    }

    let expectedOrigin: string

    try {
      expectedOrigin = new URL(appUrl).origin
    } catch {
      console.error("NEXT_PUBLIC_APP_URL の形式が不正です")
      return NextResponse.json(
        { error: "サーバー設定エラーです" },
        { status: 500 },
      )
    }

    if (origin !== expectedOrigin) {
      return NextResponse.json(
        { error: "不正なリクエストです" },
        { status: 403 },
      )
    }

    // ログイン中のユーザーを確認
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 },
      )
    }

    const admin = createAdminClient()

    // ユーザーの予定・登頂記録・プロフィールをまとめて削除
    const { error: dataError } = await admin.rpc(
      "delete_user_account_data",
      {
        target_user_id: user.id,
      },
    )

    if (dataError) {
      console.error("ユーザーデータ削除エラー:", dataError)
      return NextResponse.json(
        {
          error:
            "登録データを削除できませんでした。認証アカウントは削除されていません。",
        },
        { status: 500 },
      )
    }

    // 最後に認証アカウントを削除
    const { error: deleteUserError } =
      await admin.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error("認証ユーザー削除エラー:", deleteUserError)
      return NextResponse.json(
        {
          error:
            "登録データは削除されましたが、認証アカウントの削除に失敗しました。再試行が必要です。",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("アカウント削除エラー:", error)
    return NextResponse.json(
      { error: "アカウント削除に失敗しました" },
      { status: 500 },
    )
  }
}
