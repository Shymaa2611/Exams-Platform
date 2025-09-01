import React, { useState, useEffect } from 'react'
import { supabase, Quiz, QuizAttempt } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Calculator, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { QuizTaking } from './QuizTaking'

export const StudentDashboard: React.FC = () => {
  const { studentName } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [selectedSubject, setSelectedSubject] = useState<'pure_math' | 'statistics' | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<'first_secondary' | 'second_secondary'>('first_secondary')
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)

  useEffect(() => {
    loadQuizzes()
    loadAttempts()
  }, [])

  const loadQuizzes = async () => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setQuizzes(data)
  }

  const loadAttempts = async () => {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('student_name', studentName)
    
    if (data) setAttempts(data)
  }

  const getSubjectName = (subject: string) => {
    return subject === 'pure_math' ? 'رياضيات بحتة' : 'استاتيكا'
  }

  const getGradeName = (grade: string) => {
    return grade === 'first_secondary' ? 'أولى ثانوي' : 'تانية ثانوي'
  }

  const hasAttempted = (quizId: string) => {
    return attempts.some(attempt => attempt.quiz_id === quizId)
  }

  const startQuiz = (quiz: Quiz) => {
    if (hasAttempted(quiz.id)) {
      alert('لقد أجريت هذا الامتحان من قبل!')
      return
    }
    setActiveQuiz(quiz)
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    if (!selectedSubject) return false
    return quiz.subject === selectedSubject && quiz.grade === selectedGrade
  })

  // Filter out statistics for first secondary
  const availableSubjects = selectedGrade === 'first_secondary' 
    ? [{ value: 'pure_math', label: 'رياضيات بحتة' }]
    : [
        { value: 'pure_math', label: 'رياضيات بحتة' },
        { value: 'statistics', label: 'استاتيكا' }
      ]

  if (activeQuiz) {
    return (
      <QuizTaking
        quiz={activeQuiz}
        onComplete={() => {
          setActiveQuiz(null)
          loadAttempts()
        }}
        onCancel={() => setActiveQuiz(null)}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-8 rounded-2xl mb-8">
        <h2 className="text-3xl font-bold mb-2">أهلاً بك {studentName}</h2>
        <p className="text-blue-100">اختر الصف ونوع المادة للبدء في الامتحان</p>
      </div>

      {/* Grade Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">اختر صفك الدراسي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              setSelectedGrade('first_secondary')
              setSelectedSubject(null)
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedGrade === 'first_secondary'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <h4 className="font-bold text-lg">أولى ثانوي</h4>
          </button>
          <button
            onClick={() => {
              setSelectedGrade('second_secondary')
              setSelectedSubject(null)
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              selectedGrade === 'second_secondary'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <BookOpen className="w-8 h-8 mx-auto mb-2" />
            <h4 className="font-bold text-lg">تانية ثانوي</h4>
          </button>
        </div>
      </div>

      {/* Subject Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">اختر نوع الامتحان</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableSubjects.map((subject) => (
            <button
              key={subject.value}
              onClick={() => setSelectedSubject(subject.value as 'pure_math' | 'statistics')}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedSubject === subject.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Calculator className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-bold text-lg">{subject.label}</h4>
            </button>
          ))}
        </div>
      </div>

      {/* Available Quizzes */}
      {selectedSubject && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              امتحانات {getSubjectName(selectedSubject)} - {getGradeName(selectedGrade)}
            </h3>
          </div>

          {filteredQuizzes.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد امتحانات متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => {
                const attempted = hasAttempted(quiz.id)
                return (
                  <div key={quiz.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h4>
                      <div className="flex items-center space-x-2 space-x-reverse text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{quiz.questions?.length || 0} سؤال</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {attempted ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 ml-1" />
                            <span className="text-sm">تم الانتهاء</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-blue-600">
                            <BookOpen className="w-4 h-4 ml-1" />
                            <span className="text-sm">متاح</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => startQuiz(quiz)}
                      disabled={attempted}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                        attempted
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                      }`}
                    >
                      {attempted ? 'تم الامتحان' : 'بدء الامتحان'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}