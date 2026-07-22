import { Route, Routes } from 'react-router'
import { LoginPage } from '@/components/pages/LoginPage'
import { RegisterPage } from '@/components/pages/RegisterPage'
import { DashboardPage } from '@/components/pages/DashboardPage'
import { PostsFeedPage } from '@/components/pages/PostsFeedPage'
import { PostDetailsPage } from '@/components/pages/PostDetailsPage'
import { CreatePostPage } from '@/components/pages/CreatePostPage'
import { AppLayout } from '@/components/templates/AppLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Auth: telas próprias (AuthLayout), fora da casca do app. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Feed + detalhe são públicos e compartilham o menu via AppLayout. */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<PostsFeedPage />} />
        <Route path="/posts/:id" element={<PostDetailsPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/posts/new" element={<CreatePostPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}

export default App
