ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS playlist_name character varying,
  ADD COLUMN IF NOT EXISTS playlist_type character varying,
  ADD COLUMN IF NOT EXISTS m3u_url text,
  ADD COLUMN IF NOT EXISTS epg_url text,
  ADD COLUMN IF NOT EXISTS protect_pin character varying;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'app_users_playlist_type_check'
      AND conrelid = 'public.app_users'::regclass
  ) THEN
    ALTER TABLE public.app_users
      ADD CONSTRAINT app_users_playlist_type_check
      CHECK (playlist_type IS NULL OR playlist_type IN ('url', 'xtream', 'file', 'code'));
  END IF;
END $$;
