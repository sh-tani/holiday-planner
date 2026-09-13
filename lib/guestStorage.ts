import type { Plan } from "@/lib/types"

const STORAGE_KEY = "holiday-planner-guest-plans"

export function getGuestPlans(): Plan[] {
  if (typeof window === "undefined") {
    return []
  }

  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    return []
  }

  try {
    return JSON.parse(stored)
  } catch (error) {
    console.error("ゲスト予定の読み込みに失敗しました:", error)
    return []
  }
}

export function saveGuestPlans(plans: Plan[]) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}

export function addGuestPlan(plan: Plan) {
  const plans = getGuestPlans()
  saveGuestPlans([...plans, plan])
}

export function updateGuestPlan(plan: Plan) {
  const plans = getGuestPlans()

  const updatedPlans = plans.map((item) =>
    item.id === plan.id ? plan : item
  )

  saveGuestPlans(updatedPlans)
}

export function deleteGuestPlan(id: string) {
  const plans = getGuestPlans()

  const updatedPlans = plans.filter((item) => item.id !== id)

  saveGuestPlans(updatedPlans)
}