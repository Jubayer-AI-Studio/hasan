import React, { useState, useRef } from 'react';
import { UserProfile, API } from '../../services/api';
import { Translations, Language } from '../../i18n/translations';
import {
  Settings,
  Languages,
  Palette,
  Key,
  Database,
  Download,
  Upload,
  Check,
  Bot,
  Sparkles,
  User,
  Smartphone,
  Camera,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SettingsViewProps {
  t: Translations;
  language: Language;
  theme: string;
  profile: UserProfile;
  onUpdateLanguage: (lang: Language) => void;
  onUpdateTheme: (theme: 'dark' | 'light' | 'sophia') => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onRefreshData: () => void;
  onTriggerInstall?: () => void;
  isPWAInstalled?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  t,
  language,
  theme,
  profile,
  onUpdateLanguage,
  onUpdateTheme,
  onUpdateProfile,
  onRefreshData,
  onTriggerInstall,
  isPWAInstalled = false
}) => {
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [geminiKey, setGeminiKey] = useState(profile.gemini_api_key);
  const [mascotEnabled, setMascotEnabled] = useState(profile.mascot_enabled);
  const [mascotSide, setMascotSide] = useState<'right' | 'left'>(() => {
    try {
      const s = localStorage.getItem('hasan_mascot_side');
      if (s === 'right' || s === 'left') return s;
    } catch {}
    return language === 'ar' ? 'left' : 'right';
  });
  const [isSaved, setIsSaved] = useState(false);

  const isSophia = theme === 'sophia';
  const isLight = theme === 'light';

  const handleToggleMascot = async (enabled: boolean) => {
    setMascotEnabled(enabled);
    try {
      localStorage.setItem('hasan_mascot_dismissed', enabled ? 'false' : 'true');
      const updated = await API.updateProfile({ mascot_enabled: enabled });
      onUpdateProfile(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeMascotSide = (side: 'right' | 'left') => {
    setMascotSide(side);
    try {
      localStorage.setItem('hasan_mascot_side', side);
    } catch {}
  };

  const [showAdvancedKey, setShowAdvancedKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // High quality canvas resize to 400x400 to keep performance fast
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarUrl(compressedDataUrl);

        // Auto-save immediately to profile
        API.updateProfile({ avatar_url: compressedDataUrl }).then((updated) => {
          onUpdateProfile(updated);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    API.updateProfile({ avatar_url: '' }).then((updated) => {
      onUpdateProfile(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    });
  };

  const handleSaveProfile = async () => {
    try {
      const updated = await API.updateProfile({
        name,
        avatar_url: avatarUrl,
        gemini_api_key: geminiKey,
        mascot_enabled: mascotEnabled
      });
      onUpdateProfile(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportBackup = async () => {
    try {
      const backup = await API.exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hasan_life_guide_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export backup:', err);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await API.importBackup(json);
        alert(t.common.success);
        onRefreshData();
      } catch (err) {
        alert('Invalid JSON file');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-black flex items-center gap-2 ${
          isLight ? 'text-slate-900' : 'text-slate-100'
        }`}>
          <Settings className={`w-7 h-7 ${isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
          {t.settings.title}
        </h1>
        <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{t.settings.subtitle}</p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check size={16} />
          <span>{t.settings.savedSuccess}</span>
        </div>
      )}

      {/* 1. VISUAL THEMES SECTION */}
      <div className="rounded-3xl p-6 app-card">
        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${
          isLight ? 'text-slate-900' : 'text-slate-200'
        }`}>
          <Palette size={16} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />
          {t.settings.themeSection}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sophia Mode (Signature Luxury) */}
          <div
            onClick={() => onUpdateTheme('sophia')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative overflow-hidden ${
              theme === 'sophia'
                ? 'border-cyan-400 bg-purple-950/40 shadow-glow-cyan'
                : isLight
                ? 'border-slate-200 hover:border-slate-300 bg-slate-50'
                : 'border-white/10 hover:border-white/20 bg-slate-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-purple-600 dark:text-cyan-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                {t.settings.themeSophia}
              </span>
              {theme === 'sophia' && <Check size={16} className="text-cyan-400" />}
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {t.settings.themeSophiaDesc}
            </p>
            <div className="mt-3 flex gap-1.5">
              <div className="w-4 h-4 rounded-full bg-[#070814] border border-white/20" />
              <div className="w-4 h-4 rounded-full bg-[#7928CA]" />
              <div className="w-4 h-4 rounded-full bg-[#00DFD8]" />
              <div className="w-4 h-4 rounded-full bg-[#FFD700]" />
            </div>
          </div>

          {/* Dark Mode */}
          <div
            onClick={() => onUpdateTheme('dark')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
              theme === 'dark'
                ? 'border-sky-400 bg-[#141C2B] shadow-md'
                : isLight
                ? 'border-slate-200 hover:border-slate-300 bg-slate-50'
                : 'border-white/10 hover:border-white/20 bg-slate-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                {t.settings.themeDark}
              </span>
              {theme === 'dark' && <Check size={16} className="text-sky-400" />}
            </div>
            <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              High contrast, OLED blacks, and battery-friendly midnight palette.
            </p>
          </div>

          {/* Light Mode */}
          <div
            onClick={() => onUpdateTheme('light')}
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all ${
              theme === 'light'
                ? 'border-sky-500 bg-sky-50 text-slate-900 shadow-md'
                : 'border-white/10 hover:border-white/20 bg-slate-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-bold text-sm ${isLight ? 'text-sky-800' : 'text-slate-200'}`}>
                {t.settings.themeLight}
              </span>
              {theme === 'light' && <Check size={16} className="text-sky-600" />}
            </div>
            <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Clean paper-white aesthetic for bright daytime viewing.
            </p>
          </div>
        </div>
      </div>

      {/* 2. LANGUAGE & LOCALE SECTION */}
      <div className="rounded-3xl p-6 app-card">
        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${
          isLight ? 'text-slate-900' : 'text-slate-200'
        }`}>
          <Languages size={16} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />
          {t.settings.languageSection}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Bengali */}
          <button
            type="button"
            onClick={() => onUpdateLanguage('bn')}
            className={`p-4 rounded-2xl border-2 text-left rtl:text-right transition-all ${
              language === 'bn'
                ? isLight
                  ? 'border-sky-500 bg-sky-50 text-sky-800 shadow-sm'
                  : 'border-cyan-400 bg-cyan-500/15 text-cyan-200'
                : isLight
                ? 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-800'
                : 'border-white/10 hover:border-white/20 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-base">বাংলা (Bengali)</span>
              {language === 'bn' && <Check size={16} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />}
            </div>
            <span className={`text-[11px] mt-1 block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              ডিফল্ট মাতৃভাষা ইন্টারফেস
            </span>
          </button>

          {/* Arabic (RTL) */}
          <button
            type="button"
            onClick={() => onUpdateLanguage('ar')}
            className={`p-4 rounded-2xl border-2 text-left rtl:text-right transition-all ${
              language === 'ar'
                ? isLight
                  ? 'border-sky-500 bg-sky-50 text-sky-800 shadow-sm'
                  : 'border-cyan-400 bg-cyan-500/15 text-cyan-200'
                : isLight
                ? 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-800'
                : 'border-white/10 hover:border-white/20 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-base font-arabic">العربية (Arabic - RTL)</span>
              {language === 'ar' && <Check size={16} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />}
            </div>
            <span className={`text-[11px] mt-1 block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              تخطيط كامل من اليمين لليسار
            </span>
          </button>

          {/* English */}
          <button
            type="button"
            onClick={() => onUpdateLanguage('en')}
            className={`p-4 rounded-2xl border-2 text-left rtl:text-right transition-all ${
              language === 'en'
                ? isLight
                  ? 'border-sky-500 bg-sky-50 text-sky-800 shadow-sm'
                  : 'border-cyan-400 bg-cyan-500/15 text-cyan-200'
                : isLight
                ? 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-800'
                : 'border-white/10 hover:border-white/20 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-base">English</span>
              {language === 'en' && <Check size={16} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />}
            </div>
            <span className={`text-[11px] mt-1 block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Global Standard LTR
            </span>
          </button>
        </div>
      </div>

      {/* 3. PROFILE & AI CONFIGURATION */}
      <div className="rounded-3xl p-6 space-y-5 app-card">
        <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${
          isLight ? 'text-slate-900' : 'text-slate-200'
        }`}>
          <User size={16} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />
          {t.settings.profileSection}
        </h2>

        {/* Real Mobile Gallery / File Photo Picker */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 transition-all ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
        }`}>
          {/* Avatar Preview & Click-to-upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-20 h-20 rounded-2xl cursor-pointer group overflow-hidden border-2 flex items-center justify-center shrink-0 transition-all ${
              avatarUrl
                ? 'border-cyan-400 shadow-md'
                : 'border-dashed border-slate-400 hover:border-cyan-400'
            } ${isLight ? 'bg-white' : 'bg-slate-900'}`}
            title="গ্যালারি থেকে ছবি আপলোড করতে ট্যাপ করুন"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-cyan-400">
                <Camera size={26} />
                <span className="text-[10px] mt-1 font-bold">ছবি দিন</span>
              </div>
            )}

            {/* Hover / Tap Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-bold">
              <Camera size={18} />
              <span>পরিবর্তন</span>
            </div>
          </div>

          {/* Gallery Upload Controls */}
          <div className="space-y-1.5 text-center sm:text-start flex-1">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              প্রোফাইল ছবি (Profile Photo)
            </h4>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              লিখে দেওয়ার কোনো ঝামেলা নেই—নিচের বাটনে ট্যাপ করলেই আপনার মোবাইল গ্যালারি থেকে যেকোনো ছবি সরাসরি চলে আসবে।
            </p>

            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Camera size={14} />
                <span>গ্যালারি থেকে ছবি দিন</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <Trash2 size={13} />
                  <span>ছবি মুছুন</span>
                </button>
              )}
            </div>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileSelect}
            />
          </div>
        </div>

        {/* User Name Field */}
        <div>
          <label className={`text-xs mb-1.5 block font-semibold ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            {t.settings.userName}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors ${
              isLight
                ? 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                : 'bg-white/5 border border-white/10 text-slate-100 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Built-in Super AI Brain Status Card (No API Key required!) */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isSophia
              ? 'bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-slate-900/90 border-cyan-500/30 shadow-[0_4px_20px_rgba(0,223,216,0.1)]'
              : isLight
              ? 'bg-gradient-to-r from-sky-50 to-indigo-50/70 border-sky-200 shadow-sm'
              : 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-cyan-300 flex items-center gap-1.5">
                  হাসান এআই সুপার-ব্রেন (Super AI Brain)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  সক্রিয় ও ১০০% ফ্রি
                </span>
              </div>

              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                আপনার রোবটে এখন সরাসরি <strong>চ্যাটজিপিটি ও জেমিনাই লেভেলের সুপার-ব্রেন</strong> বিল্ট-ইন যুক্ত করা হয়েছে। সাধারণ জ্ঞান, পড়াশোনা, বিজ্ঞান, ইসলামিক তথ্য, ক্যারিয়ার বা এই অ্যাপের নোট-টাস্ক-খরচ নিয়ে যেকোনো প্রশ্ন করলেই সে বাংলায় বুদ্ধিদীপ্ত উত্তর দিবে।
              </p>

              <p className="text-[11px] text-cyan-400 font-semibold pt-1">
                ✨ কোনো এপিআই কি (API Key) বা খরচের ঝামেলা নেই—১০০% স্বয়ংক্রিয় ও ফ্রি!
              </p>
            </div>
          </div>

          {/* Optional Collapsible Developer API Key Toggle */}
          <div className="mt-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAdvancedKey(!showAdvancedKey)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>ডেভেলপার অপশন (ঐচ্ছিক নিজস্ব Gemini Key)</span>
              {showAdvancedKey ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showAdvancedKey && (
              <div className="mt-2 space-y-1.5 animate-fadeIn">
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy... (যদি নিজের কোনো কি দিতে চান)"
                  className={`w-full rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors ${
                    isLight
                      ? 'bg-white border border-slate-300 text-slate-900'
                      : 'bg-black/30 border border-white/10 text-slate-200'
                  }`}
                />
                <p className="text-[10px] text-slate-400">
                  ডিফল্টভাবে সুপার-ব্রেন ফ্রি কাজ করে। নিজস্ব পেইড কি থাকলে এখানে যোগ করতে পারেন।
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          className={`px-6 py-2.5 rounded-2xl font-bold text-xs shadow-lg transition-all ${
            isSophia
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-glow-cyan'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          {t.settings.saveChanges}
        </button>
      </div>

      {/* 4. HASAN ROBOT DISPLAY & MOBILITY */}
      <div className="rounded-3xl p-6 app-card">
        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${
          isLight ? 'text-slate-900' : 'text-slate-200'
        }`}>
          <Bot size={16} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />
          {t.settings.mascotSection}
        </h2>

        <div className="space-y-4">
          {/* Toggle Mascot Visibility */}
          <div className="flex items-center justify-between p-4 rounded-2xl app-subcard">
            <div>
              <p className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {t.settings.mascotToggleLabel}
              </p>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {mascotEnabled ? t.robot.states.idle : t.robot.hide}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleMascot(!mascotEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                mascotEnabled ? 'bg-cyan-500' : isLight ? 'bg-slate-300' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  mascotEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Screen Corner Placement (Left vs Right) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl app-subcard gap-3">
            <div>
              <p className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {t.settings.mascotSideLabel}
              </p>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {mascotSide === 'right' ? 'নিচের ডান কোণায়' : 'নিচের বাম কোণায়'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleChangeMascotSide('left')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  mascotSide === 'left'
                    ? isLight
                      ? 'bg-sky-50 text-sky-800 border-sky-400'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : isLight
                    ? 'border-slate-200 text-slate-600'
                    : 'border-white/10 text-slate-400'
                }`}
              >
                ← বামে (Left)
              </button>
              <button
                type="button"
                onClick={() => handleChangeMascotSide('right')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  mascotSide === 'right'
                    ? isLight
                      ? 'bg-sky-50 text-sky-800 border-sky-400'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                    : isLight
                    ? 'border-slate-200 text-slate-600'
                    : 'border-white/10 text-slate-400'
                }`}
              >
                ডানে (Right) →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. MOBILE & DESKTOP APP INSTALLATION (PWA) */}
      <div className="rounded-3xl p-6 app-card">
        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${
          isLight ? 'text-slate-900' : 'text-slate-200'
        }`}>
          <Smartphone size={16} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />
          {t.settings.pwaSection}
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl app-subcard gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              isLight ? 'bg-sky-50 border-sky-200 text-sky-600' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <p className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                {t.pwa.installApp}
              </p>
              <p className={`text-xs mt-0.5 max-w-md ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {t.pwa.installDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onTriggerInstall}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shrink-0 transition-all shadow-md ${
              isPWAInstalled
                ? 'bg-emerald-500 text-white cursor-default'
                : isSophia
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:shadow-glow-cyan'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {isPWAInstalled ? (
              <>
                <Check size={14} />
                <span>{t.pwa.installed}</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>{t.pwa.installApp}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6. DATA BACKUP & PORTABILITY */}
      <div className="rounded-3xl p-6 app-card">
        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${
          isLight ? 'text-slate-900' : 'text-slate-200'
        }`}>
          <Database size={16} className={isLight ? 'text-sky-600' : 'text-cyan-400'} />
          {t.settings.dataSection}
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
          >
            <Download size={15} />
            <span>{t.settings.exportBackup}</span>
          </button>

          <label className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
              : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
          }`}>
            <Upload size={15} />
            <span>{t.settings.importBackup}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
