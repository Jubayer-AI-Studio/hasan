import React, { useState, useEffect } from 'react';
import { Expense, ExpenseSummary, API } from '../../services/api';
import { Translations, Language } from '../../i18n/translations';
import {
  Wallet,
  Plus,
  TrendingDown,
  TrendingUp,
  PieChart,
  Trash2,
  X,
  Calendar
} from 'lucide-react';

interface ExpensesViewProps {
  t: Translations;
  language: Language;
  theme: string;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({ t, theme }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const isSophia = theme === 'sophia';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [expData, sumData] = await Promise.all([
        API.getExpenses(),
        API.getExpenseSummary()
      ]);
      setExpenses(expData);
      setSummary(sumData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    try {
      await API.createExpense({
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        date
      });
      setTitle('');
      setAmount('');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Delete transaction?')) {
      await API.deleteExpense(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black flex items-center gap-2 ${
            theme === 'light' ? 'text-slate-900' : 'text-slate-100'
          }`}>
            <Wallet className={`w-7 h-7 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`} />
            {t.expenses.title}
          </h1>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{t.expenses.subtitle}</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${
            isSophia
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-glow-violet'
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
        >
          <Plus size={18} />
          <span>{t.expenses.addExpense}</span>
        </button>
      </div>

      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income */}
        <div className="rounded-3xl p-5 app-card">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-extrabold ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>
              {t.expenses.totalIncome}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              <TrendingUp size={16} />
            </div>
          </div>
          <span className={`text-2xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            {summary ? `${summary.total_income.toLocaleString()} ৳` : '0 ৳'}
          </span>
        </div>

        {/* Expense */}
        <div className="rounded-3xl p-5 app-card">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-extrabold ${theme === 'light' ? 'text-rose-600' : 'text-rose-400'}`}>
              {t.expenses.totalExpense}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              theme === 'light' ? 'bg-rose-100 text-rose-700' : 'bg-rose-500/20 text-rose-300'
            }`}>
              <TrendingDown size={16} />
            </div>
          </div>
          <span className={`text-2xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            {summary ? `${summary.total_expense.toLocaleString()} ৳` : '0 ৳'}
          </span>
        </div>

        {/* Net Balance */}
        <div className="rounded-3xl p-5 app-card">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-extrabold ${theme === 'light' ? 'text-sky-600' : 'text-cyan-400'}`}>
              {t.expenses.netBalance}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              theme === 'light' ? 'bg-sky-100 text-sky-700' : 'bg-cyan-500/20 text-cyan-300'
            }`}>
              <Wallet size={16} />
            </div>
          </div>
          <span
            className={`text-2xl font-black ${
              summary && summary.net_balance < 0
                ? 'text-rose-500'
                : theme === 'light'
                ? 'text-sky-700'
                : 'text-cyan-300'
            }`}
          >
            {summary ? `${summary.net_balance.toLocaleString()} ৳` : '0 ৳'}
          </span>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN PILLS */}
      {summary && Object.keys(summary.category_breakdown).length > 0 && (
        <div className="rounded-3xl p-5 app-card">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}>
            <PieChart size={14} className={theme === 'light' ? 'text-purple-600' : 'text-purple-400'} />
            {t.expenses.category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.category_breakdown).map(([cat, amt]) => (
              <div
                key={cat}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs ${
                  theme === 'light'
                    ? 'bg-slate-100 border border-slate-200'
                    : 'bg-white/5 border border-white/5'
                }`}
              >
                <span className={`capitalize font-semibold ${
                  theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {t.expenses.categories[cat as keyof typeof t.expenses.categories] || cat}:
                </span>
                <span className="font-bold text-rose-500">{amt.toLocaleString()} ৳</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSACTIONS LIST */}
      <div className="space-y-3">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
        }`}>
          {t.expenses.recentTransactions}
        </h3>

        {isLoading ? (
          <div className="py-10 text-center text-slate-400">{t.common.loading}</div>
        ) : expenses.length === 0 ? (
          <div className={`py-16 text-center rounded-3xl border border-dashed p-6 ${
            theme === 'light' ? 'border-slate-300' : 'border-white/10'
          }`}>
            <Wallet size={40} className={`mx-auto mb-2 ${theme === 'light' ? 'text-slate-300' : 'text-slate-600'}`} />
            <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{t.expenses.noExpenses}</h4>
          </div>
        ) : (
          expenses.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-4 flex items-center justify-between transition-all app-card"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    item.type === 'income'
                      ? theme === 'light'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-emerald-500/20 text-emerald-400'
                      : theme === 'light'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {item.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>

                <div>
                  <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
                    {item.title}
                  </h4>
                  <span className={`text-[10px] capitalize ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t.expenses.categories[item.category as keyof typeof t.expenses.categories] || item.category} • {item.date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`font-black text-sm ${
                    item.type === 'income'
                      ? 'text-emerald-500'
                      : theme === 'light'
                      ? 'text-slate-900'
                      : 'text-slate-100'
                  }`}
                >
                  {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()} {item.currency}
                </span>

                <button
                  onClick={() => handleDeleteExpense(item.id)}
                  className={`p-1 transition-colors ${
                    theme === 'light' ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-red-400'
                  }`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl p-6 space-y-4 border app-modal">
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-base ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                {t.expenses.addExpense}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={theme === 'light' ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  type === 'expense'
                    ? 'bg-rose-500/20 text-rose-500 border-rose-500'
                    : theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {t.expenses.expense}
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  type === 'income'
                    ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500'
                    : theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {t.expenses.income}
              </button>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.expenses.itemTitlePlaceholder}
              className={`w-full rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors ${
                theme === 'light'
                  ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-400'
              }`}
            />

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-cyan-500 transition-colors ${
                theme === 'light'
                  ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-400'
              }`}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[11px] mb-1 block ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t.expenses.category}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs transition-colors ${
                    theme === 'light'
                      ? 'bg-slate-50 border border-slate-200 text-slate-800'
                      : 'bg-slate-800 border border-white/10 text-slate-200'
                  }`}
                >
                  <option value="food">{t.expenses.categories.food}</option>
                  <option value="transport">{t.expenses.categories.transport}</option>
                  <option value="utilities">{t.expenses.categories.utilities}</option>
                  <option value="shopping">{t.expenses.categories.shopping}</option>
                  <option value="salary">{t.expenses.categories.salary}</option>
                  <option value="project">{t.expenses.categories.project}</option>
                  <option value="other">{t.expenses.categories.other}</option>
                </select>
              </div>

              <div>
                <label className={`text-[11px] mb-1 block ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t.tasks.dueDate}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                onClick={handleCreateExpense}
                className="px-5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
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
