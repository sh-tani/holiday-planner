"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"

const MountainMap = dynamic(
  () => import("@/components/mountains/MountainMap"),
  {
    ssr: false,
  }
)

type Mountain = {
  id: string
  name: string
  area: string
  prefecture: string | null
  latitude: number
  longitude: number
  elevation: number | null
}

export default function MountainsPage() {
  const [mountains, setMountains] = useState<Mountain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedQuery, setAppliedQuery] = useState("")
  const [selectedPrefecture, setSelectedPrefecture] = useState("")

  useEffect(() => {
    async function loadMountains() {
      try {
        const response = await fetch("/api/mountains")

        if (!response.ok) {
          throw new Error("山マスタの取得に失敗しました")
        }

        const data = await response.json()
        setMountains(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "山マスタの取得に失敗しました"
        )
      } finally {
        setLoading(false)
      }
    }

    loadMountains()
  }, [])

  function handleSearch() {
    setAppliedQuery(searchQuery)
  }

  const prefectures = useMemo(() => {
    const prefectureList = mountains.flatMap((mountain) => {
      if (!mountain.prefecture) {
        return []
      }

      return mountain.prefecture
        .split("・")
        .map((prefecture) => prefecture.trim())
        .filter(Boolean)
    })

    return Array.from(new Set(prefectureList)).sort()
  }, [mountains])

  const filteredMountains = useMemo(() => {
    const query = appliedQuery.trim().toLowerCase()

    return mountains.filter((mountain) => {
      const matchesQuery =
        !query ||
        mountain.name.toLowerCase().includes(query) ||
        mountain.area.toLowerCase().includes(query)

      const matchesPrefecture =
        !selectedPrefecture ||
        Boolean(mountain.prefecture?.includes(selectedPrefecture))

      return matchesQuery && matchesPrefecture
    })
  }, [mountains, appliedQuery, selectedPrefecture])

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">山を探す</h1>
        <p className="mt-4 text-sm text-gray-600">
          山マスタを読み込んでいます...
        </p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">山を探す</h1>
        <p className="mt-4 text-sm text-red-600">
          {error}
        </p>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">山を探す</h1>
        <p className="mt-2 text-sm text-gray-600">
          登録されている山を地図から探せます。
        </p>
      </div>

      {/* 山名検索 */}

      <div className="mb-4">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleSearch()
          }}
          className="mountain-search-form w-full"
        >
          <select
            value={selectedPrefecture}
            onChange={(event) => setSelectedPrefecture(event.target.value)}
            className="!w-auto shrink-0 rounded-lg border px-4 py-2.5 text-sm"
          >
            <option value="">都道府県すべて</option>

            {prefectures.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>

          <input
            id="mountain-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="山名やエリアを入力してください"
            className="min-w-0 flex-1 rounded-lg border px-4 py-2.5 text-sm"
          />

          <button
            type="submit"
            className="shrink-0 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white"
          >
            検索
          </button>
        </form>

        <p className="mt-2 text-xs text-gray-500">
          {filteredMountains.length}座を表示中
        </p>
      </div>

      {/* 検索結果 */}
      {filteredMountains.length === 0 ? (
        <div className="mb-4 rounded-lg border bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm text-gray-600">
            「{searchQuery}」に該当する山がありません。
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <MountainMap mountains={filteredMountains} />
        </div>
      )}
    </main>
  )
}