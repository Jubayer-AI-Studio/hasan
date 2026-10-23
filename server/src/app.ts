import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { CONFIG } from './config/index.js';
import { NotesRepository } from './db/notesRepo.js';
import { TasksRepository, HabitsRepository, ExpensesRepository, ProfileRepository } from './db/lifeRepo.js';
import { AIService } from './services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(db: DatabaseSync): express.Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Repositories
  const notesRepo = new NotesRepository(db);
  const tasksRepo = new TasksRepository(db);
  const habitsRepo = new HabitsRepository(db);
  const expensesRepo = new ExpensesRepository(db);
  const profileRepo = new ProfileRepository(db);
  const aiService = new AIService(notesRepo, tasksRepo, habitsRepo, expensesRepo, profileRepo);

  // Setup Multer storage for voice memo audio files
  if (!fs.existsSync(CONFIG.UPLOADS_DIR)) {
    fs.mkdirSync(CONFIG.UPLOADS_DIR, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, CONFIG.UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.webm';
      const uniqueName = `voice_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
      cb(null, uniqueName);
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max per audio clip
  });

  // ===================== HEALTH CHECK =====================
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Hasan Life Guide Backend',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // ===================== USER PROFILE & SETTINGS =====================
  app.get('/api/profile', (_req, res) => {
    try {
      const profile = profileRepo.get();
      res.json({ success: true, data: profile });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.put('/api/profile', (req, res) => {
    try {
      const updated = profileRepo.update(req.body);
      res.json({ success: true, data: updated });
    } catch (err: unknown) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  });

  // ===================== NOTES & AUDIO MEMOS =====================
  app.get('/api/notes', (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const tag = req.query.tag as string | undefined;
      const isPinned = req.query.is_pinned !== undefined ? req.query.is_pinned === 'true' || req.query.is_pinned === '1' : undefined;

      const notes = notesRepo.getAll({ search, tag, is_pinned: isPinned });
      res.json({ success: true, count: notes.length, data: notes });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/notes', (req, res) => {
    try {
      const { title, content, tags, is_pinned, color } = req.body;
      if (!title || !content) {
        res.status(400).json({ success: false, error: 'Title and content are required' });
        return;
      }
      const note = notesRepo.create({ title, content, tags, is_pinned, color });
      res.status(201).json({ success: true, data: note });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.get('/api/notes/:id', (req, res) => {
    try {
      const note = notesRepo.getById(req.params.id);
      if (!note) {
        res.status(404).json({ success: false, error: 'Note not found' });
        return;
      }
      res.json({ success: true, data: note });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.put('/api/notes/:id', (req, res) => {
    try {
      const updated = notesRepo.update(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Note not found' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.delete('/api/notes/:id', (req, res) => {
    try {
      const deleted = notesRepo.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Note not found' });
        return;
      }
      res.json({ success: true, message: 'Note deleted successfully' });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Attach audio voice recording to a note
  app.post('/api/notes/:id/audio', upload.single('audio'), (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No audio file provided' });
        return;
      }

      const note = notesRepo.getById(req.params.id);
      if (!note) {
        // Clean up uploaded file if note doesn't exist
        fs.unlinkSync(req.file.path);
        res.status(404).json({ success: false, error: 'Note not found' });
        return;
      }

      const duration = req.body.duration_seconds ? parseFloat(req.body.duration_seconds) : 0;
      const transcription = req.body.transcription || '';

      const audioRecord = notesRepo.addAudioMemo(req.params.id, {
        filename: req.file.filename,
        filepath: req.file.path,
        duration_seconds: duration,
        file_size_bytes: req.file.size,
        transcription: transcription
      });

      res.status(201).json({ success: true, data: audioRecord });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Delete specific audio memo
  app.delete('/api/notes/audio/:audioId', (req, res) => {
    try {
      const deleted = notesRepo.deleteAudioMemo(req.params.audioId);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Audio memo not found' });
        return;
      }
      res.json({ success: true, message: 'Audio memo removed' });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Stream static audio file
  app.get('/api/audio/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(CONFIG.UPLOADS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'Audio file not found' });
      return;
    }

    res.sendFile(filePath);
  });

  // ===================== TASKS =====================
  app.get('/api/tasks', (req, res) => {
    try {
      const isCompleted = req.query.is_completed !== undefined
        ? req.query.is_completed === 'true' || req.query.is_completed === '1'
        : undefined;
      const priority = req.query.priority as string | undefined;
      const category = req.query.category as string | undefined;

      const tasks = tasksRepo.getAll({ is_completed: isCompleted, priority, category });
      res.json({ success: true, count: tasks.length, data: tasks });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/tasks', (req, res) => {
    try {
      const { title, description, priority, category, due_date } = req.body;
      if (!title) {
        res.status(400).json({ success: false, error: 'Task title is required' });
        return;
      }
      const task = tasksRepo.create({ title, description, priority, category, due_date });
      res.status(201).json({ success: true, data: task });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.put('/api/tasks/:id', (req, res) => {
    try {
      const updated = tasksRepo.update(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.patch('/api/tasks/:id/toggle', (req, res) => {
    try {
      const toggled = tasksRepo.toggle(req.params.id);
      if (!toggled) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }
      res.json({ success: true, data: toggled });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.delete('/api/tasks/:id', (req, res) => {
    try {
      const deleted = tasksRepo.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Task not found' });
        return;
      }
      res.json({ success: true, message: 'Task deleted' });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ===================== HABITS =====================
  app.get('/api/habits', (req, res) => {
    try {
      const today = req.query.today as string | undefined;
      const habits = habitsRepo.getAll(today);
      res.json({ success: true, count: habits.length, data: habits });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/habits', (req, res) => {
    try {
      const { title, frequency, target_count, color } = req.body;
      if (!title) {
        res.status(400).json({ success: false, error: 'Habit title is required' });
        return;
      }
      const habit = habitsRepo.create({ title, frequency, target_count, color });
      res.status(201).json({ success: true, data: habit });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/habits/:id/toggle', (req, res) => {
    try {
      const date = req.body.date || new Date().toISOString().slice(0, 10);
      const result = habitsRepo.toggleDate(req.params.id, date);
      res.json({ success: true, data: result });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.delete('/api/habits/:id', (req, res) => {
    try {
      const deleted = habitsRepo.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Habit not found' });
        return;
      }
      res.json({ success: true, message: 'Habit deleted' });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ===================== EXPENSES =====================
  app.get('/api/expenses', (req, res) => {
    try {
      const type = req.query.type as 'expense' | 'income' | undefined;
      const month = req.query.month as string | undefined;
      const category = req.query.category as string | undefined;

      const expenses = expensesRepo.getAll({ type, month, category });
      res.json({ success: true, count: expenses.length, data: expenses });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/expenses', (req, res) => {
    try {
      const { title, amount, type, category, currency, date, notes } = req.body;
      if (!title || amount === undefined || isNaN(Number(amount))) {
        res.status(400).json({ success: false, error: 'Title and numeric amount are required' });
        return;
      }
      const expense = expensesRepo.create({
        title,
        amount: Number(amount),
        type,
        category,
        currency,
        date,
        notes
      });
      res.status(201).json({ success: true, data: expense });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.get('/api/expenses/summary', (req, res) => {
    try {
      const month = req.query.month as string | undefined;
      const summary = expensesRepo.getSummary(month);
      res.json({ success: true, data: summary });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.delete('/api/expenses/:id', (req, res) => {
    try {
      const deleted = expensesRepo.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Expense record not found' });
        return;
      }
      res.json({ success: true, message: 'Expense deleted' });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ===================== AI ASSISTANT INTENT & SPEECH =====================
  app.post('/api/ai/intent', async (req, res) => {
    try {
      const { prompt, language } = req.body;
      if (!prompt) {
        res.status(400).json({ success: false, error: 'Prompt is required' });
        return;
      }
      const response = await aiService.processPrompt(prompt, language);
      res.json({ success: true, data: response });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // ===================== BACKUP & RESTORE =====================
  app.get('/api/backup/export', (_req, res) => {
    try {
      const backupData = {
        version: '1.0.0',
        exported_at: new Date().toISOString(),
        profile: profileRepo.get(),
        notes: notesRepo.getAll(),
        tasks: tasksRepo.getAll(),
        habits: habitsRepo.getAll(),
        expenses: expensesRepo.getAll()
      };
      res.json({ success: true, data: backupData });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  app.post('/api/backup/import', (req, res) => {
    try {
      const backup = req.body;
      if (!backup || !backup.version) {
        res.status(400).json({ success: false, error: 'Invalid backup format' });
        return;
      }

      if (backup.profile) {
        profileRepo.update(backup.profile);
      }

      if (Array.isArray(backup.notes)) {
        for (const n of backup.notes) {
          if (!notesRepo.getById(n.id)) {
            notesRepo.create(n);
          }
        }
      }

      if (Array.isArray(backup.tasks)) {
        for (const t of backup.tasks) {
          if (!tasksRepo.getById(t.id)) {
            tasksRepo.create(t);
          }
        }
      }

      if (Array.isArray(backup.expenses)) {
        for (const e of backup.expenses) {
          if (!expensesRepo.getById(e.id)) {
            expensesRepo.create(e);
          }
        }
      }

      res.json({ success: true, message: 'Backup restored successfully' });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // Serve Client SPA in production
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // 404 Handler for unhandled API routes
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  });

  return app;
}
