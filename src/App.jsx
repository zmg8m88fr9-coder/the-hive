import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import BottomNav from './components/hive/BottomNav';
// Add page imports here
import HiveCommand from './pages/HiveCommand';
import BrainGrid from './pages/BrainGrid';
import BrainDetail from './pages/BrainDetail';
import HiveSignals from './pages/HiveSignals';
import NeuralMap from './pages/NeuralMap';
import HiveChat from './pages/HiveChat';
import PerformanceDashboard from './pages/PerformanceDashboard';
import TradeHistory from './pages/TradeHistory';
import BrainAnalytics from './pages/BrainAnalytics';
import AlgorithmDashboard from './pages/AlgorithmDashboard';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1a1a1a] border-t-[#FFB81C] rounded-full animate-spin" />
          <div className="text-[8px] text-[#FFB81C] tracking-widest animate-pulse">HIVE LOADING...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-[#d4d0c8] flex flex-col" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HiveCommand />} />
          <Route path="/brains" element={<BrainGrid />} />
          <Route path="/brains/:id" element={<BrainDetail />} />
          <Route path="/signals" element={<HiveSignals />} />
          <Route path="/neural" element={<NeuralMap />} />
          <Route path="/chat" element={<HiveChat />} />
          <Route path="/perf" element={<PerformanceDashboard />} />
          <Route path="/trades" element={<TradeHistory />} />
          <Route path="/analytics" element={<BrainAnalytics />} />
          <Route path="/algorithms" element={<AlgorithmDashboard />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </main>
      <BottomNav />

    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App