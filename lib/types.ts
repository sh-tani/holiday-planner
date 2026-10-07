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
  departureTime: string | null
  returnTime: string | null
  outboundTravelMinutes: number | null
  activityMinutes: number | null
  returnTravelMinutes: number | null
}

export type HourlyWeather = {
  time: string
  weatherCode: number | null
  rain: number | null
  wind: number | null
}