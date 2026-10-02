"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import {
  getMountainLists,
  type MountainList,
} from "@/lib/mountains/api"
import { useAuth } from "@/lib/AuthContext"
import { createClient } from "@/lib/supabase/client"

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
  const { user } = useAuth()
  const [mountains, setMountains] = useState<Mountain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedQuery, setAppliedQuery] = useState("")
  const [selectedPrefecture, setSelectedPrefecture] = useState("")
  const [mountainLists, setMountainLists] = useState<MountainList[]>([])
  const [selectedList, setSelectedList] = useState("")
  const [climbedFilter, setClimbedFilter] = useState("all")
  const [climbedMountainIds, setClimbedMountainIds] = useState<Set<string>>(
    new Set()
  )

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
        if (
          selectedPrefecture &&
          !data.some((mountain: Mountain) =>
            mountain.prefecture?.includes(selectedPrefecture)
          )
        ) {
          setSelectedPrefecture("")
        }
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
  }, [selectedList, selectedPrefecture])

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

  useEffect(() => {
    async function loadClimbedMountains() {
      if (!user) {
        setClimbedMountainIds(new Set())
        return
      }

      const supabase = createClient()

      const { data, error } = await supabase
        .from("user_mountains")
        .select("mountain_id")
        .eq("user_id", user.id)
        .eq("climbed", true)

      if (error) {
        console.error("登頂済み山の取得に失敗しました:", error)
        return
      }

      setClimbedMountainIds(
        new Set(data.map((record) => record.mountain_id))
      )
    }

    loadClimbedMountains()
  }, [user])

  async function handleToggleClimbed(mountainId: string) {
    if (!user) {
      alert("登頂記録を管理するにはログインが必要です")
      return
    }

    const supabase = createClient()
    const isClimbed = climbedMountainIds.has(mountainId)

    if (isClimbed) {
      const { error } = await supabase
        .from("user_mountains")
        .delete()
        .eq("user_id", user.id)
        .eq("mountain_id", mountainId)

      if (error) {
        console.error("登頂記録の削除に失敗しました:", error)
        alert("登頂記録の更新に失敗しました")
        return
      }

      setClimbedMountainIds((current) => {
        const next = new Set(current)
        next.delete(mountainId)
        return next
      })
      return
    }

    const { error } = await supabase
      .from("user_mountains")
      .upsert({
        user_id: user.id,
        mountain_id: mountainId,
        climbed: true,
        climbed_at: new Date().toISOString(),
      })

    if (error) {
      console.error("登頂記録の登録に失敗しました:", error)
      alert("登頂記録の更新に失敗しました")
      return
    }

    setClimbedMountainIds((current) => {
      const next = new Set(current)
      next.add(mountainId)
      return next
    })
  }

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
      
      const matchesClimbed =
        climbedFilter === "all" ||
        (climbedFilter === "climbed" &&
          climbedMountainIds.has(mountain.id)) ||
        (climbedFilter === "unclimbed" &&
          !climbedMountainIds.has(mountain.id))

      return matchesQuery && matchesPrefecture && matchesClimbed
    })
  }, [mountains, appliedQuery, selectedPrefecture, climbedFilter, climbedMountainIds])

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

          <select
            value={climbedFilter}
            onChange={(event) => setClimbedFilter(event.target.value)}
            className="!w-auto shrink-0 rounded-lg border px-4 py-2.5 text-sm"
          >
            <option value="all">登頂状態すべて</option>
            <option value="unclimbed">未登頂</option>
            <option value="climbed">登頂済み</option>
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
        <MountainMap
          mountains={filteredMountains}
          climbedMountainIds={climbedMountainIds}
          onToggleClimbed={handleToggleClimbed}
        />
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