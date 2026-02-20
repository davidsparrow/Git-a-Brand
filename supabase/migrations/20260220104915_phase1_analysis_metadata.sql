/*
  # Phase 1: Add analysis metadata columns to inspirations

  ## Changes
  - Add `analysis_metadata` (JSONB) — stores raw Gemini response and extra metadata
  - Add `gemini_model_version` (TEXT) — records which Gemini model performed the analysis
  - Add `source_type` columns for Phase 2 prep: `source_url_full`, `extraction_method`

  ## Notes
  - All columns are nullable/have defaults so existing rows are unaffected
  - No destructive operations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspirations' AND column_name = 'analysis_metadata'
  ) THEN
    ALTER TABLE inspirations ADD COLUMN analysis_metadata JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspirations' AND column_name = 'gemini_model_version'
  ) THEN
    ALTER TABLE inspirations ADD COLUMN gemini_model_version TEXT DEFAULT 'gemini-2.0-flash';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspirations' AND column_name = 'extraction_method'
  ) THEN
    ALTER TABLE inspirations ADD COLUMN extraction_method TEXT DEFAULT 'manual';
  END IF;
END $$;
