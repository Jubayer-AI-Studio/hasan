import { NotesRepository } from '../db/notesRepo.js';
import { TasksRepository, HabitsRepository, ExpensesRepository, ProfileRepository } from '../db/lifeRepo.js';

export interface AIResponse {
  reply: string;
  actionTaken?: {
    type: 'create_note' | 'create_task' | 'log_expense' | 'query_summary' | 'greeting' | 'general';
    data?: unknown;
  };
  source: 'local_engine' | 'gemini_flash';
}

export class AIService {
  constructor(
    private notesRepo: NotesRepository,
    private tasksRepo: TasksRepository,
    private habitsRepo: HabitsRepository,
    private expensesRepo: ExpensesRepository,
    private profileRepo: ProfileRepository
  ) {}

  async processPrompt(prompt: string, language?: 'bn' | 'ar' | 'en'): Promise<AIResponse> {
    const trimmed = prompt.trim();
    const lang = language || this.profileRepo.get().language || 'bn';
    const profile = this.profileRepo.get();

    // 1. Check if it matches a local action intent (Fast & 100% Offline)
    const localResult = this.tryLocalIntent(trimmed, lang);
    if (localResult) {
      return localResult;
    }

    // 2. If Gemini API Key is available, invoke Gemini Free API
    if (profile.gemini_api_key && profile.gemini_api_key.trim().length > 10) {
      try {
        const geminiReply = await this.callGeminiAPI(trimmed, profile.gemini_api_key, lang);
        return {
          reply: geminiReply,
          actionTaken: { type: 'general' },
          source: 'gemini_flash'
        };
      } catch (err: unknown) {
        console.error('Gemini API call failed, falling back to local assistant:', err);
      }
    }

    // 3. Built-in Super AI Brain (Pollinations Cloud LLM)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are Hasan Robot (হাসান রোবট), a world-class intelligent AI life companion for ${profile.name}. Answer concisely and brilliantly in natural ${lang === 'bn' ? 'Bengali' : lang === 'ar' ? 'Arabic' : 'English'}.`
            },
            { role: 'user', content: trimmed }
          ],
          model: 'openai'
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 0 && text.trim() !== '{}') {
          return {
            reply: text.trim(),
            actionTaken: { type: 'general' },
            source: 'gemini_flash'
          };
        }
      }
    } catch {
      // Offline fallback
    }

    // 4. Fallback to smart localized assistant reply
    return this.generateFriendlyFallback(trimmed, lang, profile.name);
  }

  private tryLocalIntent(prompt: string, lang: 'bn' | 'ar' | 'en'): AIResponse | null {
    const lower = prompt.toLowerCase();

    // Intent: Greetings
    if (
      lower.includes('কেমন আছ') || lower.includes('হ্যালো') || lower.includes('সালাম') ||
      lower.includes('hello') || lower.includes('hi hasan') || lower.includes('hey') ||
      lower.includes('مرحبا') || lower.includes('سلام') || lower.includes('أهلا')
    ) {
      const greetings: Record<string, string> = {
        bn: `হ্যালো ${this.profileRepo.get().name}! আমি হাসান রোবট। আপনার জীবনের প্রতিটি লক্ষ্য পূরণে সাহায্য করতে আমি সর্বদা প্রস্তুত।`,
        ar: `مرحبًا يا ${this.profileRepo.get().name}! أنا روبوت حسن، مساعدك الذكي ومستعد دائمًا لمساعدتك في تنظيم حياتك.`,
        en: `Hello ${this.profileRepo.get().name}! I am Hasan Robot, ready to help you conquer your goals and organize your day.`
      };
      return {
        reply: greetings[lang] || greetings['bn'],
        actionTaken: { type: 'greeting' },
        source: 'local_engine'
      };
    }

    // Intent: Expense query
    if (
      lower.includes('খরচ') || lower.includes('expense') || lower.includes('مصاريف') || lower.includes('بكم')
    ) {
      const summary = this.expensesRepo.getSummary();
      const replies: Record<string, string> = {
        bn: `এই মাসে আপনার মোট খরচ হয়েছে ${summary.total_expense} ৳ এবং মোট আয় ${summary.total_income} ৳। আপনার বর্তমান ব্যালেন্স: ${summary.net_balance} ৳।`,
        ar: `إجمالي مصروفاتك لهذا الشهر هي ${summary.total_expense} وإجمالي الدخل ${summary.total_income}. رصيدك الحالي: ${summary.net_balance}.`,
        en: `Your total expenses this month are ${summary.total_expense} and income is ${summary.total_income}. Net balance: ${summary.net_balance}.`
      };
      return {
        reply: replies[lang] || replies['bn'],
        actionTaken: { type: 'query_summary', data: summary },
        source: 'local_engine'
      };
    }

    // Intent: Quick Task Creation (e.g., "টাস্ক যোগ করো: বাজার করা" or "add task: buy milk")
    const taskMatch = prompt.match(/(?:টাস্ক|কাজ|task|مهمة)[\s:]+(.+)/i);
    if (taskMatch && taskMatch[1]) {
      const taskTitle = taskMatch[1].trim();
      const createdTask = this.tasksRepo.create({ title: taskTitle, priority: 'medium' });
      const replies: Record<string, string> = {
        bn: `আপনার কাজের তালিকায় যোগ করা হয়েছে: "${taskTitle}"।`,
        ar: `تمت إضافة المهمة بنجاح: "${taskTitle}".`,
        en: `Added to your tasks: "${taskTitle}".`
      };
      return {
        reply: replies[lang] || replies['bn'],
        actionTaken: { type: 'create_task', data: createdTask },
        source: 'local_engine'
      };
    }

    // Intent: Quick Note Creation (e.g., "নোট: কাল মিটিং আছে" or "note: meeting tomorrow")
    const noteMatch = prompt.match(/(?:নোট|note|ملاحظة)[\s:]+(.+)/i);
    if (noteMatch && noteMatch[1]) {
      const noteContent = noteMatch[1].trim();
      const createdNote = this.notesRepo.create({
        title: noteContent.slice(0, 30) + (noteContent.length > 30 ? '...' : ''),
        content: noteContent
      });
      const replies: Record<string, string> = {
        bn: `নোট হিসেবে সংরক্ষণ করা হয়েছে: "${createdNote.title}"।`,
        ar: `تم حفظ الملاحظة بنجاح: "${createdNote.title}".`,
        en: `Saved note successfully: "${createdNote.title}".`
      };
      return {
        reply: replies[lang] || replies['bn'],
        actionTaken: { type: 'create_note', data: createdNote },
        source: 'local_engine'
      };
    }

    // Intent: Habit Status
    if (lower.includes('অভ্যাস') || lower.includes('habit') || lower.includes('عادة')) {
      const habits = this.habitsRepo.getAll();
      const completedToday = habits.filter(h => h.is_completed_today).length;
      const replies: Record<string, string> = {
        bn: `আজকের জন্য আপনার ${habits.length}টি অভ্যাসের মধ্যে ${completedToday}টি সম্পন্ন হয়েছে। চালিয়ে যান!`,
        ar: `اليوم أكملت ${completedToday} من أصل ${habits.length} من عاداتك. استمر في التقدم!`,
        en: `You have completed ${completedToday} of ${habits.length} habits today. Keep it up!`
      };
      return {
        reply: replies[lang] || replies['bn'],
        actionTaken: { type: 'query_summary', data: { total: habits.length, completedToday } },
        source: 'local_engine'
      };
    }

    return null;
  }

  private async callGeminiAPI(prompt: string, apiKey: string, lang: 'bn' | 'ar' | 'en'): Promise<string> {
    const systemPrompt = `You are Hasan Robot, a friendly, warm, intelligent life companion and personal guide for the user named ${this.profileRepo.get().name}.
    You speak primarily in ${lang === 'bn' ? 'Bengali' : lang === 'ar' ? 'Arabic' : 'English'}. Keep responses concise, uplifting, and actionable.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini API responded with status ${res.status}`);
    }

    const data = await res.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    };

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand, Hasan!';
  }

  private generateFriendlyFallback(prompt: string, lang: 'bn' | 'ar' | 'en', userName: string): AIResponse {
    const replies: Record<string, string> = {
      bn: `ধন্যবাদ ${userName}! আমি আপনার কথাটি বুঝতে পেরেছি। আপনি চাইলে এটিকে একটি নোট হিসেবে রাখতে পারেন অথবা একটি টাস্কে যুক্ত করতে পারেন।`,
      ar: `شكرًا لك يا ${userName}! لقد استلمت رسالتك. يمكنك حفظها كملاحظة أو إضافتها كمهمة جديدة في قائمة مهامك.`,
      en: `Thank you ${userName}! I have received your thought. You can save it as a note or add it to your daily tasks list.`
    };

    return {
      reply: replies[lang] || replies['bn'],
      actionTaken: { type: 'general' },
      source: 'local_engine'
    };
  }
}
