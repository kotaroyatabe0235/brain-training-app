import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import GameCategoryPage from './pages/GameCategoryPage'
import CardMatchGame from './pages/CardMatchGame'
import QuickCalcGame from './pages/QuickCalcGame'
import NumberMemoryGame from './pages/NumberMemoryGame'
import TargetClickGame from './pages/TargetClickGame'
import PatternGame from './pages/PatternGame'
import StatsHistoryPage from './pages/StatsHistoryPage'
import StatsDashboardPage from './pages/StatsDashboardPage'
import RankingPage from './pages/RankingPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/:category"
          element={
            <ProtectedRoute>
              <GameCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/memory/card-match"
          element={
            <ProtectedRoute>
              <CardMatchGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/calculation/quick-calc"
          element={
            <ProtectedRoute>
              <QuickCalcGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/memory/number-memory"
          element={
            <ProtectedRoute>
              <NumberMemoryGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/reaction/target-click"
          element={
            <ProtectedRoute>
              <TargetClickGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games/logic/pattern"
          element={
            <ProtectedRoute>
              <PatternGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats/history"
          element={
            <ProtectedRoute>
              <StatsHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats/dashboard"
          element={
            <ProtectedRoute>
              <StatsDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats/ranking"
          element={
            <ProtectedRoute>
              <RankingPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
