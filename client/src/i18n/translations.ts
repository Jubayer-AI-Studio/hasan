export type Language = 'bn' | 'ar' | 'en';

export interface Translations {
  appName: string;
  appTagline: string;
  nav: {
    dashboard: string;
    notes: string;
    tasks: string;
    habits: string;
    expenses: string;
    robot: string;
    settings: string;
  };
  greetings: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    welcomeBack: string;
  };
  dashboard: {
    dailyBriefing: string;
    dailyBriefingDesc: string;
    quickCapture: string;
    pendingTasks: string;
    habitStreaks: string;
    monthlyBalance: string;
    recentVoiceNotes: string;
    noRecentNotes: string;
    viewAllNotes: string;
    completeTasksPrompt: string;
  };
  notes: {
    title: string;
    subtitle: string;
    newNote: string;
    searchPlaceholder: string;
    allTags: string;
    pinnedNotes: string;
    otherNotes: string;
    noNotesFound: string;
    createFirstNote: string;
    noteTitlePlaceholder: string;
    noteContentPlaceholder: string;
    tagsPlaceholder: string;
    pinNote: string;
    pinned: string;
    color: string;
    save: string;
    cancel: string;
    delete: string;
    confirmDelete: string;
    // Voice within notes
    voiceDictation: string;
    dictationListening: string;
    dictationStopped: string;
    recordVoiceMemo: string;
    recordingInProgress: string;
    stopRecording: string;
    attachedAudio: string;
    playAudio: string;
    pauseAudio: string;
    deleteAudio: string;
    micNotSupported: string;
  };
  tasks: {
    title: string;
    subtitle: string;
    addTask: string;
    taskPlaceholder: string;
    priority: string;
    priorityHigh: string;
    priorityMedium: string;
    priorityLow: string;
    category: string;
    dueDate: string;
    all: string;
    active: string;
    completed: string;
    noTasks: string;
  };
  habits: {
    title: string;
    subtitle: string;
    addHabit: string;
    habitTitlePlaceholder: string;
    frequency: string;
    daily: string;
    weekly: string;
    streakDays: string;
    todayCompleted: string;
    markDone: string;
    celebrationTitle: string;
    celebrationDesc: string;
    noHabits: string;
  };
  expenses: {
    title: string;
    subtitle: string;
    addExpense: string;
    itemTitlePlaceholder: string;
    amount: string;
    type: string;
    expense: string;
    income: string;
    category: string;
    categories: {
      food: string;
      transport: string;
      utilities: string;
      shopping: string;
      salary: string;
      project: string;
      other: string;
    };
    totalIncome: string;
    totalExpense: string;
    netBalance: string;
    recentTransactions: string;
    noExpenses: string;
  };
  robot: {
    name: string;
    role: string;
    tapToChat: string;
    states: {
      idle: string;
      listening: string;
      thinking: string;
      speaking: string;
    };
    inputPlaceholder: string;
    send: string;
    voiceActive: string;
    voiceInactive: string;
    mute: string;
    unmute: string;
    minimize: string;
    maximize: string;
    hide: string;
    show: string;
    moveSide: string;
    offlineModeNotice: string;
    micNotice: string;
    suggestedPrompts: string[];
  };
  pwa: {
    installApp: string;
    installDesc: string;
    installed: string;
    howToIOS: string;
  };
  settings: {
    title: string;
    subtitle: string;
    profileSection: string;
    userName: string;
    avatarUrl: string;
    themeSection: string;
    themeDark: string;
    themeLight: string;
    themeSophia: string;
    themeSophiaDesc: string;
    languageSection: string;
    mascotSection: string;
    mascotToggleLabel: string;
    mascotSideLabel: string;
    aiSection: string;
    geminiKeyLabel: string;
    geminiKeyHelp: string;
    dataSection: string;
    pwaSection: string;
    exportBackup: string;
    importBackup: string;
    saveChanges: string;
    savedSuccess: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    success: string;
    close: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  bn: {
    appName: 'হাসান লাইফ গাইড',
    appTagline: 'আপনার ব্যক্তিগত এআই নির্দেশক ও জীবনসঙ্গী',
    nav: {
      dashboard: 'ড্যাশবোর্ড',
      notes: 'নোট ও ভয়েস',
      tasks: 'টাস্ক ও লক্ষ্য',
      habits: 'দৈনিক অভ্যাস',
      expenses: 'আয় ও ব্যয়',
      robot: 'হাসান রোবট',
      settings: 'সেটিংস'
    },
    greetings: {
      morning: 'শুভ সকাল',
      afternoon: 'শুভ দুপুর',
      evening: 'শুভ সন্ধ্যা',
      night: 'শুভ রাত্রি',
      welcomeBack: 'স্বাগতম'
    },
    dashboard: {
      dailyBriefing: 'দৈনিক সারসংক্ষেপ',
      dailyBriefingDesc: 'আজকের দিনের অগ্রাধিকার ও অগ্রগতির একনজর খতিয়ান',
      quickCapture: 'চটপট ভয়েস নোট নিন',
      pendingTasks: 'বাকি থাকা কাজ',
      habitStreaks: 'চলমান অভ্যাস',
      monthlyBalance: 'মাসিক ব্যালেন্স',
      recentVoiceNotes: 'সাম্প্রতিক নোট ও ভয়েস মেমো',
      noRecentNotes: 'এখনও কোনো নোট তৈরি করা হয়নি।',
      viewAllNotes: 'সব নোট দেখুন',
      completeTasksPrompt: 'আজকের প্রধান কাজগুলো সম্পন্ন করুন'
    },
    notes: {
      title: 'নোট ও ভয়েস রেকর্ডার',
      subtitle: 'টেক্সট নোট এবং ভয়েস মেমো এক সাথে সুন্দরভাবে সংরক্ষণ করুন',
      newNote: 'নতুন নোট তৈরি করুন',
      searchPlaceholder: 'নোট বা ভয়েস ডায়রি খুঁজুন...',
      allTags: 'সকল ট্যাগ',
      pinnedNotes: 'পিন করা নোট',
      otherNotes: 'অন্যান্য নোট',
      noNotesFound: 'কোনো নোট পাওয়া যায়নি',
      createFirstNote: 'আপনার প্রথম নোটটি এখনই লিখে বা মুখে বলে সংরক্ষণ করুন!',
      noteTitlePlaceholder: 'নোটের শিরোনাম...',
      noteContentPlaceholder: 'এখানে বিস্তারিত লিখুন অথবা নিচে মাইক চেপে মুখে বলুন...',
      tagsPlaceholder: 'ট্যাগ (কমা দিয়ে আলাদা করুন, যেমন: কাজ, ব্যক্তিগত)',
      pinNote: 'পিন করে রাখুন',
      pinned: 'পিন করা',
      color: 'রঙ নির্বাচন',
      save: 'সংরক্ষণ করুন',
      cancel: 'বাতিল',
      delete: 'মুছে ফেলুন',
      confirmDelete: 'আপনি কি নিশ্চিত যে এই নোটটি মুছে ফেলতে চান?',
      voiceDictation: 'মুখে বলে লিখুন (ভয়েস টাইপিং)',
      dictationListening: 'বলুন, আমি শুনছি...',
      dictationStopped: 'ভয়েস ইনপুট বন্ধ',
      recordVoiceMemo: 'ভয়েস মেমো রেকর্ড করুন',
      recordingInProgress: 'রেকর্ডিং চলছে... কথা বলুন',
      stopRecording: 'রেকর্ডিং শেষ করুন',
      attachedAudio: 'সংযুক্ত অডিও মেমো',
      playAudio: 'চালান',
      pauseAudio: 'থামান',
      deleteAudio: 'অডিও মুছুন',
      micNotSupported: 'এই ব্রাউজারে স্পিচ রিকগনিশন সুবিধা পাওয়া যায়নি।'
    },
    tasks: {
      title: 'টাস্ক ও পরিকল্পনা',
      subtitle: 'গুরুত্ব অনুসারে আজকের করণীয় কাজগুলো সহজে পরিচালনা করুন',
      addTask: 'নতুন কাজ যোগ করুন',
      taskPlaceholder: 'কাজের নাম লিখুন...',
      priority: 'অগ্রাধিকার',
      priorityHigh: 'জরুরি (High)',
      priorityMedium: 'মাঝারি (Medium)',
      priorityLow: 'স্বাভাবিক (Low)',
      category: 'ক্যাটাগরি',
      dueDate: 'তারিখ',
      all: 'সব',
      active: 'চলমান',
      completed: 'সম্পন্ন',
      noTasks: 'কোনো কাজ বাকি নেই! চমৎকার!'
    },
    habits: {
      title: 'দৈনিক অভ্যাস ও ধারাবাহিকতা',
      subtitle: 'প্রতিদিনের অভ্যাস গড়ে তুলুন এবং আনন্দের সাথে উদযাপন করুন',
      addHabit: 'নতুন অভ্যাস যোগ করুন',
      habitTitlePlaceholder: 'যেমন: সকালে হাঁটা, বই পড়া, নামাজ...',
      frequency: 'পুনরাবৃত্তি',
      daily: 'প্রতিদিন',
      weekly: 'সাপ্তাহিক',
      streakDays: 'দিনের ধারাবাহিকতা',
      todayCompleted: 'আজকের কাজ শেষ!',
      markDone: 'সম্পন্ন হয়েছে মার্ক করুন',
      celebrationTitle: 'দারুণ কাজ! 🎉',
      celebrationDesc: 'আপনি আজকের অভ্যাস সফলভাবে বজায় রেখেছেন!',
      noHabits: 'এখনও কোনো অভ্যাস যোগ করা হয়নি।'
    },
    expenses: {
      title: 'আয়-ব্যয় ও বাজেট ট্র্যাকার',
      subtitle: 'আপনার খরচের হিসাব রাখুন এবং আর্থিক স্বাধীনতা অর্জন করুন',
      addExpense: 'লেনদেন যোগ করুন',
      itemTitlePlaceholder: 'বিবরণ (যেমন: বাজারের খরচ, প্রজেক্ট আয়)...',
      amount: 'টাকার পরিমাণ',
      type: 'ধরণ',
      expense: 'খরচ',
      income: 'আয়',
      category: 'খাত',
      categories: {
        food: 'খাবার',
        transport: 'যাতায়াত',
        utilities: 'বিল ও ইউটিলিটি',
        shopping: 'কেনাকাটা',
        salary: 'বেতন',
        project: 'প্রজেক্ট ফি',
        other: 'অন্যান্য'
      },
      totalIncome: 'মোট আয়',
      totalExpense: 'মোট খরচ',
      netBalance: 'অবশিষ্ট ব্যালেন্স',
      recentTransactions: 'সাম্প্রতিক লেনদেন',
      noExpenses: 'কোনো খরচের রেকর্ড পাওয়া যায়নি।'
    },
    robot: {
      name: 'হাসান রোবট',
      role: 'আপনার এআই পার্সোনাল সহকারী',
      tapToChat: 'কথা বলতে ট্যাপ করুন',
      states: {
        idle: 'প্রস্তুত',
        listening: 'শুনছি...',
        thinking: 'ভাবছি...',
        speaking: 'কথা বলছি...'
      },
      inputPlaceholder: 'আমাকে কিছু বলুন বা নির্দেশ দিন...',
      send: 'পাঠান',
      voiceActive: 'ভয়েস চালু',
      voiceInactive: 'ভয়েস বন্ধ',
      mute: 'শব্দ বন্ধ',
      unmute: 'শব্দ চালু',
      minimize: 'ছোট করুন',
      maximize: 'বড় করুন',
      hide: 'রোবট সরান / লুকান',
      show: 'হাসান রোবট আনুন',
      moveSide: 'অন্য পাশে সরান',
      offlineModeNotice: 'অফলাইন মোড সক্রিয় — স্থানীয়ভাবে আপনার কম্যান্ড প্রসেস করা হচ্ছে।',
      micNotice: 'মাইক্রোফোন চালু নেই, লিখে কথা বলুন।',
      suggestedPrompts: [
        'আজকের খরচ কত?',
        'নতুন টাস্ক যোগ করো: বাজার করা',
        'নোট: কাল সকাল ১০টায় মিটিং',
        'আমার অভ্যাসের খবর কী?'
      ]
    },
    pwa: {
      installApp: 'অ্যাপ ইনস্টল করুন',
      installDesc: 'আপনার মোবাইলে বা ডিভাইসে অ্যাপ হিসেবে সরাসরি ব্যবহারের জন্য ইনস্টল করুন।',
      installed: 'ইনস্টল সম্পন্ন হয়েছে',
      howToIOS: 'আইফোনে সাফারি ব্রাউজারের নিচে Share আইকনে ট্যাপ করে "Add to Home Screen" চাপুন।'
    },
    settings: {
      title: 'অ্যাপ সেটিংস',
      subtitle: 'ভাষা, থিম ও এআই কনফিগারেশন পরিবর্তন করুন',
      profileSection: 'ব্যক্তিগত তথ্য',
      userName: 'আপনার নাম',
      avatarUrl: 'প্রোফাইল ছবি / অ্যাভাটার',
      themeSection: 'ভিজ্যুয়াল থিম নির্বাচন',
      themeDark: 'ডার্ক মোড (Dark Mode)',
      themeLight: 'লাইট মোড (Light Mode)',
      themeSophia: 'সোফিয়া মোড (Sophia Mode)',
      themeSophiaDesc: 'সিনেমাটিক লাক্সারি লুক, নিয়ন গ্লো ও গ্লাস ইফেক্ট',
      languageSection: 'ভাষা নির্বাচন (Language)',
      mascotSection: 'হাসান রোবট ডিসপ্লে ও অবস্থান',
      mascotToggleLabel: 'স্ক্রিনে হাসান রোবট প্রদর্শন',
      mascotSideLabel: 'রোবট ডিসপ্লে অবস্থান (বাম / ডান)',
      aiSection: 'এআই সহকারী সেটিংস (ঐচ্ছিক)',
      geminiKeyLabel: 'গুগল জেমিনাই ফ্রি এপিআই কি (Google Gemini API Key)',
      geminiKeyHelp: 'ফ্রি এপিআই কি দিলে রোবট অনেক বড় ও বুদ্ধিমান উত্তর দিতে পারে (না দিলেও অফলাইনে কাজ চলবে)',
      dataSection: 'ডাটা ব্যাকআপ ও সুরক্ষা',
      pwaSection: 'মোবাইল ও ডেস্কটপ অ্যাপ ইনস্টলেশন',
      exportBackup: 'JSON ব্যাকআপ ডাউনলোড করুন',
      importBackup: 'ব্যাকআপ থেকে রিস্টোর করুন',
      saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
      savedSuccess: 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!'
    },
    common: {
      loading: 'লোড হচ্ছে...',
      error: 'সমস্যা দেখা দিয়েছে',
      retry: 'আবার চেষ্টা করুন',
      success: 'সফল হয়েছে',
      close: 'বন্ধ করুন'
    }
  },

  ar: {
    appName: 'دليل حسن للحياة',
    appTagline: 'مرشدك ومساعدك الذكي لإدارة الحياة اليومية',
    nav: {
      dashboard: 'لوحة التحكم',
      notes: 'الملاحظات والصوت',
      tasks: 'المهام والأهداف',
      habits: 'العادات اليومية',
      expenses: 'المصروفات والميزانية',
      robot: 'روبوت حسن',
      settings: 'الإعدادات'
    },
    greetings: {
      morning: 'صباح الخير',
      afternoon: 'مساء الخير',
      evening: 'مساء النور',
      night: 'تصبح على خير',
      welcomeBack: 'أهلاً بعودتك'
    },
    dashboard: {
      dailyBriefing: 'الموجز اليومي',
      dailyBriefingDesc: 'نظرة شاملة على أولوياتك وأهدافك لليوم',
      quickCapture: 'تسجيل صوتي سريع للملاحظات',
      pendingTasks: 'المهام المعلقة',
      habitStreaks: 'سلسلة العادات',
      monthlyBalance: 'الرصيد الشهري',
      recentVoiceNotes: 'أحدث الملاحظات والرسائل الصوتية',
      noRecentNotes: 'لم تقم بإنشاء أي ملاحظات بعد.',
      viewAllNotes: 'عرض كافة الملاحظات',
      completeTasksPrompt: 'أكمل مهامك الأساسية اليوم'
    },
    notes: {
      title: 'الملاحظات والتسجيلات الصوتية',
      subtitle: 'اكتب ملاحظاتك أو سجل صوتك بسهولة واحتفظ بها بأمان',
      newNote: 'إنشاء ملاحظة جديدة',
      searchPlaceholder: 'بحث في الملاحظات أو اليوميات الصوتية...',
      allTags: 'جميع الوسوم',
      pinnedNotes: 'الملاحظات المثبتة',
      otherNotes: 'ملاحظات أخرى',
      noNotesFound: 'لم يتم العثور على ملاحظات',
      createFirstNote: 'ابدأ بكتابة أول ملاحظة لك أو استخدم الصوت!',
      noteTitlePlaceholder: 'عنوان الملاحظة...',
      noteContentPlaceholder: 'اكتب المحتوى هنا أو انقر على الميكروفون للتحدث...',
      tagsPlaceholder: 'الوسوم (مفصولة بفواصل، مثل: عمل, شخصي)',
      pinNote: 'تثبيت الملاحظة',
      pinned: 'مثبتة',
      color: 'اختيار اللون',
      save: 'حفظ الملاحظة',
      cancel: 'إلغاء',
      delete: 'حذف',
      confirmDelete: 'هل أنت متأكد من رغبتك في حذف هذه الملاحظة؟',
      voiceDictation: 'الكتابة بالصوت (إملاء صوتي)',
      dictationListening: 'تفضل بالتحدث، أنا أستمع...',
      dictationStopped: 'تم إيقاف الإدخال الصوتي',
      recordVoiceMemo: 'تسجيل رسالة صوتية',
      recordingInProgress: 'جاري التسجيل... تفضل بالتحدث',
      stopRecording: 'إنهاء التسجيل',
      attachedAudio: 'المذكرات الصوتية المرفقة',
      playAudio: 'تشغيل',
      pauseAudio: 'إيقاف مؤقت',
      deleteAudio: 'حذف التسجيل',
      micNotSupported: 'خاصية التعرف على الصوت غير مدعومة في هذا المتصفح.'
    },
    tasks: {
      title: 'المهام والخطط',
      subtitle: 'نظم جدول أعمالك ورتب أولوياتك بكفاءة عالية',
      addTask: 'إضافة مهمة جديدة',
      taskPlaceholder: 'عنوان المهمة...',
      priority: 'الأولوية',
      priorityHigh: 'عاجل (High)',
      priorityMedium: 'متوسط (Medium)',
      priorityLow: 'عادي (Low)',
      category: 'التصنيف',
      dueDate: 'تاريخ الاستحقاق',
      all: 'الكل',
      active: 'قيد التنفيذ',
      completed: 'مكتملة',
      noTasks: 'أحسنت! لا توجد مهام معلقة اليوم.'
    },
    habits: {
      title: 'العادات اليومية والاستمرارية',
      subtitle: 'ابنِ عاداتك الإيجابية واحتفل بإنجازاتك اليومية',
      addHabit: 'إضافة عادة جديدة',
      habitTitlePlaceholder: 'مثال: القراءة، الرياضة، الصلاة...',
      frequency: 'التكرار',
      daily: 'يوميًا',
      weekly: 'أسبوعيًا',
      streakDays: 'أيام متتالية',
      todayCompleted: 'أُنجزت اليوم!',
      markDone: 'تحديد كمكتمل',
      celebrationTitle: 'عمل رائع! 🎉',
      celebrationDesc: 'لقد حافظت على استمرار عادتك بنجاح!',
      noHabits: 'لم تقم بإضافة عادات بعد.'
    },
    expenses: {
      title: 'المصاريف والميزانية',
      subtitle: 'تتبع مدخولاتك ومصروفاتك وحقق الاستقرار المالي',
      addExpense: 'إضافة معاملة مالية',
      itemTitlePlaceholder: 'الوصف (مثل: التسوق، دخل مشروع)...',
      amount: 'المبلغ',
      type: 'النوع',
      expense: 'مصروف',
      income: 'دخل',
      category: 'التصنيف',
      categories: {
        food: 'طعام',
        transport: 'مواصلات',
        utilities: 'فواتير وخدمات',
        shopping: 'تسوق',
        salary: 'راتب',
        project: 'مشروع',
        other: 'أخرى'
      },
      totalIncome: 'إجمالي الدخل',
      totalExpense: 'إجمالي المصروفات',
      netBalance: 'الرصيد المتبقي',
      recentTransactions: 'أحدث المعاملات',
      noExpenses: 'لا توجد سجلات مالية حتى الآن.'
    },
    robot: {
      name: 'روبوت حسن',
      role: 'مساعدك الشخصي الذكي',
      tapToChat: 'انقر للحديث',
      states: {
        idle: 'جاهز',
        listening: 'أستمع إليك...',
        thinking: 'أفكر...',
        speaking: 'أتحدث...'
      },
      inputPlaceholder: 'اطلب مني أي شيء أو اسألني...',
      send: 'إرسال',
      voiceActive: 'الصوت مفعّل',
      voiceInactive: 'الصوت معطّل',
      mute: 'كتم الصوت',
      unmute: 'تشغيل الصوت',
      minimize: 'تصغير',
      maximize: 'تكبير',
      hide: 'إخفاء الروبوت',
      show: 'إظهار روبوت حسن',
      moveSide: 'نقل للجانب الآخر',
      offlineModeNotice: 'الوضع دون اتصال نشط — تتم معالجة أوامرك محليًا.',
      micNotice: 'الميكروفون غير متصل، يرجى الكتابة.',
      suggestedPrompts: [
        'كم صرفت هذا الشهر؟',
        'أضف مهمة: شراء المستلزمات',
        'ملاحظة: اجتماع غدًا الساعة العاشرة',
        'كيف هو تقدم عاداتي اليومية؟'
      ]
    },
    pwa: {
      installApp: 'تثبيت التطبيق',
      installDesc: 'قم بتثبيت التطبيق على جهازك أو هاتفك المحمول للوصول المباشر.',
      installed: 'تم التثبيت بنجاح',
      howToIOS: 'على أجهزة آيفون، اضغط على زر المشاركة في متصفح سفاري ثم اختر "إضافة إلى الشاشة الرئيسية".'
    },
    settings: {
      title: 'إعدادات التطبيق',
      subtitle: 'خصص اللغة، المظهر والمساعد الذكي حسب رغبتك',
      profileSection: 'الملف الشخصي',
      userName: 'الاسم',
      avatarUrl: 'رابط الصورة الشخصية',
      themeSection: 'المظهر المرئي (Theme)',
      themeDark: 'الوضع الليلي (Dark Mode)',
      themeLight: 'الوضع النهاري (Light Mode)',
      themeSophia: 'وضع صوفيا الفاخر (Sophia Mode)',
      themeSophiaDesc: 'مظهر سينمائي فخم بتوهج نيون وتأثيرات زجاجية راقية',
      languageSection: 'اختيار اللغة (Language)',
      mascotSection: 'مظهر وموضع روبوت حسن',
      mascotToggleLabel: 'عرض الروبوت على الشاشة',
      mascotSideLabel: 'موضع الروبوت (يمين / يسار)',
      aiSection: 'إعدادات الذكاء الاصطناعي (اختياري)',
      geminiKeyLabel: 'مفتاح Google Gemini API المجاني',
      geminiKeyHelp: 'يتيح إجابات أعمق وأكثر ذكاءً (سيعمل التطبيق بدونه محليًا)',
      dataSection: 'النسخ الاحتياطي والبيانات',
      pwaSection: 'تثبيت تطبيق الهاتف والحاسوب',
      exportBackup: 'تصدير نسخة احتياطية JSON',
      importBackup: 'استعادة من نسخة احتياطية',
      saveChanges: 'حفظ التعديلات',
      savedSuccess: 'تم حفظ الإعدادات بنجاح!'
    },
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ ما',
      retry: 'إعادة المحاولة',
      success: 'تم بنجاح',
      close: 'إغلاق'
    }
  },

  en: {
    appName: 'Hasan Life Guide',
    appTagline: 'Your Personal AI Companion & Life Navigator',
    nav: {
      dashboard: 'Dashboard',
      notes: 'Notes & Voice',
      tasks: 'Tasks & Goals',
      habits: 'Daily Habits',
      expenses: 'Expenses & Budget',
      robot: 'Hasan Robot',
      settings: 'Settings'
    },
    greetings: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      night: 'Good Night',
      welcomeBack: 'Welcome back'
    },
    dashboard: {
      dailyBriefing: 'Daily Briefing',
      dailyBriefingDesc: 'Your morning summary of key priorities and habit momentum',
      quickCapture: 'Quick Voice Capture',
      pendingTasks: 'Pending Tasks',
      habitStreaks: 'Active Streaks',
      monthlyBalance: 'Net Balance',
      recentVoiceNotes: 'Recent Notes & Voice Memos',
      noRecentNotes: 'No notes created yet.',
      viewAllNotes: 'View all notes',
      completeTasksPrompt: 'Focus on finishing today\'s top priorities'
    },
    notes: {
      title: 'Notes & Voice Memos',
      subtitle: 'Capture rich thoughts, voice dictation, and attached audio recordings',
      newNote: 'Create New Note',
      searchPlaceholder: 'Search notes and voice memos...',
      allTags: 'All Tags',
      pinnedNotes: 'Pinned Notes',
      otherNotes: 'Other Notes',
      noNotesFound: 'No notes match your filter',
      createFirstNote: 'Start your journey by creating your first note or recording a thought!',
      noteTitlePlaceholder: 'Note title...',
      noteContentPlaceholder: 'Write your content here or use the microphone below to speak...',
      tagsPlaceholder: 'Tags (comma separated, e.g. work, personal)',
      pinNote: 'Pin to top',
      pinned: 'Pinned',
      color: 'Card Color',
      save: 'Save Note',
      cancel: 'Cancel',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this note?',
      voiceDictation: 'Voice Typing (Dictation)',
      dictationListening: 'Speak now, listening...',
      dictationStopped: 'Voice input paused',
      recordVoiceMemo: 'Record Voice Memo',
      recordingInProgress: 'Recording audio... speak clearly',
      stopRecording: 'Finish Recording',
      attachedAudio: 'Attached Voice Memos',
      playAudio: 'Play',
      pauseAudio: 'Pause',
      deleteAudio: 'Remove Audio',
      micNotSupported: 'Speech recognition is not supported in this browser environment.'
    },
    tasks: {
      title: 'Tasks & Planning',
      subtitle: 'Organize high-impact goals with structured priority flags',
      addTask: 'Add New Task',
      taskPlaceholder: 'What needs to be done?...',
      priority: 'Priority',
      priorityHigh: 'High Priority',
      priorityMedium: 'Medium Priority',
      priorityLow: 'Low Priority',
      category: 'Category',
      dueDate: 'Due Date',
      all: 'All',
      active: 'Active',
      completed: 'Completed',
      noTasks: 'Zero tasks pending. You are all caught up!'
    },
    habits: {
      title: 'Habits & Streaks',
      subtitle: 'Build lifelong positive routines with celebration milestones',
      addHabit: 'Add New Habit',
      habitTitlePlaceholder: 'e.g. Morning Workout, Deep Work, Reading...',
      frequency: 'Frequency',
      daily: 'Daily',
      weekly: 'Weekly',
      streakDays: 'Day Streak',
      todayCompleted: 'Done Today!',
      markDone: 'Mark as Completed',
      celebrationTitle: 'Incredible Momentum! 🎉',
      celebrationDesc: 'You kept your habit streak unbroken!',
      noHabits: 'No habits tracked yet. Start one today!'
    },
    expenses: {
      title: 'Expenses & Budget',
      subtitle: 'Track cash flow, categorize spending, and reach financial peace',
      addExpense: 'Log Transaction',
      itemTitlePlaceholder: 'Description (e.g. Groceries, Freelance Income)...',
      amount: 'Amount',
      type: 'Type',
      expense: 'Expense',
      income: 'Income',
      category: 'Category',
      categories: {
        food: 'Food & Dining',
        transport: 'Transit & Travel',
        utilities: 'Bills & Utilities',
        shopping: 'Shopping',
        salary: 'Salary',
        project: 'Project Fee',
        other: 'Miscellaneous'
      },
      totalIncome: 'Total Income',
      totalExpense: 'Total Expenses',
      netBalance: 'Net Balance',
      recentTransactions: 'Recent Transactions',
      noExpenses: 'No transactions recorded yet.'
    },
    robot: {
      name: 'Hasan Robot',
      role: 'Your Personal AI Companion',
      tapToChat: 'Tap to chat',
      states: {
        idle: 'Ready',
        listening: 'Listening...',
        thinking: 'Thinking...',
        speaking: 'Speaking...'
      },
      inputPlaceholder: 'Ask me anything or give a command...',
      send: 'Send',
      voiceActive: 'Voice ON',
      voiceInactive: 'Voice OFF',
      mute: 'Mute',
      unmute: 'Unmute',
      minimize: 'Minimize',
      maximize: 'Expand',
      hide: 'Hide Mascot',
      show: 'Show Hasan Robot',
      moveSide: 'Move Side',
      offlineModeNotice: 'Offline Mode Active — processing commands locally.',
      micNotice: 'Microphone permission not granted, type to chat.',
      suggestedPrompts: [
        'What are my expenses this month?',
        'Add task: Client presentation demo',
        'Note: Meeting at 10 AM tomorrow',
        'How is my habit streak doing?'
      ]
    },
    pwa: {
      installApp: 'Install App',
      installDesc: 'Install on your mobile or desktop device for fast, offline-ready access.',
      installed: 'Installed',
      howToIOS: 'On iPhone Safari, tap the Share icon and tap "Add to Home Screen".'
    },
    settings: {
      title: 'App Settings',
      subtitle: 'Configure your preferred language, visual theme, and AI engine',
      profileSection: 'Personal Profile',
      userName: 'Display Name',
      avatarUrl: 'Profile Image URL',
      themeSection: 'Visual Theme',
      themeDark: 'Dark Mode (OLED Clean)',
      themeLight: 'Light Mode (Paper Pristine)',
      themeSophia: 'Sophia Mode (Cinematic Luxury)',
      themeSophiaDesc: 'Signature deep violet obsidian theme with luminous glowing accents',
      languageSection: 'Language & Locale',
      mascotSection: 'Hasan Robot Display & Mobility',
      mascotToggleLabel: 'Display Mascot on Screen',
      mascotSideLabel: 'Mascot Screen Corner (Left / Right)',
      aiSection: 'AI Intelligence (Optional)',
      geminiKeyLabel: 'Google Gemini Free API Key',
      geminiKeyHelp: 'Enables advanced reasoning and large chat answers (works offline without it)',
      dataSection: 'Data Portability & Backup',
      pwaSection: 'Mobile & Desktop App Installation',
      exportBackup: 'Download Full JSON Backup',
      importBackup: 'Restore from JSON File',
      saveChanges: 'Save Changes',
      savedSuccess: 'Settings saved successfully!'
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      success: 'Success',
      close: 'Close'
    }
  }
};
