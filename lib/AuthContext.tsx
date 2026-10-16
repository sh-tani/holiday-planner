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
  updateProfile: (updates: Record<string, any>) => Promise<void>
  updateEmail: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  clearDeletedAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => {},
  updateEmail: async () => {},
  updatePassword: async () => {},
  clearDeletedAccount: async () => {},
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
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("ユーザー取得エラー:", error)
          return
        }

        if (currentUser) {
          setUser(currentUser)

          const { data, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single()

          if (profileError) {
            console.error("プロフィール取得エラー:", profileError)
          }

          setProfile(data)
        } else {
          setUser(null)
          setProfile(null)
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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event)
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

  const clearDeletedAccount = async () => {
    const supabase = createClient()

    // ブラウザ側のセッションを破棄
    await supabase.auth.signOut({ scope: "local" })

    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates: Record<string, any>) => {
    if (!user) {
      throw new Error("ログインが必要です")
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      console.error("プロフィール更新DBエラー:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }

    setProfile(data)
  }

  const updateEmail = async (email: string) => {
    if (!user) {
      throw new Error("ログインが必要です")
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.updateUser({
      email,
    })

    if (error) {
      console.error("メールアドレス更新エラー:", error)
      throw error
    }

    if (data.user) {
      setUser(data.user)
    }
  }

  const updatePassword = async (password: string) => {
    if (!user) {
      throw new Error("ログインが必要です")
    }

    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error("パスワード更新エラー:", error)
      throw error
    }
  }


  // 子コンポーネントにユーザー情報やログアウト関数を提供
  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        updateProfile,
        updateEmail,
        updatePassword,
        clearDeletedAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}