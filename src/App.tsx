import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { LoginForm } from './components/LoginForm'
import { TeacherDashboard } from './components/TeacherDashboard'
import { StudentDashboard } from './components/StudentDashboard'

const AppContent: React.FC = () => {
  const { isTeacher, studentName } = useAuth()

  if (!studentName) {
    return <LoginForm />
  }

  return (
    <Layout>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isTeacher ? (
                <TeacherDashboard />
              ) : (
                <StudentDashboard />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App