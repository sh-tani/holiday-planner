export type Plan = {
  id: string
  title: string
  mountainId: string
  date: string | null
  weather: string
  weatherCode: number | null
  rain: number
  wind: number
  fixed: boolean
}