import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Quiz = {
  id: string
  title: string
  subject: 'pure_math' | 'statistics'
  grade: 'first_secondary' | 'second_secondary'
  questions: Question[]
  created_at: string
  updated_at: string
}

export type Question = {
  id: string
  question_text: string
  question_image?: string
  options: string[]
  correct_answer: number
  quiz_id: string
}

export type QuizAttempt = {
  id: string
  student_name: string
  quiz_id: string
  answers: number[]
  score: number
  completed_at: string
}