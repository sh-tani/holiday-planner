ALTER TABLE public.schedule
  ADD COLUMN trailhead_id uuid,
  ADD COLUMN course_id uuid;

ALTER TABLE public.schedule
  ADD CONSTRAINT schedule_trailhead_id_fkey
  FOREIGN KEY (trailhead_id)
  REFERENCES public.mountain_trailheads(id)
  ON DELETE SET NULL;

ALTER TABLE public.schedule
  ADD CONSTRAINT schedule_course_id_fkey
  FOREIGN KEY (course_id)
  REFERENCES public.mountain_courses(id)
  ON DELETE SET NULL;