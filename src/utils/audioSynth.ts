"use client";

/**
 * Generates brown noise buffer (rolling off at 6dB/octave) to simulate
 * a gentle airflow or room tone inside the museum space.
 */
function createBrownNoiseBuffer(ctx: AudioContext, seconds = 4) {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // Brown noise filter (integrator)
    data[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // Compensate for volume loss
  }
  return buffer;
}

/**
 * MuseumAmbientAudio synthesizes a warm, low-frequency room tone
 * with slow amplitude breathing. Run purely client-side on user interaction.
 */
class MuseumAmbientAudio {
  private ctx: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private osc: OscillatorNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private lfo: OscillatorNode | null = null;
  private targetVolume = 0.06; // Quiet background hum
  private isStarted = false;
  private muted = false;

  start() {
    if (typeof window === "undefined" || this.isStarted) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.mainGain.connect(this.ctx.destination);

      // 1. Deep gallery hum (55Hz)
      this.osc = this.ctx.createOscillator();
      this.osc.type = "sine";
      this.osc.frequency.setValueAtTime(55, this.ctx.currentTime);
      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.osc.connect(oscGain);
      oscGain.connect(this.mainGain);

      // 2. Soft brown noise rumble for airflow simulation
      const noiseBuffer = createBrownNoiseBuffer(this.ctx, 4);
      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.setValueAtTime(100, this.ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

      this.noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.mainGain);

      // 3. LFO to modulate noise volume to simulate natural airflow fluctuation
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = "sine";
      this.lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // ~12.5s cycle
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      
      this.lfo.connect(lfoGain);
      lfoGain.connect(noiseGain.gain);

      // Start sound sources
      this.osc.start();
      this.noiseSource.start();
      this.lfo.start();

      this.isStarted = true;
      
      // Fade in overall volume
      const startVol = this.muted ? 0 : this.targetVolume;
      this.mainGain.gain.linearRampToValueAtTime(startVol, this.ctx.currentTime + 2.5);
    } catch (e) {
      console.warn("Failed to initialize ambient audio synth:", e);
    }
  }

  setMute(mute: boolean) {
    this.muted = mute;
    if (!this.ctx || !this.mainGain) return;

    const vol = mute ? 0 : this.targetVolume;
    this.mainGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.4);
  }

  stop() {
    if (!this.isStarted) return;
    if (this.mainGain && this.ctx) {
      this.mainGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        try {
          this.osc?.stop();
          this.noiseSource?.stop();
          this.lfo?.stop();
          this.ctx?.close();
        } catch (e) {}
      }, 600);
    }
    this.isStarted = false;
  }
}

// Single instance to be imported and used globally
export const ambientAudio = new MuseumAmbientAudio();
