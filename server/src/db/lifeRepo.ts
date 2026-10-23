import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';

// ====================== PROFILE ======================
export interface UserProfile {
  id: number;
  name: string;
  avatar_url: string;
  language: 'bn' | 'ar' | 'en';
  theme: 'dark' | 'light' | 'sophia';
  gemini_api_key: string;
  mascot_enabled: boolean;
  mascot_muted: boolean;
  created_at: string;
  updated_at: string;
}

export class ProfileRepository {
  constructor(private db: DatabaseSync) {}

  get(): UserProfile {
    const row = this.db.prepare('SELECT * FROM profile WHERE id = 1').get() as Record<string, unknown>;
    return {
      id: 1,
      name: String(row.name || 'Hasan'),
      avatar_url: String(row.avatar_url || ''),
      language: (row.language as 'bn' | 'ar' | 'en') || 'bn',
      theme: (row.theme as 'dark' | 'light' | 'sophia') || 'sophia',
      gemini_api_key: String(row.gemini_api_key || ''),
      mascot_enabled: Number(row.mascot_enabled) === 1,
      mascot_muted: Number(row.mascot_muted) === 1,
      created_at: String(row.created_at),
      updated_at: String(row.updated_at)
    };
  }

  update(data: Partial<{
    name: string;
    avatar_url: string;
    language: 'bn' | 'ar' | 'en';
    theme: 'dark' | 'light' | 'sophia';
    gemini_api_key: string;
    mascot_enabled: boolean;
    mascot_muted: boolean;
  }>): UserProfile {
    const current = this.get();
    const name = data.name !== undefined ? data.name : current.name;
    const avatar_url = data.avatar_url !== undefined ? data.avatar_url : current.avatar_url;
    const language = data.language !== undefined ? data.language : current.language;
    const theme = data.theme !== undefined ? data.theme : current.theme;
    const gemini_api_key = data.gemini_api_key !== undefined ? data.gemini_api_key : current.gemini_api_key;
    const mascot_enabled = data.mascot_enabled !== undefined ? (data.mascot_enabled ? 1 : 0) : (current.mascot_enabled ? 1 : 0);
    const mascot_muted = data.mascot_muted !== undefined ? (data.mascot_muted ? 1 : 0) : (current.mascot_muted ? 1 : 0);
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE profile
      SET name = ?, avatar_url = ?, language = ?, theme = ?, gemini_api_key = ?,
          mascot_enabled = ?, mascot_muted = ?, updated_at = ?
      WHERE id = 1
    `).run(name, avatar_url, language, theme, gemini_api_key, mascot_enabled, mascot_muted, now);

    return this.get();
  }
}

// ====================== TASKS ======================
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

export class TasksRepository {
  constructor(private db: DatabaseSync) {}

  getAll(options?: { is_completed?: boolean; priority?: string; category?: string }): Task[] {
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params: (string | number)[] = [];

    if (options?.is_completed !== undefined) {
      sql += ' AND is_completed = ?';
      params.push(options.is_completed ? 1 : 0);
    }
    if (options?.priority) {
      sql += ' AND priority = ?';
      params.push(options.priority);
    }
    if (options?.category) {
      sql += ' AND category = ?';
      params.push(options.category);
    }

    sql += " ORDER BY is_completed ASC, CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, created_at DESC";

    const rows = this.db.prepare(sql).all(...params) as Array<Record<string, unknown>>;
    return rows.map(r => this.format(r));
  }

  getById(id: string): Task | null {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? this.format(row) : null;
  }

  create(data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    due_date?: string;
  }): Task {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO tasks (id, title, description, priority, category, due_date, is_completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      id,
      data.title,
      data.description || '',
      data.priority || 'medium',
      data.category || 'general',
      data.due_date || null,
      now,
      now
    );

    return this.getById(id)!;
  }

  update(id: string, data: Partial<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    due_date: string | null;
    is_completed: boolean;
  }>): Task | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const title = data.title !== undefined ? data.title : existing.title;
    const desc = data.description !== undefined ? data.description : existing.description;
    const priority = data.priority !== undefined ? data.priority : existing.priority;
    const cat = data.category !== undefined ? data.category : existing.category;
    const due = data.due_date !== undefined ? data.due_date : existing.due_date;
    const completed = data.is_completed !== undefined ? (data.is_completed ? 1 : 0) : (existing.is_completed ? 1 : 0);
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, priority = ?, category = ?, due_date = ?, is_completed = ?, updated_at = ?
      WHERE id = ?
    `).run(title, desc, priority, cat, due, completed, now, id);

    return this.getById(id);
  }

  toggle(id: string): Task | null {
    const existing = this.getById(id);
    if (!existing) return null;
    return this.update(id, { is_completed: !existing.is_completed });
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return (result.changes ?? 0) > 0;
  }

  private format(r: Record<string, unknown>): Task {
    return {
      id: String(r.id),
      title: String(r.title),
      description: String(r.description || ''),
      priority: (r.priority as 'low' | 'medium' | 'high') || 'medium',
      category: String(r.category || 'general'),
      due_date: r.due_date ? String(r.due_date) : null,
      is_completed: Number(r.is_completed) === 1,
      created_at: String(r.created_at),
      updated_at: String(r.updated_at)
    };
  }
}

// ====================== HABITS ======================
export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  target_count: number;
  color: string;
  created_at: string;
  current_streak: number;
  is_completed_today: boolean;
  recent_logs: string[]; // dates array (YYYY-MM-DD)
}

export class HabitsRepository {
  constructor(private db: DatabaseSync) {}

