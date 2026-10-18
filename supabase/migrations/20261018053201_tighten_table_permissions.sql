
-- 個人データ：未ログイン利用者の権限を取り消す
REVOKE ALL PRIVILEGES ON TABLE
  public.profiles,
  public.schedule,
  public.user_mountains
FROM anon;

-- 個人データ：ログイン利用者には必要な操作だけを許可する
REVOKE ALL PRIVILEGES ON TABLE
  public.profiles,
  public.schedule,
  public.user_mountains
FROM authenticated;

GRANT SELECT, UPDATE
ON TABLE public.profiles
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.schedule, public.user_mountains
TO authenticated;


-- 公開用の山データ：一般利用者は読み取りのみ
REVOKE ALL PRIVILEGES ON TABLE
  public.mountains,
  public.mountain_lists,
  public.mountain_list_members,
  public.mountain_trailheads,
  public.mountain_parking_lots,
  public.mountain_stations,
  public.mountain_courses
FROM anon, authenticated;

GRANT SELECT ON TABLE
  public.mountains,
  public.mountain_lists,
  public.mountain_list_members,
  public.mountain_trailheads,
  public.mountain_parking_lots,
  public.mountain_stations,
  public.mountain_courses
TO anon, authenticated;


-- 山リストと所属関係も、明示的に公開読み取り専用にする
ALTER TABLE public.mountain_lists
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mountain_list_members
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mountain lists"
ON public.mountain_lists
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can view mountain list members"
ON public.mountain_list_members
FOR SELECT
TO anon, authenticated
USING (true);
