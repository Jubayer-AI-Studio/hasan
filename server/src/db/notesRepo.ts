import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';

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

export class NotesRepository {
  constructor(private db: DatabaseSync) {}

  getAll(options?: { search?: string; tag?: string; is_pinned?: boolean }): Note[] {
    let sql = 'SELECT * FROM notes WHERE 1=1';
    const params: (string | number)[] = [];

    if (options?.search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${options.search}%`, `%${options.search}%`);
    }

    if (options?.tag) {
      sql += ' AND tags LIKE ?';
      params.push(`%"${options.tag}"%`);
    }

    if (options?.is_pinned !== undefined) {
      sql += ' AND is_pinned = ?';
      params.push(options.is_pinned ? 1 : 0);
    }

    sql += ' ORDER BY is_pinned DESC, updated_at DESC';

    const rows = this.db.prepare(sql).all(...params) as Array<Record<string, unknown>>;
    return rows.map(row => this.formatNote(row));
  }

  getById(id: string): Note | null {
    const row = this.db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) return null;

    const note = this.formatNote(row);
    // Fetch attached audio recordings
    const audios = this.db.prepare('SELECT * FROM note_audio WHERE note_id = ? ORDER BY created_at ASC').all(id) as Array<Record<string, unknown>>;
    note.audios = audios.map(a => this.formatAudio(a));
    return note;
  }

  create(data: {
    title: string;
    content: string;
    tags?: string[];
    is_pinned?: boolean;
    color?: string;
  }): Note {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const tagsJson = JSON.stringify(data.tags || []);
    const isPinned = data.is_pinned ? 1 : 0;
    const color = data.color || '#1E293B';

    this.db.prepare(`
      INSERT INTO notes (id, title, content, tags, is_pinned, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.title, data.content, tagsJson, isPinned, color, now, now);

    return this.getById(id)!;
  }

  update(id: string, data: Partial<{
    title: string;
    content: string;
    tags: string[];
    is_pinned: boolean;
    color: string;
  }>): Note | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const title = data.title !== undefined ? data.title : existing.title;
    const content = data.content !== undefined ? data.content : existing.content;
    const tagsJson = data.tags !== undefined ? JSON.stringify(data.tags) : JSON.stringify(existing.tags);
    const isPinned = data.is_pinned !== undefined ? (data.is_pinned ? 1 : 0) : (existing.is_pinned ? 1 : 0);
    const color = data.color !== undefined ? data.color : existing.color;
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE notes
      SET title = ?, content = ?, tags = ?, is_pinned = ?, color = ?, updated_at = ?
      WHERE id = ?
    `).run(title, content, tagsJson, isPinned, color, now, id);

    return this.getById(id);
  }

  delete(id: string): boolean {
    // Delete attached audio files from disk first
    const audios = this.db.prepare('SELECT filepath FROM note_audio WHERE note_id = ?').all(id) as Array<{ filepath: string }>;
    for (const a of audios) {
      if (fs.existsSync(a.filepath)) {
        try { fs.unlinkSync(a.filepath); } catch {}
      }
    }

    const result = this.db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    return (result.changes ?? 0) > 0;
  }

  // Audio Voice Memo Management inside notes
  addAudioMemo(noteId: string, data: {
    filename: string;
    filepath: string;
    duration_seconds?: number;
    file_size_bytes?: number;
    transcription?: string;
  }): NoteAudio {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO note_audio (id, note_id, filename, filepath, duration_seconds, file_size_bytes, transcription, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      noteId,
      data.filename,
      data.filepath,
      data.duration_seconds || 0,
      data.file_size_bytes || 0,
      data.transcription || '',
      now
    );

    const row = this.db.prepare('SELECT * FROM note_audio WHERE id = ?').get(id) as Record<string, unknown>;
    return this.formatAudio(row);
  }

  deleteAudioMemo(audioId: string): boolean {
    const row = this.db.prepare('SELECT filepath FROM note_audio WHERE id = ?').get(audioId) as { filepath: string } | undefined;
    if (row && fs.existsSync(row.filepath)) {
      try { fs.unlinkSync(row.filepath); } catch {}
    }
    const result = this.db.prepare('DELETE FROM note_audio WHERE id = ?').run(audioId);
    return (result.changes ?? 0) > 0;
  }

  private formatNote(row: Record<string, unknown>): Note {
    let parsedTags: string[] = [];
    try {
      parsedTags = JSON.parse(String(row.tags || '[]'));
    } catch {
      parsedTags = [];
    }

    return {
      id: String(row.id),
      title: String(row.title),
      content: String(row.content),
      tags: parsedTags,
      is_pinned: Number(row.is_pinned) === 1,
      color: String(row.color || '#1E293B'),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at)
    };
  }

  private formatAudio(row: Record<string, unknown>): NoteAudio {
    return {
      id: String(row.id),
      note_id: String(row.note_id),
      filename: String(row.filename),
      filepath: String(row.filepath),
      duration_seconds: Number(row.duration_seconds || 0),
      file_size_bytes: Number(row.file_size_bytes || 0),
      transcription: String(row.transcription || ''),
      created_at: String(row.created_at)
    };
  }
}
