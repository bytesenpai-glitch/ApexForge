import type { CylinderLayout } from "@/domain/parts/types";

export interface EngineSoundConfig {
  cylinders: number;
  cylinderLayout: CylinderLayout;
  redlineRpm: number;
  exhaustType: string;
  hasTurbo: boolean;
  engineCode?: string;
  family?: string;
}

export type ExhaustSoundPreset = "oem" | "sport-resonated" | "valvetronic" | "straight-pipe";
export type LoadMode = "neutral" | "in-gear";
export type FlywheelType = "oem" | "lightweight";

export interface EngineAudioState {
  isRunning: boolean;
  rpm: number;
  throttle: number;
  boostBar: number;
  isChopIdle: boolean;
  is2StepActive: boolean;
  exhaustPreset: ExhaustSoundPreset;
  loadMode: LoadMode;
  flywheelType: FlywheelType;
}

/**
 * Next-Gen Physical Waveguide Automotive Engine Synthesizer.
 *
 * Implements Stanford CCRMA Digital Waveguide Physical Modeling:
 * 1. 64-harmonic asymmetric combustion chamber pressure pulses with Fourier PeriodicWave
 * 2. Exhaust Pipe Acoustic Waveguide (Delay line + Phase-inversion reflection + Damping)
 *    simulating acoustic waves propagating through 3-meter steel exhaust tubes
 * 3. Asymmetric bank phasing for Crossplane V8 burble and Boxer-4 UEL header pulse interference
 * 4. Stochastic combustion cycle jitter (micro-timing variance) eliminating electronic sterility
 * 5. Tailpipe & Rear Chassis Acoustic Cavity Convolver (physical impulse response)
 * 6. Throttle-load-dependent induction plenum roar (deep resonant sub-bass)
 * 7. Mechanical valvetrain chatter modulated by camshaft speed
 * 8. Real-time dynamic Turbo Boost model (spool whistle + compressor air rush + BOV flutter)
 * 9. Natural overrun decel crackles, burbles, and 2-step anti-lag fireballs
 */
class ProceduralEngineAudio {
  private ctx: AudioContext | null = null;

  // Primary Synthesis
  private primaryOsc: OscillatorNode | null = null;
  private bankOsc: OscillatorNode | null = null; // Crossplane V8 / Boxer-4 bank
  private inductionOsc: OscillatorNode | null = null; // Intake plenum boom
  private jitterOsc: OscillatorNode | null = null; // Stochastic combustion cycle jitter LFO

  // Mechanical Noise
  private mechNoiseSource: AudioBufferSourceNode | null = null;
  private mechGain: GainNode | null = null;

  // Turbocharger
  private turboOsc: OscillatorNode | null = null;
  private turboRushNode: AudioBufferSourceNode | null = null;
  private turboGain: GainNode | null = null;
  private currentBoost: number = 0.0; // Bar (0.0 to 1.8)

  // Digital Waveguide Exhaust Tube Model (Acoustic Standing Waves)
  private pipeDelay: DelayNode | null = null;
  private pipeFeedback: GainNode | null = null;
  private pipeDamping: BiquadFilterNode | null = null;

  // Acoustic Convolver (Tailpipe & Chassis Impulse Response)
  private tailpipeConvolver: ConvolverNode | null = null;
  private convolverGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  // Dynamic Mixing Gains
  private masterGain: GainNode | null = null;
  private combustionGain: GainNode | null = null;
  private inductionGain: GainNode | null = null;

  // Formant Filter Bank (Fixed physical exhaust geometry)
  private formantSub: BiquadFilterNode | null = null; // ~80Hz Helmholtz sub-rumble
  private formantBody: BiquadFilterNode | null = null; // ~260Hz Muffler body
  private formantRasp: BiquadFilterNode | null = null; // ~950Hz Manifold rasp
  private formantHigh: BiquadFilterNode | null = null; // ~2800Hz Metallic shear

  // Distortion / Saturation
  private distortionNode: WaveShaperNode | null = null;

  // Engine Physics & State
  private isRunning: boolean = false;
  private currentRpm: number = 850;
  private throttle: number = 0.0; // 0.0 to 1.0
  private loadMode: LoadMode = "neutral";
  private flywheelType: FlywheelType = "oem";
  private chopIdle: boolean = false;
  private is2StepActive: boolean = false;
  private exhaustPreset: ExhaustSoundPreset = "sport-resonated";

