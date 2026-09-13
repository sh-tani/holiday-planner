export type Plan = {
  id: string
  mountain: string
  area: string
  date: string | null
  day: string | null
  weather: string
  rain: number
  wind: number
  fixed: boolean
}