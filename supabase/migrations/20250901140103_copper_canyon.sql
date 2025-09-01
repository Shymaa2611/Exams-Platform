/*
  # Create Quiz System Tables

  1. New Tables
    - `quizzes`
      - `id` (text, primary key)
      - `title` (text)
      - `subject` (text) - 'pure_math' or 'statistics'
      - `grade` (text) - 'first_secondary' or 'second_secondary'
      - `questions` (jsonb) - array of question objects
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `quiz_attempts`
      - `id` (text, primary key)
      - `student_name` (text)
      - `quiz_id` (text, foreign key)
      - `answers` (jsonb) - array of selected answer indices
      - `score` (integer) - percentage score
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read/write access (since we're handling auth in the app)

  3. Storage
    - Create bucket for quiz images
*/

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id text PRIMARY KEY,
  title text NOT NULL,
  subject text NOT NULL CHECK (subject IN ('pure_math', 'statistics')),
  grade text NOT NULL CHECK (grade IN ('first_secondary', 'second_secondary')),
  questions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id text PRIMARY KEY,
  student_name text NOT NULL,
  quiz_id text REFERENCES quizzes(id) ON DELETE CASCADE,
  answers jsonb DEFAULT '[]',
  score integer DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (we handle auth in the app)
CREATE POLICY "Enable all operations for quizzes"
  ON quizzes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for quiz_attempts"
  ON quiz_attempts
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for quiz images
INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-images', 'quiz-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the storage bucket
CREATE POLICY "Public access to quiz images"
  ON storage.objects
  FOR ALL
  TO public
  USING (bucket_id = 'quiz-images')
  WITH CHECK (bucket_id = 'quiz-images');