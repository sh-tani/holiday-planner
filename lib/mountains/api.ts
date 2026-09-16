export type Mountain = {
  id: string
  name: string
  area: string
  latitude: number
  longitude: number
  elevation: number | null
}

export async function searchMountains(
  query: string
): Promise<Mountain[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const response = await fetch(
    `/api/mountains?query=${encodeURIComponent(trimmedQuery)}`
  )

  if (!response.ok) {
    throw new Error('山情報の取得に失敗しました')
  }

  const data = await response.json()

  return data ?? []
}

export async function getMountain(
  id: string
): Promise<Mountain | null> {
  if (!id) {
    return null
  }

  const response = await fetch(
    `/api/mountains?id=${encodeURIComponent(id)}`
  )

  if (!response.ok) {
    return null
  }

  return (await response.json()) as Mountain
}

export async function getMountainsByIds(
  ids: string[]
): Promise<Record<string, Mountain>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))]

  const results = await Promise.all(
    uniqueIds.map((id) => getMountain(id))
  )

  const mountainMap: Record<string, Mountain> = {}

  results.forEach((mountain) => {
    if (mountain) {
      mountainMap[mountain.id] = mountain
    }
  })

  return mountainMap
}