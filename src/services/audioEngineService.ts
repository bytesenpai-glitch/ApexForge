import type { CylinderLayout, Engine } from "@/domain/parts/types";
import type { ExhaustPart, TurboPart } from "@/domain/parts/types";

export interface EngineSoundConfig {
  cylinders: number;
  cylinderLayout: CylinderLayout;
  redlineRpm: number;
  exhaustType: string;
  hasTurbo: boolean;
}

class ProceduralEngineAudio {
  private ctx: AudioContext | null = null;
  private primaryOsc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private masterGain: GainNode | null = null;
  private exhaustFilter: BiquadFilterNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private isRunning: boolean = false;
  private currentRpm: number = 850;
  private targetRpm: number = 850;
  private config: EngineSoundConfig = {
    cylinders: 4,
    cylinderLayout: "inline",
    redlineRpm: 7000,
    exhaustType: "oem",
    hasTurbo: false,
  };

  private initContext() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtxClass();
  }

  public setConfig(config: EngineSoundConfig) {
    this.config = config;
    if (this.currentRpm > config.redlineRpm) {
      this.currentRpm = config.redlineRpm;
    }
  }

  public start() {
    this.initContext();
    if (!this.ctx || this.isRunning) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    // 1. Primary Combustion Oscillator (Sawtooth for rich harmonic spectrum)
    this.primaryOsc = this.ctx.createOscillator();
    this.primaryOsc.type = "sawtooth";

    // 2. Sub-harmonic Rumble Oscillator (Triangle for exhaust body)
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = "triangle";

    // 3. Distortion / Saturation Curve
    this.distortionNode = this.ctx.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(this.config.exhaustType);

    // 4. Exhaust Acoustic Filter
    this.exhaustFilter = this.ctx.createBiquadFilter();
    this.configureExhaustFilter(this.config.exhaustType);

    // 5. Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, t);
    this.masterGain.gain.exponentialRampToValueAtTime(0.35, t + 0.1);

    // Wiring nodes: [Oscillators] -> [Distortion] -> [Exhaust Filter] -> [Master Gain] -> [Destination]
    this.primaryOsc.connect(this.distortionNode);
    this.subOsc.connect(this.distortionNode);
    this.distortionNode.connect(this.exhaustFilter);
    this.exhaustFilter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.updatePitch(this.currentRpm);

    this.primaryOsc.start();
    this.subOsc.start();
    this.isRunning = true;
  }

  public stop() {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

    setTimeout(() => {
      this.primaryOsc?.stop();
      this.subOsc?.stop();
      this.primaryOsc?.disconnect();
      this.subOsc?.disconnect();
      this.primaryOsc = null;
      this.subOsc = null;
      this.isRunning = false;
    }, 120);
  }

  public setRpm(rpm: number) {
    const clamped = Math.max(800, Math.min(rpm, this.config.redlineRpm));
    const previousRpm = this.currentRpm;
    this.currentRpm = clamped;
    this.updatePitch(clamped);

    // If suddenly dropped RPM from high boost, trigger blow-off valve flutter
    if (this.config.hasTurbo && previousRpm > 4500 && clamped < previousRpm - 1200) {
      this.triggerBov();
    }
  }

  private updatePitch(rpm: number) {
    if (!this.primaryOsc || !this.subOsc || !this.ctx) return;

    // Fundamental combustion firing frequency (Hz):
    // 4-stroke engine fires cylinders/2 times per crankshaft revolution.
    // F0 = (RPM / 60) * (cylinders / 2)
    const factor = this.config.cylinderLayout === "rotary" ? 3 : this.config.cylinders / 2;
    const baseFreq = Math.max(12, (rpm / 60) * factor);

    const t = this.ctx.currentTime;
    this.primaryOsc.frequency.setTargetAtTime(baseFreq, t, 0.04);
    this.subOsc.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.04);

    // Dynamic exhaust filter frequency opens as RPM increases
    if (this.exhaustFilter) {
      const filterFreq = Math.min(6500, 300 + (rpm / this.config.redlineRpm) * 3200);
      this.exhaustFilter.frequency.setTargetAtTime(filterFreq, t, 0.05);
    }
  }

  /**
   * Generates authentic Turbo Blow-off valve (BOV) flutter "tsu-tsu-tsu"
   */
  public triggerBov() {
    if (!this.ctx || !this.isRunning) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.6; // 600ms noise burst
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Bandpass filter for whoosh
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(2400, t);
    bandpass.Q.setValueAtTime(4.0, t);

    // 16Hz Amplitude modulation LFO for flutter
    const flutterGain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(16, t); // 16 pulses per sec flutter
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.5, t);

    flutterGain.gain.setValueAtTime(0.5, t);
    flutterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    lfo.connect(flutterGain.gain);
    whiteNoise.connect(bandpass);
    bandpass.connect(flutterGain);
    flutterGain.connect(this.ctx.destination);

    lfo.start(t);
    whiteNoise.start(t);
    lfo.stop(t + 0.6);
    whiteNoise.stop(t + 0.6);
  }

  /**
   * 2-Step Rev Limiter / Pop & Bang (Burble) flame backfire sound
   */
  public triggerPopAndBang() {
    if (!this.ctx || !this.isRunning) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.08);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  private configureExhaustFilter(type: string) {
    if (!this.exhaustFilter) return;

    switch (type) {
      case "straight-pipe":
        this.exhaustFilter.type = "peaking";
        this.exhaustFilter.frequency.value = 1800;
        this.exhaustFilter.gain.value = 8;
        this.exhaustFilter.Q.value = 1.2;
        break;
      case "titanium-catback":
        this.exhaustFilter.type = "peaking";
        this.exhaustFilter.frequency.value = 1200;
        this.exhaustFilter.gain.value = 5;
        this.exhaustFilter.Q.value = 2.5;
        break;
      case "cat-back":
      case "catless-downpipe":
        this.exhaustFilter.type = "lowpass";
        this.exhaustFilter.frequency.value = 900;
        this.exhaustFilter.Q.value = 2.0;
        break;
      case "oem":
      default:
        this.exhaustFilter.type = "lowpass";
        this.exhaustFilter.frequency.value = 450;
        this.exhaustFilter.Q.value = 0.8;
        break;
    }
  }

  private makeDistortionCurve(type: string): Float32Array<ArrayBuffer> {
    const nSamples = 256;
    const buffer = new ArrayBuffer(nSamples * Float32Array.BYTES_PER_ELEMENT);
    const curve = new Float32Array(buffer);
    const k = type === "straight-pipe" ? 40 : type === "titanium-catback" ? 25 : 10;

    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      rpm: this.currentRpm,
    };
  }
}

export const engineAudio = new ProceduralEngineAudio();
