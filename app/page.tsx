'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  ChevronRight,
  CloudSun,
  Compass,
  Edit3,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Wind,
  X,
} from 'lucide-react'

import { supabase } from '@/lib/supabaseClient'

type Plan = {
  id: number
  mountain: string
  area: string
  date: string
  day: string
  weather: string
  rain: number
  wind: number
  fixed: boolean
}

/**
 * 天気情報からおすすめ度を計算
 */
function getRating(plan: Plan) {
  if (plan.rain <= 20 && plan.wind <= 4) {
    return {
      label: 'おすすめ',
      tone: 'good',
      score: 92,
    }
  }

  if (plan.rain <= 40 && plan.wind <= 7) {
    return {
      label: '注意して計画',
      tone: 'caution',
      score: 68,
    }
  }

  return {
    label: 'おすすめしない',
    tone: 'bad',
    score: 34,
  }
}

export default function Page() {
  const [plans, setPlans] = useState<Plan[]>([])

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAlternativesOpen, setIsAlternativesOpen] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)

  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [mountain, setMountain] = useState('')
  const [area, setArea] = useState('')
  const [date, setDate] = useState('')
  const [day, setDay] = useState('')
  const [undecided, setUndecided] = useState(false)

  /**
   * Supabaseから予定を取得
   */
  useEffect(() => {
    fetchPlans()
  }, [])

  async function fetchPlans() {
    setLoading(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('ユーザー情報の取得に失敗しました:', userError)
      setLoading(false)
      return
    }

    // supabase連携確認のため一時的に.eqをコメントアウト
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      // .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('予定の取得に失敗しました:', error)
      setLoading(false)
      return
    }

    setPlans(data ?? [])
    setLoading(false)
  }

  /**
   * フォームを初期化
   */
  function resetForm() {
    setMountain('')
    setArea('')
    setDate('')
    setDay('')
    setUndecided(false)
    setEditingId(null)
    setFormError('')
  }

  /**
   * 新規登録フォームを開く
   */
  function openCreate() {
    resetForm()
    setIsFormOpen(true)
  }

  /**
   * 編集フォームを開く
   */
  function openEdit(plan: Plan) {
    setEditingId(plan.id)
    setMountain(plan.mountain)
    setArea(plan.area)
    setDate(plan.date)
    setDay(plan.day)
    setUndecided(!plan.fixed)
    setFormError('')
    setIsFormOpen(true)
  }

  /**
   * 予定を登録・更新
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !mountain.trim() ||
      !area.trim() ||
      (!undecided && !date)
    ) {
      setFormError(
        '山名・エリアと、日程または「未定」を入力してください。'
      )
      return
    }

    setSaving(true)
    setFormError('')

    /**
     * ログインユーザーを取得
     */
    // supabase動作確認のため一時的にコメントアウト
    // const {
      // data: { user },
      // error: userError,
    // } = await supabase.auth.getUser()

    // if (userError || !user) {
      // setFormError('ログインが必要です。')
      // setSaving(false)
      // return
    // }
    // ここまで一時的にコメントアウト

    /**
     * 保存するデータ
     */
    const planData = {
      mountain: mountain.trim(),
      area: area.trim(),

      // 日程未定の場合は空文字ではなくNULLにする
      date: undecided ? null : date,

      // 日程未定の場合は曜日もNULL
      day: undecided ? null : day,

      // 現時点ではモック値
      weather: '晴れ',
      rain: 20,
      wind: 3,

      // true = 日程確定
      // false = 日程未定
      fixed: !undecided,
    }

    /**
     * 編集
     */
    if (editingId !== null) {
      const { error } = await supabase
        // .from('schedule')
        // .update(planData)
        // .eq('id', editingId)
        // .eq('user_id', user.id)
        .from('schedule')
        .update({
          mountain: mountain.trim(),
          area: area.trim(),
          date: undecided ? null : date,
          day: undecided ? null : day,
          weather: '晴れ',
          rain: 20,
          wind: 3,
          fixed: !undecided,
        })
        .eq('id', editingId)
        // supabase動作確認のため一時的に変更

      if (error) {
        console.error('予定の更新に失敗しました:', error)
        setFormError('予定の更新に失敗しました。')
        setSaving(false)
        return
      }
    }

    /**
     * 新規登録
     */
    else {
      const { error } = await supabase
        // .from('schedule')
        // .insert({
          // ...planData,
          // user_id: user.id,
        // })
        .from('schedule')
        .insert({
          mountain: mountain.trim(),
          area: area.trim(),
          date: undecided ? null : date,
          day: undecided ? null : day,
          weather: '晴れ',
          rain: 20,
          wind: 3,
          fixed: !undecided,
          user_id: null,
        })
        // supabase動作確認のため一時的に変更

      if (error) {
        console.error('予定の登録に失敗しました:', error)
        setFormError('予定の登録に失敗しました。')
        setSaving(false)
        return
      }
    }

    /**
     * DBの最新状態を再取得
     */
    await fetchPlans()

    setSaving(false)
    setIsFormOpen(false)
    resetForm()
  }

  /**
   * 予定を削除
   */
  async function removePlan(id: number) {
    const confirmed = window.confirm(
      'この予定を削除しますか？'
    )

    if (!confirmed) {
      return
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('ユーザー情報の取得に失敗しました:', userError)
      return
    }

    const { error } = await supabase
      .from('schedule')
      .delete()
      .eq('id', id)
      // .eq('user_id', user.id)
      // supabase動作確認のため一時的にコメントアウト

    if (error) {
      console.error('予定の削除に失敗しました:', error)
      alert('予定の削除に失敗しました。')
      return
    }

    await fetchPlans()
  }

  /**
   * 日程確定済み / 日程未定に分類
   */
  const fixedPlans = plans.filter((plan) => plan.fixed)
  const undecidedPlans = plans.filter((plan) => !plan.fixed)

  /**
   * おすすめ度順に並び替え
   */
  const sortedAlternatives = useMemo(
    () =>
      [...plans].sort(
        (a, b) =>
          getRating(b).score - getRating(a).score
      ),
    [plans]
  )

  return (
    <main className="planner-shell">
      {/* ヘッダー */}
      <header className="site-header">
        <a
          className="brand"
          href="#top"
          aria-label="休日プランナー ホーム"
        >
          <span className="brand-mark">
            <Compass size={20} />
          </span>

          <span>休日プランナー</span>
        </a>

        <button
          className="login-button"
          type="button"
        >
          ログイン
          <ChevronRight size={16} />
        </button>
      </header>

      <div id="top" className="page-content">

        {/* ヒーロー */}
        <section className="hero-section">
          <div>
            <p className="eyebrow">
              <Sparkles size={15} />
              WEATHER SMART PLANNER
            </p>

            <h1>
              次の休日を、
              <br />
              <em>もっと楽しむ。</em>
            </h1>

            <p className="hero-copy">
              天気と予定をまとめて管理して、
              <br className="mobile-break" />
              最高の休日プランを見つけよう。
            </p>
          </div>

          <div
            className="hero-illustration"
            aria-hidden="true"
          >
            <CloudSun
              size={116}
              strokeWidth={1.2}
            />

            <span>
              週末の天気を
              <br />
              チェック
            </span>
          </div>
        </section>

        {/* 今週の予定 */}
        <section className="section-heading">
          <div>
            <p className="section-kicker">
              YOUR PLANS
            </p>

            <h2>今週の予定</h2>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={openCreate}
          >
            <Plus size={18} />
            予定を登録
          </button>
        </section>

        {/* 読み込み中 */}
        {loading ? (
          <div className="empty-state">
            <p>予定を読み込んでいます...</p>
          </div>
        ) : (
          <section
            className="plan-grid"
            aria-label="今週の予定"
          >
            {fixedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={openEdit}
                onDelete={removePlan}
              />
            ))}

            {fixedPlans.length === 0 && (
              <EmptyState onClick={openCreate} />
            )}
          </section>
        )}

        {/* 日程未定 */}
        <section className="undecided-section">
          <div className="section-heading compact">
            <div>
              <p className="section-kicker">
                FLEXIBLE IDEAS
              </p>

              <h2>日程未定の予定</h2>
            </div>

            <span className="count-badge">
              {undecidedPlans.length}件
            </span>
          </div>

          {undecidedPlans.length > 0 ? (
            <div className="undecided-list">
              {undecidedPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={openEdit}
                  onDelete={removePlan}
                  compact
                />
              ))}
            </div>
          ) : (
            <p className="empty-note">
              日程未定の予定はありません。
            </p>
          )}
        </section>

        {/* 代替プラン */}
        <section className="alternative-cta">
          <div className="cta-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <p className="section-kicker">
              FIND YOUR BEST DAY
            </p>

            <h2>
              天気が良い日に変更する？
            </h2>

            <p>
              登録した予定から、天気の良い日を探してみましょう。
            </p>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              setIsAlternativesOpen(true)
            }
          >
            代替プランを検索
            <ChevronRight size={17} />
          </button>
        </section>
      </div>

      {/* 予定登録・編集モーダル */}
      {isFormOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
          >
            <button
              className="close-button"
              type="button"
              onClick={() => {
                setIsFormOpen(false)
                resetForm()
              }}
              aria-label="閉じる"
            >
              <X size={20} />
            </button>

            <p className="section-kicker">
              NEW PLAN
            </p>

            <h2 id="form-title">
              {editingId
                ? '予定を編集'
                : '予定を登録'}
            </h2>

            <form onSubmit={handleSubmit}>

              {/* 山名 */}
              <label>
                山名

                <input
                  value={mountain}
                  onChange={(event) =>
                    setMountain(event.target.value)
                  }
                  placeholder="例：高尾山"
                />
              </label>

              {/* エリア */}
              <label>
                エリア

                <input
                  value={area}
                  onChange={(event) =>
                    setArea(event.target.value)
                  }
                  placeholder="例：東京・八王子"
                />
              </label>

              {/* 日付・曜日 */}
              <div className="form-row">
                <label>
                  日付

                  <input
                    type="date"
                    value={date}
                    disabled={undecided}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                  />
                </label>

                <label>
                  曜日

                  <select
                    value={day}
                    disabled={undecided}
                    onChange={(event) =>
                      setDay(event.target.value)
                    }
                  >
                    <option value="">
                      選択
                    </option>

                    <option value="土">
                      土
                    </option>

                    <option value="日">
                      日
                    </option>

                    <option value="祝">
                      祝
                    </option>
                  </select>
                </label>
              </div>

              {/* 日程未定 */}
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={undecided}
                  onChange={(event) => {
                    setUndecided(
                      event.target.checked
                    )

                    if (event.target.checked) {
                      setDate('')
                      setDay('')
                    }
                  }}
                />

                <span>日程は未定</span>
              </label>

              {/* エラー */}
              {formError && (
                <p className="form-error">
                  {formError}
                </p>
              )}

              {/* 保存 */}
              <button
                className="primary-button submit-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? '保存中...'
                  : editingId
                    ? '変更を保存'
                    : '予定を追加'}

                <Check size={17} />
              </button>
            </form>
          </section>
        </div>
      )}

      {/* 代替プランモーダル */}
      {isAlternativesOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
        >
          <section
            className="modal alternatives-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alternatives-title"
          >
            <button
              className="close-button"
              type="button"
              onClick={() =>
                setIsAlternativesOpen(false)
              }
              aria-label="閉じる"
            >
              <X size={20} />
            </button>

            <p className="section-kicker">
              SMART SUGGESTIONS
            </p>

            <h2 id="alternatives-title">
              おすすめの予定
            </h2>

            <p className="modal-intro">
              登録済みの予定をおすすめ度順に表示しています。
            </p>

            <div className="suggestion-list">
              {sortedAlternatives.map((plan) => (
                <div
                  className="suggestion-row"
                  key={plan.id}
                >
                  <div>
                    <strong>
                      {plan.mountain}
                    </strong>

                    <span>
                      {plan.area}

                      {plan.date &&
                        ` ・ ${plan.date}`}
                    </span>
                  </div>

                  <Rating
                    rating={getRating(plan)}
                  />
                </div>
              ))}

              {sortedAlternatives.length === 0 && (
                <p className="empty-note">
                  代替候補になる予定がありません。
                </p>
              )}
            </div>

            <button
              className="secondary-button full-button"
              type="button"
              onClick={() =>
                setIsAlternativesOpen(false)
              }
            >
              閉じる
            </button>
          </section>
        </div>
      )}
    </main>
  )
}