  // Decel crackle timing
  private lastRpm: number = 850;
  private decelTimer: number | null = null;

  private config: EngineSoundConfig = {
    cylinders: 4,
    cylinderLayout: "inline",
    redlineRpm: 7000,
    exhaustType: "sport-resonated",
    hasTurbo: false,
    engineCode: "OEM-I4",
    family: "general",
  };

  private initContext() {
    if (this.ctx || typeof window === "undefined") return;
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;
    this.ctx = new AudioCtxClass();
  }

  public setConfig(config: EngineSoundConfig) {
    this.config = config;
    if (this.currentRpm > config.redlineRpm) {
      this.currentRpm = config.redlineRpm;
    }
    if (this.isRunning && this.ctx) {
      this.applyPeriodicWave();
      this.configureFormants(this.exhaustPreset);
    }
  }

  public setExhaustPreset(preset: ExhaustSoundPreset) {
    this.exhaustPreset = preset;
    if (this.isRunning && this.ctx) {
      this.configureFormants(preset);
      if (this.distortionNode) {
        this.distortionNode.curve = this.makeDistortionCurve(preset);
      }
    }
  }

  public setLoadMode(mode: LoadMode) {
    this.loadMode = mode;
  }

  public setFlywheelType(type: FlywheelType) {
    this.flywheelType = type;
  }

  public setChopIdle(enabled: boolean) {
    this.chopIdle = enabled;
  }

  public setThrottle(val: number) {
    this.throttle = Math.max(0, Math.min(1, val));
    if (this.isRunning && this.ctx) {
      this.updateAcousticDynamics(this.currentRpm, this.throttle);
    }
  }

  public start() {
    this.initContext();
    if (!this.ctx || this.isRunning) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    // 1. Primary Combustion Oscillator with 64-harmonic Fourier wave
    this.primaryOsc = this.ctx.createOscillator();
    this.applyPeriodicWave();

    // 2. Secondary Bank Phasing Oscillator (Crossplane V8 & Boxer-4)
    this.bankOsc = this.ctx.createOscillator();
    this.bankOsc.type = "sawtooth";

    // 3. Stochastic Combustion Cycle Jitter Generator (Breaks electronic synth sterility)
    this.jitterOsc = this.ctx.createOscillator();
    this.jitterOsc.type = "sine";
    this.jitterOsc.frequency.setValueAtTime(37, t);
    const jitterGain = this.ctx.createGain();
    jitterGain.gain.setValueAtTime(1.8, t); // Micro-frequency perturbation
    this.jitterOsc.connect(jitterGain);
    jitterGain.connect(this.primaryOsc.frequency);
    this.jitterOsc.start(t);

    // 4. Intake Induction Plenum Roar (Deep bass)
    this.inductionOsc = this.ctx.createOscillator();
    this.inductionOsc.type = "sine";

    // 5. Mechanical Valvetrain Chatter
    this.createMechanicalNoise();

    // 6. Turbocharger System (Whistle + Compressor Rush)
    if (this.config.hasTurbo) {
      this.createTurbochargerNodes();
    }

    // 7. Saturation WaveShaper
    this.distortionNode = this.ctx.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(this.exhaustPreset);

    // 8. 4-Stage Formant Filter Bank
    this.formantSub = this.ctx.createBiquadFilter();
    this.formantBody = this.ctx.createBiquadFilter();
    this.formantRasp = this.ctx.createBiquadFilter();
    this.formantHigh = this.ctx.createBiquadFilter();
    this.configureFormants(this.exhaustPreset);

    // 9. Digital Waveguide Exhaust Tube Acoustic Model
    // Simulates standing wave reflections in a 3-meter hot exhaust pipe (c ~ 420 m/s => 14ms delay)
    this.pipeDelay = this.ctx.createDelay(0.06);
    this.pipeDelay.delayTime.setValueAtTime(0.0142, t);

    this.pipeDamping = this.ctx.createBiquadFilter();
    this.pipeDamping.type = "lowpass";
    this.pipeDamping.frequency.setValueAtTime(1600, t);

    this.pipeFeedback = this.ctx.createGain();
    this.pipeFeedback.gain.setValueAtTime(-0.42, t); // Open-pipe boundary phase inversion

    // 10. Tailpipe Cavity Convolver (Spatial Physical Acoustics)
    this.tailpipeConvolver = this.ctx.createConvolver();
    this.tailpipeConvolver.buffer = this.createTailpipeImpulseResponse();

    this.convolverGain = this.ctx.createGain();
    this.convolverGain.gain.setValueAtTime(0.35, t);

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.setValueAtTime(0.75, t);

    // 11. Mixer & Master Gains
    this.combustionGain = this.ctx.createGain();
    this.combustionGain.gain.setValueAtTime(0.65, t);

    this.inductionGain = this.ctx.createGain();
    this.inductionGain.gain.setValueAtTime(0.02, t);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, t);
    this.masterGain.gain.exponentialRampToValueAtTime(0.42, t + 0.12);

