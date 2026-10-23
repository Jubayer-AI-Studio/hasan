# Specification: Hasan Life Guide (হাসান লাইফ গাইড)

## 1. Overview & Vision
"Hasan Life Guide" is an offline-first, privacy-respecting, zero-cost personal life management system and AI companion. Designed with client-grade polish, it integrates rich note-taking with embedded voice recording, quick voice capture, task & habit tracking, expense management, and a lightweight 3D interactive mascot ("Hasan Robot"). It features complete trilingual support (Bengali, Arabic with full RTL layout, and English) and three visual themes including the signature cinematic "Sophia Mode".

---

## 2. Clarifications & Confirmed Decisions
1. **Note-Taking & Voice Primacy (User Mandate):**
   - Notes are not merely text: they support rich Markdown/text, inline voice dictation (STT), and audio voice recordings (record, save, play audio clips directly within notes).
   - Voice is integrated across the app with instant voice shortcuts for quick notes and tasks.
2. **Backend-First Workflow (User Mandate):**
   - The backend API and SQLite database must be built, organized, and verified first before frontend implementation.
   - Rigorous automated testing of backend routes, data validation, and database queries.
3. **Mascot Rendering:**
   - Procedural, lightweight Three.js 3D model with optimized draw-calls and battery-conscious idle throttling.
4. **AI & Speech Services:**
   - 100% free. Web Speech API for voice STT/TTS; hybrid AI engine combining local rule-based intent parsing (offline) and optional Google Gemini 2.0 Flash free API.

---

## 3. Functional Requirements (FR)

### Module A: Core Pillars — Notes & Voice System
* **FR-01: Rich Note Taking:** Users can create, edit, delete, pin, tag, and search notes. Supports rich text, checklist items, and markdown formatting.
* **FR-02: Voice Dictation in Notes:** Note editor contains an interactive microphone tool that dictates speech directly into the note content (STT) in Bengali, Arabic, or English.
* **FR-03: Audio Voice Recordings inside Notes:** Users can record audio clips directly attached to a note, store the audio file in the backend database/storage, and play it back with an embedded audio waveform/player.
* **FR-04: Global Quick Voice Capture:** From any screen, a dedicated voice capture shortcut allows users to speak a quick thought, auto-categorizing it as a note or task.
* **FR-05: Truthful Voice Protocol:** The system strictly probes Web Speech API capabilities. If microphone permission is missing or unsupported, it never displays a "Listening..." state and clearly indicates "Microphone unavailable".

### Module B: Trilingual & RTL Localization
* **FR-06: Trilingual Interface:** Complete translation for English (`en`), Bengali (`bn`), and Arabic (`ar`).
* **FR-07: Arabic RTL Engine:** Dynamic bidirectional switching: when Arabic is selected, the layout mirrors completely (`dir="rtl"`), including drawers, navigation tabs, cards, and floating elements.
* **FR-08: Instant Locale Switching:** Language switchable in 1 click from Settings or Topbar, persisted across sessions.

### Module C: Tri-Theme Engine
* **FR-09: Light & Dark Modes:** High-contrast, battery-friendly Dark Mode and clean, crisp Light Mode.
* **FR-10: Sophia Mode (Cinematic Luxury):** Distinctive theme featuring deep obsidian background, luminous cyan/amethyst gradients, 1px glowing neon borders, glassmorphic backdrop blur, and subtle pulsating gold/neon highlights.
* **FR-11: Theme Persistence:** Selected theme is stored locally and applied before render to avoid flash of unstyled theme.

### Module D: Hasan Robot (3D Interactive AI Mascot)
* **FR-12: Dedicated 3D Mascot AI Tab:** The cute 3D Three.js Hasan Robot is housed inside a dedicated "AI Assistant" (হাসান এআই) tab instead of permanently floating over content screens. When the user enters the AI tab, the cute 3D robot floats, speaks, and interacts. When switching to other tabs, the 3D mascot unmounts cleanly to keep mobile views unobstructed.
* **FR-13: Mascot State Machine:** Four reactive states:
  1. `Idle`: Subtle floating breathing, occasional eye blink, soft head tilt following cursor.
  2. `Listening`: Ears/antennae illuminate with glowing pulse.
  3. `Thinking`: Head tilts, digital eye rings spin.
  4. `Speaking`: Real-time audio amplitude analysis drives mouth mesh scaling (lip-sync).
