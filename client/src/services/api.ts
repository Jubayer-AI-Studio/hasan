export interface NoteAudio {
  id: string;
  note_id: string;
  filename: string;
  filepath: string;
  duration_seconds: number;
  file_size_bytes: number;
  transcription: string;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  color: string;
  created_at: string;
  updated_at: string;
  audios?: NoteAudio[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  target_count: number;
  color: string;
  created_at: string;
  current_streak: number;
  is_completed_today: boolean;
  recent_logs: string[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  currency: string;
  date: string;
  notes: string;
  created_at: string;
}

export interface ExpenseSummary {
  month: string;
  total_income: number;
  total_expense: number;
  net_balance: number;
  category_breakdown: Record<string, number>;
}

export interface UserProfile {
  id: number;
  name: string;
  avatar_url: string;
  language: 'bn' | 'ar' | 'en';
  theme: 'dark' | 'light' | 'sophia';
  gemini_api_key: string;
  mascot_enabled: boolean;
  mascot_muted: boolean;
}

export interface AIResponseData {
  reply: string;
  actionTaken?: {
    type: string;
    data?: unknown;
  };
  source: 'local_engine' | 'gemini_flash';
}

const API_BASE = '/api';

// ========================================================
// LOCAL-FIRST OFFLINE FALLBACK ENGINE (For Vercel & PWA)
// ========================================================
const STORAGE_KEYS = {
  PROFILE: 'hasan_life_profile_v2',
  NOTES: 'hasan_life_notes_v2',
  TASKS: 'hasan_life_tasks_v2',
  HABITS: 'hasan_life_habits_v2',
  EXPENSES: 'hasan_life_expenses_v2'
};

// Purge legacy mock data from previous sessions if present
try {
  ['hasan_life_notes_v1', 'hasan_life_tasks_v1', 'hasan_life_habits_v1', 'hasan_life_expenses_v1'].forEach((k) => {
    localStorage.removeItem(k);
  });
} catch {
  // Ignore in SSR / restricted storage environments
}

const INITIAL_PROFILE: UserProfile = {
  id: 1,
  name: 'Hasan',
  avatar_url: '',
  language: 'bn',
  theme: 'sophia',
  gemini_api_key: '',
  mascot_enabled: true,
  mascot_muted: false
};

// Start 100% clean - zero mock or pre-seeded dummy records
const INITIAL_NOTES: Note[] = [];
const INITIAL_TASKS: Task[] = [];
const INITIAL_HABITS: Habit[] = [];
const INITIAL_EXPENSES: Expense[] = [];

function getLocalData<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return initial;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

// Convert audio blob to base64 data url for offline voice playback
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ========================================================
// API CONTROLLER WITH TRANSPARENT OFFLINE/LOCAL FALLBACK
// ========================================================
export const API = {
  // Profile
  async getProfile(): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/profile`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      setLocalData(STORAGE_KEYS.PROFILE, data.data);
      return data.data;
    } catch {
      return getLocalData(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    }
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const data = await res.json();
        setLocalData(STORAGE_KEYS.PROFILE, data.data);
        return data.data;
      }
    } catch {
      // Fallback
    }
    const current = getLocalData(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    const updated = { ...current, ...profile };
    setLocalData(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },

  // Notes
  async getNotes(params?: { search?: string; tag?: string; is_pinned?: boolean }): Promise<Note[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.tag) query.set('tag', params.tag);
      if (params?.is_pinned !== undefined) query.set('is_pinned', String(params.is_pinned));
      const res = await fetch(`${API_BASE}/notes?${query.toString()}`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      const notes = data.data || [];
      setLocalData(STORAGE_KEYS.NOTES, notes);
      return notes;
    } catch {
      const all = getLocalData<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
      return all.filter((n) => {
        if (params?.is_pinned !== undefined && n.is_pinned !== params.is_pinned) return false;
        if (params?.tag && !n.tags.includes(params.tag)) return false;
        if (params?.search) {
          const q = params.search.toLowerCase();
          return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
        }
        return true;
      });
    }
  },

  async createNote(note: { title: string; content: string; tags?: string[]; is_pinned?: boolean; color?: string }): Promise<Note> {
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }
    const all = getLocalData<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      is_pinned: note.is_pinned || false,
      color: note.color || '#1E293B',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      audios: []
    };
    all.unshift(newNote);
    setLocalData(STORAGE_KEYS.NOTES, all);
    return newNote;
  },

  async updateNote(id: string, note: Partial<Note>): Promise<Note> {
    try {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }
    const all = getLocalData<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const idx = all.findIndex((n) => n.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...note, updated_at: new Date().toISOString() };
      setLocalData(STORAGE_KEYS.NOTES, all);
      return all[idx];
    }
    throw new Error('Note not found');
  },

  async deleteNote(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const all = getLocalData<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const filtered = all.filter((n) => n.id !== id);
    setLocalData(STORAGE_KEYS.NOTES, filtered);
    return true;
  },

  async uploadNoteAudio(noteId: string, audioBlob: Blob, durationSeconds: number, transcription?: string): Promise<NoteAudio> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('duration_seconds', String(durationSeconds));
      if (transcription) {
        formData.append('transcription', transcription);
      }
      const res = await fetch(`${API_BASE}/notes/${noteId}/audio`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }
    // Offline base64 storage
    const dataUrl = await blobToDataURL(audioBlob);
    const newAudio: NoteAudio = {
      id: `audio-${Date.now()}`,
      note_id: noteId,
      filename: 'voice_memo.webm',
      filepath: dataUrl,
      duration_seconds: durationSeconds,
      file_size_bytes: audioBlob.size,
      transcription: transcription || 'Voice Memo',
      created_at: new Date().toISOString()
    };
    const allNotes = getLocalData<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const note = allNotes.find((n) => n.id === noteId);
    if (note) {
      if (!note.audios) note.audios = [];
      note.audios.push(newAudio);
      setLocalData(STORAGE_KEYS.NOTES, allNotes);
    }
    return newAudio;
  },

  async deleteNoteAudio(audioId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notes/audio/${audioId}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const allNotes = getLocalData<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    allNotes.forEach((n) => {
      if (n.audios) {
        n.audios = n.audios.filter((a) => a.id !== audioId);
      }
    });
    setLocalData(STORAGE_KEYS.NOTES, allNotes);
    return true;
  },

  // Tasks
  async getTasks(params?: { is_completed?: boolean; priority?: string }): Promise<Task[]> {
    try {
      const query = new URLSearchParams();
      if (params?.is_completed !== undefined) query.set('is_completed', String(params.is_completed));
      if (params?.priority) query.set('priority', params.priority);
      const res = await fetch(`${API_BASE}/tasks?${query.toString()}`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      const tasks = data.data || [];
      setLocalData(STORAGE_KEYS.TASKS, tasks);
      return tasks;
    } catch {
      const all = getLocalData<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
      return all.filter((t) => {
        if (params?.is_completed !== undefined && t.is_completed !== params.is_completed) return false;
        if (params?.priority && t.priority !== params.priority) return false;
        return true;
      });
    }
  },

  async createTask(task: { title: string; description?: string; priority?: 'low' | 'medium' | 'high'; category?: string; due_date?: string }): Promise<Task> {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }
    const all = getLocalData<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      category: task.category || 'general',
      due_date: task.due_date || null,
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    all.unshift(newTask);
    setLocalData(STORAGE_KEYS.TASKS, all);
    return newTask;
  },

  async toggleTask(id: string): Promise<Task> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }
    const all = getLocalData<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const task = all.find((t) => t.id === id);
    if (task) {
      task.is_completed = !task.is_completed;
      task.updated_at = new Date().toISOString();
      setLocalData(STORAGE_KEYS.TASKS, all);
      return task;
    }
    throw new Error('Task not found');
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const all = getLocalData<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const filtered = all.filter((t) => t.id !== id);
    setLocalData(STORAGE_KEYS.TASKS, filtered);
    return true;
  },

  // Habits
  async getHabits(): Promise<Habit[]> {
    try {
      const res = await fetch(`${API_BASE}/habits`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      const habits = data.data || [];
      setLocalData(STORAGE_KEYS.HABITS, habits);
      return habits;
    } catch {
      return getLocalData<Habit[]>(STORAGE_KEYS.HABITS, INITIAL_HABITS);
    }
  },

  async createHabit(habit: { title: string; frequency?: 'daily' | 'weekly'; target_count?: number; color?: string }): Promise<Habit> {
    try {
      const res = await fetch(`${API_BASE}/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habit)
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }
    const all = getLocalData<Habit[]>(STORAGE_KEYS.HABITS, INITIAL_HABITS);
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: habit.title,
      frequency: habit.frequency || 'daily',
      target_count: habit.target_count || 1,
      color: habit.color || '#38BDF8',
      created_at: new Date().toISOString(),
      current_streak: 0,
      is_completed_today: false,
      recent_logs: []
    };
    all.push(newHabit);
    setLocalData(STORAGE_KEYS.HABITS, all);
    return newHabit;
  },

  async toggleHabit(id: string, date?: string): Promise<{ completed: boolean; habit: Habit }> {
    try {
      const res = await fetch(`${API_BASE}/habits/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: date || new Date().toISOString().slice(0, 10) })
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }
    const all = getLocalData<Habit[]>(STORAGE_KEYS.HABITS, INITIAL_HABITS);
    const habit = all.find((h) => h.id === id);
    if (!habit) throw new Error('Habit not found');
    const todayStr = date || new Date().toISOString().slice(0, 10);
    const alreadyDone = habit.recent_logs.includes(todayStr);
    if (alreadyDone) {
      habit.recent_logs = habit.recent_logs.filter((d) => d !== todayStr);
      habit.is_completed_today = false;
      habit.current_streak = Math.max(0, habit.current_streak - 1);
    } else {
      habit.recent_logs.push(todayStr);
      habit.is_completed_today = true;
      habit.current_streak += 1;
    }
    setLocalData(STORAGE_KEYS.HABITS, all);
    return { completed: !alreadyDone, habit };
  },

  async deleteHabit(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/habits/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const all = getLocalData<Habit[]>(STORAGE_KEYS.HABITS, INITIAL_HABITS);
    const filtered = all.filter((h) => h.id !== id);
    setLocalData(STORAGE_KEYS.HABITS, filtered);
    return true;
  },

  // Expenses
  async getExpenses(params?: { type?: 'expense' | 'income'; month?: string }): Promise<Expense[]> {
    try {
      const query = new URLSearchParams();
      if (params?.type) query.set('type', params.type);
      if (params?.month) query.set('month', params.month);
      const res = await fetch(`${API_BASE}/expenses?${query.toString()}`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      const exps = data.data || [];
      setLocalData(STORAGE_KEYS.EXPENSES, exps);
      return exps;
    } catch {
      const all = getLocalData<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
      return all.filter((e) => {
        if (params?.type && e.type !== params.type) return false;
        if (params?.month && !e.date.startsWith(params.month)) return false;
        return true;
      });
    }
  },

  async createExpense(expense: { title: string; amount: number; type?: 'expense' | 'income'; category?: string; currency?: string; date?: string; notes?: string }): Promise<Expense> {
    try {
      const res = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }
    const all = getLocalData<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      title: expense.title,
      amount: expense.amount,
      type: expense.type || 'expense',
      category: expense.category || 'other',
      currency: expense.currency || '৳',
      date: expense.date || new Date().toISOString().slice(0, 10),
      notes: expense.notes || '',
      created_at: new Date().toISOString()
    };
    all.unshift(newExp);
    setLocalData(STORAGE_KEYS.EXPENSES, all);
    return newExp;
  },

  async getExpenseSummary(month?: string): Promise<ExpenseSummary> {
    try {
      const query = month ? `?month=${month}` : '';
      const res = await fetch(`${API_BASE}/expenses/summary${query}`);
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }
    const all = getLocalData<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const currentMonth = month || new Date().toISOString().slice(0, 7);
    const filtered = all.filter((e) => e.date.startsWith(currentMonth));
    let total_income = 0;
    let total_expense = 0;
    const category_breakdown: Record<string, number> = {};
    filtered.forEach((e) => {
      if (e.type === 'income') {
        total_income += e.amount;
      } else {
        total_expense += e.amount;
        category_breakdown[e.category] = (category_breakdown[e.category] || 0) + e.amount;
      }
    });
    return {
      month: currentMonth,
      total_income,
      total_expense,
      net_balance: total_income - total_expense,
      category_breakdown
    };
  },

  async deleteExpense(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const all = getLocalData<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const filtered = all.filter((e) => e.id !== id);
    setLocalData(STORAGE_KEYS.EXPENSES, filtered);
    return true;
  },

  // AI Assistant (Multi-Tier Professional Super AI Brain: Local Actions + Cloud LLM + Offline Fallback)
  async sendAIIntent(prompt: string, language?: string): Promise<AIResponseData> {
    const lang = (language as 'bn' | 'ar' | 'en') || 'bn';
    const profile = getLocalData(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
    const lower = prompt.toLowerCase().trim();

    // 1. Direct App Actions (0ms Instant Local Execution)
    // A. Task creation intent
    const taskMatch = prompt.match(/(?:টাস্ক|কাজ|task|مهمة)[\s:,-]+(.+)/i);
    if (taskMatch && taskMatch[1] && (lower.includes('যোগ') || lower.includes('করো') || lower.includes('add') || lower.includes('create'))) {
      const taskTitle = taskMatch[1].trim();
      await this.createTask({ title: taskTitle });
      return {
        reply: lang === 'bn' ? `আপনার টাস্ক তালিকায় যোগ করা হয়েছে: "${taskTitle}"` : `Added to your tasks: "${taskTitle}"`,
        actionTaken: { type: 'create_task' },
        source: 'local_engine'
      };
    }

    // B. Note creation intent
    const noteMatch = prompt.match(/(?:নোট|লিখো|note|ملاحظة)[\s:,-]+(.+)/i);
    if (noteMatch && noteMatch[1] && (lower.includes('লিখ') || lower.includes('সেভ') || lower.includes('রাখ') || lower.includes('save') || lower.includes('create'))) {
      const content = noteMatch[1].trim();
      await this.createNote({ title: content.slice(0, 30), content });
      return {
        reply: lang === 'bn' ? `নোট হিসেবে সুন্দরভাবে সংরক্ষণ করেছি: "${content}"` : `Saved note successfully: "${content}"`,
        actionTaken: { type: 'create_note' },
        source: 'local_engine'
      };
    }

    // C. Expense query intent
    if (lower.includes('খরচ কত') || lower.includes('ব্যালেন্স') || lower.includes('টাকা কত') || lower.includes('expenses summary')) {
      const summary = await this.getExpenseSummary();
      const replies = {
        bn: `এই মাসে আপনার মোট খরচ হয়েছে ${summary.total_expense} ৳ এবং আয় ${summary.total_income} ৳। আপনার বর্তমান নিট ব্যালেন্স: ${summary.net_balance} ৳।`,
        ar: `إجمالي مصروفاتك: ${summary.total_expense} وإجمالي الدخل: ${summary.total_income}. الرصيد: ${summary.net_balance}.`,
        en: `Your total expenses this month are ${summary.total_expense} and income is ${summary.total_income}. Balance: ${summary.net_balance}.`
      };
      return { reply: replies[lang] || replies.bn, actionTaken: { type: 'query_summary' }, source: 'local_engine' };
    }

    // D. Habit query intent
    if (lower.includes('অভ্যাস') || lower.includes('হ্যাবিট') || lower.includes('habits')) {
      const habits = await this.getHabits();
      const done = habits.filter(h => h.is_completed_today).length;
      return {
        reply: lang === 'bn'
          ? `আজকের জন্য আপনার ${habits.length}টি অভ্যাসের মধ্যে ${done}টি সম্পন্ন হয়েছে। আপনি দারুণ এগোচ্ছেন!`
          : `You have completed ${done} of ${habits.length} habits today. Great job!`,
        actionTaken: { type: 'query_summary' },
        source: 'local_engine'
      };
    }

    // 2. Try User-Configured Gemini API Key first (if present in profile)
    if (profile.gemini_api_key && profile.gemini_api_key.trim().length > 10) {
      try {
        const sys = `You are Hasan Robot (হাসান রোবট), a genius AI life guide for ${profile.name}. Answer in natural ${lang === 'bn' ? 'Bengali' : 'English'}.`;
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${profile.gemini_api_key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: sys }] },
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const gText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (gText) return { reply: gText, source: 'gemini_flash' };
        }
      } catch (err) {
        console.warn('Gemini direct call fallback:', err);
      }
    }

    // 3. Cloud Super AI Brain (Free Omni-Knowledge LLM - ChatGPT / Gemini grade)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const systemPrompt = `You are Hasan Robot (হাসান রোবট), a world-class, genius AI life companion and brain for ${profile.name || 'Hasan'}.
You possess deep encyclopedic knowledge across science, general knowledge, technology, coding, history, mathematics, philosophy, career, religion/ethics, health, and life advice, just like ChatGPT and Gemini.
You also know everything about the "Hasan Life Guide" application (Notes with voice dictation, Tasks with priorities, Daily Habits & streaks, Income & Expense tracking, and Real-Time Dhaka Clock).
Always reply in natural, smart, conversational, helpful, and polite ${lang === 'bn' ? 'Bengali (বাংলা)' : lang === 'ar' ? 'Arabic' : 'English'}.
Keep responses articulate, direct, and well-structured. Never refuse general knowledge questions.`;

      const aiRes = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          model: 'openai'
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (aiRes.ok) {
        const text = await aiRes.text();
        if (text && text.trim().length > 0 && text.trim() !== '{}') {
          return {
            reply: text.trim(),
            actionTaken: { type: 'general' },
            source: 'gemini_flash'
          };
        }
      }
    } catch (err) {
      console.warn('Super-Brain cloud fetch failed or offline:', err);
    }

    // 4. Offline Smart Knowledge Engine (When airplane mode or no internet)
    if (
      lower.includes('কেমন আছ') || lower.includes('হ্যালো') || lower.includes('সালাম') ||
      lower.includes('hello') || lower.includes('hey') || lower.includes('hi')
    ) {
      return {
        reply: `হ্যালো ${profile.name}! আমি আপনার হাসান রোবট। আমি ভালো আছি এবং আপনার যেকোনো প্রশ্ন, নোট, টাস্ক বা পরামর্শে সাহায্য করতে সম্পূর্ণ প্রস্তুত!`,
        source: 'local_engine'
      };
    }

    return {
      reply: `ধন্যবাদ ${profile.name}! আমি বিষয়টি বুঝতে পেরেছি। আপনার জীবন ও কাজকে সহজ করতে আমি প্রস্তুত। আপনি যেকোনো তথ্য জানতে চাইতে পারেন, অথবা আমাকে নতুন টাস্ক বা নোট সেভ করতে বলতে পারেন।`,
      actionTaken: { type: 'general' },
      source: 'local_engine'
    };
  },

  // Backup
  async exportBackup(): Promise<unknown> {
    try {
      const res = await fetch(`${API_BASE}/backup/export`);
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch {
      // Fallback
    }
    return {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      profile: getLocalData(STORAGE_KEYS.PROFILE, INITIAL_PROFILE),
      notes: getLocalData(STORAGE_KEYS.NOTES, INITIAL_NOTES),
      tasks: getLocalData(STORAGE_KEYS.TASKS, INITIAL_TASKS),
      habits: getLocalData(STORAGE_KEYS.HABITS, INITIAL_HABITS),
      expenses: getLocalData(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES)
    };
  },

  async importBackup(backupData: any): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/backup/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData)
      });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    if (backupData && typeof backupData === 'object') {
      if (backupData.profile) setLocalData(STORAGE_KEYS.PROFILE, backupData.profile);
      if (Array.isArray(backupData.notes)) setLocalData(STORAGE_KEYS.NOTES, backupData.notes);
      if (Array.isArray(backupData.tasks)) setLocalData(STORAGE_KEYS.TASKS, backupData.tasks);
      if (Array.isArray(backupData.habits)) setLocalData(STORAGE_KEYS.HABITS, backupData.habits);
      if (Array.isArray(backupData.expenses)) setLocalData(STORAGE_KEYS.EXPENSES, backupData.expenses);
      return true;
    }
    return false;
  }
};
