import React, { useState, useEffect, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { ToastProvider } from '@/context/ToastContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SplashScreen } from '@/components/SplashScreen';
import { Loading } from '@/components/ui/Loading';
import { AppView } from '@/types';
import { applyDailyTheme } from '@/lib/dailyTheme';

// Lazy-loaded views
const Auth = React.lazy(() => import('@/views/Auth').then(m => ({ default: m.Auth })));
const OnboardingPage = React.lazy(() => import('@/views/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const DropsFeed = React.lazy(() => import('@/views/DropsFeed').then(m => ({ default: m.DropsFeed })));
const Community = React.lazy(() => import('@/views/Community').then(m => ({ default: m.Community })));
const Groups = React.lazy(() => import('@/views/Groups').then(m => ({ default: m.Groups })));
const Profile = React.lazy(() => import('@/views/Profile').then(m => ({ default: m.Profile })));

// Pet parent views
const Home = React.lazy(() => import('@/views/Home').then(m => ({ default: m.Home })));
const PetManagement = React.lazy(() => import('@/views/PetManagement').then(m => ({ default: m.PetManagement })));
const Reminders = React.lazy(() => import('@/views/Reminders').then(m => ({ default: m.Reminders })));
const AiAssistant = React.lazy(() => import('@/views/AiAssistant').then(m => ({ default: m.AiAssistant })));
const NearbyPlaces = React.lazy(() => import('@/views/NearbyPlaces').then(m => ({ default: m.NearbyPlaces })));

// Navigation components
const CommunityNav = React.lazy(() => import('@/components/CommunityNav').then(m => ({ default: m.CommunityNav })));
const PetParentNav = React.lazy(() => import('@/components/PetParentNav').then(m => ({ default: m.PetParentNav })));

const queryClient = new QueryClient();

type UserRole = 'visitor' | 'pet_parent' | null;
type ActiveMode = 'community' | 'pet_care';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DROPS);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeMode, setActiveMode] = useState<ActiveMode>('community');

  // Apply daily theme on mount
  useEffect(() => {
    applyDailyTheme();
  }, []);

  // Auth state handling
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          checkUserRole(session.user.id);
        }, 0);
      } else {
        setUserRole(null);
        setShowOnboarding(false);
      }
      setIsLoadingUser(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setIsLoadingUser(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleData?.role) {
      setUserRole(roleData.role as UserRole);
      setShowOnboarding(false);
      // Set default view based on role
      if (roleData.role === 'visitor') {
        setActiveMode('community');
        setCurrentView(AppView.DROPS);
      } else {
        setActiveMode('community');
        setCurrentView(AppView.DROPS);
      }
    } else {
      setShowOnboarding(true);
    }
    setIsLoadingUser(false);
  };

  const handleOnboardingComplete = (role: UserRole) => {
    setUserRole(role);
    setShowOnboarding(false);
    setActiveMode('community');
    setCurrentView(AppView.DROPS);
  };

  const handleSplashFinish = () => setShowSplash(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setActiveMode('community');
    setCurrentView(AppView.DROPS);
  };

  const handleModeSwitch = (mode: ActiveMode) => {
    setActiveMode(mode);
    if (mode === 'community') {
      setCurrentView(AppView.DROPS);
    } else {
      setCurrentView(AppView.HOME);
    }
  };

  if (showSplash) return <SplashScreen onFinish={handleSplashFinish} />;
  if (isLoadingUser) return <Loading />;

  // Unauthenticated users see auth screen
  if (!user) {
    return (
      <Suspense fallback={<Loading />}>
        <Auth onSuccess={() => {}} />
      </Suspense>
    );
  }

  // New users see onboarding
  if (showOnboarding) {
    return (
      <Suspense fallback={<Loading />}>
        <OnboardingPage userId={user.id} onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  // Full-screen drops feed view (no navigation overlay for immersive experience)
  if (currentView === AppView.DROPS && activeMode === 'community') {
    return (
      <Suspense fallback={<Loading />}>
        <DropsFeed />
        <CommunityNav 
          currentView={currentView}
          onChangeView={setCurrentView}
          userRole={userRole}
          onModeSwitch={handleModeSwitch}
          activeMode={activeMode}
        />
      </Suspense>
    );
  }

  // Community mode views
  if (activeMode === 'community') {
    return (
      <div className="min-h-screen bg-zinc-900 text-white pb-20">
        <Suspense fallback={<Loading />}>
          <div className="p-4 max-w-2xl mx-auto">
            {currentView === AppView.COMMUNITY && <Community />}
            {currentView === AppView.GROUPS && <Groups />}
            {currentView === AppView.PROFILE && <Profile userRole={userRole} onUpgrade={() => checkUserRole(user.id)} onLogout={handleLogout} />}
          </div>
        </Suspense>
        <CommunityNav 
          currentView={currentView}
          onChangeView={setCurrentView}
          userRole={userRole}
          onModeSwitch={handleModeSwitch}
          activeMode={activeMode}
        />
      </div>
    );
  }

  // Pet care mode (only for pet_parent)
  if (activeMode === 'pet_care' && userRole === 'pet_parent') {
    return (
      <div className="min-h-screen bg-familiar-50 text-gray-900 pb-20">
        <Suspense fallback={<Loading />}>
          <div className="p-4 max-w-2xl mx-auto">
            {currentView === AppView.HOME && <Home onNavigate={setCurrentView} />}
            {currentView === AppView.PETS && <PetManagement />}
            {currentView === AppView.REMINDERS && <Reminders />}
            {currentView === AppView.ASSISTANT && <AiAssistant />}
            {currentView === AppView.NEARBY && <NearbyPlaces />}
            {currentView === AppView.PROFILE && <Profile userRole={userRole} onUpgrade={() => {}} onLogout={handleLogout} />}
          </div>
        </Suspense>
        <PetParentNav 
          currentView={currentView}
          onChangeView={setCurrentView}
          onModeSwitch={handleModeSwitch}
        />
      </div>
    );
  }

  // Fallback
  return (
    <Suspense fallback={<Loading />}>
      <DropsFeed />
    </Suspense>
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
