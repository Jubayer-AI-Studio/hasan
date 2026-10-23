import React, { useState, useEffect } from 'react';
import { Task, API } from '../../services/api';
import { Translations, Language } from '../../i18n/translations';
import {
  CheckSquare,
  Plus,
  Check,
  Calendar,
  Tag,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';

interface TasksViewProps {
  t: Translations;
  language: Language;
  theme: string;
}

export const TasksView: React.FC<TasksViewProps> = ({ t, theme }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('general');
  const [dueDate, setDueDate] = useState('');

  const isSophia = theme === 'sophia';

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await API.getTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim()) return;
    try {
      await API.createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        due_date: dueDate || undefined
      });
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await API.toggleTask(id);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await API.deleteTask(id);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black flex items-center gap-2 ${
            theme === 'light' ? 'text-slate-900' : 'text-slate-100'
          }`}>
            <CheckSquare className={`w-7 h-7 ${theme === 'light' ? 'text-sky-600' : 'text-cyan-400'}`} />
            {t.tasks.title}
          </h1>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{t.tasks.subtitle}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
            isSophia
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-glow-cyan'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          <Plus size={18} />
          <span>{t.tasks.addTask}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className={`flex items-center gap-2 border-b pb-3 ${
        theme === 'light' ? 'border-slate-200' : 'border-white/10'
      }`}>
        {(['all', 'active', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
              filter === tab
                ? theme === 'light'
                  ? 'bg-sky-50 text-sky-700 border border-sky-300'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : theme === 'light'
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.tasks[tab]}
          </button>
        ))}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">{t.common.loading}</div>
      ) : filteredTasks.length === 0 ? (
        <div className={`py-20 text-center rounded-3xl border border-dashed p-8 ${
          theme === 'light' ? 'border-slate-300' : 'border-white/10'
        }`}>
          <CheckSquare size={42} className={`mx-auto mb-3 ${theme === 'light' ? 'text-slate-300' : 'text-slate-600'}`} />
          <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{t.tasks.noTasks}</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`group cursor-pointer rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-200 ${
                task.is_completed ? 'opacity-60 bg-white/[0.02]' : ''
              } app-card`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    task.is_completed
                      ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                      : theme === 'light'
                      ? 'border-slate-300 hover:border-sky-500 text-transparent'
                      : 'border-slate-500 hover:border-cyan-400 text-transparent'
                  }`}
                >
                  <Check size={14} strokeWidth={3} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-bold truncate ${
                      task.is_completed
                        ? 'line-through text-slate-400'
                        : theme === 'light'
                        ? 'text-slate-900 group-hover:text-sky-600'
                        : 'text-slate-100 group-hover:text-cyan-300'
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-xs truncate mt-0.5 ${
                      theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}>{task.description}</p>
                  )}
                </div>
              </div>

              {/* Priority & Due Date Badges */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.priority === 'high'
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}
                >
                  {t.tasks[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}` as keyof typeof t.tasks]}
                </span>

                {task.due_date && (
                  <span className={`text-[11px] flex items-center gap-1 hidden sm:flex ${
                    theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    <Calendar size={12} />
                    {task.due_date}
                  </span>
                )}

                <button
                  onClick={(e) => handleDeleteTask(task.id, e)}
                  className={`p-1.5 transition-opacity opacity-0 group-hover:opacity-100 ${
                    theme === 'light' ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-red-400'
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 space-y-4 border app-modal">
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-base ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                {t.tasks.addTask}
              </h3>
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
              placeholder={t.tasks.taskPlaceholder}
              className={`w-full rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors ${
                theme === 'light'
                  ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-400'
              }`}
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)..."
              rows={3}
              className={`w-full rounded-2xl p-4 text-xs focus:outline-none focus:border-cyan-500 resize-none transition-colors ${
                theme === 'light'
                  ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                  : 'bg-white/5 border border-white/10 text-slate-200 placeholder-slate-400'
              }`}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[11px] mb-1 block ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t.tasks.priority}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className={`w-full rounded-xl px-3 py-2 text-xs transition-colors ${
                    theme === 'light'
                      ? 'bg-slate-50 border border-slate-200 text-slate-800'
                      : 'bg-slate-800 border border-white/10 text-slate-200'
                  }`}
                >
                  <option value="high">{t.tasks.priorityHigh}</option>
                  <option value="medium">{t.tasks.priorityMedium}</option>
                  <option value="low">{t.tasks.priorityLow}</option>
                </select>
              </div>

              <div>
                <label className={`text-[11px] mb-1 block ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t.tasks.dueDate}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs transition-colors ${
                    theme === 'light'
                      ? 'bg-slate-50 border border-slate-200 text-slate-800'
                      : 'bg-slate-800 border border-white/10 text-slate-200'
                  }`}
                />
              </div>
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
                onClick={handleCreateTask}
                className="px-5 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md"
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
