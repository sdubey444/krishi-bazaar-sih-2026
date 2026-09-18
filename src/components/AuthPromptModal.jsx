import React from 'react';
import { LogIn, UserPlus, X, Lock, ShieldCheck, ShoppingBag, Mic, Store, ArrowRight } from 'lucide-react';

export default function AuthPromptModal({
  isOpen,
  onClose,
  title = 'Please Log In or Create an Account',
  message = 'Please create an account or log in to continue.',
  actionType = 'general', // 'marketplace' | 'voice' | 'order' | 'general'
  onCreateAccount,
  onLogin
}) {
  if (!isOpen) return null;

  const getActionIcon = () => {
    switch (actionType) {
      case 'marketplace':
        return <Store className="w-7 h-7 text-brand-600" />;
      case 'voice':
        return <Mic className="w-7 h-7 text-amber-500 animate-pulse" />;
      case 'order':
        return <ShoppingBag className="w-7 h-7 text-blue-600" />;
      default:
        return <Lock className="w-7 h-7 text-brand-600" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto shadow-xs">
            {getActionIcon()}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
              {message}
            </p>
          </div>
        </div>

        {/* Action Highlights */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Why sign in?</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Krishi Bazaar connects verified farmers and genuine buyers directly. An account ensures secure order tracking, transparent pricing, and direct communication.
          </p>
        </div>

        {/* Two Obvious Actions: Create Account & Login */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={onCreateAccount}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors text-center"
          >
            Cancel and continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}
