/*
  # Phase 5: Brand DNA Snapshots table

  ## New Tables
  - `brand_dna_snapshots`
    - `id` (uuid, primary key)
    - `inspiration_count` (int) — how many inspirations were analyzed
    - `aggregated_data` (jsonb) — full Gemini-aggregated DNA result
    - `generated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public read access (anonymous users can read their own snapshots via anon key)
  - Insert/update allowed from service role (edge functions)

  ## Notes
  - No user_id column for now since the app doesn't have auth yet
  - Single shared snapshot per project (latest snapshot is the active one)
*/

CREATE TABLE IF NOT EXISTS brand_dna_snapshots (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inspiration_count INT NOT NULL DEFAULT 0,
  aggregated_data  JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE brand_dna_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of brand dna snapshots"
  ON brand_dna_snapshots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow service role to insert brand dna snapshots"
  ON brand_dna_snapshots FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to update brand dna snapshots"
  ON brand_dna_snapshots FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
