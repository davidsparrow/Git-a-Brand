/*
  # Add target_areas to inspirations table

  ## Summary
  Adds a `target_areas` column to the existing `inspirations` table so each
  saved item can carry metadata about which parts of the brand system it should
  inform (Brand DNA, per-platform Content Voice, or Swipe File Only reference).

  ## Changes

  ### Modified Tables

  #### `inspirations`
  - `target_areas` (text[], NOT NULL, DEFAULT '{brand_dna}') — array of target
    identifiers chosen by the user when saving.

  ### Possible values
  - 'brand_dna'
  - 'content_voice_blog'
  - 'content_voice_linkedin'
  - 'content_voice_twitter'
  - 'content_voice_instagram'
  - 'content_voice_tiktok'
  - 'content_voice_youtube'
  - 'content_voice_email_newsletter'
  - 'content_voice_email_promotional'
  - 'content_voice_facebook_ads'
  - 'content_voice_google_ads'
  - 'swipe_file_only'

  ## Important Notes
  1. All existing rows default to '{brand_dna}' so nothing breaks.
  2. A GIN index is added for efficient querying by target area.
  3. No RLS changes needed — existing policies already cover the new column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inspirations' AND column_name = 'target_areas'
  ) THEN
    ALTER TABLE inspirations
      ADD COLUMN target_areas text[] NOT NULL DEFAULT '{brand_dna}';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_inspirations_target_areas
  ON inspirations USING GIN (target_areas);
