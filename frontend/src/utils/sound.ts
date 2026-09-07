// Synthesized Web Audio API sound generator
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private playToneSequence(
    tones: Array<{ freq: number; duration: number; type: OscillatorType; delay?: number }>,
  ) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      tones.forEach((tone) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = tone.type;
        osc.frequency.setValueAtTime(tone.freq, now + (tone.delay || 0));

        gain.gain.setValueAtTime(0.15, now + (tone.delay || 0));
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          now + (tone.delay || 0) + tone.duration,
        );

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + (tone.delay || 0));
        osc.stop(now + (tone.delay || 0) + tone.duration + 0.05);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Alert Tone (440Hz -> 880Hz)
  playAlertTone() {
    this.playToneSequence([
      { freq: 440, duration: 0.08, type: 'sine' },
      { freq: 880, duration: 0.12, type: 'sine', delay: 0.1 },
    ]);
  }

  // Dispatch Chime (C5 -> E5 -> G5 ascending triad)
  playDispatchChime() {
    this.playToneSequence([
      { freq: 523.25, duration: 0.08, type: 'sine' },
      { freq: 659.25, duration: 0.08, type: 'sine', delay: 0.08 },
      { freq: 783.99, duration: 0.18, type: 'sine', delay: 0.16 },
    ]);
  }

  // Success Chime (G4 -> C5 -> E5 -> G5 arpeggio)
  playSuccessChime() {
    this.playToneSequence([
      { freq: 392.0, duration: 0.06, type: 'sine' },
      { freq: 523.25, duration: 0.06, type: 'sine', delay: 0.06 },
      { freq: 659.25, duration: 0.06, type: 'sine', delay: 0.12 },
      { freq: 1046.5, duration: 0.25, type: 'sine', delay: 0.18 },
    ]);
  }
}

export const sound = new SoundManager();
