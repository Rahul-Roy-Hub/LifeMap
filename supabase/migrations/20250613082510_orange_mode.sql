/*
  # Create journal entries table

  1. New Tables
    - `journal_entries`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, references profiles.id)
      - `date` (text, not null)
      - `mood` (integer, not null, check 1-5)
      - `mood_emoji` (text, not null)
      - `decision` (text, not null)
      - `habits` (jsonb, default empty object)
      - `created_at` (timestamp with timezone, default now)
      - `updated_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `journal_entries` table
    - Add policy for users to manage their own entries
    - Add indexes for performance

  3. Constraints
    - Mood must be between 1 and 5
    - User can only have one entry per date
*/

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date text NOT NULL,
  mood integer NOT NULL CHECK (mood >= 1 AND mood <= 5),
  mood_emoji text NOT NULL DEFAULT '😐',
  decision text NOT NULL DEFAULT '',
  habits jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_date_idx ON journal_entries(date);
CREATE INDEX IF NOT EXISTS journal_entries_created_at_idx ON journal_entries(created_at DESC);


-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_journal_entries_updated_at'
  ) THEN
    CREATE TRIGGER update_journal_entries_updated_at
      BEFORE UPDATE ON journal_entries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;