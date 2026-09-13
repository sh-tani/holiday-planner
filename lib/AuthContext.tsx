"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

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

// 認証情報（ログイン状態やプロフィール）をアプリ全体に提供する
export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // 初回読み込み時に実行される処理
  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      try {
        // 現在のセッション情報を取得
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)

          // プロフィール情報を取得
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (error) {
            console.error("プロフィール取得エラー:", error)
          }

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)

        // プロフィール情報を取得
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (error) {
          console.error("プロフィール取得エラー:", error)
        }

        setProfile(data)
      } else {
        setUser(null)
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const supabase = createClient()

    await supabase.auth.signOut()

    setUser(null)
    setProfile(null)
  }

  // 子コンポーネントにユーザー情報やログアウト関数を提供
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}