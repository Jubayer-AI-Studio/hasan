import React, { useState, useEffect } from 'react';
import { TRANSLATIONS, Language } from './i18n/translations';
import { API, UserProfile, Note, Task, Habit, ExpenseSummary } from './services/api';
import { DashboardView } from './components/dashboard/DashboardView';
import { NotesView } from './components/notes/NotesView';
import { TasksView } from './components/tasks/TasksView';
import { HabitsView } from './components/habits/HabitsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { SettingsView } from './components/settings/SettingsView';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { DhakaClock } from './components/common/DhakaClock';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Flame,
  Wallet,
  Settings,
  Bot,
  Languages,
  Palette,
  Sparkles,
  Smartphone,
  X
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'notes' | 'tasks' | 'habits' | 'expenses' | 'ai' | 'settings'
  >('dashboard');
  const [language, setLanguage] = useState<Language>('bn');
  const [theme, setTheme] = useState<'dark' | 'light' | 'sophia'>('sophia');
  const [profile, setProfile] = useState<UserProfile>({
    id: 1,
    name: 'Hasan',
    avatar_url: '',
    language: 'bn',
    theme: 'sophia',
    gemini_api_key: '',
    mascot_enabled: true,
    mascot_muted: false
  });

  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary | null>(null);

  // Mobile PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';
  const isSophia = theme === 'sophia';

  useEffect(() => {
    loadInitialData();

    // Check if running as installed PWA
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Sync HTML root attributes with language & theme
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.className = `theme-${theme}`;
  }, [language, theme, isRTL]);

  const loadInitialData = async () => {
    try {
      const [profData, notesData, tasksData, habitsData, summaryData] = await Promise.all([
        API.getProfile().catch(() => null),
        API.getNotes().catch(() => []),
        API.getTasks().catch(() => []),
        API.getHabits().catch(() => []),
        API.getExpenseSummary().catch(() => null)
      ]);

      if (profData) {
        setProfile(profData);
        setLanguage(profData.language || 'bn');
        setTheme(profData.theme || 'sophia');
      }
      setNotes(notesData || []);
      setTasks(tasksData || []);
      setHabits(habitsData || []);
      setExpenseSummary(summaryData);
    } catch (err) {
      console.error('Initial data load error:', err);
    }
  };

  const handleUpdateLanguage = async (newLang: Language) => {
    setLanguage(newLang);
    await API.updateProfile({ language: newLang });
  };

  const handleUpdateTheme = async (newTheme: 'dark' | 'light' | 'sophia') => {
    setTheme(newTheme);
    await API.updateProfile({ theme: newTheme });
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowInstallGuide(true);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'notes', label: t.nav.notes, icon: FileText },
    { id: 'tasks', label: t.nav.tasks, icon: CheckSquare },
    { id: 'habits', label: t.nav.habits, icon: Flame },
    { id: 'expenses', label: t.nav.expenses, icon: Wallet },
    {
      id: 'ai',
      label: language === 'bn' ? 'হাসান এআই' : language === 'ar' ? 'روبوت حسن' : 'Hasan AI',
      icon: Bot
    },
    { id: 'settings', label: t.nav.settings, icon: Settings }
  ] as const;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isSophia
          ? 'bg-[#070814] text-slate-100'
          : theme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Sophia Mode Radiant Ambient Glow Overlays */}
      {isSophia && (
        <>
          <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="fixed bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />
        </>
      )}

      {/* TOP NAVIGATION BAR */}
      <header
        className={`sticky top-0 z-30 px-3 sm:px-6 md:px-8 py-3 border-b flex items-center justify-between app-nav ${
          isSophia
            ? 'sophia-glass-nav'
            : theme === 'dark'
            ? 'bg-[#0E1524] border-[#243147] shadow-sm'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Logo & Tagline */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-0.5 shadow-glow-cyan flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-300 animate-float" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight flex items-center gap-1.5">
              <span>{t.appName}</span>
              {isSophia && <Sparkles size={14} className="text-amber-400" />}
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Header Right Actions: Install Button, AI Shortcut, Language & Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Prominent Mobile/Desktop PWA Install Button */}
          <button
            onClick={handleInstallClick}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              isInstalled
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : isSophia
                ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-glow-cyan'
                : theme === 'light'
                ? 'bg-sky-600 hover:bg-sky-700 text-white'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
            }`}
            title={t.pwa.installApp}
          >
            <Smartphone size={14} className={isInstalled ? 'text-emerald-400' : 'text-slate-950 sm:text-slate-950'} />
            <span className="text-[11px] sm:text-xs">
              {isInstalled ? (language === 'bn' ? 'ইনস্টল করা আছে' : t.pwa.installed) : (language === 'bn' ? 'অ্যাপ ইনস্টল' : t.pwa.installApp)}
            </span>
          </button>

          {/* AI Robot Tab Quick Switcher Pill */}
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-2xl text-xs font-bold transition-all border ${
              activeTab === 'ai'
                ? isSophia
                  ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                  : theme === 'light'
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-sky-500/25 text-sky-300 border-sky-400'
                : isSophia
                ? 'bg-white/5 text-slate-300 border-white/10 hover:border-cyan-500/40'
                : theme === 'light'
                ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="হাসান এআই ট্যাব"
          >
            <Bot size={14} className={activeTab === 'ai' ? 'text-cyan-400 animate-pulse' : 'text-slate-400'} />
            <span className="text-[11px] hidden md:inline">
              {language === 'bn' ? 'হাসান এআই' : 'Hasan AI'}
            </span>
          </button>

          {/* Language Switcher */}
          <div
            className={`flex items-center rounded-2xl p-0.5 text-xs transition-colors ${
              theme === 'light'
                ? 'bg-slate-100 border border-slate-200'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            <Languages
              size={13}
              className={`mx-1.5 hidden sm:block ${
                theme === 'light' ? 'text-sky-600' : 'text-cyan-400'
              }`}
            />
            {(['bn', 'en'] as const).map((langKey) => (
              <button
                key={langKey}
                onClick={() => handleUpdateLanguage(langKey)}
                className={`px-2 py-1 rounded-xl font-bold uppercase transition-all text-[10px] ${
                  language === langKey
                    ? theme === 'light'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-cyan-500 text-slate-950 shadow-sm'
                    : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {langKey}
              </button>
            ))}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() =>
              handleUpdateTheme(
                theme === 'sophia' ? 'dark' : theme === 'dark' ? 'light' : 'sophia'
              )
            }
            className={`p-1.5 rounded-2xl border transition-all ${
              theme === 'light'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
            }`}
            title={`বর্তমান থিম: ${theme}`}
          >
            <Palette size={14} />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 gap-6">
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-start ${
                  isActive
                    ? isSophia
                      ? 'sophia-glow-pill text-cyan-200 shadow-glow-cyan'
                      : theme === 'dark'
                      ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/30'
                      : 'bg-sky-600 text-white shadow-md'
                    : theme === 'dark'
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Icon
                  size={18}
                  className={
                    isActive
                      ? theme === 'dark'
                        ? 'text-slate-950'
                        : 'text-white'
                      : theme === 'light'
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* ACTIVE CONTENT VIEW */}
        <main className="flex-1 min-w-0 pb-20 md:pb-6 space-y-4">
          
          {/* REAL-TIME BANGLADESH DHAKA CLOCK & CALENDAR (At the beginning of app!) */}
          <DhakaClock theme={theme} />

          {/* ACTIVE TAB VIEWS */}
          {activeTab === 'dashboard' && (
            <DashboardView
              t={t}
              language={language}
              theme={theme}
              profile={profile}
              notes={notes}
              tasks={tasks}
              habits={habits}
              expenseSummary={expenseSummary}
              onNavigate={(tab) => setActiveTab(tab as any)}
              onRefresh={loadInitialData}
            />
          )}

          {activeTab === 'notes' && (
            <NotesView t={t} language={language} theme={theme} />
          )}

          {activeTab === 'tasks' && (
            <TasksView t={t} language={language} theme={theme} />
          )}

          {activeTab === 'habits' && (
            <HabitsView t={t} language={language} theme={theme} />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView t={t} language={language} theme={theme} />
          )}

          {activeTab === 'ai' && (
            <AIAssistantView
              t={t}
              language={language}
              theme={theme}
              onRefreshData={loadInitialData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              t={t}
              language={language}
              theme={theme}
              profile={profile}
              onUpdateLanguage={handleUpdateLanguage}
              onUpdateTheme={handleUpdateTheme}
              onUpdateProfile={(p) => setProfile(p)}
              onRefreshData={loadInitialData}
              onTriggerInstall={handleInstallClick}
              isPWAInstalled={isInstalled}
            />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 px-2 py-2 border-t flex items-center justify-around ${
          isSophia
            ? 'sophia-glass-nav'
            : theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center gap-1 p-1 transition-colors ${
                isActive
                  ? isSophia
                    ? 'text-cyan-400 font-bold'
                    : 'text-sky-500 font-bold'
                  : 'text-slate-400'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE FLOATING CUTE ROBOT BUDDY PILL (Always visible on mobile to see the robot!) */}
      {activeTab !== 'ai' && (
        <button
          onClick={() => setActiveTab('ai')}
          className="md:hidden fixed bottom-16 right-4 z-40 px-3 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 shadow-[0_4px_20px_rgba(0,223,216,0.45)] flex items-center gap-2 font-black text-xs active:scale-95 transition-all border border-cyan-200/60"
          title="হাসান রোবটের সাথে কথা বলুন"
        >
          <div className="w-5 h-5 rounded-lg bg-slate-950 flex items-center justify-center text-cyan-300">
            <Bot size={13} className="animate-bounce" />
          </div>
          <span>{language === 'bn' ? 'হাসান রোবট' : 'Hasan Robot'}</span>
        </button>
      )}

      {/* PWA INSTALLATION GUIDE MODAL (FOR MOBILE & DESKTOP) */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 space-y-4 border app-modal shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3
                  className={`font-bold text-base ${
                    theme === 'light' ? 'text-slate-900' : 'text-slate-100'
                  }`}
                >
                  {t.pwa.installApp}
                </h3>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className={`p-1 rounded-xl transition-colors ${
                  theme === 'light'
                    ? 'text-slate-400 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <p
              className={`text-xs ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              {t.pwa.installDesc}
            </p>

            <div
              className={`p-4 rounded-2xl space-y-2.5 text-xs border ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              <div>
                <p className="font-bold text-cyan-400 flex items-center gap-1">
                  📱 Android / Chrome / Edge:
                </p>
                <p className="mt-0.5 opacity-90">
                  ব্রাউজারের উপরের মেনু বা এই বাটনে চাপ দিন:
                </p>
                <button
                  onClick={handleInstallClick}
                  className="mt-2 w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Smartphone size={14} />
                  <span>এখনই মোবাইলে ইনস্টল করুন</span>
                </button>
              </div>

              <div className="pt-2 border-t border-white/5">
                <p className="font-bold text-purple-400 flex items-center gap-1">
                  🍎 iPhone / iPad (Safari):
                </p>
                <p className="mt-0.5 opacity-90">{t.pwa.howToIOS}</p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
