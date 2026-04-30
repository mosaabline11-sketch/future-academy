-- ══════════════════════════════════════════════════
--  SUPABASE SQL SCHEMA — Future Academy v3
--  Run this in your Supabase SQL Editor
-- ══════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PLAYERS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  position    TEXT NOT NULL DEFAULT 'مهاجم',
  age         INT  DEFAULT 14,
  rating      INT  DEFAULT 3 CHECK (rating BETWEEN 1 AND 5),
  number      INT  DEFAULT 0,
  image       TEXT DEFAULT '',
  notes       TEXT DEFAULT '',
  -- Stats (0-99)
  stamina     INT  DEFAULT 75 CHECK (stamina  BETWEEN 0 AND 99),
  shot        INT  DEFAULT 70 CHECK (shot     BETWEEN 0 AND 99),
  pass        INT  DEFAULT 72 CHECK (pass     BETWEEN 0 AND 99),
  speed       INT  DEFAULT 74 CHECK (speed    BETWEEN 0 AND 99),
  skills      INT  DEFAULT 70 CHECK (skills   BETWEEN 0 AND 99),
  chemistry   INT  DEFAULT 75 CHECK (chemistry BETWEEN 0 AND 99),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NEWS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  text       TEXT DEFAULT '',
  icon       TEXT DEFAULT '🔔',
  date       DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TRAINING ────────────────────────────────────
