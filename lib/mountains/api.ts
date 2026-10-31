export type Mountain = {
  id: string
  name: string
  area: string
  prefecture: string | null
  municipality: string | null
  latitude: number
  longitude: number
  elevation: number | null
}

export type MountainParkingLot = {
  id: string
  trailhead_id: string
  name: string
  latitude: number | null
  longitude: number | null
  description: string | null
  created_at: string
}

export type MountainStation = {
  id: string
  trailhead_id: string
  name: string
  description: string | null
  created_at: string
}

export type MountainTrailhead = {
  id: string
  mountain_id: string
  name: string
  latitude: number | null
  longitude: number | null
  description: string | null
  created_at: string
  mountain_parking_lots: MountainParkingLot[]
  mountain_stations: MountainStation[]
}

export type MountainCourse = {
  id: string
  mountain_id: string
  name: string
  start_trailhead_id: string | null
  duration_minutes: number | null
  description: string | null
  created_at: string
}

export type MountainDetails = {
  trailheads: MountainTrailhead[]
  courses: MountainCourse[]
}

export async function searchMountains(
  query: string,
  list?: string
): Promise<Mountain[]> {
  const params = new URLSearchParams()

  if (query.trim()) {
    params.set('query', query.trim())
  }

  if (list?.trim()) {
    params.set('list', list.trim())
  }

  const response = await fetch(
    `/api/mountains?${params.toString()}`
  )

  if (!response.ok) {
    throw new Error('山の検索に失敗しました')
  }

  return response.json()
}

export type MountainList = {
  id: string
  name: string
}

export async function getMountainLists(): Promise<MountainList[]> {
  const response = await fetch('/api/mountain-lists')

  if (!response.ok) {
    throw new Error('山リストの取得に失敗しました')
  }

  return response.json()
}

export async function getMountainsByIds(
  ids: string[]
): Promise<Record<string, Mountain>> {
  if (ids.length === 0) {
    return {}
  }

  const results = await Promise.all(
    ids.map(async (id) => {
      const response = await fetch(
        `/api/mountains?id=${encodeURIComponent(id)}`
      )

      if (!response.ok) {
        return null
      }

      const mountain = await response.json()

      return [id, mountain] as const
    })
  )

  return Object.fromEntries(
    results.filter(
      (result): result is readonly [string, Mountain] =>
        result !== null
    )
  )
}

export async function getMountainDetails(
  mountainId: string
): Promise<MountainDetails> {
  const response = await fetch(
    `/api/mountains/${encodeURIComponent(mountainId)}/details`
  )

  if (!response.ok) {
    throw new Error('登山情報の取得に失敗しました')
  }

  return response.json()
}