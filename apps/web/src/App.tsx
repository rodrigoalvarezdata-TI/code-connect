import { Navigate, Route, Routes } from 'react-router'
import { LoginPage } from '@/components/pages/LoginPage'
import { RegisterPage } from '@/components/pages/RegisterPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}

export default App
