// Speech-to-Text (STT), Text-to-Speech (TTS), and Voice Memo Recorder

type SpeechCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  // 1. STT: Check if Speech Recognition is actually available
  isSTTSupported(): boolean {
    const win = window as unknown as IWindow;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  startListening(
    lang: 'bn' | 'ar' | 'en',
    onResult: SpeechCallback,
    onError?: ErrorCallback
  ): boolean {
    if (!this.isSTTSupported()) {
      if (onError) onError('Speech recognition is not supported in this browser.');
      return false;
    }

    try {
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();

      // Configure locale
      const localeMap = {
        bn: 'bn-BD',
        ar: 'ar-SA',
        en: 'en-US'
      };
      this.recognition.lang = localeMap[lang] || 'bn-BD';
      this.recognition.interimResults = true;
      this.recognition.continuous = true;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          onResult(text, !!finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (onError) onError(event.error);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: unknown) {
      if (onError) onError((err as Error).message);
      this.isListening = false;
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  // 2. TTS: Speak Text using browser native speech synthesis
  speak(
    text: string,
    lang: 'bn' | 'ar' | 'en',
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onAmplitude?: (amp: number) => void;
    }
  ): void {
    if (!('speechSynthesis' in window)) {
      if (options?.onEnd) options.onEnd();
      return;
    }

    window.speechSynthesis.cancel(); // Stop prior speech

    const utterance = new SpeechSynthesisUtterance(text);
    const localeMap = {
      bn: 'bn-BD',
      ar: 'ar-SA',
      en: 'en-US'
    };
    utterance.lang = localeMap[lang] || 'bn-BD';
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Friendly slightly higher pitch for mascot

    // Find localized voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(lang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    let animInterval: number | null = null;

    utterance.onstart = () => {
      if (options?.onStart) options.onStart();

      // Simulate lip-sync amplitude rhythm if audio analyser not bound to TTS
      if (options?.onAmplitude) {
        animInterval = window.setInterval(() => {
          // Dynamic conversational amplitude modulation between 0.2 and 0.95
          const amp = 0.25 + Math.random() * 0.7;
          options.onAmplitude!(amp);
        }, 120);
      }
    };

    utterance.onend = () => {
      if (animInterval) clearInterval(animInterval);
      if (options?.onAmplitude) options.onAmplitude(0);
      if (options?.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      if (animInterval) clearInterval(animInterval);
      if (options?.onAmplitude) options.onAmplitude(0);
      if (options?.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // 3. Audio Memo Recording (Mic input for notes)
  async startRecordingAudio(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.recordingStartTime = Date.now();

      // Setup Web Audio Analyser for live recording visualization
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);
      } catch {}

      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : undefined;

      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Slice every 250ms
      return true;
    } catch (err) {
      console.error('Failed to access microphone for recording:', err);
      return false;
    }
  }

  stopRecordingAudio(): Promise<{ blob: Blob; durationSeconds: number } | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const duration = Math.max(1, (Date.now() - this.recordingStartTime) / 1000);
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });

        // Stop all mic tracks
        if (this.mediaRecorder?.stream) {
          this.mediaRecorder.stream.getTracks().forEach(t => t.stop());
        }
        if (this.audioContext) {
          try { this.audioContext.close(); } catch {}
          this.audioContext = null;
        }

        resolve({ blob, durationSeconds: Math.round(duration * 10) / 10 });
      };

      this.mediaRecorder.stop();
    });
  }

  // Live mic amplitude during recording (0.0 to 1.0)
  getLiveMicAmplitude(): number {
    if (!this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    return Math.min(1, average / 128);
  }
}

export const speechService = new SpeechService();
