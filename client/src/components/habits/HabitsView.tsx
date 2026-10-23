import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Habit, API } from '../../services/api';
import { Translations, Language } from '../../i18n/translations';
import {
  Flame,
  Plus,
  Check,
  Calendar,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';

interface HabitsViewProps {
  t: Translations;
  language: Language;
  theme: string;
}

const HABIT_COLORS = ['#38BDF8', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export const HabitsView: React.FC<HabitsViewProps> = ({ t, theme }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [color, setColor] = useState('#38BDF8');

  const isSophia = theme === 'sophia';

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setIsLoading(true);
    try {
      const data = await API.getHabits();
      setHabits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateHabit = async () => {
    if (!title.trim()) return;
    try {
      await API.createHabit({ title: title.trim(), frequency, color });
      setTitle('');
      setIsModalOpen(false);
      loadHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleHabit = async (habit: Habit) => {
    try {
      const res = await API.toggleHabit(habit.id);
      if (res.completed) {
        // Trigger celebratory confetti animation!
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#00DFD8', '#7928CA', '#FFD700', '#10B981']
        });
      }
      loadHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHabit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this habit?')) {
      await API.deleteHabit(id);
      loadHabits();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-black flex items-center gap-2 ${
            theme === 'light' ? 'text-slate-900' : 'text-slate-100'
          }`}>
            <Flame className="w-7 h-7 text-amber-500" />
            {t.habits.title}
          </h1>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{t.habits.subtitle}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
            isSophia
              ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white hover:shadow-glow-gold'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          <Plus size={18} />
          <span>{t.habits.addHabit}</span>
        </button>
      </div>

      {/* Habits Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">{t.common.loading}</div>
      ) : habits.length === 0 ? (
        <div className={`py-20 text-center rounded-3xl border border-dashed p-8 ${
          theme === 'light' ? 'border-slate-300' : 'border-white/10'
        }`}>
          <Flame size={42} className={`mx-auto mb-3 ${theme === 'light' ? 'text-slate-300' : 'text-slate-600'}`} />
          <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{t.habits.noHabits}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((h) => (
            <div
              key={h.id}
              onClick={() => handleToggleHabit(h)}
              style={{ borderTopColor: h.color, borderTopWidth: '3px' }}
              className="group cursor-pointer rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between app-card hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {h.frequency === 'daily' ? t.habits.daily : t.habits.weekly}
                  </span>
                  <button
                    onClick={(e) => handleDeleteHabit(h.id, e)}
                    className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      theme === 'light' ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-red-400'
                    }`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h3 className={`font-bold text-base mb-2 ${
                  theme === 'light' ? 'text-slate-900' : 'text-slate-100'
                }`}>{h.title}</h3>

                <div className="flex items-center gap-1.5 text-xs font-black text-amber-500">
                  <Flame size={16} />
                  <span>
                    {h.current_streak} {t.habits.streakDays}
                  </span>
                </div>
              </div>

              {/* Completion Toggle Button */}
              <div className={`mt-5 pt-3 border-t flex items-center justify-between ${
                theme === 'light' ? 'border-slate-100' : 'border-white/5'
              }`}>
                <span className={`text-xs font-medium ${
                  theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {h.is_completed_today ? t.habits.todayCompleted : t.habits.markDone}
                </span>

                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                    h.is_completed_today
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                      : 'bg-white/10 hover:bg-white/20 text-slate-400'
                  }`}
                >
                  <Check size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 space-y-4 border app-modal">
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-base ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{t.habits.addHabit}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={theme === 'light' ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'}
              >
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.habits.habitTitlePlaceholder}
              className={`w-full rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors ${
                theme === 'light'
                  ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-400'
              }`}
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  frequency === 'daily'
                    ? theme === 'light'
                      ? 'bg-amber-50 text-amber-700 border-amber-400'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {t.habits.daily}
              </button>
              <button
                type="button"
                onClick={() => setFrequency('weekly')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  frequency === 'weekly'
                    ? theme === 'light'
                      ? 'bg-amber-50 text-amber-700 border-amber-400'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {t.habits.weekly}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{t.notes.color}:</span>
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full border-2 ${
                    color === c ? 'border-sky-500 scale-110 shadow-sm' : 'border-transparent'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 text-xs font-bold transition-colors ${
                  theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.notes.cancel}
              </button>
              <button
                onClick={handleCreateHabit}
                className="px-5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs shadow-md"
              >
                {t.notes.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
