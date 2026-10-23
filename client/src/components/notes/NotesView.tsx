import React, { useState, useEffect, useRef } from 'react';
import { Note, NoteAudio, API } from '../../services/api';
import { speechService } from '../../services/speechService';
import { Translations, Language } from '../../i18n/translations';
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Mic,
  MicOff,
  Radio,
  Play,
  Pause,
  Volume2,
  Calendar,
  X,
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface NotesViewProps {
  t: Translations;
  language: Language;
  theme: string;
}

const COLOR_OPTIONS = [
  '#1E293B', // Slate
  '#0F172A', // Dark Navy
  '#312E81', // Indigo Deep
  '#4C1D95', // Violet Deep
  '#831843', // Rose Deep
  '#064E3B', // Emerald Deep
  '#78350F', // Amber Deep
];

export const NotesView: React.FC<NotesViewProps> = ({ t, language, theme }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New/Edit Note Form State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState('#1E293B');

  // Live Voice Dictation in note editor
  const [isDictating, setIsDictating] = useState(false);
  const [dictationNotice, setDictationNotice] = useState<string | null>(null);

  // Audio Recording (Voice Memo)
  const [isRecordingMemo, setIsRecordingMemo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);

  // Audio Player State for attached memos
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const isSophia = theme === 'sophia';

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const data = await API.getNotes();
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || n.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const otherNotes = filteredNotes.filter((n) => !n.is_pinned);

  // Collect all unique tags
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  // Save Note
  const handleSaveNote = async () => {
    if (!title.trim() && !content.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const notePayload = {
      title: title.trim() || t.notes.noteTitlePlaceholder,
      content: content.trim(),
      tags: parsedTags,
      is_pinned: isPinned,
      color
    };

    try {
      if (editingNoteId) {
        await API.updateNote(editingNoteId, notePayload);
      } else {
        await API.createNote(notePayload);
      }
      closeModal();
      loadNotes();
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTagsInput(note.tags.join(', '));
    setIsPinned(note.is_pinned);
    setColor(note.color);
    setIsModalOpen(true);
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t.notes.confirmDelete)) {
      await API.deleteNote(id);
      loadNotes();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setTagsInput('');
    setIsPinned(false);
    setColor('#1E293B');
    if (isDictating) {
      speechService.stopListening();
      setIsDictating(false);
    }
    if (isRecordingMemo) {
      stopRecordingMemo(false);
    }
    setDictationNotice(null);
  };

  // Voice Dictation (Speech to Text inside note)
  const handleToggleDictation = () => {
    if (isDictating) {
      speechService.stopListening();
      setIsDictating(false);
      setDictationNotice(null);
      return;
    }

    if (!speechService.isSTTSupported()) {
      setDictationNotice(t.notes.micNotSupported);
      return;
    }

    setDictationNotice(t.notes.dictationListening);
    setIsDictating(true);

    const started = speechService.startListening(
      language,
      (transcript, _isFinal) => {
        setContent(prev => (prev ? `${prev} ${transcript}` : transcript));
      },
      (error) => {
        setDictationNotice(`${t.notes.micNotSupported} (${error})`);
        setIsDictating(false);
      }
    );

    if (!started) {
      setIsDictating(false);
    }
  };

  // Audio Memo Recording (Direct voice memo attachment)
  const startRecordingMemo = async () => {
    const started = await speechService.startRecordingAudio();
    if (started) {
      setIsRecordingMemo(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      alert(t.notes.micNotSupported);
    }
  };

  const stopRecordingMemo = async (saveToNote: boolean = true) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    setIsRecordingMemo(false);
    const audioResult = await speechService.stopRecordingAudio();

    if (saveToNote && audioResult && editingNoteId) {
      try {
        await API.uploadNoteAudio(editingNoteId, audioResult.blob, audioResult.durationSeconds);
        loadNotes();
      } catch (err) {
        console.error('Failed to upload audio memo:', err);
      }
    }
  };

  // Play Attached Audio
  const handlePlayAudio = (audio: NoteAudio) => {
    if (playingAudioId === audio.id) {
      // Pause
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      // Play new
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audioUrl = `/api/audio/${audio.filename}`;
      const player = new Audio(audioUrl);
      audioPlayerRef.current = player;
      setPlayingAudioId(audio.id);

      player.onended = () => {
        setPlayingAudioId(null);
      };

      player.play().catch(err => {
        console.warn('Playback error:', err);
        setPlayingAudioId(null);
      });
    }
  };

  const handleDeleteAudio = async (audioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingAudioId === audioId && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudioId(null);
    }
    await API.deleteNoteAudio(audioId);
    loadNotes();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black flex items-center gap-2 ${
            theme === 'light' ? 'text-slate-900' : 'text-slate-100'
          }`}>
            <FileText className={`w-7 h-7 ${theme === 'light' ? 'text-sky-600' : 'text-cyan-400'}`} />
            {t.notes.title}
          </h1>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            {t.notes.subtitle}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingNoteId(null);
            setIsModalOpen(true);
          }}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            isSophia
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white hover:shadow-glow-cyan'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          <Plus size={18} />
          <span>{t.notes.newNote}</span>
        </button>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.notes.searchPlaceholder}
            className={`w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-2xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors ${
              theme === 'light'
                ? 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'
                : 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 rtl:left-3.5 rtl:right-auto top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTag === ''
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {t.notes.allTags}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          {t.common.loading}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-white/10 p-8">
          <FileText size={42} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-300">{t.notes.noNotesFound}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {t.notes.createFirstNote}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Pin size={14} />
                <span>{t.notes.pinnedNotes}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    t={t}
                    isSophia={isSophia}
                    theme={theme}
                    playingAudioId={playingAudioId}
                    onPlayAudio={handlePlayAudio}
                    onDeleteAudio={handleDeleteAudio}
                    onEdit={() => handleEditNote(note)}
                    onDelete={(e) => handleDeleteNote(note.id, e)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes Section */}
          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>{t.notes.otherNotes}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    t={t}
                    isSophia={isSophia}
                    theme={theme}
                    playingAudioId={playingAudioId}
                    onPlayAudio={handlePlayAudio}
                    onDeleteAudio={handleDeleteAudio}
                    onEdit={() => handleEditNote(note)}
                    onDelete={(e) => handleDeleteNote(note.id, e)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border app-modal">
            {/* Modal Header */}
            <div className={`p-5 border-b flex items-center justify-between ${
              theme === 'light' ? 'border-slate-200' : 'border-white/10'
            }`}>
              <h2 className={`font-bold text-lg flex items-center gap-2 ${
                theme === 'light' ? 'text-slate-900' : 'text-slate-100'
              }`}>
                <FileText size={20} className={theme === 'light' ? 'text-sky-600' : 'text-cyan-400'} />
                {editingNoteId ? t.notes.title : t.notes.newNote}
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-2 rounded-xl transition-colors ${
                    isPinned
                      ? 'bg-amber-500/20 text-amber-500'
                      : theme === 'light'
                      ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  title={t.notes.pinNote}
                >
                  {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
                </button>
                <button
                  onClick={closeModal}
                  className={`p-2 rounded-xl transition-colors ${
                    theme === 'light'
                      ? 'text-slate-500 hover:text-red-500 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-red-400 hover:bg-white/5'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Title input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.notes.noteTitlePlaceholder}
                className={`w-full rounded-2xl px-4 py-3 text-base font-bold focus:outline-none focus:border-cyan-500 transition-colors ${
                  theme === 'light'
                    ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                    : 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500'
                }`}
              />

              {/* Dictation Banner if Active */}
              {dictationNotice && (
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs flex items-center gap-2 animate-pulse">
                  <Radio size={15} />
                  <span>{dictationNotice}</span>
                </div>
              )}

              {/* Content Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t.notes.noteContentPlaceholder}
                rows={7}
                className={`w-full rounded-2xl p-4 text-sm focus:outline-none focus:border-cyan-500 resize-none leading-relaxed transition-colors ${
                  theme === 'light'
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                    : 'bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500'
                }`}
              />

              {/* VOICE CONTROLS PANEL */}
              <div className={`p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
              }`}>
                <div className="flex items-center gap-2">
                  {/* Live Speech-to-Text Dictation */}
                  <button
                    type="button"
                    onClick={handleToggleDictation}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      isDictating
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
                        : isSophia
                        ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40'
                        : theme === 'light'
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isDictating ? <MicOff size={16} /> : <Mic size={16} />}
                    <span>{isDictating ? t.notes.dictationStopped : t.notes.voiceDictation}</span>
                  </button>

                  {/* Audio Recording Memo (Only when note exists) */}
                  {editingNoteId && (
                    <button
                      type="button"
                      onClick={() => (isRecordingMemo ? stopRecordingMemo(true) : startRecordingMemo())}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isRecordingMemo
                          ? 'bg-purple-600 text-white animate-pulse shadow-lg shadow-purple-600/40'
                          : theme === 'light'
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
                          : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                      }`}
                    >
                      <Radio size={16} />
                      <span>
                        {isRecordingMemo
                          ? `${t.notes.stopRecording} (${recordingSeconds}s)`
                          : t.notes.recordVoiceMemo}
                      </span>
                    </button>
                  )}
                </div>

                {/* Color Choices */}
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {t.notes.color}:
                  </span>
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        color === c ? 'border-cyan-400 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Tags input */}
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={t.notes.tagsPlaceholder}
                className={`w-full rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-cyan-500 transition-colors ${
                  theme === 'light'
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                    : 'bg-white/5 border border-white/10 text-slate-300 placeholder-slate-500'
                }`}
              />
            </div>

            {/* Modal Footer */}
            <div className={`p-5 border-t flex items-center justify-end gap-3 ${
              theme === 'light' ? 'border-slate-200' : 'border-white/10'
            }`}>
              <button
                type="button"
                onClick={closeModal}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                  theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {t.notes.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className={`px-6 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition-all ${
                  isSophia
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-glow-cyan'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
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

// Sub-component: Note Card with Attached Audio Wave Player
interface NoteCardProps {
  note: Note;
  t: Translations;
  isSophia: boolean;
  theme: string;
  playingAudioId: string | null;
  onPlayAudio: (audio: NoteAudio) => void;
  onDeleteAudio: (audioId: string, e: React.MouseEvent) => void;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  t,
  isSophia,
  theme,
  playingAudioId,
  onPlayAudio,
  onDeleteAudio,
  onEdit,
  onDelete
}) => {
  return (
    <div
      onClick={onEdit}
      style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
      className="group relative rounded-3xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between app-card hover:-translate-y-1"
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`font-bold text-base transition-colors line-clamp-1 ${
            theme === 'light' ? 'text-slate-900 group-hover:text-sky-600' : 'text-slate-100 group-hover:text-cyan-300'
          }`}>
            {note.title}
          </h3>

          <div className="flex items-center gap-1 shrink-0">
            {note.is_pinned && (
              <span className="p-1 text-amber-500" title={t.notes.pinned}>
                <Pin size={14} />
              </span>
            )}
            <button
              onClick={onDelete}
              className={`p-1 transition-colors opacity-0 group-hover:opacity-100 ${
                theme === 'light' ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-red-400'
              }`}
              title={t.notes.delete}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Content excerpt */}
        <p className={`text-xs leading-relaxed line-clamp-4 whitespace-pre-wrap mb-3 ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-300'
        }`}>
          {note.content}
        </p>

        {/* ATTACHED AUDIO MEMOS WIDGET */}
        {note.audios && note.audios.length > 0 && (
          <div className="my-2 space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              theme === 'light' ? 'text-sky-600' : 'text-cyan-400'
            }`}>
              <Volume2 size={12} />
              {t.notes.attachedAudio} ({note.audios.length})
            </span>
            {note.audios.map((audio) => {
              const isPlaying = playingAudioId === audio.id;
              return (
                <div
                  key={audio.id}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                    isPlaying
                      ? 'bg-cyan-500/25 border border-cyan-400/50 shadow-glow-cyan'
                      : theme === 'light'
                      ? 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPlayAudio(audio)}
                      className={`p-1.5 rounded-lg transition-transform active:scale-95 ${
                        isPlaying
                          ? 'bg-cyan-400 text-slate-900'
                          : theme === 'light'
                          ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                          : 'bg-white/10 text-cyan-300 hover:bg-white/20'
                      }`}
                    >
                      {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-semibold ${
                        theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                      }`}>
                        {audio.transcription || `Voice Memo (${audio.duration_seconds}s)`}
                      </span>
                      <span className={`text-[9px] ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {audio.duration_seconds}s • WebM Audio
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => onDeleteAudio(audio.id, e)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: Tags & Date */}
      <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] ${
        theme === 'light' ? 'border-slate-100 text-slate-500' : 'border-white/5 text-slate-400'
      }`}>
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                theme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-slate-300'
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>

        <span className={`shrink-0 flex items-center gap-1 text-[10px] ${
          theme === 'light' ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <Calendar size={11} />
          {new Date(note.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

