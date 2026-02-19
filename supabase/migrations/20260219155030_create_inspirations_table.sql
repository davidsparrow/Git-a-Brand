/*
  # Create inspirations table

  ## Summary
  Creates the core `inspirations` table that stores all visual inspiration items saved by users.
  This replaces the in-memory/localStorage approach with persistent Supabase storage.

  ## New Tables

  ### `inspirations`
  - `id` (text, primary key) — client-generated ID (Date.now().toString() or static seed ID)
  - `title` (text) — human-readable title for the inspiration
  - `source_url` (text) — full URL of the source
  - `source_domain` (text) — extracted domain (e.g. "linear.app")
  - `source_type` (text) — one of: website, dribbble, behance, twitter, pinterest, upload
  - `image_url` (text) — preview image URL
  - `tags` (text[]) — array of tag strings
  - `saved_at` (timestamptz) — when this was saved
  - `notes` (text) — optional user notes
  - `analysis` (jsonb) — AI analysis: dominantColors, mood, visualWeight, typographyStyle, layoutPattern
  - `created_at` (timestamptz) — row creation timestamp

  ## Security
  - RLS enabled
  - Public read/insert/update/delete allowed for anon (demo app — no auth)
    Note: This is intentional for a demo app without authentication. Policies are scoped
    to allow the demo to function without requiring user login.
*/

CREATE TABLE IF NOT EXISTS inspirations (
  id            text PRIMARY KEY,
  title         text NOT NULL DEFAULT '',
  source_url    text NOT NULL DEFAULT '',
  source_domain text NOT NULL DEFAULT '',
  source_type   text NOT NULL DEFAULT 'website',
  image_url     text NOT NULL DEFAULT '',
  tags          text[] NOT NULL DEFAULT '{}',
  saved_at      timestamptz NOT NULL DEFAULT now(),
  notes         text NOT NULL DEFAULT '',
  analysis      jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read inspirations"
  ON inspirations FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert inspirations"
  ON inspirations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update inspirations"
  ON inspirations FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete inspirations"
  ON inspirations FOR DELETE
  TO anon
  USING (true);
