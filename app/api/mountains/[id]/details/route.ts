import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  const { id } = await params

  const supabase = await createClient()

  const [
    { data: trailheads, error: trailheadsError },
    { data: courses, error: coursesError },
  ] = await Promise.all([
    supabase
      .from("mountain_trailheads")
      .select(`
        id,
        mountain_id,
        name,
        latitude,
        longitude,
        description,
        created_at,
        mountain_parking_lots (
          id,
          trailhead_id,
          name,
          latitude,
          longitude,
          description,
          created_at
        ),
        mountain_stations (
          id,
          trailhead_id,
          name,
          description,
          created_at
        )
      `)
      .eq("mountain_id", id)
      .order("name"),

    supabase
      .from("mountain_courses")
      .select(`
        id,
        mountain_id,
        name,
        start_trailhead_id,
        duration_minutes,
        description,
        created_at
      `)
      .eq("mountain_id", id)
      .order("name"),
  ])

  if (trailheadsError || coursesError) {
    console.error("Failed to fetch mountain details", {
      trailheadsError,
      coursesError,
    })

    return NextResponse.json(
      { error: "登山情報の取得に失敗しました" },
      { status: 500 },
    )
  }

  return NextResponse.json({
    trailheads: trailheads ?? [],
    courses: courses ?? [],
  })
}