"use client"

import { useMemo } from "react"
import type { Plan } from "@/lib/types"
import type { Mountain } from "@/lib/mountains/api"
import PlanListItem from "@/components/planner/PlanListItem"

type PlanListProps = {
  plans: Plan[]
  mountainsById: Record<string, Mountain>
  onEdit: (plan: Plan) => void
  onDelete: (id: string) => void
}

export default function PlanList({
  plans,
  mountainsById,
  onEdit,
  onDelete,
}: PlanListProps) {
  const todayString = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }, [])

  const upcomingPlans = useMemo(() => {
    return [...plans]
      .filter(
        (plan) =>
          plan.fixed &&
          plan.date &&
          plan.date >= todayString
      )
      .sort((a, b) =>
        a.date!.localeCompare(b.date!)
      )
  }, [plans, todayString])

  const undecidedPlans = useMemo(() => {
    return [...plans].filter(
      (plan) => !plan.fixed
    )
  }, [plans])

  const pastPlans = useMemo(() => {
    return [...plans]
      .filter(
        (plan) =>
          plan.fixed &&
          plan.date &&
          plan.date < todayString
      )
      .sort((a, b) =>
        b.date!.localeCompare(a.date!)
      )
  }, [plans, todayString])

  return (
    <>
      {/* 今後の予定 */}
      <section className="first-plan-section">
        <div className="section-heading compact">
          <div>
            <p className="section-kicker">
              UPCOMING
            </p>
            <h2>今後の予定</h2>
          </div>

          <span className="count-badge">
            {upcomingPlans.length}件
          </span>
        </div>

        {upcomingPlans.length > 0 ? (
          <div className="plan-list">
            {upcomingPlans.map((plan) => (
              <PlanListItem
                key={plan.id}
                plan={plan}
                mountain={
                  mountainsById[plan.mountainId] ??
                  undefined
                }
                onEdit={onEdit}
                onDelete={onDelete}
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

            <h2>日程未定</h2>
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
                mountain={
                  mountainsById[plan.mountainId] ??
                  undefined
                }
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
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
            <p className="section-kicker">
              PAST PLANS
            </p>

            <h2>過去の予定</h2>
          </div>

          <span className="count-badge">
            {pastPlans.length}件
          </span>
        </div>

        {pastPlans.length > 0 ? (
          <div className="plan-list">
            {pastPlans.map((plan) => (
              <PlanListItem
                key={plan.id}
                plan={plan}
                mountain={
                  mountainsById[plan.mountainId] ??
                  undefined
                }
                onEdit={onEdit}
                onDelete={onDelete}
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
  )
}