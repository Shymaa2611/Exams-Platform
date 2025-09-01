import React, { createContext, useContext, useState, useEffect } from 'react'

type AuthContextType = {
  isTeacher: boolean
  studentName: string
  login: (name: string, isTeacher?: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTeacher, setIsTeacher] = useState(false)
  const [studentName, setStudentName] = useState('')

  useEffect(() => {
    const savedAuth = localStorage.getItem('math_quiz_auth')
    if (savedAuth) {
      const { isTeacher: savedIsTeacher, studentName: savedStudentName } = JSON.parse(savedAuth)
      setIsTeacher(savedIsTeacher)
      setStudentName(savedStudentName)
    }
  }, [])

  const login = (name: string, isTeacherLogin = false) => {
    const teacherLogin = name === 'shymaa9977' && isTeacherLogin
    setIsTeacher(teacherLogin)
    setStudentName(teacherLogin ? 'shymaa9977' : name)
    localStorage.setItem('math_quiz_auth', JSON.stringify({
      isTeacher: teacherLogin,
      studentName: teacherLogin ? 'shymaa9977' : name
    }))
  }

  const logout = () => {
    setIsTeacher(false)
    setStudentName('')
    localStorage.removeItem('math_quiz_auth')
  }

  return (
    <AuthContext.Provider value={{ isTeacher, studentName, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}