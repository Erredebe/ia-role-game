import { Injectable } from '@angular/core';

export interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  voiceName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesBound = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private stateListeners = new Set<() => void>();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      this.bindVoicesChanged();
    }
  }

  isSupported(): boolean {
    return !!this.synthesis;
  }

  onStateChange(listener: () => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  loadVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    const voices = this.synthesis.getVoices();
    if (voices.length) {
      this.voices = voices;
    }
    return this.voices;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return [...this.voices];
  }

  speak(text: string, options: SpeechOptions = {}): void {
    if (!this.synthesis) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    this.loadVoices();

    const utterance = new SpeechSynthesisUtterance(trimmed);
    utterance.lang = options.lang || 'es-ES';
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;

    const voice = this.pickVoice(utterance.lang, options.voiceName);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => this.notifyState();
    utterance.onend = () => this.notifyState();
    utterance.onpause = () => this.notifyState();
    utterance.onresume = () => this.notifyState();
    utterance.onerror = () => this.notifyState();

    this.stop();
    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
    this.notifyState();
  }

  pause(): void {
    if (this.synthesis?.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
      this.notifyState();
    }
  }

  resume(): void {
    if (this.synthesis?.paused) {
      this.synthesis.resume();
      this.notifyState();
    }
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
      this.notifyState();
    }
  }

  isSpeaking(): boolean {
    return !!this.synthesis?.speaking;
  }

  isPaused(): boolean {
    return !!this.synthesis?.paused;
  }

  private pickVoice(lang: string, voiceName?: string): SpeechSynthesisVoice | undefined {
    if (!this.voices.length) return undefined;
    if (voiceName) {
      const named = this.voices.find((voice) => voice.name === voiceName);
      if (named) return named;
    }

    const normalized = lang.toLowerCase();
    const exact = this.voices.find((voice) => voice.lang?.toLowerCase() === normalized);
    if (exact) return exact;

    const langPrefix = normalized.split('-')[0];
    return this.voices.find((voice) => voice.lang?.toLowerCase().startsWith(langPrefix));
  }

  private bindVoicesChanged(): void {
    if (!this.synthesis || this.voicesBound) return;
    this.voicesBound = true;
    this.synthesis.onvoiceschanged = () => {
      this.loadVoices();
      this.notifyState();
    };
  }

  private notifyState(): void {
    this.stateListeners.forEach((listener) => listener());
  }
}
