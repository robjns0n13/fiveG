import React from 'react';
import { Wifi, Globe, Apple, Lock } from 'lucide-react';
import { Language, WiFiStatus } from '../types';
import { translations } from '../data/translations';

interface HeaderProps {
  status: WiFiStatus;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenMenuBar: () => void;
  isMenuBarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  lang,
  onLanguageChange,
  onOpenMenuBar,
  isMenuBarOpen,
}) => {
  const t = translations[lang];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center relative">
            <Wifi className="w-5 h-5 text-white" />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-slate-900">
              <Lock className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                {t.appTitle}
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  macOS Native Port
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Band Badge */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
            status.band === '5 GHz'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : status.band === '2.4 GHz'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              status.band === '5 GHz' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`} />
            <span>{status.currentSSID || 'No Network'} ({status.band})</span>
          </div>

          {/* Menu Bar Popover Button (macOS style preview) */}
          <button
            id="toggle-menubar-btn"
            onClick={onOpenMenuBar}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isMenuBarOpen
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                : 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border-slate-700'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.menuBarPreview}</span>
            <span className="sm:hidden">Menu Bar</span>
          </button>

          {/* Language Switch */}
          <button
            id="lang-switch-btn"
            onClick={() => onLanguageChange(lang === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            title="Switch Language (VI / EN)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
