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

export interface EngineAudioState {
  isRunning: boolean;
  rpm: number;
  throttle: number;
  isChopIdle: boolean;
  is2StepActive: boolean;
  exhaustPreset: ExhaustSoundPreset;
}

/**
 * High-Precision Procedural Acoustic Engine Synthesizer.
 *
 * Implements physical acoustic modeling of internal combustion engines:
 * 1. Multi-harmonic cylinder firing pulse trains with custom Fourier PeriodicWaves
 * 2. Asymmetric bank phasing for Crossplane V8 burble and Boxer-4 UEL header rumble
 * 3. 4-Stage Formant Resonator Bank (Helmholtz cavity, mid-pipe body, manifold rasp, tailpipe shear)
 * 4. Throttle-sensitive induction plenum roar (lowpass intake boom)
 * 5. Mechanical valvetrain & camshaft chatter
 * 6. Turbocharger turbine spool whistle & BOV flutter
 * 7. Deceleration overrun crackles and pops (burble tune)
 */
class ProceduralEngineAudio {
  private ctx: AudioContext | null = null;

  // Synthesis Nodes
  private primaryOsc: OscillatorNode | null = null;
  private bankOsc: OscillatorNode | null = null; // Secondary bank for V8 crossplane & Boxer UEL phasing
  private inductionOsc: OscillatorNode | null = null; // Intake plenum boom
  private mechNoiseSource: AudioBufferSourceNode | null = null; // Valvetrain mechanical noise
  private mechGain: GainNode | null = null;
  private turboOsc: OscillatorNode | null = null; // Turbocharger spool whistle
  private turboRushNode: AudioBufferSourceNode | null = null; // Compressor air rush
  private turboGain: GainNode | null = null;

  // Dynamic Gains
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

  // State Tracking
  private isRunning: boolean = false;
  private currentRpm: number = 850;
  private targetRpm: number = 850;
  private throttle: number = 0.0; // 0.0 to 1.0
  private chopIdle: boolean = false;
  private is2StepActive: boolean = false;
  private exhaustPreset: ExhaustSoundPreset = "sport-resonated";

  // Last RPM for decel crackle detection
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
    // Reconfigure wave shape and filters if running
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

    // 1. Primary Combustion Oscillator
    this.primaryOsc = this.ctx.createOscillator();
    this.applyPeriodicWave();

    // 2. Bank B / Sub-harmonic Phasing Oscillator (V8 Crossplane / Boxer-4)
    this.bankOsc = this.ctx.createOscillator();
    this.bankOsc.type = "sawtooth";

    // 3. Intake Induction Sub-Bass Generator
    this.inductionOsc = this.ctx.createOscillator();
    this.inductionOsc.type = "sine";

    // 4. Mechanical Valvetrain Chatter
    this.createMechanicalNoise();

    // 5. Turbocharger Spool Whistle & Air Rush
    if (this.config.hasTurbo) {
      this.createTurbochargerNodes();
    }

    // 6. Saturation / WaveShaper Node
    this.distortionNode = this.ctx.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(this.exhaustPreset);

    // 7. Formant Filter Bank Setup
    this.formantSub = this.ctx.createBiquadFilter();
    this.formantBody = this.ctx.createBiquadFilter();
    this.formantRasp = this.ctx.createBiquadFilter();
    this.formantHigh = this.ctx.createBiquadFilter();
    this.configureFormants(this.exhaustPreset);

    // 8. Mixer Gains
    this.combustionGain = this.ctx.createGain();
    this.combustionGain.gain.setValueAtTime(0.7, t);

