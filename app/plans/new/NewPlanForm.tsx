'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  searchMountains,
  getMountainLists,
} from '@/lib/mountains/api'
import type { Mountain } from '@/lib/mountains/api'
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

  const [date, setDate] = useState(dateFromUrl)
  const [undecided, setUndecided] = useState(false)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

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