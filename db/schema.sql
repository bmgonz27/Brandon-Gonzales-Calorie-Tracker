-- schema.sql — creates every table the app needs.
-- Run it with:  psql -U postgres -d calorie_tracker -f db/schema.sql
-- Safe to re-run: "IF NOT EXISTS" skips tables that already exist.

-- ─────────────────────────────────────────────────────────────
-- USERS: one row per account.
-- We NEVER store the real password, only a bcrypt "hash" of it (Phase 2).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,           -- auto-incrementing 1, 2, 3...
  email         TEXT NOT NULL UNIQUE,         -- UNIQUE: no two accounts share an email
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- USER_GOALS: each user's daily targets. One row per user.
-- user_id is both the primary key AND a foreign key, which enforces "one-to-one".
-- ON DELETE CASCADE: if the user is deleted, their goals go too.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_goals (
  user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  calories   INTEGER NOT NULL DEFAULT 2000,
  protein_g  INTEGER,
  carbs_g    INTEGER,
  fat_g      INTEGER
);

-- ─────────────────────────────────────────────────────────────
-- FOODS: our local copy ("cache") of food data.
-- When a user logs a food from the USDA API, we save it here so:
--   1) we don't call the API again for the same food, and
--   2) old logs stay accurate even if the API data changes later.
-- Nutrition values are PER ONE SERVING.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS foods (
  id             SERIAL PRIMARY KEY,
  source         TEXT NOT NULL CHECK (source IN ('usda', 'custom')),
  external_id    TEXT,                         -- the USDA "fdcId"; NULL for custom foods
  name           TEXT NOT NULL,
  brand          TEXT,
  serving_size   NUMERIC(8,2),
  serving_unit   TEXT,                         -- e.g. 'g', 'ml', 'cup'
  calories       NUMERIC(8,2) NOT NULL,
  protein_g      NUMERIC(8,2) NOT NULL DEFAULT 0,
  carbs_g        NUMERIC(8,2) NOT NULL DEFAULT 0,
  fat_g          NUMERIC(8,2) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, external_id)                 -- don't cache the same USDA food twice
);

-- ─────────────────────────────────────────────────────────────
-- FOOD_LOGS: "User X ate N servings of food Y at meal Z on date D."
-- This is the heart of the app. It connects users and foods.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id     INTEGER NOT NULL REFERENCES foods(id),
  log_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type   TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings    NUMERIC(6,2) NOT NULL DEFAULT 1 CHECK (servings > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- An INDEX makes lookups fast, like a book's index.
-- Our most common query will be "this user's logs for this date".
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs (user_id, log_date);
