-- Blood Bank Management System — database schema (SQLite)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS donors (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT NOT NULL,
  blood_group        TEXT NOT NULL,      -- A+ A- B+ B- AB+ AB- O+ O-
  age                INTEGER NOT NULL,
  gender             TEXT NOT NULL,      -- Male | Female | Other
  phone              TEXT NOT NULL,
  address            TEXT DEFAULT '',
  last_donation_date TEXT,               -- YYYY-MM-DD
  created_at         TEXT DEFAULT (datetime('now'))
);

-- One row per donation. "units" = units still in stock.
CREATE TABLE IF NOT EXISTS blood_units (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  donor_id        INTEGER REFERENCES donors(id) ON DELETE SET NULL,
  blood_group     TEXT NOT NULL,
  units_collected INTEGER NOT NULL,
  units           INTEGER NOT NULL,
  collected_on    TEXT NOT NULL,
  expires_on      TEXT NOT NULL          -- collected_on + 35 days
);

CREATE TABLE IF NOT EXISTS requests (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_name TEXT NOT NULL,
  hospital     TEXT NOT NULL,
  blood_group  TEXT NOT NULL,
  units        INTEGER NOT NULL,
  contact      TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
  created_at   TEXT DEFAULT (datetime('now')),
  resolved_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_units_group   ON blood_units(blood_group, expires_on);
CREATE INDEX IF NOT EXISTS idx_requests_stat ON requests(status);
