import React, { useState, useEffect } from 'react'
import { supabase, Quiz, QuizAttempt } from '../lib/supabase'
import { Plus, Edit, Trash2, Users, BarChart3, BookOpen, AlertTriangle, Database } from 'lucide-react'
import { QuizForm } from './QuizForm'
import { QuizResults } from './QuizResults'

export const TeacherDashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [showQuizForm, setShowQuizForm] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'quizzes' | 'results'>('quizzes')
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

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
      .order('completed_at', { ascending: false })
    
    if (data) setAttempts(data)
  }

  const deleteQuiz = async (id: string) => {
    if (confirm('هل أنت متأكدة من حذف هذا الامتحان؟')) {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id)
      
      if (!error) {
        loadQuizzes()
      }
    }
  }

  const resetDatabase = async () => {
    setResetLoading(true)
    try {
      // Delete all quiz attempts first (due to foreign key constraint)
      const { error: attemptsError } = await supabase
        .from('quiz_attempts')
        .delete()
        .neq('id', '')
      
      if (attemptsError) throw attemptsError

      // Delete all quizzes
      const { error: quizzesError } = await supabase
        .from('quizzes')
        .delete()
        .neq('id', '')
      
      if (quizzesError) throw quizzesError

      // Clear quiz images from storage
      const { data: files } = await supabase.storage
        .from('quiz-images')
        .list('question-images')
      
      if (files && files.length > 0) {
        const filePaths = files.map(file => `question-images/${file.name}`)
        await supabase.storage
          .from('quiz-images')
          .remove(filePaths)
      }

      // Reload data
      await loadQuizzes()
      await loadAttempts()
      
      alert('تم مسح جميع البيانات بنجاح')
      setShowResetConfirm(false)
    } catch (error) {
      alert('خطأ في مسح البيانات')
    } finally {
      setResetLoading(false)
    }
  }
  const getSubjectName = (subject: string) => {
    return subject === 'pure_math' ? 'رياضيات بحتة' : 'استاتيكا'
  }

  const getGradeName = (grade: string) => {
    return grade === 'first_secondary' ? 'أولى ثانوي' : 'تانية ثانوي'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم المعلمة</h2>
        <p className="text-gray-600">إدارة الامتحانات ومتابعة النتائج</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي الامتحانات</p>
              <p className="text-2xl font-bold text-blue-600">{quizzes.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">محاولات الطلاب</p>
              <p className="text-2xl font-bold text-emerald-600">{attempts.length}</p>
            </div>
            <Users className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">متوسط الدرجات</p>
              <p className="text-2xl font-bold text-orange-600">
                {attempts.length > 0 
                  ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length)
                  : 0}%
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8 space-x-reverse">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quizzes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            إدارة الامتحانات
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            نتائج الطلاب
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'quizzes' && (
        <div>
          {/* Add Quiz Button */}
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => setShowQuizForm(true)}
              className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2 space-x-reverse"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة امتحان جديد</span>
            </button>
            
            {/* Reset Database Button */}
            {(quizzes.length > 0 || attempts.length > 0) && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-all flex items-center space-x-2 space-x-reverse"
              >
                <Database className="w-5 h-5" />
                <span>مسح جميع البيانات</span>
              </button>
            )}
          </div>

          {/* Quizzes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {getSubjectName(quiz.subject)}
                    </span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                      {getGradeName(quiz.grade)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {quiz.questions?.length || 0} سؤال
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => {
                        setEditingQuiz(quiz)
                        setShowQuizForm(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedQuiz(quiz.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    عرض النتائج
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Database Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500 ml-3" />
              <h3 className="text-xl font-bold text-red-600">تحذير: مسح جميع البيانات</h3>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm mb-2">
                <strong>تحذير:</strong> هذا الإجراء سيؤدي إلى:
              </p>
              <ul className="text-red-700 text-sm space-y-1 mr-4">
                <li>• حذف جميع الامتحانات ({quizzes.length} امتحان)</li>
                <li>• حذف جميع محاولات الطلاب ({attempts.length} محاولة)</li>
                <li>• حذف جميع صور الأسئلة</li>
                <li>• <strong>لا يمكن التراجع عن هذا الإجراء</strong></li>
              </ul>
            </div>
            
            <p className="text-gray-600 mb-6">
              هل أنت متأكدة تماماً من مسح جميع البيانات؟
            </p>
            
            <div className="flex space-x-4 space-x-reverse">
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={resetLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={resetDatabase}
                disabled={resetLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold"
              >
                {resetLoading ? 'جاري المسح...' : 'مسح جميع البيانات'}
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'results' && (
        <QuizResults attempts={attempts} quizzes={quizzes} />
      )}

      {/* Quiz Form Modal */}
      {showQuizForm && (
        <QuizForm
          quiz={editingQuiz}
          onClose={() => {
            setShowQuizForm(false)
            setEditingQuiz(null)
          }}
          onSave={() => {
            loadQuizzes()
            setShowQuizForm(false)
            setEditingQuiz(null)
          }}
        />
      )}

      {/* Quiz Results Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  نتائج امتحان: {quizzes.find(q => q.id === selectedQuiz)?.title}
                </h3>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <QuizResults 
                attempts={attempts.filter(a => a.quiz_id === selectedQuiz)} 
                quizzes={quizzes.filter(q => q.id === selectedQuiz)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}