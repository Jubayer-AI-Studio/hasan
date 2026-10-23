import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../src/db/connection.js';
import { createApp } from '../src/app.js';
import type express from 'express';

describe('Backend API End-to-End Integration Tests', () => {
  let db: DatabaseSync;
  let app: express.Express;

  beforeEach(() => {
    db = getDatabase(':memory:');
    app = createApp(db);
  });

  afterEach(() => {
    db.close();
  });

  test('GET /api/health returns 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'Hasan Life Guide Backend');
  });

  test('Profile API: GET & PUT settings (Name, Arabic RTL, Sophia Mode)', async () => {
    // GET default profile
    const getRes = await request(app).get('/api/profile');
    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.data.name, 'Hasan');
    assert.equal(getRes.body.data.language, 'bn');
    assert.equal(getRes.body.data.theme, 'sophia');

    // PUT updated profile
    const putRes = await request(app)
      .put('/api/profile')
      .send({
        name: 'হাসান আল-মাহমুদ',
        language: 'ar',
        theme: 'sophia',
        mascot_enabled: true
      });

    assert.equal(putRes.status, 200);
    assert.equal(putRes.body.data.name, 'হাসান আল-মাহমুদ');
    assert.equal(putRes.body.data.language, 'ar');
    assert.equal(putRes.body.data.theme, 'sophia');
  });

  test('Notes API: Full lifecycle (Create, Read, Search, Update, Delete)', async () => {
    // 1. Create Note
    const createRes = await request(app)
      .post('/api/notes')
      .send({
        title: 'Project Goals 2026 (আমার লক্ষ্য)',
        content: 'সম্পূর্ণ ফিচারের তালিকা সম্পন্ন করা এবং ক্লায়েন্টকে উপস্থাপন করা।',
        tags: ['goals', 'hasan'],
        is_pinned: true,
        color: '#6366F1'
      });
    assert.equal(createRes.status, 201);
    const noteId = createRes.body.data.id;
    assert.ok(noteId);

    // 2. Read Note
    const getRes = await request(app).get(`/api/notes/${noteId}`);
    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.data.title, 'Project Goals 2026 (আমার লক্ষ্য)');
    assert.equal(getRes.body.data.is_pinned, true);

    // 3. Search Note in Bengali
    const searchRes = await request(app).get('/api/notes?search=লক্ষ্য');
    assert.equal(searchRes.status, 200);
    assert.equal(searchRes.body.count, 1);

    // 4. Update Note
    const updateRes = await request(app)
      .put(`/api/notes/${noteId}`)
      .send({ title: 'Updated Project Goals' });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.data.title, 'Updated Project Goals');

    // 5. Delete Note
    const delRes = await request(app).delete(`/api/notes/${noteId}`);
    assert.equal(delRes.status, 200);

    const checkRes = await request(app).get(`/api/notes/${noteId}`);
    assert.equal(checkRes.status, 404);
  });

  test('Voice Note Audio Attachment & Streaming API', async () => {
    // Create note first
    const noteRes = await request(app)
      .post('/api/notes')
      .send({
        title: 'Voice Diary Note',
        content: 'ভয়েস রেকর্ড সংযুক্ত নোট'
      });
    const noteId = noteRes.body.data.id;

    // Upload audio buffer
    const fakeAudioBuffer = Buffer.from('RIFF....WAVEfmt ....data....');
    const uploadRes = await request(app)
      .post(`/api/notes/${noteId}/audio`)
      .attach('audio', fakeAudioBuffer, 'voice_sample.webm')
      .field('duration_seconds', '24.5')
      .field('transcription', 'আজকের সকালের ভয়েস বার্তা');

    assert.equal(uploadRes.status, 201);
    assert.ok(uploadRes.body.data.id);
    assert.equal(uploadRes.body.data.transcription, 'আজকের সকালের ভয়েস বার্তা');
    const filename = uploadRes.body.data.filename;

    // Stream uploaded audio
    const streamRes = await request(app).get(`/api/audio/${filename}`);
    assert.equal(streamRes.status, 200);

    // Retrieve note and verify attached audio
    const noteWithAudio = await request(app).get(`/api/notes/${noteId}`);
    assert.equal(noteWithAudio.body.data.audios.length, 1);
    assert.equal(noteWithAudio.body.data.audios[0].filename, filename);
  });

  test('Tasks API: Create, Filter by priority, Toggle completion', async () => {
    const t1 = await request(app)
      .post('/api/tasks')
      .send({ title: 'Create Client Presentation', priority: 'high', category: 'work' });
    assert.equal(t1.status, 201);

    const t2 = await request(app)
      .post('/api/tasks')
      .send({ title: 'Read Book', priority: 'low', category: 'personal' });
    assert.equal(t2.status, 201);

    // Toggle t1
    const toggleRes = await request(app).patch(`/api/tasks/${t1.body.data.id}/toggle`);
    assert.equal(toggleRes.status, 200);
    assert.equal(toggleRes.body.data.is_completed, true);

    // List completed tasks
    const listRes = await request(app).get('/api/tasks?is_completed=true');
    assert.equal(listRes.status, 200);
    assert.equal(listRes.body.count, 1);
    assert.equal(listRes.body.data[0].id, t1.body.data.id);
  });

  test('Habits API: Create, Toggle date, Track streaks', async () => {
    const habitRes = await request(app)
      .post('/api/habits')
      .send({ title: 'নামাজ ও ধ্যান', frequency: 'daily', color: '#10B981' });
    assert.equal(habitRes.status, 201);
    const habitId = habitRes.body.data.id;

    // Toggle today's completion
    const today = new Date().toISOString().slice(0, 10);
    const toggleRes = await request(app)
      .post(`/api/habits/${habitId}/toggle`)
      .send({ date: today });

    assert.equal(toggleRes.status, 200);
    assert.equal(toggleRes.body.data.completed, true);
    assert.equal(toggleRes.body.data.habit.current_streak, 1);
  });

  test('Expenses API: Log income/expense, Monthly summary', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const month = today.slice(0, 7);

    // Add Income
    await request(app).post('/api/expenses').send({
      title: 'Freelance Project Income',
      amount: 45000,
      type: 'income',
      category: 'project',
      date: today
    });

    // Add Expense
    await request(app).post('/api/expenses').send({
      title: 'Hosting & Server Fee',
      amount: 2500,
      type: 'expense',
      category: 'tech',
      date: today
    });

    // Get Summary
    const summaryRes = await request(app).get(`/api/expenses/summary?month=${month}`);
    assert.equal(summaryRes.status, 200);
    assert.equal(summaryRes.body.data.total_income, 45000);
    assert.equal(summaryRes.body.data.total_expense, 2500);
    assert.equal(summaryRes.body.data.net_balance, 42500);
  });

  test('AI Assistant Intent API: Local Offline Intent Engine (Bengali)', async () => {
    // 1. Greeting
    const greetRes = await request(app)
      .post('/api/ai/intent')
      .send({ prompt: 'কেমন আছো হাসান রোবট?', language: 'bn' });
    assert.equal(greetRes.status, 200);
    assert.equal(greetRes.body.data.source, 'local_engine');
    assert.equal(greetRes.body.data.actionTaken.type, 'greeting');
    assert.ok(greetRes.body.data.reply.includes('হাসান রোবট'));

    // 2. Voice task creation via AI intent
    const taskIntentRes = await request(app)
      .post('/api/ai/intent')
      .send({ prompt: 'টাস্ক: ক্লায়েন্টকে ডেমো দেখানো', language: 'bn' });
    assert.equal(taskIntentRes.status, 200);
    assert.equal(taskIntentRes.body.data.actionTaken.type, 'create_task');
    assert.equal(taskIntentRes.body.data.actionTaken.data.title, 'ক্লায়েন্টকে ডেমো দেখানো');

    // 3. Voice note creation via AI intent
    const noteIntentRes = await request(app)
      .post('/api/ai/intent')
      .send({ prompt: 'নোট: আগামী সপ্তাহের মিটিং এজেন্ডা', language: 'bn' });
    assert.equal(noteIntentRes.status, 200);
    assert.equal(noteIntentRes.body.data.actionTaken.type, 'create_note');
  });

  test('Backup & Restore API: Full database export and import', async () => {
    // Create sample task
    await request(app).post('/api/tasks').send({ title: 'Task to backup' });

    // Export
    const exportRes = await request(app).get('/api/backup/export');
    assert.equal(exportRes.status, 200);
    assert.equal(exportRes.body.data.version, '1.0.0');
    assert.ok(Array.isArray(exportRes.body.data.tasks));

    // Import
    const importRes = await request(app)
      .post('/api/backup/import')
      .send(exportRes.body.data);
    assert.equal(importRes.status, 200);
    assert.equal(importRes.body.success, true);
  });

  test('Static Client SPA: Root / serves built index.html', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hasan Life Guide') || res.text.includes('html'));
  });
});