/**
 * 予定カード
 */
function PlanCard({
  plan,
  onEdit,
  onDelete,
  compact = false,
}: {
  plan: Plan
  onEdit: (plan: Plan) => void
  onDelete: (id: number) => void
  compact?: boolean
}) {
  const rating = getRating(plan)

  return (
    <article
      className={`plan-card ${
        compact ? 'compact-card' : ''
      }`}
    >
      <div className="card-top">

        {/* 日付 */}
        <div className="date-block">
          {plan.fixed ? (
            <>
              <strong>
                {plan.date}
              </strong>

              <span>
                {plan.day}曜日
              </span>
            </>
          ) : (
            <>
              <strong>
                日程未定
              </strong>

              <span>
                候補として保存中
              </span>
            </>
          )}
        </div>

        {/* 編集・削除 */}
        <div className="card-actions">
          <button
            type="button"
            onClick={() => onEdit(plan)}
            aria-label={`${plan.mountain}を編集`}
          >
            <Edit3 size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(plan.id)}
            aria-label={`${plan.mountain}を削除`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 山情報 */}
      <div className="mountain-info">
        <h3>{plan.mountain}</h3>

        <span>
          <MapPin size={14} />
          {plan.area}
        </span>
      </div>

      {/* 天気 */}
      <div className="weather-row">

        <div>
          <span className="weather-label">
            <CloudSun size={16} />
            予報
          </span>

          <strong>
            {plan.weather}
          </strong>
        </div>

        <div>
          <span className="weather-label">
            <CloudSun size={16} />
            降水確率
          </span>

          <strong>
            {plan.rain}%
          </strong>
        </div>

        <div>
          <span className="weather-label">
            <Wind size={16} />
            風速
          </span>

          <strong>
            {plan.wind}m/s
          </strong>
        </div>
      </div>

      {/* おすすめ度 */}
      <Rating rating={rating} />
    </article>
  )
}

/**
 * おすすめ度
 */
function Rating({
  rating,
}: {
  rating: ReturnType<typeof getRating>
}) {
  return (
    <div
      className={`rating ${rating.tone}`}
    >
      <span className="rating-score">
        {rating.score}
      </span>

      <span>
        <strong>
          {rating.label}
        </strong>

        <small>
          お出かけしやすさ
        </small>
      </span>

      <span className="rating-bar">
        <i
          style={{
            width: `${rating.score}%`,
          }}
        />
      </span>
    </div>
  )
}

/**
 * 予定がない場合
 */
function EmptyState({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <div className="empty-state">
      <CalendarDays size={28} />

      <p>
        今週の予定はまだありません。
      </p>

      <button
        className="text-button"
        type="button"
        onClick={onClick}
      >
        最初の予定を登録する
        <ChevronRight size={15} />
      </button>
    </div>
  )
}