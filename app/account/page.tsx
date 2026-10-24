"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"

export default function AccountPage() {
  const router = useRouter()
  const {
    user,
    profile,
    loading,
    signOut,
    clearDeletedAccount,
    updateProfile,
    updateEmail,
    updatePassword,
  } = useAuth()
  const [saving, setSaving] = useState(false)
  const [emailSaving, setEmailSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [emailError, setEmailError] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    if (!loading && !user && !deleting) {
      router.replace("/auth/login")
    }
  }, [loading, user, deleting, router])

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

  const handleEmailSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("newEmail") ?? "")
      .trim()
      .toLowerCase()

    if (!email) {
      setEmailError("メールアドレスを入力してください")
      setEmailMessage("")
      return
    }

    if (email === user?.email?.toLowerCase()) {
      setEmailError("現在と異なるメールアドレスを入力してください")
      setEmailMessage("")
      return
    }

    setEmailSaving(true)
    setEmailMessage("")
    setEmailError("")

    try {
      await updateEmail(email)
      setEmailMessage(
        "確認メールを送信しました。メール内の案内に従って変更を完了してください。",
      )
      setNewEmail("")
    } catch (updateError) {
      console.error("メールアドレス更新エラー:", updateError)
      setEmailError("メールアドレスの変更に失敗しました")
    } finally {
      setEmailSaving(false)
    }
  }

  const handlePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (newPassword.length < 8) {
      setPasswordError("パスワードは8文字以上で入力してください")
      setPasswordMessage("")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("確認用パスワードが一致しません")
      setPasswordMessage("")
      return
    }

    setPasswordSaving(true)
    setPasswordMessage("")
    setPasswordError("")

    try {
      await updatePassword(newPassword)
      setPasswordMessage("パスワードを変更しました")
      setNewPassword("")
      setConfirmPassword("")
    } catch (updateError) {
      console.error("パスワード変更エラー:", updateError)
      setPasswordError("パスワードの変更に失敗しました")
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleDeleteAccount = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (deleteConfirmation !== "アカウントを削除") {
      setDeleteError("確認欄に「アカウントを削除」と正確に入力してください")
      return
    }

    const confirmed = window.confirm(
      "アカウントと登録した予定・登頂記録を削除します。この操作は取り消せません。本当に削除しますか？",
    )

    if (!confirmed) return

    setDeleting(true)
    setDeleteError("")

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          result.error || "アカウントの削除に失敗しました",
        )
      }

      // 削除成功後、ローカルの認証状態をクリア
      await clearDeletedAccount()

      router.replace("/")
      router.refresh()
    } catch (deleteAccountError) {
      console.error("アカウント削除エラー:", deleteAccountError)

      setDeleteError(
        deleteAccountError instanceof Error
          ? deleteAccountError.message
          : "アカウントの削除に失敗しました",
      )
      setDeleting(false)
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

        <div className="section-heading">
          <h2>プロフィールの編集</h2>
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

        <div className="section-heading">
          <h2>メールアドレスの変更</h2>
        </div>
        <div>
          <p>
            メールアドレスを変更する場合は、以下のフォームに新しいメールアドレスを入力してください。
          </p>
        </div>
        <div className="form-field">
          <label htmlFor="email">現在のメールアドレス</label>
          <input
            id="email"
            type="email"
            value={user.email ?? ""}
            disabled
          />
        </div>

        <form onSubmit={handleEmailSubmit} className="planner-form">
          <div className="form-field">
            <label htmlFor="new-email">新しいメールアドレス</label>
            <input
              id="new-email"
              name="newEmail"
              type="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="新しいメールアドレス"
            />
          </div>

          {emailMessage && (
            <p className="form-message" role="status">
              {emailMessage}
            </p>
          )}

          {emailError && (
            <p className="form-error" role="alert">
              {emailError}
            </p>
          )}

          <button
            type="submit"
            disabled={emailSaving}
            className="primary-button"
          >
            {emailSaving ? "送信中..." : "メールアドレスを変更"}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="planner-form">
          <div className="section-heading">
            <h2>パスワードの変更</h2>
          </div>
          <div>
            <p>
              パスワードを変更する場合は、以下のフォームに新しいパスワードを入力してください。
            </p>
          </div>
          <div className="form-field">
            <label htmlFor="new-password">新しいパスワード</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
              placeholder="8文字以上"
            />
          </div>

          <div className="form-field">
            <label htmlFor="confirm-password">新しいパスワード（確認）</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
              placeholder="もう一度入力"
            />
          </div>

          {passwordMessage && (
            <p className="form-message" role="status">
              {passwordMessage}
            </p>
          )}

          {passwordError && (
            <p className="form-error" role="alert">
              {passwordError}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordSaving}
            className="primary-button"
          >
            {passwordSaving ? "変更中..." : "パスワードを変更"}
          </button>
        </form>

        <section className="planner-form">
          <div className="section-heading">
            <h2>アカウントの削除</h2>
          </div>
          <div>
            <p>
              アカウントを削除すると、登録した予定、登頂記録、
              プロフィールが削除されます。この操作は取り消せません。
            </p>
          </div>

          <form onSubmit={handleDeleteAccount}>
            <div className="form-field">
              <label htmlFor="delete-confirmation">
                確認のため「アカウントを削除」と入力してください
              </label>
              <input
                id="delete-confirmation"
                type="text"
                value={deleteConfirmation}
                onChange={(event) =>
                  setDeleteConfirmation(event.target.value)
                }
                autoComplete="off"
                required
              />
            </div>

            {deleteError && (
              <p className="form-error" role="alert">
                {deleteError}
              </p>
            )}

            <button
              type="submit"
              disabled={
                deleting ||
                deleteConfirmation !== "アカウントを削除"
              }
              className="primary-button"
            >
              {deleting ? "削除処理中..." : "アカウントを削除する"}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}