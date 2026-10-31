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
  getMountainDetails,
  type Mountain,
  type MountainDetails,
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
  const [timeBasis, setTimeBasis] = useState<
    'departure' | 'return'
  >('departure')
  const [outboundTravelMinutes, setOutboundTravelMinutes] =
    useState('')
  const [activityMinutes, setActivityMinutes] = useState('')
  const [returnTravelMinutes, setReturnTravelMinutes] =
    useState('')
  const totalDurationMinutes =
    outboundTravelMinutes !== '' &&
    activityMinutes !== '' &&
    returnTravelMinutes !== '' &&
    Number(outboundTravelMinutes) >= 0 &&
    Number(activityMinutes) > 0 &&
    Number(returnTravelMinutes) >= 0
      ? Number(outboundTravelMinutes) +
        Number(activityMinutes) +
        Number(returnTravelMinutes)
      : null

  function addMinutesToTime(
    time: string,
    minutes: number
  ) {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const normalizedMinutes =
      ((totalMinutes % 1440) + 1440) % 1440

    return `${String(
      Math.floor(normalizedMinutes / 60)
    ).padStart(2, '0')}:${String(
      normalizedMinutes % 60
    ).padStart(2, '0')}`
  }

  const calculatedReturnTime =
    timeBasis === 'departure' &&
    departureTime &&
    totalDurationMinutes !== null
      ? addMinutesToTime(
          departureTime,
          totalDurationMinutes
        )
      : ''

  const calculatedDepartureTime =
    timeBasis === 'return' &&
    returnTime &&
    totalDurationMinutes !== null
      ? addMinutesToTime(
          returnTime,
          -totalDurationMinutes
        )
      : ''
  const [undecided, setUndecided] = useState(false)

  const [mountain, setMountain] =
    useState<Mountain | null>(null)

  const [trailheadId, setTrailheadId] =
    useState<string | null>(null)
  const [courseId, setCourseId] =
    useState<string | null>(null)
  const [mountainDetails, setMountainDetails] =
    useState<MountainDetails>({
      trailheads: [],
      courses: [],
    })

  const [isDetailsLoading, setIsDetailsLoading] =
    useState(false)

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
        setTrailheadId(plan.trailheadId ?? null)
        setCourseId(plan.courseId ?? null)
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

  // 選択中の山の登山口・駐車場・駅・コースを取得
  useEffect(() => {
    if (!mountain) return

    const mountainId = mountain.id
    let cancelled = false

    async function loadMountainDetails() {
      setIsDetailsLoading(true)

      try {
        const details =
          await getMountainDetails(mountainId)

        if (!cancelled) {
          setMountainDetails(details)
        }
      } catch (error) {
        console.error(
          '登山情報の取得に失敗しました:',
          error
        )
      } finally {
        if (!cancelled) {
          setIsDetailsLoading(false)
        }
      }
    }

    loadMountainDetails()

    return () => {
      cancelled = true
    }
  }, [mountain])

  // 登山口を選択
  function selectTrailhead(id: string) {
    setTrailheadId(id || null)

    // 選択した登山口と開始登山口が異なるコースは解除
    if (courseId) {
      const selectedCourse = mountainDetails.courses.find(
        (course) => course.id === courseId
      )

      if (
        selectedCourse?.start_trailhead_id &&
        selectedCourse.start_trailhead_id !== id
      ) {
        setCourseId(null)
      }
    }
  }

  // コースを選択
  function selectCourse(id: string) {
    setCourseId(id || null)

    const selectedCourse = mountainDetails.courses.find(
      (course) => course.id === id
    )

    if (!selectedCourse) return

    // 開始登山口が登録されていれば自動選択
    if (selectedCourse.start_trailhead_id) {
      setTrailheadId(selectedCourse.start_trailhead_id)
    }

    // 所要時間が登録されていれば活動時間に反映
    if (selectedCourse.duration_minutes !== null) {
      setActivityMinutes(
        String(selectedCourse.duration_minutes)
      )
    }
  }

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
          trailheadId,
          courseId,
          date: undecided ? null : date,
          weather,
          weatherCode,
          rain,
          wind,
          fixed: !undecided,
          departureTime:
            (timeBasis === 'departure'
              ? departureTime
              : calculatedDepartureTime) || null,
          returnTime:
            (timeBasis === 'departure'
              ? calculatedReturnTime
              : returnTime) || null,
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

            {/* 登山口・コース */}
            <section className="mountain-details-section">
              <h2>登山情報</h2>

              {isDetailsLoading ? (
                <p>登山情報を読み込んでいます...</p>
              ) : (
                <>
                  {/* 登山口 */}
                  <label>
                    登山口（任意）
                    <select
                      value={trailheadId ?? ''}
                      onChange={(event) =>
                        selectTrailhead(event.target.value)
                      }
                    >
                      <option value="">
                        登山口を選択しない
                      </option>

                      {mountainDetails.trailheads.map(
                        (trailhead) => (
                          <option
                            key={trailhead.id}
                            value={trailhead.id}
                          >
                            {trailhead.name}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  {/* 選択した登山口の詳細 */}
                  {trailheadId &&
                    (() => {
                      const selectedTrailhead =
                        mountainDetails.trailheads.find(
                          (trailhead) =>
                            trailhead.id === trailheadId
                        )

                      if (!selectedTrailhead) return null

                      return (
                        <div className="trailhead-details">
                          <h3>{selectedTrailhead.name}</h3>

                          {selectedTrailhead.description && (
                            <p>
                              {selectedTrailhead.description}
                            </p>
                          )}

                          <div>
                            <strong>駐車場</strong>

                            {selectedTrailhead.mountain_parking_lots.length >
                            0 ? (
                              <ul>
                                {selectedTrailhead.mountain_parking_lots.map(
                                  (parking) => (
                                    <li key={parking.id}>
                                      {parking.name}

                                      {parking.description && (
                                        <p>{parking.description}</p>
                                      )}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p>登録情報なし</p>
                            )}
                          </div>

                          <div>
                            <strong>最寄り駅</strong>

                            {selectedTrailhead.mountain_stations.length >
                            0 ? (
                              <ul>
                                {selectedTrailhead.mountain_stations.map(
                                  (station) => (
                                    <li key={station.id}>
                                      {station.name}

                                      {station.description && (
                                        <p>{station.description}</p>
                                      )}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p>登録情報なし</p>
                            )}
                          </div>
                        </div>
                      )
                    })()}

                  {/* コース */}
                  <label>
                    登山コース（任意）
                    <select
                      value={courseId ?? ''}
                      onChange={(event) =>
                        selectCourse(event.target.value)
                      }
                    >
                      <option value="">
                        コースを選択しない
                      </option>

                      {mountainDetails.courses.map(
                        (course) => (
                          <option
                            key={course.id}
                            value={course.id}
                          >
                            {course.name}
                            {course.duration_minutes !== null
                              ? `（約${course.duration_minutes}分）`
                              : ''}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  {/* 選択したコースの説明 */}
                  {courseId &&
                    (() => {
                      const selectedCourse =
                        mountainDetails.courses.find(
                          (course) => course.id === courseId
                        )

                      if (!selectedCourse?.description) {
                        return null
                      }

                      return (
                        <p>{selectedCourse.description}</p>
                      )
                    })()}

                  {mountainDetails.trailheads.length === 0 &&
                    mountainDetails.courses.length === 0 && (
                      <p>
                        この山には、まだ登山情報が登録されていません。
                      </p>
                    )}
                </>
              )}
            </section>

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

            <fieldset>
              <legend>時刻の設定方法</legend>

              <label className="check-label">
                <input
                  type="radio"
                  name="timeBasis"
                  value="departure"
                  checked={timeBasis === 'departure'}
                  onChange={() => {
                    setTimeBasis('departure')
                    setReturnTime('')
                  }}
                />
                出発時刻を基準にする
              </label>

              <label className="check-label">
                <input
                  type="radio"
                  name="timeBasis"
                  value="return"
                  checked={timeBasis === 'return'}
                  onChange={() => {
                    setTimeBasis('return')
                    setDepartureTime('')
                  }}
                />
                帰宅時刻を基準にする
              </label>
            </fieldset>

            {timeBasis === 'departure' ? (
              <>
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
                  帰宅時刻（自動計算）
                  <input
                    type="time"
                    value={calculatedReturnTime}
                    readOnly
                  />
                </label>
              </>
            ) : (
              <>
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
                  出発時刻（自動計算）
                  <input
                    type="time"
                    value={calculatedDepartureTime}
                    readOnly
                  />
                </label>
              </>
            )}

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