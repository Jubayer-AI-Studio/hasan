import React, { useState, useEffect, useRef, Suspense } from 'react';
import { speechService } from '../../services/speechService';
import { API, AIResponseData } from '../../services/api';
import { Translations, Language } from '../../i18n/translations';
import { HasanRobot3D, MascotState } from '../mascot/HasanRobot3D';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  AlertCircle
} from 'lucide-react';

interface AIAssistantViewProps {
  t: Translations;
  language: Language;
  theme: string;
  onRefreshData?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'robot';
  text: string;
  timestamp: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  t,
  language,
  theme,
  onRefreshData
}) => {
  const [robotState, setRobotState] = useState<MascotState>('idle');
  const [mouthAmplitude, setMouthAmplitude] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSophia = theme === 'sophia';
  const isLight = theme === 'light';

  // Initial welcome message
  useEffect(() => {
    const welcome =
      language === 'bn'
        ? 'স্বাগতম! আমি আপনার কিউট এআই সহকারী হাসান রোবট। আপনার নোট, টাস্ক, খরচ কিংবা যেকোনো বিষয়ে কথা বলতে প্রস্তুত। নিচে লিখুন অথবা মাইকে কথা বলুন!'
        : language === 'ar'
        ? 'أهلاً بك! أنا روبوت حسن، مساعدك الذكي ومستعد دائمًا لمساعدتك في تنظيم حياتك.'
        : 'Welcome! I am your cute AI companion Hasan Robot. Feel free to ask me anything or use voice!';

    setMessages([
      {
        id: 'msg-0',
        sender: 'robot',
        text: welcome,
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

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
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
      setMessages((prev) => [...prev, robotMsg]);

      if (response.actionTaken && onRefreshData) {
        onRefreshData();
      }

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
        text:
          language === 'bn'
            ? 'অফলাইন মোড: সংযোগে কিছু সমস্যা হলেও আপনার অনুরোধ প্রসেস করার চেষ্টা করছি।'
            : 'Connection problem, trying offline processing.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleToggleVoice = () => {
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

  const quickPrompts =
    language === 'bn'
      ? [
          'সূর্য কেন পূর্ব দিকে ওঠে?',
          'সফল হওয়ার ৩টি চমৎকার টিপস দাও',
          'আজকের কী কী কাজ বাকি?',
          'আমার চলতি মাসের খরচ কত?',
          'আমার জন্য একটি নোট লিখো',
          'একটি মজার হাসির কৌতুক শোনাও',
          'মনোযোগ বাড়ানোর বিজ্ঞানসম্মত উপায়'
        ]
      : language === 'ar'
      ? [
          'ما هي مهامي اليوم؟',
          'سجل ملاحظة جديدة',
          'كم هو مجموع نفقاتي؟',
          'نصيحة اليوم للنجاح',
          'معلومة علمية شيقة'
        ]
      : [
          'Why does the Sun rise in the east?',
          '3 powerful tips for success',
          'What are my pending tasks?',
          'Show my monthly spending',
          'Take a quick note for me',
          'Tell me a witty joke'
        ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Introduction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
              <span
                className={
                  isSophia
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400'
                    : isLight
                    ? 'text-slate-900'
                    : 'text-white'
                }
              >
                হাসান এআই সহকারী
              </span>
            </h2>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
              🧠 সুপার ব্রেন সক্রিয়
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            বিশ্বমানের বুদ্ধিমান ব্রেন • সাধারণ জ্ঞান, বিজ্ঞান, জীবন পরামর্শ ও অ্যাপ পরিচালনা • কথা বলুন বা লিখুন
          </p>
        </div>

        {/* Mute/Sound Toggle Pill */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            isMuted
              ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
              : isSophia
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25'
              : isLight
              ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
              : 'bg-slate-800 text-slate-200 border-slate-700'
          }`}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span>{isMuted ? 'ভয়েস বন্ধ (Muted)' : 'ভয়েস চালু (Sound On)'}</span>
        </button>
      </div>

      {/* Main Grid: Robot Spotlight on Left, Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 1. ROBOT SPOTLIGHT CARD */}
        <div
          className={`lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl border text-center transition-all duration-300 relative overflow-hidden ${
            isSophia
              ? 'bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-[#160c33]/90 border-cyan-500/30 shadow-[0_8px_30px_rgba(0,223,216,0.12)]'
              : isLight
              ? 'bg-white border-slate-200 shadow-md'
              : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          {/* Ambient Background Lighting */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
              isSophia ? 'bg-cyan-500/20' : isLight ? 'bg-sky-300/20' : 'bg-cyan-600/15'
            }`}
          />

          {/* Status Badge */}
          <div className="relative z-10 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                robotState === 'speaking'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse'
                  : robotState === 'listening'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-ping'
                  : robotState === 'thinking'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : isSophia
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : isLight
                  ? 'bg-sky-100 text-sky-800 border-sky-200'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {robotState === 'speaking'
                ? 'কথা বলছি...'
                : robotState === 'listening'
                ? 'শুনছি...'
                : robotState === 'thinking'
                ? 'ভাবছি...'
                : 'বাতাসে ভাসছি (অপেক্ষায়)'}
            </span>
          </div>

          {/* Hasan Robot Canvas */}
          <div className="relative w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] flex items-center justify-center">
            <HasanRobot3D
              state={robotState}
              mouthAmplitude={mouthAmplitude}
              isSophiaMode={isSophia}
              theme={theme as any}
              size={230}
            />
          </div>

          {/* Mascot Identity */}
          <div className="relative z-10 mt-3">
            <h3 className="font-extrabold text-lg tracking-tight flex items-center justify-center gap-1.5">
              <span>হাসান কিউট রোবট</span>
              <span className="text-sm">✨</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              আপনার আদুরে এআই সঙ্গী • হাত নেড়ে কথা বলা ও জীবন্ত মুভমেন্ট
            </p>
          </div>

          {/* Quick Voice Wave Indicator during listening */}
          {isListening && (
            <div className="flex items-center gap-1 mt-4">
              {[40, 70, 100, 60, 90, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-400 rounded-full animate-pulse"
                  style={{ height: `${h * 0.25}px`, animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2. CHAT & INTERACTION CARD */}
        <div
          className={`lg:col-span-7 flex flex-col h-[520px] rounded-3xl border transition-all duration-300 overflow-hidden ${
            isSophia
              ? 'bg-slate-950/80 border-cyan-500/25 shadow-xl'
              : isLight
              ? 'bg-white border-slate-200 shadow-md'
              : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {messages.map((msg) => {
              const isRobot = msg.sender === 'robot';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isRobot ? 'justify-start' : 'justify-end'}`}
                >
                  {isRobot && (
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isRobot
                        ? isSophia
                          ? 'bg-slate-900/90 border border-cyan-500/20 text-slate-200'
                          : isLight
                          ? 'bg-slate-100 border border-slate-200 text-slate-800'
                          : 'bg-slate-800 border border-slate-700 text-slate-200'
                        : isSophia
                        ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-medium'
                        : isLight
                        ? 'bg-sky-600 text-white'
                        : 'bg-sky-500 text-slate-950 font-semibold'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[10px] mt-1 text-end ${
                        isRobot ? 'opacity-50' : 'opacity-75'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts */}
          <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-b border-white/5 bg-black/10">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className={`text-[11px] whitespace-nowrap px-2.5 py-1 rounded-xl font-medium border transition-all ${
                  isSophia
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20'
                    : isLight
                    ? 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Mic Error Notice */}
          {micError && (
            <div className="px-4 py-1.5 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{micError}</span>
            </div>
          )}

          {/* Input Controls */}
          <div className="p-3 sm:p-4 bg-black/15 flex items-center gap-2">
            {/* Voice Input Button */}
            <button
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-2xl transition-all shadow-sm ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : isSophia
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25'
                  : isLight
                  ? 'bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-200'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
              }`}
              title={isListening ? 'শোনা থামান' : 'মুখে বলে কথা বলুন'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="এখানে লিখুন বা কিছু জিজ্ঞাসা করুন..."
              className={`flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm border focus:outline-none transition-all ${
                isSophia
                  ? 'bg-slate-900/90 border-cyan-500/30 text-white placeholder-slate-500 focus:border-cyan-400'
                  : isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                  : 'bg-slate-800/90 border-slate-700 text-white placeholder-slate-500 focus:border-sky-400'
              }`}
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-2xl transition-all font-bold shadow-md ${
                !inputText.trim()
                  ? 'opacity-40 cursor-not-allowed bg-slate-700 text-slate-400'
                  : isSophia
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
                  : isLight
                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
              }`}
              title="পাঠান"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
