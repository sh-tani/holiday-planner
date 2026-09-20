'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '@/lib/plans/api'
import {
  CalendarDays,
  Check,
  ChevronRight,
  CloudSun,
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
import { formatDateWithWeekday } from '@/lib/planner/date'
import PlanCard from '@/components/planner/PlanCard'
import {
  searchMountains,
  getMountainsByIds,
} from '@/lib/mountains/api'
import type { Mountain } from '@/lib/mountains/api'
import Rating from '@/components/planner/Rating'
import EmptyState from '@/components/planner/EmptyState'
import PlanFormModal from '@/components/planner/PlanFormModal'

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
    const mountainIdFromUrl =
      new URLSearchParams(window.location.search).get('mountainId')

    if (typeof mountainIdFromUrl !== 'string' || mountainIdFromUrl.length === 0) {
      return
    }

    async function openMountainPlanForm() {
      try {
        const response = await fetch(
          `/api/mountains?id=${encodeURIComponent(mountainIdFromUrl!)}`
        )

        if (!response.ok) {
          throw new Error('山情報の取得に失敗しました')
        }

        const mountain = await response.json()

        if (!mountain) {
          throw new Error('山情報が見つかりませんでした')
        }

        resetForm()

        setMountainId(mountain.id)
        setMountainName(mountain.name)
        setSelectedMountain(mountain)

        setIsFormOpen(true)

        // URLからmountainIdを消す
        window.history.replaceState({}, '', '/')
      } catch (error) {
        console.error(
          '山情報の取得に失敗しました:',
          error
        )
      }
    }

    openMountainPlanForm()
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

        const data = await searchMountains(query)
        setMountainCandidates(data)
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

  async function fetchPlans(loggedIn: boolean) {
    setLoading(true)

    try {
      const loadedPlans = await getPlans(loggedIn)

      setPlans(loadedPlans)

      const mountainIds = loadedPlans.map(
        (plan) => plan.mountainId
      )

      const mountainMap =
        await getMountainsByIds(mountainIds)

      setMountainsById(mountainMap)
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
    setSelectedMountain(null)
    setMountainCandidates([])
  }

  function selectMountain(mountain: Mountain) {
    setMountainId(mountain.id)
    setMountainName(mountain.name)
    setSelectedMountain(mountain)
    setMountainCandidates([])
    setFormError('')
  }
  
  function clearMountain() {
    setMountainId('')
    setMountainName('')
    setSelectedMountain(null)
    setMountainCandidates([])
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
      // 予定の登録・更新
      // =========================
      if (editingId !== null) {
        await updatePlan(
          editingId,
          planData,
          isLoggedIn
        )
      } else {
        await createPlan(
          planData,
          isLoggedIn
        )
      }

      await fetchPlans(isLoggedIn)

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
      await deletePlan(id, isLoggedIn)

      await fetchPlans(isLoggedIn)
    } catch (error) {
      console.error('予定の削除に失敗しました:', error)
      alert('予定の削除に失敗しました。')
    }
  }

  /**
   * 日程確定済み / 日程未定に分類
   */
  const fixedPlans = useMemo(() => {
    const now = new Date()

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    const oneWeekLater = new Date(today)
    oneWeekLater.setDate(oneWeekLater.getDate() + 6)

    const toDateString = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")

      return `${year}-${month}-${day}`
    }

    const todayString = toDateString(today)
    const oneWeekLaterString = toDateString(oneWeekLater)

    return [...plans]
      .filter((plan) => {
        if (!plan.fixed || !plan.date) {
          return false
        }

        return (
          plan.date >= todayString &&
          plan.date <= oneWeekLaterString
        )
      })
      .sort((a, b) => a.date!.localeCompare(b.date!))
  }, [plans])

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

          <div className="section-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                window.location.href = '/plans'
              }}
            >
              <CalendarDays size={18} />
              予定一覧
            </button>
            
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                window.location.href = '/mountains'
              }}
            >
              <MapPin size={18} />
              山を探す
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={openCreate}
            >
              <Plus size={18} />
              予定を登録
            </button>
          </div>
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
      <PlanFormModal
        isOpen={isFormOpen}
        editingId={editingId}
        formError={formError}
        saving={saving}

        title={title}
        mountainId={mountainId}
        mountainName={mountainName}
        mountainCandidates={mountainCandidates}
        isMountainSearching={isMountainSearching}
        selectedMountain={selectedMountain}

        date={date}
        undecided={undecided}

        onClose={() => {
          setIsFormOpen(false)
          resetForm()
        }}

        onSubmit={handleSubmit}

        onTitleChange={setTitle}
        onMountainNameChange={handleMountainNameChange}
        onSelectMountain={selectMountain}
        onClearMountain={clearMountain}
        onDateChange={setDate}
        onUndecidedChange={(checked) => {
          setUndecided(checked)

          if (checked) {
            setDate('')
          }
        }}
      />

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