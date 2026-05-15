import React, { useState, useEffect, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { ToastProvider } from '@/context/ToastContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Layout } from '@/components/Layout';
import { SplashScreen } from '@/components/SplashScreen';
import { Loading } from '@/components/ui/Loading';
import { AppView } from '@/types';
import { applyDailyTheme } from '@/lib/dailyTheme';
import { useUserRole } from '@/hooks/useUserRole';
import { getAllowedViews, getDefaultView } from '@/lib/roleAccess';

// Lazy-loaded views
const Auth = React.lazy(() => import('@/views/Auth').then(m => ({ default: m.Auth })));
const Onboarding = React.lazy(() => import('@/views/Onboarding').then(m => ({ default: m.Onboarding })));
const Home = React.lazy(() => import('@/views/Home').then(m => ({ default: m.Home })));
const PetManagement = React.lazy(() => import('@/views/PetManagement').then(m => ({ default: m.PetManagement })));
const HealthRecords = React.lazy(() => import('@/views/HealthRecords').then(m => ({ default: m.HealthRecords })));
const Reminders = React.lazy(() => import('@/views/Reminders').then(m => ({ default: m.Reminders })));
const AiAssistant = React.lazy(() => import('@/views/AiAssistant').then(m => ({ default: m.AiAssistant })));
const NearbyPlaces = React.lazy(() => import('@/views/NearbyPlaces').then(m => ({ default: m.NearbyPlaces })));
const Community = React.lazy(() => import('@/views/Community').then(m => ({ default: m.Community })));
const Drops = React.lazy(() => import('@/views/Drops').then(m => ({ default: m.Drops })));
const Groups = React.lazy(() => import('@/views/Groups').then(m => ({ default: m.Groups })));
const ScratchBoard = React.lazy(() => import('@/views/ScratchBoard').then(m => ({ default: m.ScratchBoard })));
const Profile = React.lazy(() => import('@/views/Profile').then(m => ({ default: m.Profile })));
const Settings = React.lazy(() => import('@/views/Settings').then(m => ({ default: m.Settings })));
const Tasks = React.lazy(() => import('@/views/Tasks').then(m => ({ default: m.Tasks })));
const Achievements = React.lazy(() => import('@/views/Achievements').then(m => ({ default: m.Achievements })));

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [showSplash, setShowSplash] = useState(true);
  const [isYouMode, setIsYouMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const { role, loading: roleLoading, updateRole } = useUserRole(user?.id);

  // Apply daily theme on mount
  useEffect(() => {
    applyDailyTheme();
  }, []);

  // Auth state handling
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoadingUser(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoadingUser(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set default view based on role once loaded
  useEffect(() => {
    if (role) {
      const defaultView = getDefaultView(role);
      setCurrentView(defaultView);
      if (role === 'visitor') setIsYouMode(true);
    }
  }, [role]);

  const handleSplashFinish = () => setShowSplash(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView(AppView.HOME);
    setIsYouMode(false);
  };

  const handleNavigate = (view: AppView) => {
    const allowed = getAllowedViews(role);
    if (allowed.has(view)) {
      setCurrentView(view);
    }
  };

  const toggleYouMode = () => {
    if (role !== 'both') return;
    setIsYouMode(prev => !prev);
    setCurrentView(isYouMode ? AppView.HOME : AppView.COMMUNITY);
  };

  const handleOnboardingComplete = async (selectedRole: 'visitor' | 'pet_parent' | 'both') => {
    await updateRole(selectedRole);
    setCurrentView(getDefaultView(selectedRole));
    if (selectedRole === 'visitor') setIsYouMode(true);
  };

  if (showSplash) return <SplashScreen onFinish={handleSplashFinish} />;
  if (isLoadingUser) return <Loading />;

  if (!user) {
    return (
      <Suspense fallback={<Loading />}>
        <Auth onSuccess={() => {}} />
      </Suspense>
    );
  }

  // Wait for role check
  if (roleLoading) return <Loading />;

  // No role set → show onboarding
  if (!role) {
    return (
      <Suspense fallback={<Loading />}>
        <Onboarding onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Home onNavigate={handleNavigate} />;
      case AppView.PETS:
        return <PetManagement />;
      case AppView.HEALTH_RECORDS:
        return <HealthRecords />;
      case AppView.REMINDERS:
        return <Reminders />;
      case AppView.ASSISTANT:
        return <AiAssistant />;
      case AppView.TASKS:
        return <Tasks />;
      case AppView.ACHIEVEMENTS:
        return <Achievements />;
      case AppView.NEARBY:
        return <NearbyPlaces />;
      case AppView.COMMUNITY:
        return <Community />;
      case AppView.DROPS:
        return <Drops />;
      case AppView.GROUPS:
        return <Groups />;
      case AppView.SCRATCH_BOARD:
        return <ScratchBoard />;
      case AppView.PROFILE:
        return <Profile onNavigate={handleNavigate} />;
      case AppView.SETTINGS:
        return <Settings onBack={() => setCurrentView(AppView.PROFILE)} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onChangeView={handleNavigate}
      onLogout={handleLogout}
      isYouMode={isYouMode}
      onToggleYouMode={toggleYouMode}
      userRole={role}
    >
      <Suspense fallback={<Loading />}>{renderView()}</Suspense>
    </Layout>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
