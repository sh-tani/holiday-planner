"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  getPlans,
  deletePlan,
} from "@/lib/plans/api"
import type { Plan } from "@/lib/types"
import {
  getMountainsByIds,
} from "@/lib/mountains/api"
import type { Mountain } from "@/lib/mountains/api"
import PlanList from "@/components/planner/PlanList"

export default function PlansPage() {
  const router = useRouter()

  const [plans, setPlans] = useState<Plan[]>([])
  const [mountainsById, setMountainsById] =
    useState<Record<string, Mountain>>({})
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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
   * 予定を編集
   */
  function openEdit(plan: Plan) {
    router.push(
      `/plans/${encodeURIComponent(plan.id)}/edit`
    )
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
          <PlanList
            plans={plans}
            mountainsById={mountainsById}
            onEdit={openEdit}
            onDelete={removePlan}
          />
        )}
      </div>
    </main>
  )
}