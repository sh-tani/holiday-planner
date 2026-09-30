'use client'
// lintテスト
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronRight,
  CloudSun,
  MapPin,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import type { Plan } from "@/lib/types"
import { getRating } from '@/lib/planner/rating'
import { formatDateWithWeekday } from '@/lib/planner/date'
import PlanCard from '@/components/planner/PlanCard'
import { getMountainsByIds } from '@/lib/mountains/api'
import type { Mountain } from '@/lib/mountains/api'
import Rating from '@/components/planner/Rating'
import EmptyState from '@/components/planner/EmptyState'
import { useAuth } from '@/lib/AuthContext'
import PlanList from '@/components/planner/PlanList'
import { useRouter } from "next/navigation"
import { deletePlan, getPlans } from '@/lib/plans/api'

export default function Page() {
  const {user, loading: authLoading} = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [activeTab, setActiveTab] = useState<'weekly' | 'all'>('weekly')

  const [isAlternativesOpen, setIsAlternativesOpen] = useState(false)

  const [alternativeDate, setAlternativeDate] = useState('')
  const [alternativeResults, setAlternativeResults] = useState<Plan[]>([])
  const [isAlternativeLoading, setIsAlternativeLoading] = useState(false)

  const [loading, setLoading] = useState(true)

  const [mountainsById, setMountainsById] = useState<Record<string, Mountain>>({})
  const router = useRouter()

  

  // APIから予定を取得
  useEffect(() => {
    if (authLoading) {
      return
    }

    if (user) {
      fetchPlans(true)
    } else {
      fetchPlans(false)
    }
  }, [user, authLoading])
  
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
  
  /**
   * 新規登録フォームを開く
   */
  function openCreate() {
    router.push('/plans/new')
  }

  function openEdit(plan: Plan) {
    router.push(`/plans/${plan.id}/edit`)
  }

  /**
   * 予定を削除
   */
  async function removePlan(id: string) {
    const confirmed = window.confirm('この予定を削除しますか？')

    if (!confirmed) return
    try {
      await deletePlan(id, !!user)

      await fetchPlans(!!user)
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
   * 代替プラン検索の日付候補
   * 明日〜7日後
   */
  const alternativeDateOptions = useMemo(() => {
    const today = new Date()
    const dates: string[] = []

    const toDateString = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    }

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      dates.push(toDateString(date))
    }

    return dates
  }, [])

  /**
   * 予定一覧に登録されている山を重複なしで取得
   */
  const alternativeMountains = useMemo(() => {
    const mountainIds = new Set<string>()

    return plans
      .map((plan) => {
        if (mountainIds.has(plan.mountainId)) {
          return null
        }

        const mountain = mountainsById[plan.mountainId]

        if (!mountain) {
          return null
        }

        mountainIds.add(plan.mountainId)
        return mountain
      })
      .filter((mountain): mountain is Mountain => mountain !== null)
  }, [plans, mountainsById])

  /**
   * 代替検索の初期日付を決定
   */
  const getDefaultAlternativeDate = () => {
    const options = alternativeDateOptions

    if (options.length === 0) {
      return ''
    }

    const nearestPlanDate = fixedPlans[0]?.date

    if (
      nearestPlanDate &&
      options.includes(nearestPlanDate)
    ) {
      return nearestPlanDate
    }

    return options[0]
  }

  /**
   * 指定日の天気から代替候補を検索
   */
  const searchAlternativePlans = useCallback(
    async (targetDate: string) => {
      if (!targetDate || alternativeMountains.length === 0) {
        setAlternativeResults([])
        return
      }

      setIsAlternativeLoading(true)

      try {
        const results = await Promise.all(
         alternativeMountains.map(async (mountain) => {
            try {
              const response = await fetch(
                `/api/weather?latitude=${encodeURIComponent(
                  mountain.latitude
               )}&longitude=${encodeURIComponent(
                  mountain.longitude
               )}&date=${encodeURIComponent(targetDate)}`
             )

              if (!response.ok) {
                return null
              }

              const weatherData = await response.json()

              const temporaryPlan = {
                id: '',
                title: mountain.name,
                mountainId: mountain.id,
               date: targetDate,
                weather: weatherData.weather ?? '不明',
                weatherCode:
                  weatherData.weatherCode ?? null,
                rain: weatherData.rain ?? 0,
                wind: weatherData.wind ?? 0,
                fixed: true,
              } as Plan

              const rating = getRating(temporaryPlan)

              if (rating.label !== 'おすすめ') {
               return null
              }

             return temporaryPlan
            } catch (error) {
              console.error(
                `${mountain.name}の天気取得に失敗しました:`,
                error
              )
              return null
            }
          })
        )

        setAlternativeResults(
          results.filter(
            (plan): plan is Plan => plan !== null
          )
        )
      } finally {
        setIsAlternativeLoading(false)
      }
    },
    [alternativeMountains]
  )

  /**
   * 代替プラン検索モーダルを開く
   */
  function openAlternatives() {
    const defaultDate = getDefaultAlternativeDate()

    setAlternativeDate(defaultDate)
    setIsAlternativesOpen(true)
  }

  /**
   * モーダル内の日付変更時に再検索
   */
  useEffect(() => {
    if (!isAlternativesOpen || !alternativeDate) {
      return
    }

    const timer = setTimeout(() => {
      searchAlternativePlans(alternativeDate)
    }, 0)

    return () => clearTimeout(timer)
  }, [
    isAlternativesOpen,
    alternativeDate,
    searchAlternativePlans,
  ])

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

        <section className="section-heading">
          <div className="section-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                router.push('/mountains')
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

        <div className="plan-tabs" role="tablist" aria-label="予定表示">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'weekly'}
            className={`plan-tab ${
              activeTab === 'weekly' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('weekly')}
          >
            今週の予定
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`plan-tab ${
              activeTab === 'all' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('all')}
          >
            予定一覧
          </button>
        </div>
        {activeTab === 'weekly' && (
          <section className="section-heading">
            <div>
              <p className="section-kicker">
                YOUR PLANS
              </p>

              <h2>今週の予定</h2>
            </div>
          </section>
        )}

        {/* 読み込み中 */}
        {loading ? (
          <div className="empty-state">
            <p>予定を読み込んでいます...</p>
          </div>
        ) : activeTab === 'weekly' ? (
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
        ) : (
          <PlanList
            plans={plans}
            mountainsById={mountainsById}
            onEdit={openEdit}
            onDelete={removePlan}
          />
        )}

        {/* 代替プラン */}
        {activeTab === 'weekly' && (
          <section className="alternative-cta">
            <div className="cta-icon">
              <Sparkles size={22} />
            </div>

            <div>
              <p className="section-kicker">
                FIND YOUR BEST DAY
              </p>

              <h2>
                天気が良い山に変更する？
              </h2>

              <p>
                登録した予定から、天気の良い山を探してみましょう。
              </p>
            </div>

            <button
              className="secondary-button"
              type="button"
              onClick={openAlternatives}
            >
              代替プランを検索
              <ChevronRight size={17} />
            </button>
          </section>
        )}
      </div>

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
              天気の良い山を探す
            </h2>

            <p className="modal-intro">
              登録済みの山から、選択した日の天気が「おすすめ」の山を表示します。
            </p>

            <div className="alternative-date-selector">
              <label htmlFor="alternative-date">
                予定日
              </label>

              <select
                id="alternative-date"
                value={alternativeDate}
                onChange={(event) =>
                  setAlternativeDate(event.target.value)
                }
              >
                {alternativeDateOptions.map(
                  (dateOption) => (
                    <option
                      key={dateOption}
                      value={dateOption}
                    >
                      {formatDateWithWeekday(dateOption)}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="suggestion-list">
              {isAlternativeLoading ? (
                <p className="empty-note">
                  天気予報を確認しています…
                </p>
              ) : alternativeResults.length > 0 ? (
                alternativeResults.map((plan) => {
                  const mountain =
                    mountainsById[plan.mountainId]

                  return (
                    <div
                      className="suggestion-row"
                      key={plan.mountainId}
                    >
                      <div>
                        <strong>
                          {mountain?.name ??
                            '山情報不明'}
                        </strong>

                        <span>
                          {mountain
                            ? `${mountain.name}（${mountain.area}）`
                            : '山情報不明'}
                        </span>
                      </div>

                      <Rating
                        rating={getRating(plan)}
                      />
                    </div>
                  )
                })
              ) : (
                <p className="empty-note">
                  この日の「おすすめ」の山はありません。
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