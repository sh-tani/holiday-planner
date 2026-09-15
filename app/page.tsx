'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getGuestPlans } from "@/lib/guestStorage"
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

import type { Plan } from "@/lib/types"
import { getRating } from '@/lib/planner/rating'
import {
  addGuestPlan,
  updateGuestPlan,
  deleteGuestPlan,
} from "@/lib/guestStorage"

type Mountain = {
  id: string
  name: string
  area: string
  latitude: number
  longitude: number
  elevation: number | null
}

function formatDateWithWeekday(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const dateObject = new Date(year, month - 1, day)

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  return `${date}（${weekdays[dateObject.getDay()]}）`
}

export default function Page() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [userName, setUserName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAlternativesOpen, setIsAlternativesOpen] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)

  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [mountainId, setMountainId] = useState('')
  const [mountainName, setMountainName] = useState('')
  const [mountainCandidates, setMountainCandidates] = useState<Mountain[]>([])
  const [isMountainSearching, setIsMountainSearching] = useState(false)
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null)
  const [mountainsById, setMountainsById] = useState<Record<string, Mountain>>({})

  const [date, setDate] = useState('')
  const [undecided, setUndecided] = useState(false)

  

  // APIから予定を取得
  useEffect(() => {
    checkAuth()
  }, [])
  
  useEffect(() => {
    const query = mountainName.trim()
    
    if (!query) {
      setMountainCandidates([])
      setIsMountainSearching(false)
      return
    }

    // すでに候補から山を選択済みなら検索しない
    if (mountainId) {
      setMountainCandidates([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsMountainSearching(true)

        const response = await fetch(
          `/api/mountains?query=${encodeURIComponent(query)}`
        )

        if (!response.ok) {
          throw new Error('山情報の取得に失敗しました')
        }

        const data = await response.json()

        setMountainCandidates(data ?? [])
      } catch (error) {
        console.error('山の検索に失敗しました:', error)
        setMountainCandidates([])
      } finally {
        setIsMountainSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [mountainName, mountainId])

  async function checkAuth() {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (user) {
        setIsLoggedIn(true)
        await fetchPlans(true)
        await fetchUserName()
      } else {
        setIsLoggedIn(false)
        await fetchPlans(false)
      }
    } catch (error) {
      console.error('認証チェックに失敗しました:', error)
      
      // セッションがない場合はゲストとして扱う
      setIsLoggedIn(false)
      await fetchPlans(false)
    }
  }

  async function fetchMountainInfo(loadedPlans: Plan[]) {
    const mountainIds = [
      ...new Set(
        loadedPlans
          .map((plan) => plan.mountainId)
          .filter(Boolean)
      ),
    ]

    const mountainResults = await Promise.all(
      mountainIds.map(async (id) => {
        try {
          const response = await fetch(
            `/api/mountains?id=${encodeURIComponent(id)}`
          )

          if (!response.ok) {
            return null
          }

          return (await response.json()) as Mountain
        } catch (error) {
          console.error(
            `山情報の取得に失敗しました: ${id}`,
            error
          )
          return null
        }
      })
    )

    const mountainMap: Record<string, Mountain> = {}

    mountainResults.forEach((mountain) => {
      if (mountain) {
        mountainMap[mountain.id] = mountain
      }
    })

    setMountainsById(mountainMap)
  }

  async function fetchPlans(loggedIn: boolean) {
    setLoading(true)

    try {
      if (!loggedIn) {
        const guestPlans = getGuestPlans()

        setPlans(guestPlans)
        await fetchMountainInfo(guestPlans)

        return
      }

      const response = await fetch('/api/plans')

      if (!response.ok) {
        throw new Error('予定の取得に失敗しました')
      }

      const data = await response.json()
      const loadedPlans: Plan[] = data ?? []

      setPlans(loadedPlans)
      await fetchMountainInfo(loadedPlans)
    } catch (error) {
      console.error('予定の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUserName() {
    try {
      const supabase = createClient()

      console.log('① fetchUserName開始')
      
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      
      console.log('② user:', user)
      console.log('③ userError:', userError)

      if (userError) {
        throw userError
      }
      
      if (!user) {
        console.log('④ ログインユーザーが取得できませんでした')
        return
      }
      
      const { data: profile, error: profileError } =
        await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

        console.log('⑤ profile:', profile)
        console.log('⑥ profileError:', profileError)

      if (profileError) {
        throw profileError
      }
      
      setUserName(profile?.name ?? '')
      console.log('⑦ userName:', profile?.name)
    } catch (error) {
      console.error(
        'ユーザー情報の取得に失敗しました:',
        error
      )
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('ログアウトに失敗しました:', error)
      return
    }
    window.location.href = '/auth/login'
  }

  /**
   * フォームを初期化
   */
  function resetForm() {
    setTitle('')
    setMountainId('')
    setMountainName('')
    setDate('')
    setUndecided(false)
    setEditingId(null)
    setFormError('')
  }

  function selectMountain(mountain: Mountain) {
    setMountainId(mountain.id)
    setMountainName(mountain.name)
    setSelectedMountain(mountain)
    setMountainCandidates([])
    setFormError('')
  }
  
  function handleMountainNameChange(value: string) {
    setMountainName(value)
    setMountainId('')
    setSelectedMountain(null)
    setMountainCandidates([])
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
  async function openEdit(plan: Plan) {
    setEditingId(plan.id)
    setTitle(plan.title)
    setDate(plan.date ?? '')
    setUndecided(!plan.fixed)
    setFormError('')

    try {
      const response = await fetch(
        `/api/mountains?id=${encodeURIComponent(plan.mountainId)}`
      )

      if (!response.ok) {
        throw new Error('山情報の取得に失敗しました')
      }

      const mountain = await response.json()

      if (!mountain) {
        throw new Error('山情報が見つかりませんでした')
      }

      setMountainId(mountain.id)
      setMountainName(mountain.name)
      setSelectedMountain(mountain)
    } catch (error) {
      console.error('編集対象の山情報取得に失敗しました:', error)
      setFormError('山情報の取得に失敗しました。')
    }

    setIsFormOpen(true)
  }

  /**
   * 予定を登録・更新
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !mountainId ||
      !selectedMountain ||
      (!undecided && !date)
    ) {
      setFormError(
        '山名を候補から選択し、日程または「日程未定」を入力してください。'
      )
      return
    }

    setSaving(true)
    setFormError('')

    try {
      let weather = '不明'
      let weatherCode: number | null = null
      let rain = 0
      let wind = 0

      // 日程が決まっている場合だけ天気を取得
      if (!undecided && date) {
        const weatherResponse = await fetch(
          `/api/weather?latitude=${encodeURIComponent(
            selectedMountain.latitude
          )}&longitude=${encodeURIComponent(
            selectedMountain.longitude
          )}&date=${encodeURIComponent(date)}`
        )

        if (!weatherResponse.ok) {
          console.warn(
            '天気予報がまだ取得できないため、予報待ちとして登録します'
          )
        } else {
          const weatherData = await weatherResponse.json()

          weather = weatherData.weather ?? '不明'
          weatherCode = weatherData.weatherCode ?? null
          rain = weatherData.rain ?? 0
          wind = weatherData.wind ?? 0
        }
      }

      // タイトル未入力なら山名を使用
      const finalTitle =
        (title ?? '').trim() || selectedMountain.name

      const planData = {
        title: finalTitle,
        mountainId: selectedMountain.id,
        date: undecided ? null : date,
        weather,
        weatherCode,
        rain,
        wind,
        fixed: !undecided,
      }

      // =========================
      // ゲストモード
      // =========================
      if (!isLoggedIn) {
        if (editingId !== null) {
          const updatedPlan: Plan = {
            id: editingId,
            ...planData,
          }

          updateGuestPlan(updatedPlan)
        } else {
          const newPlan: Plan = {
            id: crypto.randomUUID(),
            ...planData,
          }

          addGuestPlan(newPlan)
        }

        await fetchPlans(false)

        setIsFormOpen(false)
        resetForm()
        return
      }

      // =========================
      // ログインモード
      // =========================

      // 編集
      if (editingId !== null) {
        const response = await fetch(
          `/api/plans/${editingId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(planData),
          }
        )

        if (!response.ok) {
          throw new Error('予定の更新に失敗しました')
        }
      }

      // 新規登録
      else {
        const response = await fetch('/api/plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData),
        })

        if (!response.ok) {
          throw new Error('予定の登録に失敗しました')
        }
      }

      await fetchPlans(true)

      setIsFormOpen(false)
      resetForm()
    } catch (error) {
      console.error('予定の保存に失敗しました:', error)

      if (editingId !== null) {
        setFormError('予定の更新に失敗しました。')
      } else {
        setFormError('予定の登録に失敗しました。')
      }
    } finally {
      setSaving(false)
    }
  }

  /**
   * 予定を削除
   */
  async function removePlan(id: string) {
    const confirmed = window.confirm('この予定を削除しますか？')

    if (!confirmed) return
    try {
      // =========================
      // ゲストモード
      // =========================
      if (!isLoggedIn) {
        deleteGuestPlan(id)

        await fetchPlans(false)
        return
      }
      
      // =========================
      // ログインモード
      // =========================
      const response = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('予定の削除に失敗しました')
      }

      await fetchPlans(true)
    } catch (error) {
      console.error('予定の削除に失敗しました:', error)
      alert('予定の削除に失敗しました。')
    }
  }

  /**
   * 日程確定済み / 日程未定に分類
   */
  const fixedPlans = [...plans]
    .filter((plan) => plan.fixed)
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1

      return a.date.localeCompare(b.date)
    })

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
        {isLoggedIn ? (
          <div className="header-actions">
            <span className="user-name">
              {userName ? `${userName}さん` : ''}
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
            onClick={() => {
              window.location.href = '/auth/login'
             }}
           className="login-button"
           >
             ログイン
             <ChevronRight size={16} />
           </button>
         </div>
        )}
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
                mountain={mountainsById[plan.mountainId] ?? null}
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
                  mountain={mountainsById[plan.mountainId] ?? null}
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

              {/* タイトル */}
              <label>
                タイトル（任意）
                
                <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例：秋の高尾山ハイキング"
                />
              </label>
              {/* 山名 */}
              <label>
                山名
                <div className="mountain-search">
                  <input
                  value={mountainName}
                  onChange={(event) =>
                    handleMountainNameChange(event.target.value)
                  }
                  placeholder="例：高尾山"
                  autoComplete="off"
                  />
                  
                  {isMountainSearching && (
                    <p className="search-status">
                      山を検索しています...
                      </p>
                    )
                  }
                  
                  {!isMountainSearching &&
                  mountainCandidates.length > 0 && (
                  <div className="mountain-candidates">
                    {mountainCandidates.map((mountain) => (
                      <button
                      key={mountain.id}
                      type="button"
                      className="mountain-candidate"
                      onClick={() => selectMountain(mountain)}
                      >
                        <strong>{mountain.name}</strong>
                        <span>
                          {mountain.area}
                          {mountain.elevation
                          ? ` ・ ${mountain.elevation}m`
                          : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {!isMountainSearching &&
                mountainName.trim() &&
                !mountainId &&
                mountainCandidates.length === 0 && (
                <p className="search-status">
                  該当する山がありません
                  </p>
                )}
                </div>
              </label>
              {/* 選択した山 */}
              {mountainId && (
                <div className="selected-mountain">
                  <span>
                    選択中：<strong>{mountainName}</strong>
                  </span>
                  
                  <button
                  type="button"
                  onClick={() => {
                    setMountainId('')
                    setMountainName('')
                    setSelectedMountain(null)
                    setMountainCandidates([])
                  }}
                  >
                    変更
                  </button>
                </div>
              )}
              
              {/* 日付 */}
              <label>
                日付
                
                <input
                type="date"
                value={date}
                disabled={undecided}
                onChange={(event) => setDate(event.target.value)}
                />
              </label>
              
              {/* 日程未定 */}
              <label className="check-label">
                <input
                type="checkbox"
                checked={undecided}
                onChange={(event) => {
                  const checked = event.target.checked
                  
                  setUndecided(checked)
                  
                  if (checked) {
                    setDate('')
                  }
                }}
                />
                
                日程未定
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
              {sortedAlternatives.map((plan) => {
                const mountain = mountainsById[plan.mountainId]

                return (
                  <div
                    className="suggestion-row"
                    key={plan.id}
                  >
                    <div>
                      <strong>
                        {plan.title}
                      </strong>

                      <span>
                        {mountain
                          ? `${mountain.name}（${mountain.area}）`
                          : '山情報不明'}

                        {plan.date &&
                          ` ・ ${plan.date}`}
                      </span>
                    </div>

                    <Rating
                      rating={getRating(plan)}
                    />
                  </div>
                )
              })}

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
  mountain,
  onEdit,
  onDelete,
  compact = false,
}: {
  plan: Plan
  mountain: Mountain | null
  onEdit: (plan: Plan) => void
  onDelete: (id: string) => void
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
                {plan.date ? formatDateWithWeekday(plan.date) : '日程未定'}
              </strong>

              <span>
                お出かけ予定
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
            aria-label={`${mountain?.name ?? '山情報不明'}を編集`}
          >
            <Edit3 size={16} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(plan.id)}
            aria-label={`${mountain?.name ?? '山情報不明'}を削除`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 山情報 */}
      <div className="mountain-info">
        <h3>{plan.title}</h3>

        <span>
          <MapPin size={14} />
          {mountain
            ? `${mountain.name}（${mountain.area}）`
            : '山情報不明'}
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