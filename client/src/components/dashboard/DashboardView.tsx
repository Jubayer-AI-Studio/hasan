import React, { useState, Suspense } from 'react';
import { UserProfile, Note, Task, Habit, ExpenseSummary, API } from '../../services/api';
import { Translations, Language } from '../../i18n/translations';
import { speechService } from '../../services/speechService';
import {
  Sparkles,
  CheckCircle2,
  Flame,
  Wallet,
  Mic,
  MicOff,
  Radio,
  FileText,
  ArrowRight,
  TrendingUp,
  Clock,
  Send,
  Plus,
  MessageSquare,
  Bot
} from 'lucide-react';
import { HasanRobot3D } from '../mascot/HasanRobot3D';

interface DashboardViewProps {
  t: Translations;
  language: Language;
  theme: string;
  profile: UserProfile;
  notes: Note[];
  tasks: Task[];
  habits: Habit[];
  expenseSummary: ExpenseSummary | null;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  t,
  language,
  theme,
  profile,
  notes,
  tasks,
  habits,
  expenseSummary,
  onNavigate,
  onRefresh
}) => {
  const [quickVoiceText, setQuickVoiceText] = useState('');
  const [isRecordingQuickVoice, setIsRecordingQuickVoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSophia = theme === 'sophia';
  const isLight = theme === 'light';

  // Greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t.greetings.morning;
    if (hour >= 12 && hour < 17) return t.greetings.afternoon;
    if (hour >= 17 && hour < 21) return t.greetings.evening;
    return t.greetings.night;
  };

  const pendingTasks = tasks.filter((t) => !t.is_completed);
  const completedHabitsToday = habits.filter((h) => h.is_completed_today);
  const recentNotes = notes.slice(0, 3);

  // Quick Voice Capture Handler
  const handleToggleQuickVoice = () => {
    if (isRecordingQuickVoice) {
      speechService.stopListening();
      setIsRecordingQuickVoice(false);
      return;
    }

    if (!speechService.isSTTSupported()) {
      alert(t.notes.micNotSupported);
      return;
    }

    setIsRecordingQuickVoice(true);
    speechService.startListening(
      language,
      (transcript, _isFinal) => {
        setQuickVoiceText(transcript);
      },
      () => {
        setIsRecordingQuickVoice(false);
      }
    );
  };

  const handleSaveQuickVoice = async (asType: 'note' | 'task') => {
    if (!quickVoiceText.trim()) return;
    setIsSubmitting(true);
    try {
      if (asType === 'task') {
        await API.createTask({ title: quickVoiceText.trim(), priority: 'medium' });
      } else {
        await API.createNote({
          title: quickVoiceText.trim().slice(0, 30) + (quickVoiceText.length > 30 ? '...' : ''),
          content: quickVoiceText.trim(),
          tags: ['voice-capture']
        });
      }
      setQuickVoiceText('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HERO SECTION: Personal Greeting & Avatar */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
          isSophia
            ? 'sophia-glass-card border-cyan-500/30'
            : isLight
            ? 'bg-gradient-to-r from-sky-50 via-indigo-50/70 to-purple-50 border border-sky-100 shadow-md'
            : 'bg-gradient-to-r from-[#141C2B] via-[#0E1524] to-[#141C2B] border border-[#2B3A52] shadow-xl'
        }`}
      >
        {/* Glowing Background Radial */}
        {isSophia && (
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        )}

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl p-0.5 shadow-md ${
              isSophia
                ? 'bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600'
                : isLight
                ? 'bg-gradient-to-tr from-sky-400 to-indigo-500'
                : 'bg-gradient-to-tr from-sky-500 to-indigo-600'
            }`}>
              <div className={`w-full h-full rounded-2xl flex items-center justify-center font-black text-2xl md:text-3xl ${
                isLight ? 'bg-white text-sky-600' : 'bg-slate-900 text-cyan-300'
              }`}>
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 flex items-center justify-center ${
              isLight ? 'border-white' : 'border-slate-900'
            }`}>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <div>
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'text-sky-700' : 'text-cyan-400'
            }`}>
              <Sparkles size={13} />
              {getGreeting()}
            </span>
            <h1 className={`text-2xl md:text-4xl font-black tracking-tight mt-0.5 ${
              isLight ? 'text-slate-900' : 'text-slate-100'
            }`}>
              {profile.name}
            </h1>
            <p className={`text-xs mt-1 max-w-md ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              {t.dashboard.dailyBriefingDesc}
            </p>
          </div>
        </div>

        {/* Cute Mascot Showcase on Dashboard Hero Card */}
        <div
          onClick={() => onNavigate('ai')}
          className="cursor-pointer group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 self-stretch md:self-auto hover:scale-[1.02] active:scale-95"
          style={{
            background: isSophia
              ? 'linear-gradient(135deg, rgba(0, 223, 216, 0.12), rgba(121, 40, 202, 0.15))'
              : isLight
              ? '#ffffff'
              : 'rgba(255, 255, 255, 0.05)',
            borderColor: isSophia ? 'rgba(0, 223, 216, 0.35)' : isLight ? '#bae6fd' : 'rgba(255, 255, 255, 0.12)'
          }}
          title="হাসান রোবটের সাথে কথা বলতে ট্যাপ করুন"
        >
          {/* Mascot Canvas */}
          <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] flex items-center justify-center shrink-0 relative">
            <HasanRobot3D
              state="idle"
              isSophiaMode={isSophia}
              theme={theme as any}
              size={110}
            />
          </div>

          {/* Speech Bubble & Quick Talk CTA */}
          <div className="flex flex-col items-start space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                হাসান রোবট এআই
              </span>
            </div>

            <p className="text-xs font-bold leading-tight">
              {language === 'bn'
                ? 'হাই! আমি আপনার কিউট এআই সঙ্গী।'
                : language === 'ar'
                ? 'أهلاً! أنا رفيقك الذكي.'
                : 'Hi! I am your AI companion.'}
            </p>

            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm transition-colors">
              <MessageSquare size={12} />
              <span>{language === 'bn' ? 'কথা বলুন ➔' : 'Chat Now ➔'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* QUICK VOICE CAPTURE BAR */}
      <div
        className={`rounded-3xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-3 transition-all app-card ${
          isSophia ? 'border-purple-500/30' : ''
        }`}
      >
        <button
          onClick={handleToggleQuickVoice}
          className={`shrink-0 p-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all ${
            isRecordingQuickVoice
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
              : isSophia
              ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-200 border border-cyan-400/40 hover:border-cyan-400'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
          }`}
          title={t.dashboard.quickCapture}
        >
          {isRecordingQuickVoice ? <MicOff size={20} /> : <Mic size={20} />}
          <span className="text-xs hidden sm:inline">
            {isRecordingQuickVoice ? t.notes.stopRecording : t.dashboard.quickCapture}
          </span>
        </button>

        <input
          type="text"
          value={quickVoiceText}
          onChange={(e) => setQuickVoiceText(e.target.value)}
          placeholder={t.notes.noteContentPlaceholder}
          className={`flex-1 w-full rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors ${
            isLight
              ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
              : 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-400'
          }`}
        />

        {quickVoiceText.trim() && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSaveQuickVoice('note')}
              disabled={isSubmitting}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              + {t.nav.notes}
            </button>
            <button
              onClick={() => handleSaveQuickVoice('task')}
              disabled={isSubmitting}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md ${
                isSophia ? 'bg-cyan-500 hover:bg-cyan-400' : 'bg-cyan-600 hover:bg-cyan-500'
              }`}
            >
              + {t.nav.tasks}
            </button>
          </div>
        )}
      </div>

      {/* THREE KEY STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Tasks */}
        <div
          onClick={() => onNavigate('tasks')}
          className="cursor-pointer rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 app-card group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isLight ? 'bg-sky-100 text-sky-600' : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              <CheckCircle2 size={20} />
            </div>
            <span className={`text-xs flex items-center gap-1 font-semibold ${
              isLight ? 'text-slate-500 group-hover:text-sky-600' : 'text-slate-400 group-hover:text-cyan-400'
            }`}>
              {t.dashboard.completeTasksPrompt}
              <ArrowRight size={12} className="rtl:rotate-180" />
            </span>
          </div>
          <span className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            {pendingTasks.length}
          </span>
          <p className={`text-xs mt-1 font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {t.dashboard.pendingTasks}
          </p>
        </div>

        {/* Habits Streak */}
        <div
          onClick={() => onNavigate('habits')}
          className="cursor-pointer rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 app-card group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Flame size={20} />
            </div>
            <span className="text-xs text-amber-500 font-extrabold">
              {completedHabitsToday.length} / {habits.length}
            </span>
          </div>
          <span className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            {habits.reduce((acc, h) => Math.max(acc, h.current_streak), 0)} 🔥
          </span>
          <p className={`text-xs mt-1 font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {t.dashboard.habitStreaks}
          </p>
        </div>

        {/* Monthly Expenses */}
        <div
          onClick={() => onNavigate('expenses')}
          className="cursor-pointer rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 app-card group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isLight ? 'bg-purple-100 text-purple-600' : 'bg-purple-500/20 text-purple-400'
            }`}>
              <Wallet size={20} />
            </div>
            <span className="text-xs text-purple-500 font-extrabold flex items-center gap-1">
              <TrendingUp size={12} />
              {expenseSummary ? `${expenseSummary.total_expense} ৳` : '0 ৳'}
            </span>
          </div>
          <span className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            {expenseSummary ? `${expenseSummary.net_balance} ৳` : '0 ৳'}
          </span>
          <p className={`text-xs mt-1 font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {t.dashboard.monthlyBalance}
          </p>
        </div>
      </div>

      {/* RECENT VOICE & TEXT NOTES OVERVIEW */}
      <div
        className={`rounded-3xl p-6 app-card ${
          isSophia ? 'sophia-glass-card' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-base font-bold flex items-center gap-2 ${
            isLight ? 'text-slate-900' : 'text-slate-100'
          }`}>
            <FileText size={18} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />
            {t.dashboard.recentVoiceNotes}
          </h2>

          <button
            onClick={() => onNavigate('notes')}
            className={`text-xs font-bold flex items-center gap-1 transition-colors ${
              isLight ? 'text-sky-600 hover:text-sky-700' : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            {t.dashboard.viewAllNotes}
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <p className={`text-xs py-6 text-center ${
            isLight ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {t.dashboard.noRecentNotes}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentNotes.map((n) => (
              <div
                key={n.id}
                onClick={() => onNavigate('notes')}
                className="p-4 rounded-2xl app-subcard cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-bold text-sm line-clamp-1 ${
                    isLight ? 'text-slate-900' : 'text-slate-200'
                  }`}>
                    {n.title}
                  </h4>
                  {n.audios && n.audios.length > 0 && (
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                      isLight ? 'text-sky-600' : 'text-cyan-400'
                    }`}>
                      <Radio size={10} />
                      {n.audios.length}
                    </span>
                  )}
                </div>
                <p className={`text-xs line-clamp-2 ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
