-- 登山口
CREATE TABLE public.mountain_trailheads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mountain_id uuid NOT NULL,
  name text NOT NULL,
  latitude double precision,
  longitude double precision,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT mountain_trailheads_pkey
    PRIMARY KEY (id),

  CONSTRAINT mountain_trailheads_mountain_id_fkey
    FOREIGN KEY (mountain_id)
    REFERENCES public.mountains(id)
    ON DELETE CASCADE
);

-- 駐車場
CREATE TABLE public.mountain_parking_lots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trailhead_id uuid NOT NULL,
  name text NOT NULL,
  latitude double precision,
  longitude double precision,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT mountain_parking_lots_pkey
    PRIMARY KEY (id),

  CONSTRAINT mountain_parking_lots_trailhead_id_fkey
    FOREIGN KEY (trailhead_id)
    REFERENCES public.mountain_trailheads(id)
    ON DELETE CASCADE
);

-- 最寄り駅
CREATE TABLE public.mountain_stations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trailhead_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT mountain_stations_pkey
    PRIMARY KEY (id),

  CONSTRAINT mountain_stations_trailhead_id_fkey
    FOREIGN KEY (trailhead_id)
    REFERENCES public.mountain_trailheads(id)
    ON DELETE CASCADE
);

-- 登山コース
CREATE TABLE public.mountain_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mountain_id uuid NOT NULL,
  name text NOT NULL,
  start_trailhead_id uuid,
  duration_minutes integer,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),

  CONSTRAINT mountain_courses_pkey
    PRIMARY KEY (id),

  CONSTRAINT mountain_courses_mountain_id_fkey
    FOREIGN KEY (mountain_id)
    REFERENCES public.mountains(id)
    ON DELETE CASCADE,

  CONSTRAINT mountain_courses_start_trailhead_id_fkey
    FOREIGN KEY (start_trailhead_id)
    REFERENCES public.mountain_trailheads(id)
    ON DELETE SET NULL,

  CONSTRAINT mountain_courses_duration_minutes_check
    CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- RLS
ALTER TABLE public.mountain_trailheads
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mountain_parking_lots
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mountain_stations
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mountain_courses
  ENABLE ROW LEVEL SECURITY;

-- 公開情報なので、ログイン状態に関係なく参照可能
CREATE POLICY "Anyone can view mountain trailheads"
  ON public.mountain_trailheads
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view mountain parking lots"
  ON public.mountain_parking_lots
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view mountain stations"
  ON public.mountain_stations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view mountain courses"
  ON public.mountain_courses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- SELECT grant
GRANT SELECT ON TABLE public.mountain_trailheads
  TO anon, authenticated;

GRANT SELECT ON TABLE public.mountain_parking_lots
  TO anon, authenticated;

GRANT SELECT ON TABLE public.mountain_stations
  TO anon, authenticated;

GRANT SELECT ON TABLE public.mountain_courses
  TO anon, authenticated;