* **FR-14: Battery & Performance Guardrail:** Dynamic code-splitting (`React.lazy` + `Suspense`) ensures the 3D Three.js bundle is only loaded on demand, keeping initial mobile load ultra-light (<120 KB). Throttles render loop when idle.
* **FR-15: Interactive AI Dialogue & Voice:** AI Assistant view provides voice/text dialogue, powered by local offline intent processing + optional free Gemini API.
* **FR-20: Real-Time Dhaka Clock & Live Calendar:** Prominently placed at the top of the app, displays live ticking Bangladesh Dhaka Time (Asia/Dhaka, BST - UTC+6) with seconds, day of week, and full date.
* **FR-21: Prominent Mobile Install (PWA):** Instantly accessible "অ্যাপ ইনস্টল করুন" (Install App) button directly in the top header and quick action bar so mobile users can install the PWA without searching menus.
* **FR-22: Full Offline Resilience:** Complete offline-first support via Service Worker caching and local storage persistence for all user data and AI intent replies.
* **FR-23: Streetwear / Hip-Hop Cyber Aesthetic for Clock:** The Dhaka Clock displays date and time in English with stylish symbols (`⚡`, `🔥`, `✦`, audio beat equalizer bars), high-energy neon street colors (Electric Cyan, Acid Lime, Neon Violet/Flame), and bold futuristic typography.
* **FR-24: Professional AI Brain (Omni-Knowledge LLM):** Hasan Robot is equipped with a full multi-tier AI Brain capable of answering any question—including general knowledge, science, philosophy, coding, history, life advice, and app operations—matching ChatGPT and Gemini with intelligent, witty, concise replies in natural Bengali, Arabic, and English.
* **FR-25: High-Visibility Mobile Mascot & Bulletproof Rendering:** The cute robot mascot is prominently visible on mobile devices—both in the Dashboard Hero Welcome Card and the dedicated AI Tab—with dual-engine rendering (Three.js WebGL + 3D-shaded vector fallback) ensuring zero blank screens or device GPU failures.
* **FR-26: Ultra-Cute Baby Robot Aesthetic (অতিরিক্ত কিউট বাচ্চা রোবট):** Overhaul the visual styling of Hasan Robot to be genuinely endearing and lovable like a futuristic chibi baby robot (inspired by Astro Bot and kawaii mascots): pure pearlescent glossy white ceramic shell, large expressive glowing anime eyes with sparkle highlights (no hollow rings), glowing rosy blushing cheeks, sweet smiling mouth, glowing heart reactor, cute headphone ears, and chubby playful baby proportions with zero spooky or ghost-like attributes.
* **FR-27: Ultra-Lightweight Mobile Architecture & Zero-Crash Service Worker:** Eliminate heavy 3D WebGL engine (540+ KB Three.js overhead) in favor of an ultra-optimized, high-definition SVG & CSS animated vector mascot (<8 KB), dropping total bundle size to <120 KB for instant mobile loading. Harden Service Worker to guarantee strict non-null Response returns on all navigation and asset fetches, eliminating browser `ERR_FAILED` errors.

### Module E: Life Management & Personalization
* **FR-16: Personalized Dashboard:** Displays user's name, custom profile photo, time-sensitive greeting ("শুভ সকাল", "صباح الخير", "Good morning"), and Daily Overview briefing.
* **FR-17: Goals & Habit Tracker:** Daily habit streaks, weekly progress heatmaps, and tasteful celebration confetti/glow animations upon completion.
* **FR-18: Expense & Budget Manager:** Income/expense logging, category breakdown donut charts, and monthly spend tracking with multi-currency symbols (৳, $, د.إ, etc.).
* **FR-19: Local Data Backup & Restore:** Complete export of all notes, audio, tasks, and settings to a JSON file and full restore capability.

---

## 4. Non-Functional Requirements (NFR)
* **NFR-01: Zero Cost ($0):** No mandatory paid subscriptions, cloud database fees, or paid AI APIs.
* **NFR-02: Offline-First:** Fully functional without active internet connection (notes, tasks, habits, expenses, local search, local voice features).
* **NFR-03: Performance:** Local API response times < 50ms; frontend UI runs at smooth 60 FPS.
* **NFR-04: Privacy & Data Ownership:** All user data, audio recordings, and notes remain on the user's local machine in SQLite.
* **NFR-05: Accessibility:** WCAG 2.1 AA compliance with high contrast options and full keyboard navigability.

---

## 5. Acceptance Criteria (Gherkin Scenarios)

### Scenario 1: Note Creation with Voice Dictation & Audio Attachment
- **Given** the user is in the Notes module
- **When** the user clicks "New Note" and taps the microphone dictation button
- **Then** the spoken words in the active language are transcribed directly into the note editor
- **And** when the user clicks "Record Voice Memo", an audio snippet is recorded, saved to the backend, and an in-note audio player is rendered.

### Scenario 2: Arabic RTL Localization Switch
- **Given** the user is viewing the dashboard in English or Bengali
- **When** the user switches the language to Arabic in Settings
- **Then** the document attribute switches to `dir="rtl"`
- **And** the navigation, cards, and floating Hasan Robot flip to proper RTL alignments
- **And** 100% of the visible interface text is translated into Arabic.

### Scenario 3: Sophia Mode Activation
- **Given** the user is on any screen
- **When** the user selects "Sophia Mode"
- **Then** the UI transitions smoothly to the dark obsidian backdrop with radiant amethyst/cyan accents, glassmorphic blurred panels, and glowing outlines.

### Scenario 4: Truthful Mascot Speech State
- **Given** the user is in a browser where microphone permission is blocked
- **When** the user taps the voice input button on Hasan Robot
- **Then** the mascot does NOT pretend to listen
- **And** the UI clearly displays an informative notice explaining microphone access is unavailable.

### Scenario 5: Backend Data Integrity
- **Given** the backend server is running with SQLite
- **When** CRUD operations are executed on notes, tasks, habits, and expenses
- **Then** all relational queries and schema constraints validate with 100% test pass rate.

### Scenario 6: Ultra-Cute Baby Robot Mascot Appearance
- **Given** the user views the Hasan Robot on mobile or desktop (Dashboard, AI Tab, or Floating Buddy)
- **When** the mascot renders in either 3D WebGL or 2D vector fallback
- **Then** the robot presents a glossy pearlescent white baby-chibi design with large shiny expressive eyes, glowing pink blushing cheeks, sweet smile, and glowing chest heart
- **And** completely eliminates hollow eyes, dark armor, cone thruster smoke, or any ghost-like apparitions.

### Scenario 7: Zero-Crash Lightweight Mobile Experience
- **Given** the user loads the application on a mobile phone (3G/4G or intermittent connection)
- **When** navigating to the app URL or loading assets
- **Then** the initial bundle is under 120 KB without heavy Three.js chunks, loading in <0.5s
- **And** the Service Worker never rejects or returns undefined, preventing `ERR_FAILED` completely.
