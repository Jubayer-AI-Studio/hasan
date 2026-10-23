import React, { useState, useEffect, useRef } from 'react';
import { HasanRobot3D, MascotState } from './HasanRobot3D';
import { speechService } from '../../services/speechService';
import { API, AIResponseData } from '../../services/api';
import { Translations, Language } from '../../i18n/translations';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  Send,
  X,
  Sparkles,
  Bot,
  AlertCircle,
  ArrowLeftRight
} from 'lucide-react';

interface MascotDockProps {
  t: Translations;
  language: Language;
  theme: string;
  mascotEnabled?: boolean;
  onToggleMascot?: (enabled: boolean) => void;
  onRefreshData?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'robot';
  text: string;
  timestamp: string;
}

export const MascotDock: React.FC<MascotDockProps> = ({
  t,
  language,
  theme,
  mascotEnabled = true,
  onToggleMascot,
  onRefreshData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [robotState, setRobotState] = useState<MascotState>('idle');
  const [mouthAmplitude, setMouthAmplitude] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSophia = theme === 'sophia';
  const isLight = theme === 'light';
  const isRTL = language === 'ar';

  // Dock placement: 'right' or 'left' (can be moved by user)
  const [dockSide, setDockSide] = useState<'right' | 'left'>(() => {
    try {
      const saved = localStorage.getItem('hasan_mascot_side');
      if (saved === 'right' || saved === 'left') return saved;
    } catch {}
    return isRTL ? 'left' : 'right';
  });

  // Mascot visibility (can be completely hidden/dismissed by user)
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('hasan_mascot_dismissed');
      return saved === 'true';
    } catch {}
    return false;
  });

  const isVisible = mascotEnabled && !isDismissed;

  const handleToggleSide = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSide = dockSide === 'right' ? 'left' : 'right';
    setDockSide(newSide);
    try {
      localStorage.setItem('hasan_mascot_side', newSide);
    } catch {}
  };

  const handleHideMascot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    try {
      localStorage.setItem('hasan_mascot_dismissed', 'true');
    } catch {}
    if (onToggleMascot) {
      onToggleMascot(false);
    }
  };

  const handleShowMascot = () => {
    setIsDismissed(false);
    try {
      localStorage.setItem('hasan_mascot_dismissed', 'false');
    } catch {}
    if (onToggleMascot) {
      onToggleMascot(true);
    }
  };

  useEffect(() => {
    // Initial welcome message
    const welcomeText = language === 'bn'
      ? 'স্বাগতম! আমি হাসান রোবট। আপনার নোট, টাস্ক, খরচ বা যেকোনো কিছুতে সাহায্য করতে আমি সদা প্রস্তুত।'
      : language === 'ar'
      ? 'أهلاً بك! أنا روبوت حسن، مساعدك الذكي ومستعد دائمًا لمساعدتك في تنظيم حياتك.'
      : 'Welcome! I am Hasan Robot. I am ready to help you organize notes, tasks, expenses, and your day.';

    setMessages([
      {
        id: 'msg-0',
        sender: 'robot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setMicError(null);
    setRobotState('thinking');

    try {
      const response: AIResponseData = await API.sendAIIntent(text, language);

      const robotMsg: ChatMessage = {
        id: `robot-${Date.now()}`,
        sender: 'robot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, robotMsg]);

      // If action was taken (e.g. task/note created), refresh dashboard
      if (response.actionTaken && onRefreshData) {
        onRefreshData();
      }

      // Speak reply out loud if not muted
      if (!isMuted) {
        setRobotState('speaking');
        speechService.speak(response.reply, language, {
          onAmplitude: (amp) => setMouthAmplitude(amp),
          onEnd: () => {
            setRobotState('idle');
            setMouthAmplitude(0);
          }
        });
      } else {
        setRobotState('idle');
      }
    } catch {
      setRobotState('idle');
      const errorMsg: ChatMessage = {
        id: `robot-${Date.now()}`,
        sender: 'robot',
        text: language === 'bn' ? 'দুঃখিত, সংযোগে কিছু সমস্যা হয়েছে।' : 'Sorry, connection error occurred.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setRobotState('idle');
      return;
    }

    if (!speechService.isSTTSupported()) {
      setMicError(t.robot.micNotice);
      return;
    }

    setMicError(null);
    setRobotState('listening');
    setIsListening(true);

    const started = speechService.startListening(
      language,
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal && transcript.trim().length > 1) {
          speechService.stopListening();
          setIsListening(false);
          handleSendMessage(transcript);
        }
      },
      (error) => {
        setIsListening(false);
        setRobotState('idle');
        setMicError(error);
      }
    );

    if (!started) {
      setIsListening(false);
      setRobotState('idle');
      setMicError(t.robot.micNotice);
    }
  };

  return (
    <>
      {/* 1. When hidden / dismissed, render an unobtrusive restore button */}
      {!isVisible && !isOpen && (
        <div
          className={`fixed z-40 transition-all duration-300 ${
            dockSide === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8'
          } bottom-20 md:bottom-8`}
        >
          <button
            onClick={handleShowMascot}
            title={t.robot.show}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full font-bold text-xs shadow-xl transition-all transform hover:scale-105 active:scale-95 border ${
              isSophia
                ? 'sophia-glow-pill text-cyan-200 hover:shadow-glow-cyan'
                : isLight
                ? 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Bot size={16} className={isLight ? 'text-sky-600 animate-pulse' : 'text-cyan-400 animate-pulse'} />
            <span>{t.robot.show}</span>
          </button>
        </div>
      )}

      {/* 2. Floating 3D Mascot Button */}
      {isVisible && (
        <div
          className={`fixed z-40 transition-all duration-300 ${
            dockSide === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8'
          } bottom-20 md:bottom-8`}
        >
          {!isOpen && (
            <div className="flex flex-col items-center">
              {!isMinimized ? (
                <div className="relative group">
                  {/* Speech Bubble Pill on Hover */}
                  <div
                    className={`absolute -top-10 ${
                      dockSide === 'left' ? 'left-0' : 'right-0'
                    } whitespace-nowrap px-3 py-1 text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg ${
                      isSophia
                        ? 'sophia-glow-pill text-cyan-200'
                        : isLight
                        ? 'bg-white text-slate-800 border border-slate-200'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {t.robot.tapToChat}
                  </div>

                  {/* Mascot Widget Card - Full Body Floating Cute Robot */}
                  <div
                    onClick={() => setIsOpen(true)}
                    className={`relative cursor-pointer rounded-3xl p-2 transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center app-card ${
                      isSophia
                        ? 'hover:shadow-glow-cyan border-cyan-500/40'
                        : isLight
                        ? 'border-sky-200 hover:border-sky-400 shadow-xl'
                        : 'border-sky-500/30 hover:border-sky-400/60 shadow-xl'
                    }`}
                  >
                    <HasanRobot3D
                      state={robotState}
                      mouthAmplitude={mouthAmplitude}
                      isSophiaMode={isSophia}
                      theme={theme as any}
                      size={145}
                    />

                    {/* Quick Controls overlay on mascot widget */}
                    <div
                      className={`absolute bottom-2 right-2 flex items-center space-x-1 rtl:space-x-reverse rounded-full px-2 py-0.5 border shadow-md backdrop-blur-sm ${
                        isLight
                          ? 'bg-white/95 border-slate-200 text-slate-600'
                          : 'bg-slate-900/90 border-white/15 text-slate-300'
                      }`}
                    >
                      {/* Move Side (Left / Right Corner Toggle) */}
                      <button
                        onClick={handleToggleSide}
                        title={t.robot.moveSide}
                        className={`p-1 transition-colors ${
                          isLight ? 'hover:text-sky-600' : 'hover:text-cyan-400'
                        }`}
                      >
                        <ArrowLeftRight size={12} />
                      </button>

                      {/* Mute Voice */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted(!isMuted);
                        }}
                        title={isMuted ? t.robot.unmute : t.robot.mute}
                        className={`p-1 transition-colors ${
                          isLight ? 'hover:text-sky-600' : 'hover:text-cyan-400'
                        }`}
                      >
                        {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      </button>

                      {/* Minimize to Pill */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMinimized(true);
                        }}
                        title={t.robot.minimize}
                        className={`p-1 transition-colors ${
                          isLight ? 'hover:text-sky-600' : 'hover:text-cyan-400'
                        }`}
                      >
                        <Minimize2 size={12} />
                      </button>

                      {/* Hide / Dismiss Mascot Completely */}
                      <button
                        onClick={handleHideMascot}
                        title={t.robot.hide}
                        className="p-1 transition-colors text-rose-400 hover:text-rose-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Minimized Pill with Mobility & Dismissal controls
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsMinimized(false)}
                    className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-full font-medium text-xs transition-all duration-300 shadow-xl ${
                      isSophia
                        ? 'sophia-glow-pill text-cyan-200 hover:shadow-glow-cyan'
                        : isLight
                        ? 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Bot size={16} className={isLight ? 'text-sky-600 animate-pulse' : 'text-cyan-400 animate-pulse'} />
                    <span>{t.robot.name}</span>
                    <Maximize2 size={12} />
                  </button>

                  <button
                    onClick={handleToggleSide}
                    title={t.robot.moveSide}
                    className={`p-2 rounded-full border shadow-md transition-colors ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-600 hover:text-sky-600'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-cyan-400'
                    }`}
                  >
                    <ArrowLeftRight size={12} />
                  </button>

                  <button
                    onClick={handleHideMascot}
                    title={t.robot.hide}
                    className={`p-2 rounded-full border shadow-md text-rose-400 hover:text-rose-500 transition-colors ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Full AI Assistant Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end rtl:justify-start bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div
            className={`w-full max-w-lg h-full flex flex-col shadow-2xl transition-all duration-300 border-l rtl:border-r rtl:border-l-0 app-drawer`}
          >
            {/* Drawer Header */}
            <div className={`p-4 flex items-center justify-between border-b ${
              isLight ? 'border-slate-200' : 'border-white/10'
            }`}>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border ${
                  isLight
                    ? 'bg-sky-50 border-sky-200 text-sky-600'
                    : 'bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border-cyan-500/40 text-cyan-400'
                }`}>
                  <Bot className="w-6 h-6 animate-float" />
                </div>
                <div>
                  <h3 className={`font-bold text-base flex items-center gap-2 ${
                    isLight ? 'text-slate-900' : 'text-slate-100'
                  }`}>
                    {t.robot.name}
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                      isLight
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {t.robot.states[robotState]}
                    </span>
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t.robot.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? t.robot.unmute : t.robot.mute}
                  className={`p-2 rounded-xl transition-colors ${
                    isLight
                      ? 'text-slate-500 hover:text-sky-600 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'
                  }`}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isLight
                      ? 'text-slate-500 hover:text-red-500 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-red-400 hover:bg-white/5'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Interactive 3D Mascot Preview in Drawer */}
            <div className={`flex flex-col items-center justify-center py-4 border-b ${
              isLight
                ? 'bg-gradient-to-b from-sky-50/40 to-slate-50/80 border-slate-200'
                : 'bg-gradient-to-b from-transparent to-black/30 border-white/10'
            }`}>
              <HasanRobot3D
                state={robotState}
                mouthAmplitude={mouthAmplitude}
                isSophiaMode={isSophia}
                theme={theme as any}
                size={200}
              />
              <span className={`text-xs font-semibold flex items-center gap-1.5 mt-2 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}>
                <Sparkles size={14} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />
                {t.robot.states[robotState]}
              </span>
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? isSophia
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-violet'
                          : isLight
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-cyan-600 text-white shadow-md'
                        : isSophia
                        ? 'sophia-glass-card text-slate-100 border-white/10'
                        : isLight
                        ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm'
                        : 'bg-[#141C2B] text-slate-100 border border-[#2B3A52]'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[10px] mt-1 px-1 ${
                    isLight ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Mic Notice / Truthful Speech Probe */}
            {micError && (
              <div className="mx-4 mb-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            {/* Suggested Prompt Quick Buttons */}
            <div className={`px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t ${
              isLight ? 'border-slate-200' : 'border-white/5'
            }`}>
              {t.robot.suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-xs transition-colors ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className={`p-4 border-t flex items-center gap-2 ${
              isLight ? 'border-slate-200' : 'border-white/10'
            }`}>
              <button
                onClick={handleToggleVoiceInput}
                className={`p-3 rounded-2xl transition-all duration-200 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                    : isSophia
                    ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isListening ? t.notes.stopRecording : t.notes.voiceDictation}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={t.robot.inputPlaceholder}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${
                  isLight
                    ? 'bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                    : 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500'
                }`}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className={`p-3 rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                  isSophia
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-glow-cyan'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                <Send size={18} className="rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
