import React, { useState, useEffect } from 'react'
import { Quiz, supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, ArrowRight, Clock, AlertTriangle, CheckCircle, Trophy } from 'lucide-react'

type QuizTakingProps = {
  quiz: Quiz
  onComplete: () => void
  onCancel: () => void
}

export const QuizTaking: React.FC<QuizTakingProps> = ({ quiz, onComplete, onCancel }) => {
  const { studentName } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.questions?.length || 0).fill(-1))
  const [timeLeft, setTimeLeft] = useState(quiz.questions?.length ? quiz.questions.length * 60 : 0) // 1 minute per question
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const selectAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < (quiz.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitQuiz = async () => {
    const score = answers.reduce((total, answer, index) => {
      if (quiz.questions && quiz.questions[index] && answer === quiz.questions[index].correct_answer) {
        return total + 1
      }
      return total
    }, 0)

    const percentage = Math.round((score / (quiz.questions?.length || 1)) * 100)

    const attempt = {
      id: Date.now().toString(),
      student_name: studentName,
      quiz_id: quiz.id,
      answers,
      score: percentage,
      completed_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('quiz_attempts')
      .insert(attempt)

    if (!error) {
      setQuizScore(percentage)
      setShowConfirm(false)
      setShowSuccess(true)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    onComplete()
  }

  const unansweredCount = answers.filter(answer => answer === -1).length

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">لا توجد أسئلة في هذا الامتحان</p>
        <button
          onClick={onCancel}
          className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg"
        >
          العودة
        </button>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          <div className="flex items-center space-x-4 space-x-reverse">
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>السؤال {currentQuestion + 1} من {quiz.questions.length}</span>
          <span>{unansweredCount} سؤال لم يتم الإجابة عليه</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-emerald-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          السؤال {currentQuestion + 1}
        </h3>

        {/* Question Image */}
        {question.question_image && (
          <div className="mb-4">
            <img
              src={question.question_image}
              alt="صورة السؤال"
              className="max-w-full h-auto rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Question Text */}
        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
          {question.question_text}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                answers[currentQuestion] === index
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  checked={answers[currentQuestion] === index}
                  onChange={() => selectAnswer(currentQuestion, index)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-right flex-1">{option}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4 space-x-reverse">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 space-x-reverse px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4" />
            <span>السابق</span>
          </button>
          
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={nextQuestion}
              className="flex items-center space-x-2 space-x-reverse px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <span>التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-bold"
            >
              إنهاء الامتحان
            </button>
          )}
        </div>

        <button
          onClick={onCancel}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          إلغاء الامتحان
        </button>
      </div>

      {/* Question Navigator */}
      <div className="mt-6 bg-white p-4 rounded-xl shadow-md">
        <h4 className="text-sm font-medium text-gray-700 mb-3">الانتقال السريع للأسئلة</h4>
        <div className="grid grid-cols-10 gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 text-xs rounded-lg font-medium transition-all ${
                index === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : answers[index] !== -1
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 ml-2" />
              <h3 className="text-lg font-bold">تأكيد إنهاء الامتحان</h3>
            </div>
            
            {unansweredCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-orange-800 text-sm">
                  تحذير: لم تجب على {unansweredCount} سؤال
                </p>
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              هل أنت متأكد من إنهاء الامتحان؟ لن تتمكن من العودة إليه مرة أخرى.
            </p>
            
            <div className="flex space-x-4 space-x-reverse">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                مراجعة الإجابات
              </button>
              <button
                onClick={submitQuiz}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                إنهاء الامتحان
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
            {/* Success Animation */}
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex justify-center">
                <Trophy className="w-12 h-12 text-yellow-500" />
              </div>
            </div>
            
            {/* Success Message */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              تم إنهاء الامتحان بنجاح!
            </h3>
            
            <p className="text-gray-600 mb-4">
              تم إرسال إجاباتك بنجاح. النتائج متاحة للمعلمة فقط.
            </p>
            
            {/* Student Info */}
            <div className="text-sm text-gray-500 mb-6">
              الطالب: {studentName}
            </div>
            
            {/* Action Button */}
            <button
              onClick={handleSuccessClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              العودة إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      )}
    </div>
  )
}