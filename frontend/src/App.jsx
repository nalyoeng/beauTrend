import { lazy, Suspense } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import AppLayout from "./components/common/AppLayout"
import ProtectedRoute from "./components/common/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"

const AuthPage = lazy(() => import("./pages/AuthPage"))
const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const LandingPage = lazy(() => import("./pages/LandingPage"))
const MarketComparisonPage = lazy(() => import("./pages/MarketComparisonPage"))
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"))
const ReportGeneratedPage = lazy(() => import("./pages/ReportGeneratedPage"))
const TrendAnalysisPage = lazy(() => import("./pages/TrendAnalysisPage"))

function LoadingPage() {
  return (
    <div className="route-loading" role="status">
      <span />
      Loading BeautyTrend…
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/trends" element={<TrendAnalysisPage />} />
              <Route path="/comparison" element={<MarketComparisonPage />} />
              <Route path="/reports" element={<ReportGeneratedPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
