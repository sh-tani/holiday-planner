ALTER TABLE public.schedule
  ADD COLUMN departure_time time,
  ADD COLUMN outbound_travel_minutes integer,
  ADD COLUMN activity_minutes integer,
  ADD COLUMN return_travel_minutes integer;

ALTER TABLE public.schedule
  ADD CONSTRAINT schedule_outbound_travel_minutes_check
    CHECK (
      outbound_travel_minutes IS NULL
      OR outbound_travel_minutes >= 0
    ),
  ADD CONSTRAINT schedule_activity_minutes_check
    CHECK (
      activity_minutes IS NULL
      OR activity_minutes > 0
    ),
  ADD CONSTRAINT schedule_return_travel_minutes_check
    CHECK (
      return_travel_minutes IS NULL
      OR return_travel_minutes >= 0
    );
