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

// Lazy-loaded views
const Auth = React.lazy(() => import('@/views/Auth').then(m => ({ default: m.Auth })));
const Home = React.lazy(() => import('@/views/Home').then(m => ({ default: m.Home })));
const PetManagement = React.lazy(() => import('@/views/PetManagement').then(m => ({ default: m.PetManagement })));
const Reminders = React.lazy(() => import('@/views/Reminders').then(m => ({ default: m.Reminders })));
const AiAssistant = React.lazy(() => import('@/views/AiAssistant').then(m => ({ default: m.AiAssistant })));
const NearbyPlaces = React.lazy(() => import('@/views/NearbyPlaces').then(m => ({ default: m.NearbyPlaces })));
const Community = React.lazy(() => import('@/views/Community').then(m => ({ default: m.Community })));
const Drops = React.lazy(() => import('@/views/Drops').then(m => ({ default: m.Drops })));
const Groups = React.lazy(() => import('@/views/Groups').then(m => ({ default: m.Groups })));
const Profile = React.lazy(() => import('@/views/Profile').then(m => ({ default: m.Profile })));
const Onboarding = React.lazy(() => import('@/components/Onboarding').then(m => ({ default: m.Onboarding })));

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [showSplash, setShowSplash] = useState(true);
  const [isYouMode, setIsYouMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userMode, setUserMode] = useState<'visitor' | 'pet_owner' | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Apply daily theme on mount
  useEffect(() => {
    applyDailyTheme();
  }, []);

  // Auth state handling
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check if user has completed onboarding - defer to avoid deadlock
        setTimeout(() => {
          checkUserMode(session.user.id);
        }, 0);
      } else {
        setUserMode(null);
        setShowOnboarding(false);
      }
      setIsLoadingUser(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserMode(session.user.id);
      } else {
        setIsLoadingUser(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserMode = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_mode')
      .eq('user_id', userId)
      .single();

    if (profile?.user_mode) {
      setUserMode(profile.user_mode as 'visitor' | 'pet_owner');
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
    setIsLoadingUser(false);
  };

  const handleOnboardingComplete = (mode: 'visitor' | 'pet_owner') => {
    setUserMode(mode);
    setShowOnboarding(false);
    // Set appropriate starting view based on mode
    if (mode === 'visitor') {
      setCurrentView(AppView.COMMUNITY);
      setIsYouMode(true);
    } else {
      setCurrentView(AppView.HOME);
      setIsYouMode(false);
    }
  };

  const handleSplashFinish = () => setShowSplash(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserMode(null);
    setCurrentView(AppView.HOME);
    setIsYouMode(false);
  };

  const toggleYouMode = () => {
    setIsYouMode(prev => !prev);
    setCurrentView(isYouMode ? AppView.HOME : AppView.DROPS);
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

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <Suspense fallback={<Loading />}>
        <Onboarding userId={user.id} onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  const renderView = () => {
    // Visitors shouldn't access pet care features
    if (userMode === 'visitor') {
      switch (currentView) {
        case AppView.COMMUNITY:
          return <Community />;
        case AppView.DROPS:
          return <Drops />;
        case AppView.GROUPS:
          return <Groups />;
        case AppView.PROFILE:
          return <Profile />;
        default:
          return <Community />;
      }
    }

    // Pet owners have full access
    switch (currentView) {
      case AppView.HOME:
        return <Home onNavigate={setCurrentView} />;
      case AppView.PETS:
        return <PetManagement />;
      case AppView.REMINDERS:
        return <Reminders />;
      case AppView.ASSISTANT:
        return <AiAssistant />;
      case AppView.NEARBY:
        return <NearbyPlaces />;
      case AppView.COMMUNITY:
        return <Community />;
      case AppView.DROPS:
        return <Drops />;
      case AppView.GROUPS:
        return <Groups />;
      case AppView.PROFILE:
        return <Profile />;
      default:
        return isYouMode ? <Drops /> : <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onChangeView={setCurrentView}
      onLogout={handleLogout}
      isYouMode={isYouMode}
      onToggleYouMode={toggleYouMode}
      userMode={userMode}
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
