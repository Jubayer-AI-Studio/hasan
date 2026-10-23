import React, { useState, useEffect } from 'react';
import { Zap, Flame, Radio, Sparkles, Activity } from 'lucide-react';

interface DhakaClockProps {
  theme?: 'dark' | 'light' | 'sophia';
  compact?: boolean;
}

const ENGLISH_DAYS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
];

const ENGLISH_MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
];

export const DhakaClock: React.FC<DhakaClockProps> = ({ theme = 'sophia', compact = false }) => {
  const [dhakaTime, setDhakaTime] = useState<{
    hoursStr: string;
    minutesStr: string;
    secondsStr: string;
    period: string;
    dayName: string;
    dayNum: string;
    monthName: string;
    yearStr: string;
    beatTick: number;
  } | null>(null);

  useEffect(() => {
    let tickCounter = 0;
    const updateTime = () => {
      const now = new Date();
      tickCounter++;

      const dhakaDateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });

      const parts = dhakaDateFormatter.formatToParts(now);
      const partMap: Record<string, string> = {};
      parts.forEach((p) => {
        partMap[p.type] = p.value;
      });

      const rawHour = parseInt(partMap.hour || '12', 10);
      const rawMinute = parseInt(partMap.minute || '0', 10);
      const rawSecond = parseInt(partMap.second || '0', 10);
      const dayPeriod = (partMap.dayPeriod || 'AM').toUpperCase();

      const dhakaDateObj = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
      const dayIndex = dhakaDateObj.getDay();
      const monthIndex = dhakaDateObj.getMonth();
      const dayOfMonth = dhakaDateObj.getDate();
      const year = dhakaDateObj.getFullYear();

      const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

      setDhakaTime({
        hoursStr: padZero(rawHour),
        minutesStr: padZero(rawMinute),
        secondsStr: padZero(rawSecond),
        period: dayPeriod,
        dayName: ENGLISH_DAYS[dayIndex] || 'TODAY',
        dayNum: padZero(dayOfMonth),
        monthName: ENGLISH_MONTHS[monthIndex] || '',
        yearStr: String(year),
        beatTick: tickCounter
      });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!dhakaTime) return null;

  const isLight = theme === 'light';
  const isSophia = theme === 'sophia';

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-black border backdrop-blur-md transition-all ${
          isSophia
            ? 'bg-slate-950/80 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(0,223,216,0.25)]'
            : isLight
            ? 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
            : 'bg-slate-900/90 border-amber-500/40 text-amber-300 shadow-md'
        }`}
      >
        <span className="flex items-center gap-1 text-[11px] text-pink-500 animate-pulse">
          <Zap size={13} className="fill-current" />
        </span>
        <span className="tracking-wider">
          {dhakaTime.hoursStr}:{dhakaTime.minutesStr}:{dhakaTime.secondsStr} {dhakaTime.period}
        </span>
        <span className="opacity-40">/</span>
        <span className="text-[10px] tracking-widest">{dhakaTime.dayName}</span>
      </div>
    );
  }

  // Audio Equalizer wave bar heights for hip-hop beat aesthetic
  const beatHeights = [45, 80, 100, 65, 90, 75, 95, 60, 85];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 select-none p-4 sm:p-5 backdrop-blur-2xl ${
        isSophia
          ? 'bg-gradient-to-br from-[#0c051f]/95 via-[#090b1c]/90 to-[#021820]/95 border-cyan-400/40 shadow-[0_8px_35px_rgba(0,223,216,0.18)]'
          : isLight
          ? 'bg-gradient-to-br from-white via-sky-50/60 to-indigo-50/80 border-sky-300 shadow-[0_8px_30px_rgba(2,132,199,0.12)]'
          : 'bg-gradient-to-br from-[#121624] via-[#0d101a] to-[#1a0e1c] border-amber-500/40 shadow-[0_8px_30px_rgba(245,158,11,0.12)]'
      }`}
    >
      {/* Background Street Glow Elements */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
          isSophia ? 'bg-fuchsia-600/25' : isLight ? 'bg-orange-400/15' : 'bg-amber-500/20'
        }`}
      />
      <div
        className={`absolute -bottom-12 -left-12 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
          isSophia ? 'bg-cyan-500/25' : isLight ? 'bg-sky-400/20' : 'bg-rose-500/20'
        }`}
      />

      {/* Cyber Grid Corner Accent Lines */}
      <div className="absolute top-2 right-3 flex items-center gap-1 opacity-60">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[9px] font-mono font-bold tracking-widest uppercase opacity-70">
          BST // UTC+6
        </span>
      </div>

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Section: Badges, City, Equalizer Beat & Date */}
        <div className="space-y-2">
          
          {/* Top Tag Badges: Hip-Hop / Cyber Style */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* City Tag */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-black tracking-wider uppercase border shadow-sm ${
                isSophia
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-400/40'
                  : isLight
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              <Zap size={13} className="text-amber-400 fill-amber-400 animate-bounce" />
              <span>DHAKA CITY ⚡ BD</span>
            </div>

            {/* Live Beat Pulse Tag */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-black tracking-wider uppercase border shadow-sm ${
                isSophia
                  ? 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                  : isLight
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              <Flame size={13} className="text-rose-400 fill-rose-400 animate-pulse" />
              <span>LIVE BEAT</span>
            </div>

            {/* Equalizer Soundwave Bars (Reactive to seconds!) */}
            <div className="flex items-end gap-1 h-4 px-2 py-0.5 rounded-lg bg-black/25 border border-white/5">
              {beatHeights.map((h, i) => {
                const dynamicHeight = Math.max(
                  20,
                  ((h + (dhakaTime.beatTick * 17 + i * 23)) % 100)
                );
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      isSophia
                        ? 'bg-gradient-to-t from-cyan-400 to-fuchsia-400'
                        : isLight
                        ? 'bg-sky-600'
                        : 'bg-amber-400'
                    }`}
                    style={{ height: `${dynamicHeight}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Full English Date Display with Street Style */}
          <div className="flex items-center gap-2 pt-0.5">
            <span
              className={`text-xs sm:text-sm font-black tracking-widest uppercase ${
                isSophia
                  ? 'text-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]'
                  : isLight
                  ? 'text-indigo-900'
                  : 'text-amber-400'
              }`}
            >
              {dhakaTime.dayName}
            </span>

            <span className="text-slate-500 font-bold">•</span>

            <span
              className={`text-xs sm:text-sm font-extrabold tracking-wider ${
                isLight ? 'text-slate-700' : 'text-slate-200'
              }`}
            >
              {dhakaTime.dayNum} {dhakaTime.monthName} {dhakaTime.yearStr}
            </span>

            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                isSophia
                  ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/40'
                  : isLight
                  ? 'bg-slate-200/80 text-slate-800'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              24/7 SYNC
            </span>
          </div>
        </div>

        {/* Right Section: Massive Bold Streetwear English Time */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Main Time Digits with Cyberpunk Gradient */}
          <div
            className={`font-mono font-black text-3xl sm:text-4xl md:text-5xl tracking-tight leading-none ${
              isSophia
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-300 to-amber-200 drop-shadow-[0_0_20px_rgba(0,223,216,0.45)]'
                : isLight
                ? 'text-slate-950 drop-shadow-sm'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-100 drop-shadow-[0_0_15px_rgba(245,158,11,0.35)]'
            }`}
          >
            <span>{dhakaTime.hoursStr}</span>
            <span className="animate-pulse text-pink-400 inline-block px-0.5">:</span>
            <span>{dhakaTime.minutesStr}</span>
            <span className="animate-pulse text-cyan-400 inline-block px-0.5">:</span>
            <span className={isSophia ? 'text-cyan-300' : isLight ? 'text-sky-600' : 'text-amber-300'}>
              {dhakaTime.secondsStr}
            </span>
          </div>

          {/* AM / PM Hip-Hop Street Pill Badge */}
          <div className="flex flex-col gap-1">
            <span
              className={`px-2 py-1 rounded-xl font-mono text-xs sm:text-sm font-black tracking-widest uppercase border shadow-md ${
                isSophia
                  ? 'bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white border-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.4)]'
                  : isLight
                  ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                  : 'bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 border-amber-300 font-black'
              }`}
            >
              {dhakaTime.period}
            </span>

            <span className="text-[9px] font-mono font-bold tracking-widest text-center text-slate-400 opacity-80 uppercase">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