CREATE TABLE IF NOT EXISTS training (
  id         SERIAL PRIMARY KEY,
  day        TEXT NOT NULL,
  focus      TEXT DEFAULT '',
  time       TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WEEKLY TOP ──────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_top (
  id         SERIAL PRIMARY KEY,
  rank       INT  NOT NULL UNIQUE CHECK (rank BETWEEN 1 AND 3),
  player_id  INT  REFERENCES players(id) ON DELETE SET NULL
);

-- Seed ranks 1-3
INSERT INTO weekly_top (rank) VALUES (1),(2),(3)
ON CONFLICT (rank) DO NOTHING;

-- ─── FORMATION ───────────────────────────────────
CREATE TABLE IF NOT EXISTS formation_config (
  id           INT  PRIMARY KEY DEFAULT 1, -- single row
  name         TEXT DEFAULT '4-3-3',
  animated     BOOL DEFAULT FALSE,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO formation_config (id, name, animated)
VALUES (1, '4-3-3', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ─── FORMATION SLOTS ─────────────────────────────
-- Represents the tactical board layout
-- line_index: row from top (0=GK row), slot_index: position within row
CREATE TABLE IF NOT EXISTS formation_slots (
  id          SERIAL PRIMARY KEY,
  line_index  INT  NOT NULL,
  slot_index  INT  NOT NULL,
  pos         TEXT NOT NULL DEFAULT 'CM',   -- position code e.g. GK, ST, CM
  player_id   INT  REFERENCES players(id) ON DELETE SET NULL,
  UNIQUE (line_index, slot_index)
);

-- ─── VIEWS ───────────────────────────────────────

-- Player OVR score view
CREATE OR REPLACE VIEW player_ovr AS
SELECT
  id,
  name,
  position,
  rating,
  LEAST(99, GREATEST(40, ROUND(
    (stamina + shot + pass + speed + skills + chemistry)::NUMERIC / 6
  )))::INT AS ovr
FROM players;

-- Weekly top with player info
CREATE OR REPLACE VIEW weekly_top_players AS
SELECT
  wt.rank,
  p.id,
  p.name,
  p.position,
  p.rating,
  p.number,
  p.image,
  LEAST(99, GREATEST(40, ROUND(
    (p.stamina + p.shot + p.pass + p.speed + p.skills + p.chemistry)::NUMERIC / 6
  )))::INT AS ovr
FROM weekly_top wt
LEFT JOIN players p ON wt.player_id = p.id
ORDER BY wt.rank;

-- Formation with assigned player names
CREATE OR REPLACE VIEW formation_board AS
SELECT
  fs.line_index,
  fs.slot_index,
  fs.pos,
  p.id   AS player_id,
  p.name AS player_name,
  p.image AS player_image
FROM formation_slots fs
LEFT JOIN players p ON fs.player_id = p.id
ORDER BY fs.line_index, fs.slot_index;

-- ─── ROW LEVEL SECURITY (Optional) ──────────────
-- Uncomment and configure after setting up Supabase Auth:

-- ALTER TABLE players       ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE news          ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE training      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE weekly_top    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE formation_config ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE formation_slots  ENABLE ROW LEVEL SECURITY;

-- Public read policy (everyone can read):
-- CREATE POLICY "Public read players"  ON players       FOR SELECT USING (true);
-- CREATE POLICY "Public read news"     ON news          FOR SELECT USING (true);
-- CREATE POLICY "Public read training" ON training      FOR SELECT USING (true);
-- CREATE POLICY "Public read weekly"   ON weekly_top    FOR SELECT USING (true);
-- CREATE POLICY "Public read formation" ON formation_config FOR SELECT USING (true);
-- CREATE POLICY "Public read slots"    ON formation_slots   FOR SELECT USING (true);

-- Admin write policy (only authenticated users):
-- CREATE POLICY "Auth write players"  ON players    FOR ALL  USING (auth.role() = 'authenticated');
-- CREATE POLICY "Auth write news"     ON news       FOR ALL  USING (auth.role() = 'authenticated');
-- CREATE POLICY "Auth write training" ON training   FOR ALL  USING (auth.role() = 'authenticated');

-- ─── TRIGGERS: auto-update updated_at ─────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_players_updated
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_formation_updated
  BEFORE UPDATE ON formation_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── SEED DATA (Optional) ────────────────────────
-- Uncomment to insert sample players:

/*
INSERT INTO players (name, position, age, rating, number, image, notes, stamina, shot, pass, speed, skills, chemistry)
VALUES
  ('عمر أحمد',  'حارس مرمى', 14, 4, 1,
   'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=500&q=80',
   'رد فعل ممتاز', 82, 45, 60, 70, 65, 80),
  ('يوسف خالد', 'مهاجم', 13, 5, 9,
   'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=500&q=80',
   'إنهاء قوي للهجمات', 88, 90, 72, 86, 84, 88),
  ('آدم محمود',  'وسط ملعب', 14, 4, 8,
   'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=500&q=80',
   'رؤية لعب ممتازة', 91, 68, 88, 78, 80, 85),
  ('مالك سامي',  'مدافع', 13, 3, 5,
   'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=500&q=80',
   'قوي في الالتحامات', 79, 50, 65, 72, 62, 74);

INSERT INTO news (title, text, icon) VALUES
  ('التمرين القادم', 'الأحد 6:30 مساءً - ملعب الأكاديمية', '📅'),
  ('مباراة ودية', 'Future Academy ضد فريق الضيوف يوم الجمعة', '🏆');

INSERT INTO training (day, focus, time) VALUES
  ('الأحد', 'لياقة + تحكم بالكرة', '6:30 PM'),
  ('الثلاثاء', 'تكتيك 4-3-3 + ضغط عالي', '6:00 PM'),
  ('الخميس', 'مباريات مصغرة + حراس', '7:00 PM');
*/

-- ══════════════════════════════════════════════════
--  HOW TO CONNECT TO THE APP (JavaScript / Supabase SDK)
--
--  1. npm install @supabase/supabase-js
--
--  2. In data.js, replace localStorage with Supabase calls:
--
--  import { createClient } from '@supabase/supabase-js'
--  const supabase = createClient('YOUR_PROJECT_URL', 'YOUR_ANON_KEY')
--
--  // Example: Load players
--  const { data, error } = await supabase.from('players').select('*')
--
--  // Example: Add player
--  const { data, error } = await supabase.from('players').insert({ name, position, ... })
--
--  // Example: Update formation slot
--  const { error } = await supabase.from('formation_slots')
--    .upsert({ line_index: li, slot_index: si, pos, player_id: pid })
--
-- ══════════════════════════════════════════════════
