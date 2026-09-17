"use client"

import { useEffect, useState } from "react"
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
  latitude: number
  longitude: number
  elevation: number | null
}

export default function MountainsPage() {
  const [mountains, setMountains] = useState<Mountain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        <p className="mt-4 text-sm text-red-600">{error}</p>
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

      <div className="overflow-hidden rounded-xl border">
        <MountainMap mountains={mountains} />
      </div>
    </main>
  )
}