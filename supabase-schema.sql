-- Daily Dose — Supabase Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL UNIQUE,
  content JSONB NOT NULL,
  html_content TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debriefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL UNIQUE,
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  energy INTEGER CHECK (energy BETWEEN 1 AND 10),
  stress INTEGER CHECK (stress BETWEEN 1 AND 10),
  gassiness INTEGER CHECK (gassiness BETWEEN 1 AND 10),
  bristol_stool INTEGER CHECK (bristol_stool BETWEEN 1 AND 7),
  exercise_type TEXT,
  exercise_duration INTEGER,
  water_glasses INTEGER DEFAULT 0,
  medications JSONB DEFAULT '[]',
  supplements JSONB DEFAULT '[]',
  gratitude TEXT,
  tomorrow_intentions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reach_out_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  person TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE debriefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reach_out_log ENABLE ROW LEVEL SECURITY;

-- Briefings: authenticated user can read/write their own rows
-- (For single-user app, service role handles inserts from cron)
CREATE POLICY "Users can read own briefings"
  ON briefings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own briefings"
  ON briefings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own briefings"
  ON briefings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Debriefs
CREATE POLICY "Users can read own debriefs"
  ON debriefs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own debriefs"
  ON debriefs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own debriefs"
  ON debriefs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Reach out log (service role only for inserts, users can read)
CREATE POLICY "Users can read reach out log"
  ON reach_out_log FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert reach out log"
  ON reach_out_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS briefings_date_idx ON briefings(date DESC);
CREATE INDEX IF NOT EXISTS debriefs_date_idx ON debriefs(date DESC);
CREATE INDEX IF NOT EXISTS reach_out_log_date_idx ON reach_out_log(created_at DESC);

-- ============================================
-- UPDATED_AT TRIGGER FOR DEBRIEFS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER debriefs_updated_at
  BEFORE UPDATE ON debriefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
