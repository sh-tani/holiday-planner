"use client"

import { ChevronRight, Compass } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"

export default function Header() {
  const router = useRouter()
  const { user, profile, loading, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <header className="site-header">
        <a
          className="brand"
          href="/"
          aria-label="休日プランナー ホーム"
        >
          <span className="brand-mark">
            <Compass size={20} />
          </span>

          <span>休日プランナー</span>
        </a>
      </header>
    )
  }

  return (
    <header className="site-header">
      <a
        className="brand"
        href="/"
        aria-label="休日プランナー ホーム"
      >
        <span className="brand-mark">
          <Compass size={20} />
        </span>

        <span>休日プランナー</span>
      </a>

      {user ? (
        <div className="header-actions">
          <span className="user-name">
            {profile?.name ? `${profile.name}さん` : ""}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="login-button"
          >
            ログアウト
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div className="header-actions">
          <span className="guest-label">
            ゲスト利用中
          </span>

          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="login-button"
          >
            ログイン
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </header>
  )
}