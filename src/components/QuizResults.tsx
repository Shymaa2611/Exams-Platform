import React from 'react'
import { QuizAttempt, Quiz } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type QuizResultsProps = {
  attempts: QuizAttempt[]
  quizzes: Quiz[]
}

export const QuizResults: React.FC<QuizResultsProps> = ({ attempts, quizzes }) => {
  const getQuizTitle = (quizId: string) => {
    return quizzes.find(q => q.id === quizId)?.title || 'امتحان محذوف'
  }

  const getQuizTotalMarks = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId)
    if (!quiz || !quiz.questions) return 100
    const questions = Array.isArray(quiz.questions) ? quiz.questions : []
    return questions.length || 100
  }

  const getStudentGrade = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId)
    return quiz?.grade === 'first_secondary' ? 'الأول الثانوي' : quiz?.grade === 'second_secondary' ? 'الثاني الثانوي' : 'غير محدد'
  }

  const chartData = attempts.reduce((acc: any[], attempt) => {
    const totalMarks = getQuizTotalMarks(attempt.quiz_id)
    const actualScore = Math.round((attempt.score / 100) * totalMarks)
    const scoreRange = Math.floor(actualScore / 10) * 10
    const rangeKey = `${scoreRange}-${scoreRange + 9}`
    const existing = acc.find(item => item.range === rangeKey)
    
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ range: rangeKey, count: 1 })
    }
    
    return acc
  }, []).sort((a, b) => parseInt(a.range) - parseInt(b.range))

  return (
    <div className="space-y-6">
      {attempts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">لا توجد محاولات امتحان حتى الآن</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h4 className="text-lg font-bold text-gray-900 mb-4">توزيع الدرجات</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-bold text-gray-900">نتائج الطلاب</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم الطالب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الصف الدراسي
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الامتحان
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدرجة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attempts.map((attempt) => {
                    const totalMarks = getQuizTotalMarks(attempt.quiz_id)
                    const actualScore = Math.round((attempt.score / 100) * totalMarks)
                    
                    return (
                      <tr key={attempt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {attempt.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getStudentGrade(attempt.quiz_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getQuizTitle(attempt.quiz_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            attempt.score >= 85 
                              ? 'bg-green-100 text-green-800'
                              : attempt.score >= 70
                              ? 'bg-yellow-100 text-yellow-800'
                              : attempt.score >= 50
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {actualScore} / {totalMarks}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(attempt.completed_at).toLocaleDateString('ar-EG')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}