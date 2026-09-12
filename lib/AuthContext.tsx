"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

type User = any
type AuthContextType = {
  user: User | null
  profile: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

//認証情報（ログイン状態やプロフィール）をアプリ全体に提供する
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // 初回読み込み時に実行される処理
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 現在のセッション情報（ログイン情報）をSupabaseクライアントから取得
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)

          // プロフィール情報を取得
          const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          setProfile(data)
        }
      } catch (error) {
        console.error("認証情報取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)

        // プロフィール情報を取得
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(data)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }
  //子コンポーネントに対して、ユーザー情報やログアウト関数などを提供。layout.tsxに反映する
  return <AuthContext.Provider value={{ user, profile, loading, signOut }}>{children}</AuthContext.Provider>
}