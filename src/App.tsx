import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WhyAttendSection } from './components/WhyAttendSection';
import { WebinarSeriesSection } from './components/WebinarSeriesSection';
import { PricingAndStepsSection } from './components/PricingAndStepsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { DetailModal } from './components/DetailModal';
import { RegistrationModal } from './components/RegistrationModal';
import { PublicStatusCheckModal } from './components/PublicStatusCheckModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { Toast } from './components/Toast';
import { WebinarSeries } from './types';
import { BANK_DETAILS } from './data/webinarData';

export default function App() {
  const [view, setView] = useState<'public' | 'admin'>(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin' ? 'admin' : 'public';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isStatusCheckOpen, setIsStatusCheckOpen] = useState(false);
  const [initialCheckNik, setInitialCheckNik] = useState('');

  const [selectedDetailSeries, setSelectedDetailSeries] = useState<WebinarSeries | null>(null);
  const [preselectedSeriesTitle, setPreselectedSeriesTitle] = useState<string>('ONKOLOGI');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    // Sync live maintenance configuration from Supabase DB
    import('./data/webinarData').then(mod => {
      mod.fetchMaintenanceConfigFromDB();
    });

    // Check URL params for ?nik=... or #cek-status
    const urlParams = new URLSearchParams(window.location.search);
    const nikParam = urlParams.get('nik');
    if (nikParam) {
      setInitialCheckNik(nikParam);
      setIsStatusCheckOpen(true);
    } else if (window.location.hash === '#cek-status' || window.location.hash === '#invoice') {
      setIsStatusCheckOpen(true);
    }

    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setView('admin');
      } else {
        setView('public');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setView('admin');
  };

  const navigateToPublic = () => {
    window.history.pushState({}, '', '/');
    setView('public');
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setToastMsg(`Nomor Rekening Mandiri ${BANK_DETAILS.accountNumber} berhasil disalin!`);
  };

  const handleOpenRegisterWithSeries = (seriesTitle: string) => {
    setPreselectedSeriesTitle(seriesTitle);
    setIsRegisterOpen(true);
  };

  // Render Admin View
  if (view === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
          onBackToHome={navigateToPublic}
        />
      );
    }
    return (
      <AdminDashboard
        onLogout={() => {
          sessionStorage.removeItem('admin_auth');
          setIsAdminAuthenticated(false);
        }}
        onGoToPublic={navigateToPublic}
      />
    );
  }

  // Render Public View
  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-red-500 selection:text-white">
      {/* Navbar Header */}
      <Navbar 
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenCheckStatus={() => setIsStatusCheckOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection onOpenRegister={() => setIsRegisterOpen(true)} />

        {/* Why Attend & Latar Belakang Section */}
        <WhyAttendSection />

        {/* 4 Series Webinar Section */}
        <WebinarSeriesSection onSelectSeries={(series) => setSelectedDetailSeries(series)} />

        {/* Pricing & Steps Section */}
        <PricingAndStepsSection
          onOpenRegister={() => setIsRegisterOpen(true)}
          onCopyAccount={handleCopyAccount}
        />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer 
        onOpenAdmin={navigateToAdmin} 
        onOpenCheckStatus={() => setIsStatusCheckOpen(true)}
      />

      {/* Interactive Detail Modal */}
      <DetailModal
        series={selectedDetailSeries}
        onClose={() => setSelectedDetailSeries(null)}
        onOpenRegisterForSeries={handleOpenRegisterWithSeries}
      />

      {/* Interactive Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        preselectedSeriesTitle={preselectedSeriesTitle}
        onCopyAccount={handleCopyAccount}
        onSuccessToast={(msg) => setToastMsg(msg)}
      />

      {/* Public Self-Service Status Check & Invoice Modal (No Login) */}
      <PublicStatusCheckModal
        isOpen={isStatusCheckOpen}
        onClose={() => setIsStatusCheckOpen(false)}
        initialNik={initialCheckNik}
      />

      {/* Toast Notification */}
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </div>
  );
}
