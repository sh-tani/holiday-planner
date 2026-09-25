"use client"

import { ChevronRight, Compass } from "lucide-react"
import Link from "next/link"
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
        <Link
          className="brand"
          href="/"
          aria-label="山旅プランナー ホーム"
        >
          <span className="brand-mark">
            <Compass size={20} />
          </span>

          <span>山旅プランナー</span>
        </Link>
      </header>
    )
  }

  return (
    <header className="site-header">
      <Link
        className="brand"
        href="/"
        aria-label="山旅プランナー ホーム"
      >
        <span className="brand-mark">
          <Compass size={20} />
        </span>

        <span>山旅プランナー</span>
      </Link>

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