/*
  # Create winners table for GABI V2 Scavenger Hunt

  1. New Tables
    - `winners`
      - `id` (uuid, primary key)
      - `name` (text, winner's name)
      - `supervisor` (text, supervisor's name)
      - `department` (text, department name)
      - `prize_amount` (integer, prize amount in rupees)
      - `created_at` (timestamp, when winner was selected)

  2. Security
    - Enable RLS on `winners` table
    - Add policy for public read access (no authentication required for this contest)
    - Add policy for public insert access
    - Add policy for public delete access
*/

CREATE TABLE IF NOT EXISTS winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  supervisor text NOT NULL,
  department text NOT NULL,
  prize_amount integer DEFAULT 5000,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read winners"
  ON winners
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access
CREATE POLICY "Anyone can insert winners"
  ON winners
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public delete access
CREATE POLICY "Anyone can delete winners"
  ON winners
  FOR DELETE
  TO public
  USING (true);