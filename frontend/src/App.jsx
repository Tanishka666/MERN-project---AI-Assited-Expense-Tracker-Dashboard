import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import VerifyEmail from './components/VerifyEmail';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Check if this is an email verification URL
  const path = window.location.pathname;

  if (path.startsWith('/verify-email/')) {
    const token = path.split('/verify-email/')[1];

    return <VerifyEmail token={token} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">
          Loading...
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <Auth />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;