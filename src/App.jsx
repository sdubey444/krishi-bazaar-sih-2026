import React, { useState, useEffect } from 'react';
import { store } from './services/store';

// Components
import QuickRoleBar from './components/QuickRoleBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import KrishiAiModal from './components/KrishiAiModal';
import LogisticsRegisterModal from './components/LogisticsRegisterModal';
import { Mic, Sparkles } from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/Marketplace';
import BulkRequirement from './pages/BulkRequirement';
import OrderDetails from './pages/OrderDetails';
import LogisticsView from './pages/LogisticsView';
import MarketIntel from './pages/MarketIntel';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';

export default function App() {
  const [currentView, setCurrentViewState] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) return hash;
    }
    return 'landing';
  });
  const [currentUser, setCurrentUser] = useState(store.currentUser);
  const [selectedOrderId, setSelectedOrderId] = useState('ORD-2026-8812');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLogisticsRegisterOpen, setIsLogisticsRegisterOpen] = useState(false);
  const [defaultAiCropId, setDefaultAiCropId] = useState('wheat');

  // Keep browser history and URL hash in sync for proper Back/Forward navigation
  const setCurrentView = (nextView, replace = false) => {
    setCurrentViewState(nextView);
    if (typeof window !== 'undefined') {
      const targetHash = `#${nextView}`;
      if (window.location.hash !== targetHash) {
        if (replace) {
          window.history.replaceState({ view: nextView }, '', targetHash);
        } else {
          window.history.pushState({ view: nextView }, '', targetHash);
        }
      }
    }
  };

  // Handle browser Back / Forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial history state if not already set
    const currentHash = window.location.hash.replace('#', '').trim() || 'landing';
    window.history.replaceState({ view: currentHash }, '', `#${currentHash}`);

    const handlePopState = (event) => {
      const view = event.state?.view || window.location.hash.replace('#', '').trim() || 'landing';
      setCurrentViewState(view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    return store.subscribe(state => {
      setCurrentUser(state.currentUser);
    });
  }, []);

  const handleRoleChanged = (userId) => {
    // Intelligently guide view based on role
    const user = store.users.find(u => u.id === userId);
    if (user?.role === 'farmer') {
      setCurrentView('farmer-dashboard');
    } else if (user?.role === 'buyer') {
      setCurrentView('buyer-dashboard');
    } else if (user?.role === 'admin') {
      setCurrentView('admin-dashboard');
    }
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage
            setCurrentView={setCurrentView}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        );

      case 'marketplace':
        return (
          <Marketplace
            setCurrentView={setCurrentView}
            setSelectedOrderId={setSelectedOrderId}
          />
        );

      case 'bulk-requirement':
        return (
          <BulkRequirement
            setCurrentView={setCurrentView}
            setSelectedOrderId={setSelectedOrderId}
          />
        );

      case 'order-details':
        return (
          <OrderDetails
            orderId={selectedOrderId}
            setCurrentView={setCurrentView}
            setSelectedOrderId={setSelectedOrderId}
          />
        );

      case 'logistics':
        return (
          <LogisticsView
            setCurrentView={setCurrentView}
          />
        );

      case 'market-intel':
        return (
          <MarketIntel
            setCurrentView={setCurrentView}
            onOpenAiModal={(cropId) => {
              if (cropId && typeof cropId === 'string') {
                setDefaultAiCropId(cropId);
              }
              setIsAiModalOpen(true);
            }}
          />
        );

      case 'farmer-dashboard':
        return (
          <FarmerDashboard
            setCurrentView={setCurrentView}
            setSelectedOrderId={setSelectedOrderId}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        );

      case 'my-orders':
      case 'buyer-dashboard':
        return (
          <BuyerDashboard
            setCurrentView={setCurrentView}
            setSelectedOrderId={setSelectedOrderId}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            initialTab={currentView === 'my-orders' ? 'orders' : 'dashboard'}
          />
        );

      case 'admin-dashboard':
        return (
          <AdminDashboard
            setCurrentView={setCurrentView}
            setSelectedOrderId={setSelectedOrderId}
          />
        );

      case 'auth':
        return (
          <AuthPage
            setCurrentView={setCurrentView}
          />
        );

      default:
        return (
          <LandingPage
            setCurrentView={setCurrentView}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />
        );
    }
  };

  const handleAiNavigate = (targetView, params) => {
    if (params?.cropId) {
      setDefaultAiCropId(params.cropId);
    }
    setCurrentView(targetView);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans relative">
      {/* 1-Click Judge Role Switcher Banner */}
      <QuickRoleBar onRoleChange={handleRoleChanged} />

      {/* Main Responsive Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenLogisticsRegister={() => setIsLogisticsRegisterOpen(true)}
      />

      {/* Primary Content Router */}
      <main className="flex-1">
        {renderActiveView()}
      </main>

      {/* Platform Footer */}
      <Footer setCurrentView={setCurrentView} />

      {/* Floating Persistent Voice Assistant / Ask AI Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-brand-600 to-emerald-700 hover:from-emerald-500 hover:to-brand-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-brand-700/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white/30 group"
          title="Open Voice Search & Ask AI"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </div>
          <span>Voice Search / Ask AI</span>
        </button>
      </div>

      {/* Global Krishi AI Modal */}
      <KrishiAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        defaultCropId={defaultAiCropId}
        onNavigate={handleAiNavigate}
      />

      {/* Logistics Partner Registration Modal */}
      <LogisticsRegisterModal
        isOpen={isLogisticsRegisterOpen}
        onClose={() => setIsLogisticsRegisterOpen(false)}
      />
    </div>
  );
}
