import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import HelpLanding from './pages/public/HelpLanding';
import HelpRequestForm from './pages/public/HelpRequestForm';
import SurvivorRegister from './pages/public/SurvivorRegister';
import TrackRequest from './pages/public/TrackRequest';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Protected Route Component
const ProtectedRoute = ({ children, pageName }) => {
  const { isAuthenticated, canView, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (pageName && !canView(pageName)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError } = useAuth();

  // Show loading spinner
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError && authError.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render the main app with protected routes
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HelpLanding />} />
      <Route path="/help" element={<Navigate to="/" replace />} />
      <Route path="/help/request" element={<HelpRequestForm />} />
      <Route path="/register" element={<SurvivorRegister />} />
      <Route path="/track" element={<TrackRequest />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Authenticated Root (Legacy redirect if needed) */}
      <Route path="/home" element={
        <ProtectedRoute pageName="Dashboard">
          <LayoutWrapper currentPageName="Dashboard">
            <MainPage />
          </LayoutWrapper>
        </ProtectedRoute>
      } />

      {/* All Other Pages (Protected with Role-Based Access) */}
      {Object.entries(Pages).map(([path, Page]) => {
        if (path === "Login" || path === "Unauthorized") return null;
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <ProtectedRoute pageName={path}>
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
        );
      })}

      {/* 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
