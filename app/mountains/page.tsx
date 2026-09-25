"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import {
  getMountainLists,
  type MountainList,
} from "@/lib/mountains/api"

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
  const [mountainLists, setMountainLists] = useState<MountainList[]>([])
  const [selectedList, setSelectedList] = useState("")

  useEffect(() => {
    async function loadMountains() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()

        if (selectedList) {
          params.set("list", selectedList)
        }

        const response = await fetch(
          `/api/mountains/map?${params.toString()}`
        )

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
  }, [selectedList])

  useEffect(() => {
    async function loadMountainLists() {
      try {
        const lists = await getMountainLists()
        setMountainLists(lists)
      } catch (err) {
        console.error("山リストの取得に失敗しました:", err)
      }
    }

    loadMountainLists()
  }, [])

  function handleSearch() {
    setAppliedQuery(searchQuery)
  }

  const prefectures = useMemo(() => {
    const PREFECTURE_ORDER = [
      "北海道",
      "青森県",
      "岩手県",
      "宮城県",
      "秋田県",
      "山形県",
      "福島県",
      "茨城県",
      "栃木県",
      "群馬県",
      "埼玉県",
      "千葉県",
      "東京都",
      "神奈川県",
      "新潟県",
      "富山県",
      "石川県",
      "福井県",
      "山梨県",
      "長野県",
      "岐阜県",
      "静岡県",
      "愛知県",
      "三重県",
      "滋賀県",
      "京都府",
      "大阪府",
      "兵庫県",
      "奈良県",
      "和歌山県",
      "鳥取県",
      "島根県",
      "岡山県",
      "広島県",
      "山口県",
      "徳島県",
      "香川県",
      "愛媛県",
      "高知県",
      "福岡県",
      "佐賀県",
      "長崎県",
      "熊本県",
      "大分県",
      "宮崎県",
      "鹿児島県",
      "沖縄県",
    ]
    const prefectureList = mountains.flatMap((mountain) => {
      if (!mountain.prefecture) {
        return []
      }

      return mountain.prefecture
        .split("・")
        .map((prefecture) => prefecture.trim())
        .filter(Boolean)
    })
    const uniquePrefectures = Array.from(new Set(prefectureList))
    return PREFECTURE_ORDER.filter((prefecture) =>
      uniquePrefectures.includes(prefecture)
    )
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
            value={selectedList}
            onChange={(event) => {
              setSelectedList(event.target.value)
              setSelectedPrefecture("")
            }}
            className="!w-auto shrink-0 rounded-lg border px-4 py-2.5 text-sm"
          >
            <option value="">リストすべて</option>

            {mountainLists.map((list) => (
              <option key={list.id} value={list.name}>
                {list.name}
              </option>
            ))}
          </select>

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
      <div className="overflow-hidden rounded-xl border">
        <MountainMap mountains={filteredMountains} />
      </div>

      {filteredMountains.length === 0 && (
        <div className="mt-4 rounded-lg border bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm text-gray-600">
            「{searchQuery}」に該当する山がありません。
          </p>
        </div>
      )}
    </main>
  )
}