'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'

import { useAuth } from '@/lib/AuthContext'
import {
  getPlans,
  updatePlan,
} from '@/lib/plans/api'
import {
  getMountainsByIds,
  type Mountain,
} from '@/lib/mountains/api'

export default function EditPlanPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()

  const planId =
    typeof params.id === 'string'
      ? params.id
      : ''

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [returnTime, setReturnTime] = useState('')
  const [outboundTravelMinutes, setOutboundTravelMinutes] =
    useState('')
  const [activityMinutes, setActivityMinutes] = useState('')
  const [returnTravelMinutes, setReturnTravelMinutes] =
    useState('')
  const [undecided, setUndecided] = useState(false)

  const [mountain, setMountain] =
    useState<Mountain | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (authLoading || !planId) {
      return
    }

    async function loadPlan() {
      setLoading(true)
      setFormError('')

      try {
        const plans = await getPlans(!!user)

        const plan = plans.find(
          (item) => item.id === planId
        )

        if (!plan) {
          setFormError('予定が見つかりません。')
          return
        }

        setTitle(plan.title)
        setDate(plan.date ?? '')
        setUndecided(!plan.fixed)
        setDepartureTime(plan.departureTime ?? '')
        setReturnTime(plan.returnTime ?? '')
        setOutboundTravelMinutes(
          plan.outboundTravelMinutes?.toString() ?? ''
        )
        setActivityMinutes(
          plan.activityMinutes?.toString() ?? ''
        )
        setReturnTravelMinutes(
          plan.returnTravelMinutes?.toString() ?? ''
        )

        const mountainMap =
          await getMountainsByIds([
            plan.mountainId,
          ])

        setMountain(
          mountainMap[plan.mountainId] ?? null
        )
      } catch (error) {
        console.error(
          '予定の取得に失敗しました:',
          error
        )
        setFormError(
          '予定の取得に失敗しました。'
        )
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [authLoading, planId, user])

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!mountain) {
      setFormError('山情報を確認してください。')
      return
    }

    if (!undecided && !date) {
      setFormError(
        '日付を入力するか、「日程未定」を選択してください。'
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

      if (!undecided && date) {
        const response = await fetch(
          `/api/weather?latitude=${encodeURIComponent(
            mountain.latitude
          )}&longitude=${encodeURIComponent(
            mountain.longitude
          )}&date=${encodeURIComponent(date)}`
        )

        if (!response.ok) {
          console.warn(
            '天気予報がまだ取得できないため、予報待ちとして保存します'
          )
        } else {
          const weatherData =
            await response.json()

          weather =
            weatherData.weather ?? '不明'
          weatherCode =
            weatherData.weatherCode ?? null
          rain = weatherData.rain ?? 0
          wind = weatherData.wind ?? 0
        }
      }

      const finalTitle =
        title.trim() || mountain.name

      await updatePlan(
        planId,
        {
          title: finalTitle,
          mountainId: mountain.id,
          date: undecided ? null : date,
          weather,
          weatherCode,
          rain,
          wind,
          fixed: !undecided,
          departureTime: departureTime || null,
          returnTime: returnTime || null,
          outboundTravelMinutes:
            outboundTravelMinutes
              ? Number(outboundTravelMinutes)
              : null,
          activityMinutes:
            activityMinutes
              ? Number(activityMinutes)
              : null,
          returnTravelMinutes:
            returnTravelMinutes
              ? Number(returnTravelMinutes)
              : null,
        },
        !!user
      )

      router.push('/')
    } catch (error) {
      console.error(
        '予定の更新に失敗しました:',
        error
      )
      setFormError(
        '予定の更新に失敗しました。'
      )
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    router.push('/')
  }

  if (loading) {
    return (
      <main className="planner-shell">
        <div className="page-content">
          <div className="empty-state">
            <p>予定を読み込んでいます...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="planner-shell">
      <div className="page-content">
        <section className="section-heading">
          <div>
            <p className="section-kicker">
              EDIT PLAN
            </p>

            <h1>予定を編集</h1>
          </div>

          <button
            className="close-button"
            type="button"
            onClick={handleClose}
            aria-label="閉じる"
          >
            <X size={20} />
          </button>
        </section>

        {formError && (
          <p className="form-error">
            {formError}
          </p>
        )}

        {mountain && (
          <form onSubmit={handleSubmit}>
            <label>
              タイトル（任意）
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="例：秋の高尾山ハイキング"
              />
            </label>

            <label>
              山名
              <input
                value={mountain.name}
                readOnly
              />
            </label>

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

            <label className="check-label">
              <input
                type="checkbox"
                checked={undecided}
                onChange={(event) => {
                  const checked =
                    event.target.checked

                  setUndecided(checked)

                  if (checked) {
                    setDate('')
                  }
                }}
              />
              日程未定
            </label>

            <label>
              出発時刻
              <input
                type="time"
                value={departureTime}
                onChange={(event) =>
                  setDepartureTime(event.target.value)
                }
              />
            </label>

            <label>
              帰宅時刻
              <input
                type="time"
                value={returnTime}
                onChange={(event) =>
                  setReturnTime(event.target.value)
                }
              />
            </label>

            <label>
              往路移動時間（分）
              <input
                type="number"
                min="0"
                value={outboundTravelMinutes}
                onChange={(event) =>
                  setOutboundTravelMinutes(event.target.value)
                }
                placeholder="例：90"
              />
            </label>

            <label>
              活動時間（分）

              <input
                type="number"
                min="1"
                value={activityMinutes}
                onChange={(event) =>
                  setActivityMinutes(event.target.value)
                }
                placeholder="例：300"
              />
            </label>

            <label>
              復路移動時間（分）

              <input
                type="number"
                min="0"
                value={returnTravelMinutes}
                onChange={(event) =>
                  setReturnTravelMinutes(event.target.value)
                }
                placeholder="例：90"
              />
            </label>

            <button
              className="primary-button submit-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? '保存中...'
                : '変更を保存'}
              <Check size={17} />
            </button>
          </form>
        )}
      </div>
    </main>
  )
}