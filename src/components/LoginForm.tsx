import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Calculator, UserCheck, User } from 'lucide-react'

export const LoginForm: React.FC = () => {
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [isTeacherLogin, setIsTeacherLogin] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      login(name.trim(), isTeacherLogin)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-800 flex items-center justify-center" dir="rtl">
      {/* Mathematical Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.3'%3E%3Ctext x='10' y='30' font-family='serif' font-size='20'%3E∫%3C/text%3E%3Ctext x='60' y='30' font-family='serif' font-size='16'%3Eπ%3C/text%3E%3Ctext x='30' y='60' font-family='serif' font-size='18'%3E∑%3C/text%3E%3Ctext x='70' y='80' font-family='serif' font-size='14'%3E√%3C/text%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4 rounded-xl inline-block mb-4">
            <Calculator className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">منصة الرياضيات</h1>
          <p className="text-gray-600">نظام الامتحانات التفاعلي</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setIsTeacherLogin(false)}
              className={`p-4 rounded-lg border-2 transition-all ${
                !isTeacherLogin
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <User className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">طالب</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTeacherLogin(true)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isTeacherLogin
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <UserCheck className="w-6 h-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">معلمة</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isTeacherLogin ? 'اسم المعلمة' : 'اسم الطالب'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
              placeholder={isTeacherLogin ? "ادخلي اسم المعلمة" : "ادخل اسمك"}
              required
            />
            {isTeacherLogin && (
              <p className="text-xs text-gray-500 mt-1">
               المعلم فقط هو الذي يمكنه الدخول .
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            دخول المنصة
          </button>
        </form>
      </div>
    </div>
  )
}