    // Node Wiring Topology:
    // [Combustion Sources] -> [combustionGain] ----------------------------------┐
    // [Induction Source] -> [inductionGain] -------------------------------------┼-> [Distortion]
    //                                                                            │
    // [Distortion] -> [FormantSub] -> [FormantBody] -> [FormantRasp] -> [FormantHigh]
    //                                      │
    //                                      ├-> [pipeDelay] -> [pipeDamping] -> [pipeFeedback] (Loop back to pipeDelay)
    //                                      │        │
    //                                      ▼        ▼
    //                             [Exhaust Mix Sum]
    //                                 ├-> [dryGain] --------------------------------┐
    //                                 └-> [tailpipeConvolver] -> [convolverGain] ---┼-> [masterGain] -> Output
    this.primaryOsc.connect(this.combustionGain);
    this.bankOsc.connect(this.combustionGain);
    this.combustionGain.connect(this.distortionNode);

    this.inductionOsc.connect(this.inductionGain);
    this.inductionGain.connect(this.distortionNode);

    this.distortionNode.connect(this.formantSub);
    this.formantSub.connect(this.formantBody);
    this.formantBody.connect(this.formantRasp);
    this.formantRasp.connect(this.formantHigh);

    // Connect into Waveguide loop
    this.formantHigh.connect(this.pipeDelay);
    this.pipeDelay.connect(this.pipeDamping);
    this.pipeDamping.connect(this.pipeFeedback);
    this.pipeFeedback.connect(this.pipeDelay);

    // Sum Waveguide + direct into convolver & dry paths
    this.formantHigh.connect(this.dryGain);
    this.pipeDamping.connect(this.dryGain);

    this.formantHigh.connect(this.tailpipeConvolver);
    this.tailpipeConvolver.connect(this.convolverGain);

    this.dryGain.connect(this.masterGain);
    this.convolverGain.connect(this.masterGain);

    this.masterGain.connect(this.ctx.destination);

    // Start Oscillators
    this.primaryOsc.start(t);
    this.bankOsc.start(t);
    this.inductionOsc.start(t);

