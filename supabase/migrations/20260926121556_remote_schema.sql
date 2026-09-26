CREATE TABLE "public"."mountain_list_members" (
  "mountain_id" uuid                     NOT NULL,
  "list_id"     uuid                     NOT NULL,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "mountain_list_members_pkey" PRIMARY KEY (mountain_id, list_id)
);

CREATE TABLE "public"."mountain_lists" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "mountain_lists_name_key" UNIQUE (name),
  CONSTRAINT "mountain_lists_pkey" PRIMARY KEY (id)
);

CREATE TABLE "public"."mountains" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"         text                     NOT NULL,
  "area"         text                     NOT NULL,
  "latitude"     double precision,
  "longitude"    double precision,
  "elevation"    integer,
  "created_at"   timestamp with time zone DEFAULT now(),
  "prefecture"   text,
  "municipality" text,
  CONSTRAINT "mountains_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."mountains"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"    uuid NOT NULL DEFAULT gen_random_uuid(),
  "email" text NOT NULL,
  "name"  text NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."schedule" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "mountain"     text,
  "date"         date,
  "area"         text,
  "weather"      text,
  "wind"         double precision,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "rain"         double precision,
  "fixed"        boolean,
  "user_id"      uuid,
  "day"          text,
  "title"        text,
  "mountain_id"  uuid,
  "weather_code" integer,
  CONSTRAINT "schedule_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."schedule"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."user_mountains" (
  "user_id"     uuid                     NOT NULL,
  "mountain_id" uuid                     NOT NULL,
  "climbed"     boolean                  NOT NULL DEFAULT false,
  "climbed_at"  timestamp with time zone,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "user_mountains_pkey" PRIMARY KEY (user_id, mountain_id)
);

ALTER TABLE "public"."user_mountains"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mountain_list_members"
  ADD CONSTRAINT "mountain_list_members_list_id_fkey" FOREIGN KEY (list_id) REFERENCES public.mountain_lists(id) ON DELETE RESTRICT;

ALTER TABLE "public"."mountain_list_members"
  ADD CONSTRAINT "mountain_list_members_mountain_id_fkey" FOREIGN KEY (mountain_id) REFERENCES public.mountains(id) ON DELETE RESTRICT;

ALTER TABLE "public"."schedule"
  ADD CONSTRAINT "schedule_mountain_id_fkey" FOREIGN KEY (mountain_id) REFERENCES public.mountains(id);

ALTER TABLE "public"."schedule"
  ADD CONSTRAINT "schedule_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE "public"."user_mountains"
  ADD CONSTRAINT "user_mountains_mountain_id_fkey" FOREIGN KEY (mountain_id) REFERENCES public.mountains(id) ON DELETE CASCADE;

ALTER TABLE "public"."user_mountains"
  ADD CONSTRAINT "user_mountains_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX idx_mountain_list_members_list_id ON public.mountain_list_members USING btree (list_id);

CREATE INDEX idx_mountain_list_members_mountain_id ON public.mountain_list_members USING btree (mountain_id);

CREATE POLICY "Anyone can view mountains" ON "public"."mountains"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

CREATE POLICY "Users can update their own profile" ON "public"."profiles"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = id))
  WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can view their own profile" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = id));

CREATE POLICY "Users can delete their own schedules" ON "public"."schedule"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own schedules" ON "public"."schedule"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own schedules" ON "public"."schedule"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view their own schedules" ON "public"."schedule"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can delete their own mountain records" ON "public"."user_mountains"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own mountain records" ON "public"."user_mountains"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update their own mountain records" ON "public"."user_mountains"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view their own mountain records" ON "public"."user_mountains"
  FOR SELECT
  TO "authenticated"
  USING ((auth.uid() = user_id));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."mountain_list_members" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."mountain_lists" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."mountains" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."schedule" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."user_mountains" TO "anon", "authenticated", "postgres", "service_role";

