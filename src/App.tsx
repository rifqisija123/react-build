import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/landing/LandingPage';
import { PortfolioBuilderLayout } from './layouts/PortfolioBuilderLayout';
import { DashboardPortfolio } from './pages/dashboard/DashboardPortfolio';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { AuthPage } from './pages/auth/AuthPage';
import { TwoFactorChallengePage } from './pages/auth/TwoFactorChallengePage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { PublicPortfolio } from './pages/portfolio/PublicPortfolio';
import { SettingsPage } from './pages/settings/SettingsPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';
import { UnauthorizedPage } from './pages/errors/UnauthorizedPage';
import { ForbiddenPage } from './pages/errors/ForbiddenPage';
import { TimeoutPage } from './pages/errors/TimeoutPage';
import { BadRequestPage } from './pages/errors/BadRequestPage';
import { ServerErrorPage } from './pages/errors/ServerErrorPage';
import { BadGatewayPage } from './pages/errors/BadGatewayPage';
import { ServiceUnavailablePage } from './pages/errors/ServiceUnavailablePage';
import { InvalidVerificationPage } from './pages/errors/InvalidVerificationPage';
import { ExpiredVerificationPage } from './pages/errors/ExpiredVerificationPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ConfirmDeleteAccount } from './pages/auth/ConfirmDeleteAccount';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemesBuilder } from './components/dashboard/ThemesBuilder';
import { FeedbackForm } from './components/dashboard/FeedbackForm';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/login/2fa" element={<TwoFactorChallengePage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/confirm-delete-account" element={<ConfirmDeleteAccount />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <PortfolioBuilderLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/portfolio-builder" element={<DashboardPortfolio />} />
                  <Route path="/overview" element={<OverviewPage />} />
                  <Route path="/themes" element={<ThemesBuilder />} />
                  <Route path="/feedback" element={<FeedbackForm />} />
                </Route>
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/portfolio/public/:username" element={<PublicPortfolio />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/forbidden" element={<ForbiddenPage />} />
                <Route path="/timeout" element={<TimeoutPage />} />
                <Route path="/bad-request" element={<BadRequestPage />} />
                <Route path="/server-error" element={<ServerErrorPage />} />
                <Route path="/bad-gateway" element={<BadGatewayPage />} />
                <Route path="/service-unavailable" element={<ServiceUnavailablePage />} />
                <Route path="/invalid-verification" element={<InvalidVerificationPage />} />
                <Route path="/expired-verification" element={<ExpiredVerificationPage />} />

                {/* Catch-all 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
