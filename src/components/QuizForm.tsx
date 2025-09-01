import React, { useState, useRef } from 'react'
import { supabase, Quiz, Question } from '../lib/supabase'
import { Plus, Trash2, Upload, X } from 'lucide-react'

type QuizFormProps = {
  quiz?: Quiz | null
  onClose: () => void
  onSave: () => void
}

export const QuizForm: React.FC<QuizFormProps> = ({ quiz, onClose, onSave }) => {
  const [title, setTitle] = useState(quiz?.title || '')
  const [subject, setSubject] = useState<'pure_math' | 'statistics'>(quiz?.subject || 'pure_math')
  const [grade, setGrade] = useState<'first_secondary' | 'second_secondary'>(quiz?.grade || 'first_secondary')
  const [questions, setQuestions] = useState<Omit<Question, 'quiz_id'>[]>(
    quiz?.questions || [{ id: '', question_text: '', options: ['', '', '', ''], correct_answer: 0 }]
  )
  const [loading, setLoading] = useState(false)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(),
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 0
    }])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions]
    if (field === 'option') {
      updated[index].options[value.index] = value.text
    } else {
      (updated[index] as any)[field] = value
    }
    setQuestions(updated)
  }

  const handleImageUpload = async (file: File, questionIndex: number) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `question-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('quiz-images')
      .upload(filePath, file)

    if (uploadError) {
      alert('خطأ في رفع الصورة')
      return
    }

    const { data } = supabase.storage
      .from('quiz-images')
      .getPublicUrl(filePath)

    updateQuestion(questionIndex, 'question_image', data.publicUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const quizData = {
      title,
      subject,
      grade,
      questions: questions.map(q => ({
        ...q,
        id: q.id || Date.now().toString() + Math.random()
      })),
      updated_at: new Date().toISOString()
    }

    try {
      if (quiz?.id) {
        // Update existing quiz
        const { error } = await supabase
          .from('quizzes')
          .update(quizData)
          .eq('id', quiz.id)
        
        if (error) throw error
      } else {
        // Create new quiz
        const { error } = await supabase
          .from('quizzes')
          .insert({
            ...quizData,
            id: Date.now().toString(),
            created_at: new Date().toISOString()
          })
        
        if (error) throw error
      }

      onSave()
    } catch (error) {
      alert('خطأ في حفظ الامتحان')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {quiz ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quiz Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الامتحان
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المادة
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as 'pure_math' | 'statistics')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pure_math">رياضيات بحتة</option>
                <option value="statistics">استاتيكا</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الصف
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as 'first_secondary' | 'second_secondary')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="first_secondary">أولى ثانوي</option>
                <option value="second_secondary">تانية ثانوي</option>
              </select>
            </div>
          </div>

          {/* Validation */}
          {subject === 'statistics' && grade === 'first_secondary' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                تنبيه: الأول الثانوي لا يدرس الاستاتيكا
              </p>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium">الأسئلة</h4>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سؤال</span>
              </button>
            </div>

            {questions.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-medium">السؤال {qIndex + 1}</h5>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نص السؤال
                  </label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                {/* Question Image */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صورة السؤال (اختيارية)
                  </label>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => fileInputRefs.current[qIndex] = el}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, qIndex)
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[qIndex]?.click()}
                      className="flex items-center space-x-2 space-x-reverse px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>رفع صورة</span>
                    </button>
                    {question.question_image && (
                      <div className="relative">
                        <img
                          src={question.question_image}
                          alt="سؤال"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuestion(qIndex, 'question_image', '')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-3 space-x-reverse">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correct_answer === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateQuestion(qIndex, 'option', { index: oIndex, text: e.target.value })}
                        placeholder={`الخيار ${oIndex + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 space-x-reverse mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : (quiz ? 'تحديث' : 'إضافة')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}