import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { getDatabase } from '../src/db/connection.js';
import { NotesRepository } from '../src/db/notesRepo.js';
import { TasksRepository, HabitsRepository, ExpensesRepository, ProfileRepository } from '../src/db/lifeRepo.js';

describe('Repositories Unit Tests', () => {
  let db: DatabaseSync;
  let notesRepo: NotesRepository;
  let tasksRepo: TasksRepository;
  let habitsRepo: HabitsRepository;
  let expensesRepo: ExpensesRepository;
  let profileRepo: ProfileRepository;

  beforeEach(() => {
    db = getDatabase(':memory:');
    notesRepo = new NotesRepository(db);
    tasksRepo = new TasksRepository(db);
    habitsRepo = new HabitsRepository(db);
    expensesRepo = new ExpensesRepository(db);
    profileRepo = new ProfileRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  test('NotesRepository: CRUD, tag filtering, and search', () => {
    const note1 = notesRepo.create({
      title: 'Daily Reflection in Bangla (বাংলা ডায়রি)',
      content: 'আজকের দিনটি চমৎকার ছিল। অনেক কিছু শিখলাম।',
      tags: ['reflection', 'life'],
      is_pinned: true
    });

    const note2 = notesRepo.create({
      title: 'Arabic Vocabulary List',
      content: 'كلمات جديدة للمذاكرة',
      tags: ['study'],
      is_pinned: false
    });

    assert.equal(notesRepo.getAll().length, 2);
    // Pinned note comes first
    assert.equal(notesRepo.getAll()[0].id, note1.id);

    // Search query
    const searchResults = notesRepo.getAll({ search: 'বাংলা' });
    assert.equal(searchResults.length, 1);
    assert.equal(searchResults[0].id, note1.id);

    // Tag filter
    const tagResults = notesRepo.getAll({ tag: 'study' });
    assert.equal(tagResults.length, 1);
    assert.equal(tagResults[0].id, note2.id);

    // Update
    const updated = notesRepo.update(note1.id, { title: 'Updated Title' });
    assert.equal(updated?.title, 'Updated Title');

    // Delete
    assert.ok(notesRepo.delete(note2.id));
    assert.equal(notesRepo.getAll().length, 1);
  });

  test('NotesRepository: Audio Memo Attachment & Cascading', () => {
    const note = notesRepo.create({
      title: 'Voice Thought',
      content: 'Quick note with attached audio message'
    });

    // Create a dummy temp audio file
    const tempAudio = path.resolve('temp_test_audio.webm');
    fs.writeFileSync(tempAudio, 'fake audio binary bytes');

    const audioMemo = notesRepo.addAudioMemo(note.id, {
      filename: 'voice_memo_1.webm',
      filepath: tempAudio,
      duration_seconds: 18.5,
      file_size_bytes: 1024,
      transcription: 'মনে রাখতে হবে আজকের মিটিং'
    });

    assert.ok(audioMemo.id);
    assert.equal(audioMemo.transcription, 'মনে রাখতে হবে আজকের মিটিং');

    // Fetch note with audios
    const fetched = notesRepo.getById(note.id);
    assert.ok(fetched?.audios);
    assert.equal(fetched.audios.length, 1);
    assert.equal(fetched.audios[0].filename, 'voice_memo_1.webm');

    // Delete note and verify audio file was removed from disk
    notesRepo.delete(note.id);
    assert.equal(fs.existsSync(tempAudio), false, 'Audio file should be removed from disk when note is deleted');
  });

  test('TasksRepository: priority sorting and toggling', () => {
    const t1 = tasksRepo.create({ title: 'Pay Internet Bill', priority: 'low' });
    const t2 = tasksRepo.create({ title: 'Finish Client Presentation', priority: 'high' });

    const all = tasksRepo.getAll();
    assert.equal(all[0].id, t2.id, 'High priority task must come first');

    const toggled = tasksRepo.toggle(t1.id);
    assert.equal(toggled?.is_completed, true);
  });

  test('HabitsRepository: accurate streak calculation', () => {
    const habit = habitsRepo.create({ title: 'Morning Exercise', color: '#10B981' });

    // Log yesterday and today
    const today = '2026-10-10';
    const yesterday = '2026-10-09';
    const dayBefore = '2026-10-08';

    habitsRepo.toggleDate(habit.id, dayBefore);
    habitsRepo.toggleDate(habit.id, yesterday);
    habitsRepo.toggleDate(habit.id, today);

    const habitWithStreak = habitsRepo.getById(habit.id, today);
    assert.equal(habitWithStreak?.current_streak, 3);
    assert.equal(habitWithStreak?.is_completed_today, true);
  });

  test('ExpensesRepository: monthly summary and category breakdown', () => {
    expensesRepo.create({
      title: 'Client Payment',
      amount: 50000,
      type: 'income',
      category: 'salary',
      date: '2026-10-01'
    });

    expensesRepo.create({
      title: 'Groceries',
      amount: 4500,
      type: 'expense',
      category: 'food',
      date: '2026-10-05'
    });

    expensesRepo.create({
      title: 'Internet Bill',
      amount: 1500,
      type: 'expense',
      category: 'utilities',
      date: '2026-10-08'
    });

    const summary = expensesRepo.getSummary('2026-10');
    assert.equal(summary.total_income, 50000);
    assert.equal(summary.total_expense, 6000);
    assert.equal(summary.net_balance, 44000);
    assert.equal(summary.category_breakdown['food'], 4500);
    assert.equal(summary.category_breakdown['utilities'], 1500);
  });

  test('ProfileRepository: update language to Arabic and theme to Sophia Mode', () => {
    const initial = profileRepo.get();
    assert.equal(initial.name, 'Hasan');

    const updated = profileRepo.update({
      name: 'হাসান ভাই',
      language: 'ar',
      theme: 'sophia'
    });

    assert.equal(updated.name, 'হাসান ভাই');
    assert.equal(updated.language, 'ar');
    assert.equal(updated.theme, 'sophia');
  });
});
