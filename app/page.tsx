'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '@/lib/plans/api'
import {
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
  getMountainLists,
  getMountainsByIds,
} from '@/lib/mountains/api'
import type { Mountain } from '@/lib/mountains/api'
import Rating from '@/components/planner/Rating'
import EmptyState from '@/components/planner/EmptyState'
import PlanFormModal from '@/components/planner/PlanFormModal'
import { useAuth } from '@/lib/AuthContext'
import PlanList from '@/components/planner/PlanList'

export default function Page() {
  const {user, profile, loading: authLoading} = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [activeTab, setActiveTab] = useState<'weekly' | 'all'>('weekly')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAlternativesOpen, setIsAlternativesOpen] = useState(false)

  const [alternativeDate, setAlternativeDate] = useState('')
  const [alternativeResults, setAlternativeResults] = useState<Plan[]>([])
  const [isAlternativeLoading, setIsAlternativeLoading] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)

  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [mountainId, setMountainId] = useState('')
  const [mountainName, setMountainName] = useState('')
  const [mountainCandidates, setMountainCandidates] = useState<Mountain[]>([])
  const [mountainList, setMountainList] = useState('')
  const [mountainLists, setMountainLists] = useState<
    { id: string; name: string }[]
  >([])
  const [isMountainSearching, setIsMountainSearching] = useState(false)
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null)
  const [mountainsById, setMountainsById] = useState<Record<string, Mountain>>({})

  const [date, setDate] = useState('')
  const [undecided, setUndecided] = useState(false)

  

  // APIから予定を取得
  useEffect(() => {
    if (authLoading) {
      return
    }

    if (user) {
      fetchPlans(true)
    } else {
      fetchPlans(false)
      setAlternativeResults([])
      setIsAlternativesOpen(false)
    }
  }, [user, authLoading])

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

        const data = await searchMountains(
          query,
          mountainList
        )
        setMountainCandidates(data)
      } catch (error) {
        console.error('山の検索に失敗しました:', error)
        setMountainCandidates([])
      } finally {
        setIsMountainSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [mountainName, mountainId, mountainList])

  useEffect(() => {
    async function loadMountainLists() {
      try {
        const lists = await getMountainLists()
        setMountainLists(lists)
      } catch (error) {
        console.error('山リストの取得に失敗しました:', error)
      }
    }

    loadMountainLists()
  }, [])

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

  function handleMountainListChange(value: string) {
    setMountainList(value)
    // リストを変更したら、現在選択している山を解除
    setMountainId('')
    setSelectedMountain(null)
    setMountainCandidates([])
  }
  /**
   * フォームを初期化
   */
  function resetForm() {
    setTitle('')
    setMountainId('')
    setMountainName('')
    setMountainList('')
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
          !!user
        )
      } else {
        await createPlan(
          planData,
          !!user
        )
      }

      await fetchPlans(!!user)

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
  async function searchAlternativePlans(targetDate: string) {
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
  }

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

    searchAlternativePlans(alternativeDate)
  }, [
    isAlternativesOpen,
    alternativeDate,
    alternativeMountains,
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

      {/* 予定登録・編集モーダル */}
      <PlanFormModal
        isOpen={isFormOpen}
        editingId={editingId}
        formError={formError}
        saving={saving}

        title={title}
        mountainId={mountainId}
        mountainName={mountainName}
        mountainList={mountainList}
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
        onMountainListChange={handleMountainListChange}
        mountainLists={mountainLists}
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