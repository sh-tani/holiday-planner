"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"

export default function AccountPage() {
  const router = useRouter()
  const { user, profile, loading, updateProfile } = useAuth()

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  if (loading) {
    return (
      <main className="planner-shell">
        <div className="page-content">
          <p>読み込み中...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    router.replace("/auth/login")
    return null
  }

  if (!profile) {
    return (
      <main className="planner-shell">
        <div className="page-content">
          <p>プロフィールを読み込めませんでした。</p>
        </div>
      </main>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    const name = String(formData.get("name") ?? "").trim()
    const residenceArea = String(
      formData.get("residenceArea") ?? "",
    ).trim()
    const nearestStation = String(
      formData.get("nearestStation") ?? "",
    ).trim()

    if (!name) {
      setError("名前を入力してください")
      setMessage("")
      return
    }

    setSaving(true)
    setMessage("")
    setError("")

    try {
      await updateProfile({
        name,
        residence_area: residenceArea || null,
        nearest_station: nearestStation || null,
      })

      setMessage("プロフィールを保存しました")
    } catch (updateError) {
      console.error("プロフィール更新エラー:", updateError)
      setError("プロフィールの保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="planner-shell">
      <div className="page-content">
        <div className="section-heading">
          <p className="section-kicker">ACCOUNT</p>
          <h1>アカウント</h1>
          <p>プロフィール情報を編集できます。</p>
        </div>

        <form onSubmit={handleSubmit} className="planner-form">
          <div className="form-field">
            <label htmlFor="name">名前</label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={profile.name ?? ""}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={user.email ?? ""}
              disabled
            />
            <p className="form-help">
              メールアドレスの変更は今後のアカウント管理機能で対応します。
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="residence-area">
              居住エリア
              <span>任意</span>
            </label>
            <input
              id="residence-area"
              name="residenceArea"
              type="text"
              defaultValue={profile.residence_area ?? ""}
              placeholder="例：神戸市"
            />
            <p className="form-help">
              代替プランの移動時間などに利用する予定です。
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="nearest-station">
              最寄り駅
              <span>任意</span>
            </label>
            <input
              id="nearest-station"
              name="nearestStation"
              type="text"
              defaultValue={profile.nearest_station ?? ""}
              placeholder="例：三ノ宮駅"
            />
            <p className="form-help">
              移動時間を計算する際の出発地点として利用する予定です。
            </p>
          </div>

          {message && (
            <p className="form-message" role="status">
              {message}
            </p>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="primary-button"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </form>
      </div>
    </main>
  )
}