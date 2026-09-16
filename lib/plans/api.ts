import type { Plan } from '@/lib/types'
import {
  getGuestPlans,
  addGuestPlan,
  updateGuestPlan,
  deleteGuestPlan,
} from '@/lib/guestStorage'

/**
 * 予定一覧を取得
 *
 * ゲスト:
 *   localStorageから取得
 *
 * ログイン:
 *   /api/plansから取得
 */
export async function getPlans(
  isLoggedIn: boolean
): Promise<Plan[]> {
  if (!isLoggedIn) {
    return getGuestPlans()
  }

  const response = await fetch('/api/plans')

  if (!response.ok) {
    throw new Error('予定の取得に失敗しました')
  }

  const data = await response.json()

  return data ?? []
}

/**
 * 予定を登録
 */
export async function createPlan(
  plan: Omit<Plan, 'id'>,
  isLoggedIn: boolean
): Promise<void> {
  if (!isLoggedIn) {
    const newPlan: Plan = {
      id: crypto.randomUUID(),
      ...plan,
    }

    addGuestPlan(newPlan)
    return
  }

  const response = await fetch('/api/plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  })

  if (!response.ok) {
    throw new Error('予定の登録に失敗しました')
  }
}

/**
 * 予定を更新
 */
export async function updatePlan(
  id: string,
  plan: Omit<Plan, 'id'>,
  isLoggedIn: boolean
): Promise<void> {
  if (!isLoggedIn) {
    const updatedPlan: Plan = {
      id,
      ...plan,
    }

    updateGuestPlan(updatedPlan)
    return
  }

  const response = await fetch(`/api/plans/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(plan),
  })

  if (!response.ok) {
    throw new Error('予定の更新に失敗しました')
  }
}

/**
 * 予定を削除
 */
export async function deletePlan(
  id: string,
  isLoggedIn: boolean
): Promise<void> {
  if (!isLoggedIn) {
    deleteGuestPlan(id)
    return
  }

  const response = await fetch(`/api/plans/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('予定の削除に失敗しました')
  }
}