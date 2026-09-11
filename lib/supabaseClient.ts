//Supabaseのライブラリをimport
import { createClient } from "@supabase/supabase-js"
//環境変数を読み込む
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

//Supabaseクライアントを作成する

export const supabase = createClient(supabaseUrl,supabaseAnonKey,{
  auth: {
    persistSession: true,//セッション情報（認証トークンなど）をブラウザに紐づくローカルストレージに保存
    autoRefreshToken: true,//トークンの有効期限が近付いたら自動で更新する
    detectSessionInUrl: true,//URLにセッション情報がある場合、それを検出してログイン状態を初期化する
  }
})