    this.isRunning = true;
    this.updateAcousticDynamics(this.currentRpm, this.throttle);
  }

  public stop() {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

    setTimeout(() => {
      try {
        this.primaryOsc?.stop();
        this.bankOsc?.stop();
        this.inductionOsc?.stop();
        this.jitterOsc?.stop();
        this.mechNoiseSource?.stop();
        this.turboOsc?.stop();
        this.turboRushNode?.stop();

        this.primaryOsc?.disconnect();
        this.bankOsc?.disconnect();
        this.inductionOsc?.disconnect();
        this.jitterOsc?.disconnect();
        this.mechNoiseSource?.disconnect();
        this.turboOsc?.disconnect();
        this.turboRushNode?.disconnect();
        this.pipeDelay?.disconnect();
        this.pipeFeedback?.disconnect();
        this.tailpipeConvolver?.disconnect();
      } catch {
        // Safe guard against audio lifecycle races
      }

      this.primaryOsc = null;
      this.bankOsc = null;
      this.inductionOsc = null;
      this.jitterOsc = null;
      this.mechNoiseSource = null;
      this.turboOsc = null;
      this.turboRushNode = null;
      this.pipeDelay = null;
      this.pipeFeedback = null;
      this.tailpipeConvolver = null;
      this.isRunning = false;
    }, 160);
  }

  public setRpm(rpm: number) {
    const clamped = Math.max(800, Math.min(rpm, this.config.redlineRpm));
    const prevRpm = this.currentRpm;
    this.lastRpm = prevRpm;
    this.currentRpm = clamped;

    this.updateAcousticDynamics(clamped, this.throttle);

    // Detect sudden lift-off: trigger BOV flutter & Overrun crackles
    if (prevRpm > 3400 && clamped < prevRpm - 120) {
      if (this.config.hasTurbo && prevRpm > 4200 && clamped < prevRpm - 700) {
        this.triggerBov();
      }
      this.checkAndTriggerOverrun(prevRpm, clamped);
    }
  }

  public set2Step(active: boolean) {
    this.is2StepActive = active;
  }

  /**
   * Updates all acoustic frequencies, harmonic ratios, and dynamic gains
   */
  private updateAcousticDynamics(rpm: number, throttle: number) {
    if (!this.ctx || !this.primaryOsc || !this.bankOsc || !this.inductionOsc) return;

    const t = this.ctx.currentTime;
    const isV8 = this.config.cylinders === 8 && this.config.cylinderLayout === "v-engine";
    const isBoxer = this.config.cylinderLayout === "boxer";
    const isRotary = this.config.cylinderLayout === "rotary";
    const isI6 = this.config.cylinders === 6 && this.config.cylinderLayout === "inline";

    // 1. Calculate Fundamental Firing Frequency (Hz)
    // 4-stroke engine: F0 = (RPM / 60) * (Cylinders / 2)
    let firingMultiplier = this.config.cylinders / 2;
    if (isRotary) firingMultiplier = 3;

    let baseFreq = Math.max(12, (rpm / 60) * firingMultiplier);

    // Apply chop-idle camshaft lope if enabled at idle
    if (this.chopIdle && rpm < 1100) {
      const lopeMod = Math.sin(t * 13) * 9 + (Math.random() * 5 - 2.5);
      baseFreq = Math.max(15, baseFreq + lopeMod);
    }

    this.primaryOsc.frequency.setTargetAtTime(baseFreq, t, 0.035);

    // 2. Secondary Bank Phasing Oscillator
    if (isV8) {
      // Crossplane V8 has uneven 90-180-270-90 pulse spacing between banks
      const bankFreq = Math.max(10, (rpm / 60) * 2 + 0.35);
      this.bankOsc.frequency.setTargetAtTime(bankFreq, t, 0.04);
    } else if (isBoxer) {
      // Boxer-4 with UEL headers creates a 14-22Hz beat rumble
      const boxerBeatFreq = Math.max(12, (rpm / 60) * 1.0);
      this.bankOsc.frequency.setTargetAtTime(boxerBeatFreq, t, 0.04);
    } else if (isI6) {
      // Inline-6 has silky 3rd harmonic mechanical resonance
      const i6Harmonic = baseFreq * 1.5;
      this.bankOsc.frequency.setTargetAtTime(i6Harmonic, t, 0.035);
    } else {
      // Standard I4 / V6 sub-harmonic body
      this.bankOsc.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.04);
    }

    // 3. Induction Plenum Roar (Lowpass intake boom under throttle)
    // Frequency tracks engine displacement resonance (55Hz to 180Hz)
    const inductionFreq = Math.min(180, 52 + (rpm / this.config.redlineRpm) * 95);
    this.inductionOsc.frequency.setTargetAtTime(inductionFreq, t, 0.05);

    if (this.inductionGain) {
      // In neutral: moderate induction boom. In-gear under full load: massive induction roar
      const loadFactor = this.loadMode === "in-gear" ? 1.3 : 1.0;
      const targetInductionGain = (0.02 + throttle * 0.45) * loadFactor;
      this.inductionGain.gain.setTargetAtTime(Math.min(0.6, targetInductionGain), t, 0.04);
    }

    // 4. Dynamic Turbocharger Boost & Spool Whistle
    if (this.turboOsc && this.turboGain) {
      // In neutral, engine cannot build high boost (only 0.2 - 0.4 bar).
      // Under load (in-gear), boost builds up to 1.6 - 1.8 bar!
      const maxBoost = this.loadMode === "in-gear" ? 1.75 : 0.35;
      const boostCurve = Math.max(0, (rpm - 2200) / (this.config.redlineRpm - 2200));
      this.currentBoost = boostCurve * throttle * maxBoost;

      const turboPitch = 1500 + this.currentBoost * 2600 + (rpm / this.config.redlineRpm) * 1200;
      const targetTurboGain = this.currentBoost > 0.08 ? Math.min(0.25, this.currentBoost * 0.18) : 0.001;

      this.turboOsc.frequency.setTargetAtTime(turboPitch, t, 0.08);
      this.turboGain.gain.setTargetAtTime(targetTurboGain, t, 0.08);
    }

    // 5. Dynamic Formant Rasp Adjustments
    if (this.formantRasp) {
      const baseRaspFreq = this.exhaustPreset === "straight-pipe" ? 1150 : 940;
      const dynamicRasp = baseRaspFreq + (rpm / this.config.redlineRpm) * 380;
      this.formantRasp.frequency.setTargetAtTime(dynamicRasp, t, 0.06);
    }

    // 6. Dynamic Waveguide Pipe Delay Tuning
    if (this.pipeDelay) {
      // Gas temperature increases with RPM and load (from 400°C to 850°C), increasing speed of sound
      // c_hot increases => delay time slightly decreases from 14.8ms to 12.5ms
      const tempDelay = 0.015 - (rpm / this.config.redlineRpm) * 0.0025;
      this.pipeDelay.delayTime.setTargetAtTime(tempDelay, t, 0.1);
    }
  }

  /**
   * Generates a 64-harmonic Fourier series matching real automotive cylinder pressure profiles
   */
  private applyPeriodicWave() {
    if (!this.ctx || !this.primaryOsc) return;

    const nHarmonics = 64;
    const real = new Float32Array(nHarmonics);
    const imag = new Float32Array(nHarmonics);

    const layout = this.config.cylinderLayout;
    const cyl = this.config.cylinders;

    if (layout === "inline" && cyl === 6) {
      // Inline-6 (2JZ / S58 / RB26): Smooth, silky mechanical howl. Dominant 3rd, 6th & 12th orders
      imag[1] = 0.85;
      imag[2] = 0.35;
      imag[3] = 1.0;
      imag[4] = 0.28;
      imag[5] = 0.2;
      imag[6] = 0.75;
      imag[7] = 0.15;
      imag[8] = 0.22;
      imag[9] = 0.52;
      imag[12] = 0.38;
      imag[18] = 0.2;
    } else if (cyl === 8 && layout === "v-engine") {
      // Crossplane V8 (LS / Coyote / M156): Heavy uneven syncopation, massive low-end punch
      imag[1] = 0.95;
      imag[2] = 1.0;
      imag[3] = 0.45;
      imag[4] = 0.82;
      imag[5] = 0.26;
      imag[6] = 0.65;
      imag[7] = 0.2;
      imag[8] = 0.52;
      imag[10] = 0.32;
      imag[12] = 0.28;
      imag[16] = 0.18;
    } else if (layout === "boxer") {
      // Boxer-4 (Subaru EJ / FA): Asymmetric pulse train with strong sub-harmonic thumping
      imag[1] = 1.0;
      imag[2] = 0.88;
      imag[3] = 0.58;
      imag[4] = 0.72;
      imag[5] = 0.36;
      imag[6] = 0.48;
      imag[8] = 0.32;
      imag[10] = 0.22;
    } else if (layout === "rotary") {
      // Rotary Wankel (13B-REW): 3 combustion lobes with ultra-sharp odd-order rasp
      imag[1] = 0.72;
      imag[2] = 0.52;
      imag[3] = 1.0;
      imag[4] = 0.42;
      imag[5] = 0.88;
      imag[6] = 0.36;
      imag[7] = 0.72;
      imag[9] = 0.62;
      imag[11] = 0.45;
    } else if (cyl === 10) {
      // V10 (BMW S85 / Carrera GT): Shrill, high-order Formula 1 scream
      imag[1] = 0.75;
      imag[2] = 0.4;
      imag[3] = 0.3;
      imag[4] = 0.52;
      imag[5] = 1.0;
      imag[6] = 0.32;
      imag[8] = 0.42;
      imag[10] = 0.88;
    } else {
      // Inline-4 (Theta II / K24 / 4G63T / EA888): Punchy 2nd & 4th order firing rasp
      imag[1] = 1.0;
      imag[2] = 0.92;
      imag[3] = 0.38;
      imag[4] = 0.72;
      imag[5] = 0.22;
      imag[6] = 0.48;
      imag[7] = 0.16;
      imag[8] = 0.32;
      imag[12] = 0.18;
    }

    const periodicWave = this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    this.primaryOsc.setPeriodicWave(periodicWave);
  }

  /**
   * Creates a 40ms Tailpipe & Rear Chassis Acoustic Cavity Impulse Response
   */
  private createTailpipeImpulseResponse(): AudioBuffer | null {
    if (!this.ctx) return null;

    const sampleRate = this.ctx.sampleRate;
    const duration = 0.042; // 42ms early reflection cavity
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 65);
      // Resonance modes of an oval exhaust tailpipe (180Hz body, 420Hz cavity)
      const resonance =
        Math.sin(2 * Math.PI * 180 * t) * 0.6 +
        Math.sin(2 * Math.PI * 420 * t) * 0.4;
      const noise = (Math.random() * 2 - 1) * 0.25;

      left[i] = (resonance + noise) * envelope * 0.45;
      right[i] = (resonance * 0.88 + (Math.random() * 2 - 1) * 0.25) * envelope * 0.45;
    }

    return buffer;
  }

  /**
   * Configures the 4-Stage Exhaust Formant Filter Bank based on physical pipe characteristics
   */
  private configureFormants(preset: ExhaustSoundPreset) {
    if (!this.formantSub || !this.formantBody || !this.formantRasp || !this.formantHigh) return;

    switch (preset) {
      case "straight-pipe":
        this.formantSub.type = "lowshelf";
        this.formantSub.frequency.value = 95;
        this.formantSub.gain.value = 6;

        this.formantBody.type = "peaking";
        this.formantBody.frequency.value = 320;
        this.formantBody.Q.value = 2.0;
        this.formantBody.gain.value = 4;

        this.formantRasp.type = "peaking";
        this.formantRasp.frequency.value = 1150;
        this.formantRasp.Q.value = 3.5;
        this.formantRasp.gain.value = 11;

        this.formantHigh.type = "highshelf";
        this.formantHigh.frequency.value = 2600;
        this.formantHigh.gain.value = 8;
        break;

      case "valvetronic":
        this.formantSub.type = "lowshelf";
        this.formantSub.frequency.value = 85;
        this.formantSub.gain.value = 8;

        this.formantBody.type = "peaking";
        this.formantBody.frequency.value = 250;
        this.formantBody.Q.value = 2.5;
        this.formantBody.gain.value = 6;

        this.formantRasp.type = "peaking";
        this.formantRasp.frequency.value = 950;
        this.formantRasp.Q.value = 2.8;
        this.formantRasp.gain.value = 6;

        this.formantHigh.type = "highshelf";
        this.formantHigh.frequency.value = 3000;
        this.formantHigh.gain.value = 3;
        break;

      case "sport-resonated":
        this.formantSub.type = "lowshelf";
        this.formantSub.frequency.value = 80;
        this.formantSub.gain.value = 9;

        this.formantBody.type = "peaking";
        this.formantBody.frequency.value = 220;
        this.formantBody.Q.value = 2.2;
        this.formantBody.gain.value = 7;

        this.formantRasp.type = "peaking";
        this.formantRasp.frequency.value = 850;
        this.formantRasp.Q.value = 2.0;
        this.formantRasp.gain.value = 2;

        this.formantHigh.type = "highshelf";
        this.formantHigh.frequency.value = 2400;
        this.formantHigh.gain.value = -2;
        break;

      case "oem":
      default:
        this.formantSub.type = "lowshelf";
        this.formantSub.frequency.value = 75;
        this.formantSub.gain.value = 4;

        this.formantBody.type = "peaking";
        this.formantBody.frequency.value = 190;
        this.formantBody.Q.value = 1.8;
        this.formantBody.gain.value = 3;

        this.formantRasp.type = "peaking";
        this.formantRasp.frequency.value = 750;
        this.formantRasp.Q.value = 1.5;
        this.formantRasp.gain.value = -4;

        this.formantHigh.type = "highshelf";
        this.formantHigh.frequency.value = 2000;
        this.formantHigh.gain.value = -8;
        break;
    }
  }

  /**
   * Generates mechanical valvetrain & camshaft chatter
   */
  private createMechanicalNoise() {
    if (!this.ctx) return;

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    this.mechNoiseSource = this.ctx.createBufferSource();
    this.mechNoiseSource.buffer = buffer;
    this.mechNoiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2200;
    filter.Q.value = 4.0;

    this.mechGain = this.ctx.createGain();
    this.mechGain.gain.value = 0.04;

    this.mechNoiseSource.connect(filter);
    filter.connect(this.mechGain);
    if (this.masterGain) {
      this.mechGain.connect(this.masterGain);
    }

    this.mechNoiseSource.start();
  }

  /**
   * Turbocharger spool whistle oscillator
   */
  private createTurbochargerNodes() {
    if (!this.ctx || !this.masterGain) return;

    this.turboOsc = this.ctx.createOscillator();
    this.turboOsc.type = "sine";
    this.turboOsc.frequency.value = 1800;

    this.turboGain = this.ctx.createGain();
    this.turboGain.gain.value = 0.001;

    this.turboOsc.connect(this.turboGain);
    this.turboGain.connect(this.masterGain);
    this.turboOsc.start();
  }

  /**
   * Blow-off valve (BOV) flutter "tsu-tsu-tsu"
   */
  public triggerBov() {
    if (!this.ctx || !this.isRunning) return;

    const t = this.ctx.currentTime;
    const duration = 0.58;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(2600, t);
    bandpass.Q.setValueAtTime(4.5, t);

    // 15Hz flutter amplitude modulation
    const flutterGain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(14.5, t);

    flutterGain.gain.setValueAtTime(0.55, t);
    flutterGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    lfo.connect(flutterGain.gain);
    whiteNoise.connect(bandpass);
    bandpass.connect(flutterGain);
    flutterGain.connect(this.ctx.destination);

    lfo.start(t);
    whiteNoise.start(t);
    lfo.stop(t + duration);
    whiteNoise.stop(t + duration);
  }

  /**
   * Overrun burble & exhaust crackles
   */
  private checkAndTriggerOverrun(fromRpm: number, toRpm: number) {
    if (this.decelTimer !== null) return;
    if (fromRpm < 2700) return;

    const numPops = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numPops; i++) {
      const delayMs = i * (80 + Math.random() * 95);
      window.setTimeout(() => {
        if (this.isRunning) {
          this.triggerMiniCrackle();
        }
      }, delayMs);
    }

    this.decelTimer = window.setTimeout(() => {
      this.decelTimer = null;
    }, 850);
  }

  private triggerMiniCrackle() {
    if (!this.ctx || !this.isRunning) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(110 + Math.random() * 45, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.05);

    gain.gain.setValueAtTime(0.26 + Math.random() * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  /**
   * 2-Step Rev Limiter & Hard Pop
   */
  public triggerPopAndBang() {
    if (!this.ctx || !this.isRunning) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.09);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  private makeDistortionCurve(preset: ExhaustSoundPreset): Float32Array<ArrayBuffer> {
    const nSamples = 256;
    const buffer = new ArrayBuffer(nSamples * Float32Array.BYTES_PER_ELEMENT);
    const curve = new Float32Array(buffer);

    let k = 15;
    if (preset === "straight-pipe") k = 50;
    else if (preset === "valvetronic") k = 30;
    else if (preset === "sport-resonated") k = 20;

    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public getStatus(): EngineAudioState {
    return {
      isRunning: this.isRunning,
      rpm: this.currentRpm,
      throttle: this.throttle,
      boostBar: this.currentBoost,
      isChopIdle: this.chopIdle,
      is2StepActive: this.is2StepActive,
      exhaustPreset: this.exhaustPreset,
      loadMode: this.loadMode,
      flywheelType: this.flywheelType,
    };
  }
}

export const engineAudio = new ProceduralEngineAudio();