  getAll(todayStr?: string): Habit[] {
    const today = todayStr || new Date().toISOString().slice(0, 10);
    const rows = this.db.prepare('SELECT * FROM habits ORDER BY created_at ASC').all() as Array<Record<string, unknown>>;
    return rows.map(r => this.formatWithStreak(r, today));
  }

  getById(id: string, todayStr?: string): Habit | null {
    const today = todayStr || new Date().toISOString().slice(0, 10);
    const row = this.db.prepare('SELECT * FROM habits WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? this.formatWithStreak(row, today) : null;
  }

  create(data: {
    title: string;
    frequency?: 'daily' | 'weekly';
    target_count?: number;
    color?: string;
  }): Habit {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO habits (id, title, frequency, target_count, color, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.title,
      data.frequency || 'daily',
      data.target_count || 1,
      data.color || '#38BDF8',
      now
    );

    return this.getById(id)!;
  }

  toggleDate(habitId: string, dateStr: string): { completed: boolean; habit: Habit } {
    const existingLog = this.db.prepare(`
      SELECT id FROM habit_logs WHERE habit_id = ? AND completed_date = ?
    `).get(habitId, dateStr);

    if (existingLog) {
      this.db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND completed_date = ?').run(habitId, dateStr);
      return { completed: false, habit: this.getById(habitId, dateStr)! };
    } else {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      this.db.prepare(`
        INSERT INTO habit_logs (id, habit_id, completed_date, created_at)
        VALUES (?, ?, ?, ?)
      `).run(id, habitId, dateStr, now);
      return { completed: true, habit: this.getById(habitId, dateStr)! };
    }
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM habits WHERE id = ?').run(id);
    return (result.changes ?? 0) > 0;
  }

  private formatWithStreak(r: Record<string, unknown>, todayStr: string): Habit {
    const id = String(r.id);
    // Fetch logs ordered by date desc
    const logs = this.db.prepare(`
      SELECT completed_date FROM habit_logs WHERE habit_id = ? ORDER BY completed_date DESC
    `).all(id) as Array<{ completed_date: string }>;

    const logDates = new Set(logs.map(l => l.completed_date));
    const isCompletedToday = logDates.has(todayStr);

    // Calculate streak backwards from today (or yesterday if not yet completed today)
    let streak = 0;
    let checkDate = new Date(todayStr);

    if (!isCompletedToday) {
      // Check if yesterday was completed
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateKey = checkDate.toISOString().slice(0, 10);
      if (logDates.has(dateKey)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      id,
      title: String(r.title),
      frequency: (r.frequency as 'daily' | 'weekly') || 'daily',
      target_count: Number(r.target_count || 1),
      color: String(r.color || '#38BDF8'),
      created_at: String(r.created_at),
      current_streak: streak,
      is_completed_today: isCompletedToday,
      recent_logs: logs.map(l => l.completed_date).slice(0, 30)
    };
  }
}

// ====================== EXPENSES ======================
export interface Expense {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  currency: string;
  date: string; // YYYY-MM-DD
  notes: string;
  created_at: string;
}

export interface ExpenseSummary {
  total_income: number;
  total_expense: number;
  net_balance: number;
  category_breakdown: Record<string, number>;
  month: string;
}

export class ExpensesRepository {
  constructor(private db: DatabaseSync) {}

  getAll(options?: { type?: 'expense' | 'income'; month?: string; category?: string }): Expense[] {
    let sql = 'SELECT * FROM expenses WHERE 1=1';
    const params: (string | number)[] = [];

    if (options?.type) {
      sql += ' AND type = ?';
      params.push(options.type);
    }
    if (options?.category) {
      sql += ' AND category = ?';
      params.push(options.category);
    }
    if (options?.month) {
      sql += ' AND date LIKE ?';
      params.push(`${options.month}%`);
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    const rows = this.db.prepare(sql).all(...params) as Array<Record<string, unknown>>;
    return rows.map(r => this.format(r));
  }

  getById(id: string): Expense | null {
    const row = this.db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? this.format(row) : null;
  }

  create(data: {
    title: string;
    amount: number;
    type?: 'expense' | 'income';
    category?: string;
    currency?: string;
    date?: string;
    notes?: string;
  }): Expense {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const date = data.date || now.slice(0, 10);

    this.db.prepare(`
      INSERT INTO expenses (id, title, amount, type, category, currency, date, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.title,
      data.amount,
      data.type || 'expense',
      data.category || 'other',
      data.currency || 'BDT',
      date,
      data.notes || '',
      now
    );

    return this.getById(id)!;
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
    return (result.changes ?? 0) > 0;
  }

  getSummary(month?: string): ExpenseSummary {
    const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM
    const rows = this.db.prepare(`
      SELECT type, category, amount FROM expenses WHERE date LIKE ?
    `).all(`${currentMonth}%`) as Array<{ type: string; category: string; amount: number }>;

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown: Record<string, number> = {};

    for (const r of rows) {
      const amt = Number(r.amount);
      if (r.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + amt;
      }
    }

    return {
      month: currentMonth,
      total_income: totalIncome,
      total_expense: totalExpense,
      net_balance: totalIncome - totalExpense,
      category_breakdown: categoryBreakdown
    };
  }

  private format(r: Record<string, unknown>): Expense {
    return {
      id: String(r.id),
      title: String(r.title),
      amount: Number(r.amount),
      type: (r.type as 'expense' | 'income') || 'expense',
      category: String(r.category || 'other'),
      currency: String(r.currency || 'BDT'),
      date: String(r.date),
      notes: String(r.notes || ''),
      created_at: String(r.created_at)
    };
  }
}