    this.inductionGain = this.ctx.createGain();
    this.inductionGain.gain.setValueAtTime(0.02, t);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, t);
    this.masterGain.gain.exponentialRampToValueAtTime(0.4, t + 0.12);

    // Node Wiring Topology:
    // [PrimaryOsc + BankOsc] -> [CombustionGain] -> [Distortion]
    // [InductionOsc] -> [InductionGain] ---------> [Distortion]
    // [Distortion] -> [FormantSub] -> [FormantBody] -> [FormantRasp] -> [FormantHigh] -> [MasterGain] -> Destination
    this.primaryOsc.connect(this.combustionGain);
    this.bankOsc.connect(this.combustionGain);
    this.combustionGain.connect(this.distortionNode);

    this.inductionOsc.connect(this.inductionGain);
    this.inductionGain.connect(this.distortionNode);

    this.distortionNode.connect(this.formantSub);
    this.formantSub.connect(this.formantBody);
    this.formantBody.connect(this.formantRasp);
    this.formantRasp.connect(this.formantHigh);
    this.formantHigh.connect(this.masterGain);

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
        this.mechNoiseSource?.stop();
        this.turboOsc?.stop();
        this.turboRushNode?.stop();

        this.primaryOsc?.disconnect();
        this.bankOsc?.disconnect();
        this.inductionOsc?.disconnect();
        this.mechNoiseSource?.disconnect();
        this.turboOsc?.disconnect();
        this.turboRushNode?.disconnect();
      } catch {
        // Safe guard against audio lifecycle races
      }

      this.primaryOsc = null;
      this.bankOsc = null;
      this.inductionOsc = null;
      this.mechNoiseSource = null;
      this.turboOsc = null;
      this.turboRushNode = null;
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
    if (prevRpm > 3600 && clamped < prevRpm - 150) {
      if (this.config.hasTurbo && prevRpm > 4500 && clamped < prevRpm - 1000) {
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
      const lopeMod = Math.sin(t * 14) * 8 + (Math.random() * 4 - 2);
      baseFreq = Math.max(15, baseFreq + lopeMod);
    }

    this.primaryOsc.frequency.setTargetAtTime(baseFreq, t, 0.035);

    // 2. Secondary Bank Phasing Oscillator
    if (isV8) {
      // Crossplane V8 has uneven 90-180-270-90 pulse spacing between banks
      // Bank B runs at half frequency with slight detune to create the iconic low-end American/AMG rumble
      const bankFreq = Math.max(10, (rpm / 60) * 2 + 0.3);
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
    // Frequency tracks engine displacement resonance (60Hz to 180Hz)
    const inductionFreq = Math.min(180, 55 + (rpm / this.config.redlineRpm) * 90);
    this.inductionOsc.frequency.setTargetAtTime(inductionFreq, t, 0.05);

    if (this.inductionGain) {
      // Induction roar swells as throttle opens (from 0.03 at idle to 0.45 at WOT)
      const targetInductionGain = 0.03 + throttle * 0.42;
      this.inductionGain.gain.setTargetAtTime(targetInductionGain, t, 0.04);
    }

    // 4. Turbocharger Spool Whistle
    if (this.turboOsc && this.turboGain) {
      const boostRatio = Math.max(0, (rpm - 2200) / (this.config.redlineRpm - 2200)) * (throttle * 0.7 + 0.3);
      const turboPitch = 1600 + boostRatio * 3800; // 1.6kHz -> 5.4kHz turbine whistle
      const targetTurboGain = boostRatio > 0.1 ? Math.min(0.18, boostRatio * 0.22) : 0.001;

      this.turboOsc.frequency.setTargetAtTime(turboPitch, t, 0.08);
      this.turboGain.gain.setTargetAtTime(targetTurboGain, t, 0.08);
    }

    // 5. Dynamic Formant Rasp Adjustments
    if (this.formantRasp) {
      // Rasp frequency opens slightly with gas flow velocity
      const baseRaspFreq = this.exhaustPreset === "straight-pipe" ? 1100 : 920;
      const dynamicRasp = baseRaspFreq + (rpm / this.config.redlineRpm) * 350;
      this.formantRasp.frequency.setTargetAtTime(dynamicRasp, t, 0.06);
    }
  }

  /**
   * Builds custom Fourier PeriodicWave matching the authentic acoustic pressure profile of the engine
   */
  private applyPeriodicWave() {
    if (!this.ctx || !this.primaryOsc) return;

    const nHarmonics = 32;
    const real = new Float32Array(nHarmonics);
    const imag = new Float32Array(nHarmonics);

    const layout = this.config.cylinderLayout;
    const cyl = this.config.cylinders;

    // Harmonic Coefficients tailored by automotive acoustic physics
    if (layout === "inline" && cyl === 6) {
      // Inline-6 (2JZ / S58 / RB26): Smooth, metallic mechanical howl. Dominant 3rd & 6th orders
      imag[1] = 0.85; // Fundamental
      imag[2] = 0.35;
      imag[3] = 1.0;  // High 3rd order resonance
      imag[4] = 0.3;
      imag[5] = 0.2;
      imag[6] = 0.75; // 6th order balance
      imag[7] = 0.15;
      imag[8] = 0.2;
      imag[9] = 0.5;
      imag[12] = 0.35;
    } else if (cyl === 8 && layout === "v-engine") {
      // Crossplane V8 (LS / Coyote / M156): Heavy uneven syncopation, massive low-end punch
      imag[1] = 0.9;
      imag[2] = 1.0;
      imag[3] = 0.45;
      imag[4] = 0.8;
      imag[5] = 0.25;
      imag[6] = 0.65;
      imag[7] = 0.2;
      imag[8] = 0.5;
      imag[10] = 0.3;
    } else if (layout === "boxer") {
      // Boxer-4 / Flat-6 (EJ20 / FA24 / Porsche Flat-6): Asymmetric pulse train, low thumping rumble
      imag[1] = 1.0;
      imag[2] = 0.85;
      imag[3] = 0.55;
      imag[4] = 0.7;
      imag[5] = 0.35;
      imag[6] = 0.45;
      imag[8] = 0.3;
    } else if (layout === "rotary") {
      // Rotary Wankel (13B-REW): 3 combustion faces, high-frequency screaming bee-hive rasp
      imag[1] = 0.7;
      imag[2] = 0.5;
      imag[3] = 1.0;
      imag[4] = 0.4;
      imag[5] = 0.85;
      imag[6] = 0.35;
      imag[7] = 0.7;
      imag[9] = 0.6;
    } else if (cyl === 10) {
      // V10 (BMW S85 / Carrera GT): Shrill, high-order Formula 1 scream
      imag[1] = 0.75;
      imag[2] = 0.4;
      imag[3] = 0.3;
      imag[4] = 0.5;
      imag[5] = 1.0;
      imag[6] = 0.3;
      imag[8] = 0.4;
      imag[10] = 0.85;
    } else {
      // Inline-4 (Theta II / K24 / 4G63T / EA888): Punchy 2nd & 4th order firing rasp
      imag[1] = 1.0;
      imag[2] = 0.9;
      imag[3] = 0.35;
      imag[4] = 0.7;
      imag[5] = 0.2;
      imag[6] = 0.45;
      imag[7] = 0.15;
      imag[8] = 0.3;
    }

    const periodicWave = this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    this.primaryOsc.setPeriodicWave(periodicWave);
  }

  /**
   * Configures the 4-Stage Exhaust Formant Filter Bank based on physical pipe characteristics
   */
  private configureFormants(preset: ExhaustSoundPreset) {
    if (!this.formantSub || !this.formantBody || !this.formantRasp || !this.formantHigh) return;

    switch (preset) {
      case "straight-pipe":
        // Raw, unfiltered straight pipe: aggressive rasp, metallic bite, loud open exhaust
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
        this.formantRasp.gain.value = 11; // High metallic rasp

        this.formantHigh.type = "highshelf";
        this.formantHigh.frequency.value = 2600;
        this.formantHigh.gain.value = 8;
        break;

      case "valvetronic":
        // Tuned valvetronic exhaust: deep muscular bass with crisp open-valve top end
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
        // Performance resonated: rich low rumble, clean midrange, zero harsh rasp
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
        // Stock OEM factory exhaust: heavily muffled, civilized bass, quiet top end
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
   * Generates authentic mechanical valvetrain & camshaft chatter
   */
  private createMechanicalNoise() {
    if (!this.ctx) return;

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 2; // 2-second looped noise buffer
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
   * Creates turbocharger whistle oscillator and compressor rush
   */
  private createTurbochargerNodes() {
    if (!this.ctx || !this.masterGain) return;

    this.turboOsc = this.ctx.createOscillator();
    this.turboOsc.type = "sine";
    this.turboOsc.frequency.value = 2000;

    this.turboGain = this.ctx.createGain();
    this.turboGain.gain.value = 0.001;

    this.turboOsc.connect(this.turboGain);
    this.turboGain.connect(this.masterGain);
    this.turboOsc.start();
  }

  /**
   * Blow-off valve (BOV) flutter "tsu-tsu-tsu" on sudden lift-off
   */
  public triggerBov() {
    if (!this.ctx || !this.isRunning) return;

    const t = this.ctx.currentTime;
    const duration = 0.55;
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

    // 16Hz Amplitude Modulation for flutter stutter
    const flutterGain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(15, t);

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
   * Overrun burble & exhaust crackles (Popcorn / burble tune)
   */
  private checkAndTriggerOverrun(fromRpm: number, toRpm: number) {
    if (this.decelTimer !== null) return;
    if (fromRpm < 2800) return;

    // Trigger randomized popcorn sequence (3-6 pops)
    const numPops = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numPops; i++) {
      const delayMs = i * (80 + Math.random() * 90);
      window.setTimeout(() => {
        if (this.isRunning) {
          this.triggerMiniCrackle();
        }
      }, delayMs);
    }

    this.decelTimer = window.setTimeout(() => {
      this.decelTimer = null;
    }, 900);
  }

  private triggerMiniCrackle() {
    if (!this.ctx || !this.isRunning) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Low thump
    osc.type = "triangle";
    osc.frequency.setValueAtTime(110 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.05);

    gain.gain.setValueAtTime(0.25 + Math.random() * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  /**
   * 2-Step Rev Limiter & Hard Pop flame backfire
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
      isChopIdle: this.chopIdle,
      is2StepActive: this.is2StepActive,
      exhaustPreset: this.exhaustPreset,
    };
  }
}

export const engineAudio = new ProceduralEngineAudio();
