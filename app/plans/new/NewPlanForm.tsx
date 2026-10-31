'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  searchMountains,
  getMountainLists,
  getMountainDetails,
} from '@/lib/mountains/api'
import type {
  Mountain,
  MountainDetails,
} from '@/lib/mountains/api'
import type { FormEvent } from 'react'
import { createPlan } from '@/lib/plans/api'
import { useAuth } from '@/lib/AuthContext'

export default function NewPlanForm({
  mountainIdFromUrl,
  dateFromUrl,
}: {
  mountainIdFromUrl: string
  dateFromUrl: string
}) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [title, setTitle] = useState('')
  const [mountainId, setMountainId] = useState('')
  const [mountainName, setMountainName] = useState('')
  const [mountainList, setMountainList] = useState('')
  const [mountainLists, setMountainLists] = useState<
    { id: string; name: string }[]
  >([])
  const [mountainCandidates, setMountainCandidates] = useState<Mountain[]>([])
  const [isMountainSearching, setIsMountainSearching] = useState(false)
  const [selectedMountain, setSelectedMountain] =
    useState<Mountain | null>(null)

  const [mountainDetails, setMountainDetails] =
    useState<MountainDetails>({
      trailheads: [],
      courses: [],
    })
  const [isDetailsLoading, setIsDetailsLoading] =
    useState(false)
  const [trailheadId, setTrailheadId] =
    useState('')
  const [courseId, setCourseId] =
    useState('')

  const [date, setDate] = useState(dateFromUrl)
  const [undecided, setUndecided] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [timeBasis, setTimeBasis] = useState<'departure' | 'return'>('departure')
  const [departureTime, setDepartureTime] = useState('')
  const [returnTime, setReturnTime] = useState('')
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

  function addMinutesToTime(time: string, minutes: number) {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const normalizedMinutes =
      ((totalMinutes % 1440) + 1440) % 1440

    return `${String(Math.floor(normalizedMinutes / 60)).padStart(2, '0')}:${String(
      normalizedMinutes % 60
    ).padStart(2, '0')}`
  }

  const calculatedReturnTime =
    timeBasis === 'departure' &&
    departureTime &&
    totalDurationMinutes !== null
      ? addMinutesToTime(departureTime, totalDurationMinutes)
      : ''

  const calculatedDepartureTime =
    timeBasis === 'return' &&
    returnTime &&
    totalDurationMinutes !== null
      ? addMinutesToTime(returnTime, -totalDurationMinutes)
      : ''

  // 山リストを取得
  useEffect(() => {
    async function loadMountainLists() {
      try {
        const lists = await getMountainLists()
        setMountainLists(lists)
      } catch (error) {
        console.error(
          '山リストの取得に失敗しました:',
          error
        )
      }
    }

    loadMountainLists()
  }, [])

  // 選択した山の登山口・駐車場・駅・コースを取得
  useEffect(() => {
    if (!selectedMountain) return

    const mountainId = selectedMountain.id
    let cancelled = false

    async function loadMountainDetails() {
      setIsDetailsLoading(true)
      setMountainDetails({
        trailheads: [],
        courses: [],
      })
      setTrailheadId('')
      setCourseId('')

      try {
        const details = await getMountainDetails(mountainId)

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
  }, [selectedMountain])

  // URLの mountainId から山を取得
  useEffect(() => {
    async function loadMountain() {
      if (!mountainIdFromUrl) {
        return
      }

      try {
        const response = await fetch(
          `/api/mountains?id=${encodeURIComponent(
            mountainIdFromUrl
          )}`
        )

        if (!response.ok) {
          throw new Error(
            '山情報の取得に失敗しました'
          )
        }

        const mountain = await response.json()

        if (!mountain) {
          throw new Error(
            '山情報が見つかりませんでした'
          )
        }

        setMountainId(mountain.id)
        setMountainName(mountain.name)
        setSelectedMountain(mountain)
      } catch (error) {
        console.error(
          '山情報の取得に失敗しました:',
          error
        )

        setFormError(
          '山情報の取得に失敗しました。'
        )
      }
    }

    loadMountain()
  }, [mountainIdFromUrl])

  // 山名検索
  useEffect(() => {
    const query = mountainName.trim()

    if (!query || mountainId) {
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
        console.error(
          '山の検索に失敗しました:',
          error
        )

        setMountainCandidates([])
      } finally {
        setIsMountainSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [
    mountainName,
    mountainId,
    mountainList,
  ])

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

  // 登山口を選択
  function selectTrailhead(id: string) {
    setTrailheadId(id)

    // 選択した登山口と開始登山口が異なるコースは解除
    if (courseId) {
      const selectedCourse = mountainDetails.courses.find(
        (course) => course.id === courseId
      )

      if (
        selectedCourse?.start_trailhead_id &&
        selectedCourse.start_trailhead_id !== id
      ) {
        setCourseId('')
      }
    }
  }

  // コースを選択
  function selectCourse(id: string) {
    setCourseId(id)

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

  function handleMountainListChange(value: string) {
    setMountainList(value)
    setMountainId('')
    setMountainName('')
    setSelectedMountain(null)
    setMountainCandidates([])
  }

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
        '山名を候補から選択し、日程または「日程未定」を入力してください。'
      )
      return
    }

    if (authLoading) {
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
          const weatherData =
            await weatherResponse.json()

          weather =
            weatherData.weather ?? '不明'
          weatherCode =
            weatherData.weatherCode ?? null
          rain =
            weatherData.rain ?? 0
          wind =
            weatherData.wind ?? 0
        }
      }

      const finalTitle =
        title.trim() || selectedMountain.name

      function addMinutesToTime(time: string, minutes: number) {
        const [hours, mins] = time.split(':').map(Number)
        const totalMinutes = hours * 60 + mins + minutes
        const normalizedMinutes =
          ((totalMinutes % 1440) + 1440) % 1440
        const resultHours = Math.floor(normalizedMinutes / 60)
        const resultMinutes = normalizedMinutes % 60

        return `${String(resultHours).padStart(2, '0')}:${String(
          resultMinutes
        ).padStart(2, '0')}`
      }

      const calculatedReturnTime =
        timeBasis === 'departure' &&
        departureTime &&
        totalDurationMinutes !== null
          ? addMinutesToTime(departureTime, totalDurationMinutes)
          : ''

      const calculatedDepartureTime =
        timeBasis === 'return' &&
        returnTime &&
        totalDurationMinutes !== null
          ? addMinutesToTime(returnTime, -totalDurationMinutes)
          : ''

      const planData = {
        title: finalTitle,
        mountainId: selectedMountain.id,
        trailheadId: trailheadId || null,
        courseId: courseId || null,
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
      }

      await createPlan(
        planData,
        !!user
      )

      router.push('/')
    } catch (error) {
      console.error(
        '予定の保存に失敗しました:',
        error
      )

      setFormError(
        '予定の登録に失敗しました。'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="planner-shell">
      <div className="page-content">
        <section className="section-heading">
          <div>
            <p className="section-kicker">
              NEW PLAN
            </p>

            <h1>予定を登録</h1>
          </div>
        </section>

        <form onSubmit={handleSubmit}>
          {/* タイトル */}
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

          {/* リストで絞り込み */}
          <label>
            リストで絞り込み

            <select
              value={mountainList}
              onChange={(event) =>
                handleMountainListChange(
                  event.target.value
                )
              }
            >
              <option value="">
                すべての山
              </option>

              {mountainLists.map((list) => (
                <option
                  key={list.id}
                  value={list.name}
                >
                  {list.name}
                </option>
              ))}
            </select>
          </label>

          {/* 山名 */}
          <label>
            山名

            <div className="mountain-search">
              <input
                value={mountainName}
                onChange={(event) =>
                  handleMountainNameChange(
                    event.target.value
                  )
                }
                placeholder="例：高尾山"
                autoComplete="off"
              />

              {isMountainSearching && (
                <p className="search-status">
                  山を検索しています...
                </p>
              )}

              {!isMountainSearching &&
                mountainCandidates.length > 0 && (
                  <div className="mountain-candidates">
                    {mountainCandidates.map(
                      (mountain) => (
                        <button
                          key={mountain.id}
                          type="button"
                          className="mountain-candidate"
                          onClick={() =>
                            selectMountain(
                              mountain
                            )
                          }
                        >
                          <strong>
                            {mountain.name}
                          </strong>

                          <span>
                            {mountain.area}
                            {mountain.elevation
                              ? ` ・ ${mountain.elevation}m`
                              : ''}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )}

              {!isMountainSearching &&
                mountainName.trim() &&
                !mountainId &&
                mountainCandidates.length === 0 && (
                  <p className="search-status">
                    該当する山がありません
                  </p>
                )}
            </div>
          </label>

          {/* 選択した山 */}
          {mountainId && (
            <div className="selected-mountain">
              <span>
                選択中：
                <strong>{mountainName}</strong>
              </span>

              <button
                type="button"
                onClick={clearMountain}
              >
                変更
              </button>
            </div>
          )}

          {/* 登山口・コース */}
          {mountainId && (
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
                      value={trailheadId}
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
                  {trailheadId && (() => {
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

                        {/* 駐車場 */}
                        <div>
                          <strong>駐車場</strong>

                          {selectedTrailhead.mountain_parking_lots.length > 0 ? (
                            <ul>
                              {selectedTrailhead.mountain_parking_lots.map(
                                (parking) => (
                                  <li key={parking.id}>
                                    {parking.name}

                                    {parking.description && (
                                      <p>
                                        {parking.description}
                                      </p>
                                    )}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p>登録されている駐車場はありません。</p>
                          )}
                        </div>

                        {/* 最寄り駅 */}
                        <div>
                          <strong>最寄り駅</strong>

                          {selectedTrailhead.mountain_stations.length > 0 ? (
                            <ul>
                              {selectedTrailhead.mountain_stations.map(
                                (station) => (
                                  <li key={station.id}>
                                    {station.name}

                                    {station.description && (
                                      <p>
                                        {station.description}
                                      </p>
                                    )}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p>登録されている駅はありません。</p>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* コース */}
                  <label>
                    登山コース（任意）

                    <select
                      value={courseId}
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

                  {courseId && (() => {
                    const selectedCourse =
                      mountainDetails.courses.find(
                        (course) =>
                          course.id === courseId
                      )

                    if (!selectedCourse) return null

                    return selectedCourse.description ? (
                      <p>{selectedCourse.description}</p>
                    ) : null
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
          )}

          {/* 日付 */}
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

          {/* 日程未定 */}
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

          {/* 時間設定 */}
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

          {formError && (
            <p className="form-error">
              {formError}
            </p>
          )}

          <button
            className="primary-button submit-button"
            type="submit"
            disabled={saving}
          >
            {saving ? '保存中...' : '予定を追加'}
          </button>
        </form>

        <button
          className="secondary-button"
          type="button"
          onClick={() => router.back()}
        >
          戻る
        </button>
      </div>
    </main>
  )
}