"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from "@/lib/plans/api"
import type { Plan } from "@/lib/types"
import {
  getMountainsByIds,
  searchMountains,
} from "@/lib/mountains/api"
import type { Mountain } from "@/lib/mountains/api"
import PlanListItem from "@/components/planner/PlanListItem"
import PlanFormModal from "@/components/planner/PlanFormModal"

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [mountainsById, setMountainsById] =
    useState<Record<string, Mountain>>({})
  const [loading, setLoading] = useState(true)

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 編集・登録フォーム
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState("")
  const [mountainId, setMountainId] = useState("")
  const [mountainName, setMountainName] = useState("")
  const [mountainCandidates, setMountainCandidates] =
    useState<Mountain[]>([])
  const [isMountainSearching, setIsMountainSearching] =
    useState(false)
  const [selectedMountain, setSelectedMountain] =
    useState<Mountain | null>(null)

  const [date, setDate] = useState("")
  const [undecided, setUndecided] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  /**
   * 予定を取得
   */
  async function loadPlans() {
    setLoading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      const loggedIn = Boolean(user)

      setIsLoggedIn(loggedIn)

      const loadedPlans = await getPlans(loggedIn)

      setPlans(loadedPlans)

      const mountainIds = loadedPlans.map(
        (plan) => plan.mountainId
      )

      const mountainMap =
        await getMountainsByIds(mountainIds)

      setMountainsById(mountainMap)
    } catch (error) {
      console.error(
        "予定の取得に失敗しました:",
        error
      )
    } finally {
      setLoading(false)
    }
  }

  /**
   * フォームを初期化
   */
  function resetForm() {
    setTitle("")
    setMountainId("")
    setMountainName("")
    setMountainCandidates([])
    setIsMountainSearching(false)
    setSelectedMountain(null)

    setDate("")
    setUndecided(false)

    setEditingId(null)
    setFormError("")
  }

  /**
   * 編集フォームを開く
   */
  async function openEdit(plan: Plan) {
    setEditingId(plan.id)
    setTitle(plan.title)
    setDate(plan.date ?? "")
    setUndecided(!plan.fixed)
    setFormError("")

    try {
      const response = await fetch(
        `/api/mountains?id=${encodeURIComponent(
          plan.mountainId
        )}`
      )

      if (!response.ok) {
        throw new Error(
          "山情報の取得に失敗しました"
        )
      }

      const mountain = await response.json()

      if (!mountain) {
        throw new Error(
          "山情報が見つかりませんでした"
        )
      }

      setMountainId(mountain.id)
      setMountainName(mountain.name)
      setSelectedMountain(mountain)
    } catch (error) {
      console.error(
        "編集対象の山情報取得に失敗しました:",
        error
      )

      setFormError(
        "山情報の取得に失敗しました。"
      )
    }

    setIsFormOpen(true)
  }

  /**
   * 山名入力
   */
  function handleMountainNameChange(
    value: string
  ) {
    setMountainName(value)
    setMountainId("")
    setSelectedMountain(null)
    setMountainCandidates([])
  }

  /**
   * 山を選択
   */
  function selectMountain(
    mountain: Mountain
  ) {
    setMountainId(mountain.id)
    setMountainName(mountain.name)
    setSelectedMountain(mountain)
    setMountainCandidates([])
    setFormError("")
  }

  /**
   * 山の選択を解除
   */
  function clearMountain() {
    setMountainId("")
    setMountainName("")
    setSelectedMountain(null)
    setMountainCandidates([])
  }

  /**
   * 山名入力中の検索
   */
  useEffect(() => {
    const query = mountainName.trim()

    if (!query) {
      setMountainCandidates([])
      setIsMountainSearching(false)
      return
    }

    // 既に山を選択済みなら検索しない
    if (mountainId) {
      setMountainCandidates([])
      return
    }

    const timer = setTimeout(
      async () => {
        try {
          setIsMountainSearching(true)

          const data =
            await searchMountains(query)

          setMountainCandidates(data)
        } catch (error) {
          console.error(
            "山の検索に失敗しました:",
            error
          )

          setMountainCandidates([])
        } finally {
          setIsMountainSearching(false)
        }
      },
      300
    )

    return () => clearTimeout(timer)
  }, [mountainName, mountainId])

  /**
   * 予定を更新
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (
      !mountainId ||
      !selectedMountain ||
      (!undecided && !date)
    ) {
      setFormError(
        "山名を候補から選択し、日程または「日程未定」を入力してください。"
      )
      return
    }

    setSaving(true)
    setFormError("")

    try {
      let weather = "不明"
      let weatherCode: number | null = null
      let rain = 0
      let wind = 0

      // 日程が決まっている場合は天気を再取得
      if (!undecided && date) {
        const weatherResponse =
          await fetch(
            `/api/weather?latitude=${encodeURIComponent(
              selectedMountain.latitude
            )}&longitude=${encodeURIComponent(
              selectedMountain.longitude
            )}&date=${encodeURIComponent(date)}`
          )

        if (!weatherResponse.ok) {
          console.warn(
            "天気予報がまだ取得できないため、予報待ちとして登録します"
          )
        } else {
          const weatherData =
            await weatherResponse.json()

          weather =
            weatherData.weather ?? "不明"
          weatherCode =
            weatherData.weatherCode ?? null
          rain =
            weatherData.rain ?? 0
          wind =
            weatherData.wind ?? 0
        }
      }

      const finalTitle =
        title.trim() ||
        selectedMountain.name

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

      await loadPlans()

      setIsFormOpen(false)
      resetForm()
    } catch (error) {
      console.error(
        "予定の保存に失敗しました:",
        error
      )

      if (editingId !== null) {
        setFormError(
          "予定の更新に失敗しました。"
        )
      } else {
        setFormError(
          "予定の登録に失敗しました。"
        )
      }
    } finally {
      setSaving(false)
    }
  }

  /**
   * 予定を削除
   */
  async function removePlan(id: string) {
    const confirmed = window.confirm(
      "この予定を削除しますか？"
    )

    if (!confirmed) {
      return
    }

    try {
      await deletePlan(
        id,
        isLoggedIn
      )

      await loadPlans()
    } catch (error) {
      console.error(
        "予定の削除に失敗しました:",
        error
      )

      alert(
        "予定の削除に失敗しました。"
      )
    }
  }

  /**
   * 予定を日付順に並べる
   * 日程未定は最後
   */
    const todayString = (() => {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, "0")
        const day = String(today.getDate()).padStart(2, "0")

        return `${year}-${month}-${day}`
    })()

    const upcomingPlans = useMemo(() => {
    return [...plans]
        .filter(
        (plan) =>
            plan.fixed &&
            plan.date &&
            plan.date >= todayString
      )
        .sort((a, b) => a.date!.localeCompare(b.date!))
    }, [plans, todayString])

    const undecidedPlans = useMemo(() => {
      return [...plans].filter((plan) => !plan.fixed)
    }, [plans])

    const pastPlans = useMemo(() => {
     return [...plans]
        .filter(
       (plan) =>
            plan.fixed &&
            plan.date &&
           plan.date < todayString
       )
        .sort((a, b) => b.date!.localeCompare(a.date!))
    }, [plans, todayString])

  return (
    <main className="planner-shell">
      <div className="page-content">

        <section className="section-heading">
          <div>
            <p className="section-kicker">
              ALL PLANS
            </p>

            <h1>登録した予定</h1>
          </div>
        </section>

        {loading ? (
          <div className="empty-state">
            <p>
              予定を読み込んでいます...
            </p>
          </div>
        ) : (
          <>
            {/* 今後の予定 */}
            <section>
              <div className="section-heading compact">
                <div>
                  <p className="section-kicker">UPCOMING</p>
                  <h2>今後の予定</h2>
                </div>
                <span className="count-badge">{upcomingPlans.length}件</span>
              </div>

              {upcomingPlans.length > 0 ? (
                <div className="plan-list">
                  {upcomingPlans.map((plan) => (
                    <PlanListItem
                        key={plan.id}
                        plan={plan}
                        mountain={mountainsById[plan.mountainId] ?? undefined}
                        onEdit={openEdit}
                        onDelete={removePlan}
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-note">
                  日程確定済みの予定はありません。
                </p>
              )}
            </section>

            {/* 日程未定 */}
            <section className="undecided-section">
              <div className="section-heading compact">
                <div>
                  <p className="section-kicker">
                    FLEXIBLE IDEAS
                  </p>

                  <h2>
                    日程未定
                  </h2>
                </div>

                <span className="count-badge">
                  {undecidedPlans.length}件
                </span>
              </div>

              {undecidedPlans.length > 0 ? (
                <div className="plan-list">
                  {undecidedPlans.map((plan) => (
                      <PlanListItem
                        key={plan.id}
                        plan={plan}
                        mountain={mountainsById[plan.mountainId] ?? undefined}
                        onEdit={openEdit}
                        onDelete={removePlan}
                      />
                    )
                  )}
                </div>
              ) : (
                <p className="empty-note">
                  日程未定の予定はありません。
                </p>
              )}
            </section>

            {/* 過去の予定 */}
            <section className="past-section">
            <div className="section-heading compact">
                <div>
                <p className="section-kicker">PAST PLANS</p>
                <h2>過去の予定</h2>
                </div>
                <span className="count-badge">{pastPlans.length}件</span>
            </div>

            {pastPlans.length > 0 ? (
                <div className="plan-list">
                {pastPlans.map((plan) => (
                    <PlanListItem
                    key={plan.id}
                    plan={plan}
                    mountain={mountainsById[plan.mountainId] ?? undefined}
                    onEdit={openEdit}
                    onDelete={removePlan}
                    />
                ))}
                </div>
            ) : (
                <p className="empty-note">
                過去の予定はありません。
                </p>
            )}
            </section>
          </>
        )}
      </div>

      {/* 予定編集モーダル */}
      <PlanFormModal
        isOpen={isFormOpen}
        editingId={editingId}
        formError={formError}
        saving={saving}

        title={title}
        mountainId={mountainId}
        mountainName={mountainName}
        mountainCandidates={
          mountainCandidates
        }
        isMountainSearching={
          isMountainSearching
        }
        selectedMountain={
          selectedMountain
        }

        date={date}
        undecided={undecided}

        onClose={() => {
          setIsFormOpen(false)
          resetForm()
        }}

        onSubmit={handleSubmit}

        onTitleChange={setTitle}
        onMountainNameChange={
          handleMountainNameChange
        }
        onSelectMountain={
          selectMountain
        }
        onClearMountain={
          clearMountain
        }
        onDateChange={setDate}
        onUndecidedChange={
          (checked) => {
            setUndecided(checked)

            if (checked) {
              setDate("")
            }
          }
        }
      />
    </main>
  )
}