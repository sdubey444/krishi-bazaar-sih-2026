import React, { useState, useEffect } from 'react';
import { i18n, SUPPORTED_LANGUAGES } from '../services/i18nService';
import { Globe, Check, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher({ compact = false }) {
  const [currentLang, setCurrentLang] = useState(i18n.getLanguage());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return i18n.subscribe(lang => {
      setCurrentLang(lang);
    });
  }, []);

  const activeMeta = i18n.getLanguageMeta(currentLang);

  const handleSelectLang = (code) => {
    i18n.setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-800 font-bold shadow-2xs ${
          compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs'
        }`}
        title="Select Language / भाषा चुनें (22 Indian Languages)"
      >
        <Globe className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <span className="truncate max-w-[80px]">{activeMeta.name}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-56 max-h-80 overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-1.5 space-y-0.5">
            <div className="px-2 py-1 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
              Select Language (22 Languages)
            </div>
            {SUPPORTED_LANGUAGES.map(lang => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLang(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                    isSelected
                      ? 'bg-brand-50 text-brand-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold">{lang.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {lang.englishName}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 ml-1" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
