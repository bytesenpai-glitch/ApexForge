import type { CylinderLayout } from "@/domain/parts/types";

export interface EngineSoundConfig {
  cylinders: number;
  cylinderLayout: CylinderLayout;
  displacementLiters: number;
  redlineRpm: number;
  exhaustType: string;
  hasTurbo: boolean;
  engineCode?: string;
  family?: string;
}

export type ExhaustSoundPreset = "oem" | "sport-resonated" | "valvetronic" | "straight-pipe";
export type LoadMode = "neutral" | "in-gear";
export type FlywheelType = "oem" | "lightweight";
export type AudioPerspective = "cockpit" | "tailpipe" | "engine-bay";

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
  perspective: AudioPerspective;
  displacementLiters: number;
}

/**
 * Next-Gen High-Fidelity Automotive Engine Acoustic Synthesizer.
 *
 * Implements Physical Crankshaft Order & Waveguide Combustion Modeling:
 * 1. Exact 128-harmonic Crankshaft Cycle Fourier series (f_cycle = RPM / 120) with authentic
 *    combustion signatures for I3, I4, I5, I6, V6, Crossplane V8, Flatplane V8, Boxer-4 UEL, Flat-6, V10, V12, Rotary.
 * 2. Secondary Bank Pulse Interference Oscillator for V-engine & Boxer acoustic phase cancellation.
 * 3. Discrete Cylinder Blowdown Pulse Train (palpable percussive thumps at idle/low RPM).
 * 4. Exhaust Mass Air Flow (MAF) Turbulent Noise Layer connected through physical acoustic perspectives.
 * 5. Authentic Acoustic Perspective Modeling:
 *    - Tailpipe (Выхлоп): Deep 85Hz chest-thumping bass, 190Hz 3-inch pipe resonance, 1250Hz tip rasp, violent gas rush.
 *    - Cockpit (Салон): 750Hz firewall sound deadening, 58Hz floorpan sub-bass, 160Hz induction roar.
 *    - Engine Bay (Под капотом): 150Hz bass cut, 2400Hz valvetrain/injector mechanical click, intake suction, turbo whistle.
 * 6. Smooth Hyperbolic Tangent (tanh) Soft Saturation (eliminates harsh digital square-wave buzz).
 * 7. Scaled Digital Waveguide delay line tuned to physical exhaust pipe lengths (9.5ms - 15.0ms).
 * 8. Straight-Cut Dogbox Racing Gear Whine under dyno load.
 * 9. Natural decel overrun crackles and 2-step anti-lag fireballs.
 */
class ProceduralEngineAudio {
  private ctx: AudioContext | null = null;

  // Primary Synthesis: Crankshaft Cycle Fundamental (f_cycle = RPM / 120)
  private primaryOsc: OscillatorNode | null = null;
  private bankOsc: OscillatorNode | null = null; // Secondary bank interference (V8 / Boxer / V6)
  private bankGain: GainNode | null = null;
  private inductionOsc: OscillatorNode | null = null; // Intake plenum boom
  private jitterOsc: OscillatorNode | null = null; // Micro-timing cycle jitter LFO

  // Discrete Cylinder Blowdown Pulse Generator (percussive low-RPM exhaust thumps)
  private puffOsc: OscillatorNode | null = null;
  private puffGain: GainNode | null = null;

  // Exhaust Gas Flow Turbulence (MAF-scaled pink noise rush)
  private gasFlowSource: AudioBufferSourceNode | null = null;
  private gasFlowFilter: BiquadFilterNode | null = null;
  private gasFlowGain: GainNode | null = null;

  // Mechanical Valvetrain Noise (camshaft speed ticking)
  private mechNoiseSource: AudioBufferSourceNode | null = null;
  private mechFilter: BiquadFilterNode | null = null;
  private mechGain: GainNode | null = null;

  // Turbocharger System (Spool whistle + Compressor air rush)
  private turboOsc: OscillatorNode | null = null;
  private turboGain: GainNode | null = null;
  private currentBoost: number = 0.0; // Bar (0.0 to 1.8)

  // Straight-Cut Dogbox Transmission Whine (In-Gear Load Mode)
  private gearWhineOsc: OscillatorNode | null = null;
  private gearWhineGain: GainNode | null = null;

  // Physical Engine Architecture Modulators (Subaru Boxer UEL & Crossplane V8)
  private boxerLfo: OscillatorNode | null = null;
  private boxerLfoGain: GainNode | null = null;
  private crossplaneLfo: OscillatorNode | null = null;
  private crossplaneLfoGain: GainNode | null = null;

  // Digital Waveguide Exhaust Tube Model (Acoustic Standing Waves)
  private pipeDelay: DelayNode | null = null;
  private pipeFeedback: GainNode | null = null;
  private pipeDamping: BiquadFilterNode | null = null;

  // Perspective Acoustic Processing (Cockpit, Tailpipe, Engine Bay)
  private perspectiveFilterLow: BiquadFilterNode | null = null;
  private perspectiveFilterHigh: BiquadFilterNode | null = null;
  private perspectiveChassisRes: BiquadFilterNode | null = null;
  private perspectiveAirRollOff: BiquadFilterNode | null = null;

  // Acoustic Convolver (Tailpipe & Chassis Impulse Response)
  private tailpipeConvolver: ConvolverNode | null = null;
  private convolverGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  // Dynamic Mixing Gains
  private masterGain: GainNode | null = null;
  private combustionGain: GainNode | null = null;
  private inductionGain: GainNode | null = null;

  // Formant Filter Bank (Physical exhaust cavity acoustics)
  private formantSub: BiquadFilterNode | null = null; // Helmholtz sub-rumble
  private formantBody: BiquadFilterNode | null = null; // Exhaust body chamber
  private formantRasp: BiquadFilterNode | null = null; // Manifold rasp
  private formantHigh: BiquadFilterNode | null = null; // Metallic shear

  // Distortion / Soft Saturation WaveShaper
  private distortionNode: WaveShaperNode | null = null;

  // Engine Physics & State
  private isRunning: boolean = false;
  private currentRpm: number = 850;
  private throttle: number = 0.0; // 0.0 to 1.0
  private loadMode: LoadMode = "neutral";
  private flywheelType: FlywheelType = "oem";
  private perspective: AudioPerspective = "cockpit";
  private chopIdle: boolean = false;
  private is2StepActive: boolean = false;
  private exhaustPreset: ExhaustSoundPreset = "sport-resonated";

  // Decel crackle timing
  private decelTimer: number | null = null;

  private config: EngineSoundConfig = {
    cylinders: 4,
    cylinderLayout: "inline",
    displacementLiters: 2.0,
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
      this.configurePerspective(this.perspective);
      this.updatePipeLength();
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

  public setPerspective(p: AudioPerspective) {
    this.perspective = p;
    if (this.isRunning && this.ctx) {
      this.configurePerspective(p);
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

  public set2Step(active: boolean) {
    this.is2StepActive = active;
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

    // 1. Primary Combustion Oscillator with 128-harmonic Fourier wave
    this.primaryOsc = this.ctx.createOscillator();
    this.applyPeriodicWave();

    // 2. Secondary Bank Pulse Interference Oscillator
    this.bankOsc = this.ctx.createOscillator();
    this.applyBankPeriodicWave();

    this.bankGain = this.ctx.createGain();
    this.bankGain.gain.setValueAtTime(0.18, t);
    this.bankOsc.connect(this.bankGain);

    // 3. Discrete Cylinder Blowdown Pulse Generator (Percussive low-RPM exhaust thumps)
    this.puffOsc = this.ctx.createOscillator();
    this.applyPuffPeriodicWave();

    this.puffGain = this.ctx.createGain();
    this.puffGain.gain.setValueAtTime(0.32, t);
    this.puffOsc.connect(this.puffGain);

    // 4. Stochastic Combustion Cycle Jitter Generator (eliminates electronic sterility)
    this.jitterOsc = this.ctx.createOscillator();
    this.jitterOsc.type = "sine";
    this.jitterOsc.frequency.setValueAtTime(31, t);
    const jitterGain = this.ctx.createGain();
    jitterGain.gain.setValueAtTime(1.2, t);
    this.jitterOsc.connect(jitterGain);
    jitterGain.connect(this.primaryOsc.frequency);
    this.jitterOsc.start(t);

    // 5. Intake Induction Plenum Roar (Deep resonant bass)
    this.inductionOsc = this.ctx.createOscillator();
    this.inductionOsc.type = "sine";

    // 6. Mechanical Valvetrain Chatter
    this.createMechanicalNoise();

    // 7. Exhaust Gas Flow Turbulence (MAF Whoosh)
    this.createGasFlowTurbulence();

    // 8. Turbocharger System (Whistle + Compressor Rush)
    if (this.config.hasTurbo) {
      this.createTurbochargerNodes();
    }

    // 8.5. Straight-Cut Dogbox Transmission Whine (active in load mode)
    this.gearWhineOsc = this.ctx.createOscillator();
    this.gearWhineOsc.type = "sine";
    this.gearWhineGain = this.ctx.createGain();
    this.gearWhineGain.gain.setValueAtTime(0.0001, t);
    this.gearWhineOsc.connect(this.gearWhineGain);
    this.gearWhineOsc.start(t);

    // 8.6. Physical Architecture Tremolo Modulators (Subaru Boxer UEL & Crossplane V8)
    this.boxerLfo = this.ctx.createOscillator();
    this.boxerLfo.type = "sine";
    this.boxerLfoGain = this.ctx.createGain();
    this.boxerLfoGain.gain.setValueAtTime(0.0001, t);
    this.boxerLfo.connect(this.boxerLfoGain);
    this.boxerLfo.start(t);

    this.crossplaneLfo = this.ctx.createOscillator();
    this.crossplaneLfo.type = "sine";
    this.crossplaneLfoGain = this.ctx.createGain();
    this.crossplaneLfoGain.gain.setValueAtTime(0.0001, t);
    this.crossplaneLfo.connect(this.crossplaneLfoGain);
    this.crossplaneLfo.start(t);

    // 9. Saturation WaveShaper (Hyperbolic Tangent soft tube/exhaust compression)
    this.distortionNode = this.ctx.createWaveShaper();
    this.distortionNode.curve = this.makeDistortionCurve(this.exhaustPreset);

    // 10. 4-Stage Formant Filter Bank
    this.formantSub = this.ctx.createBiquadFilter();
    this.formantBody = this.ctx.createBiquadFilter();
    this.formantRasp = this.ctx.createBiquadFilter();
    this.formantHigh = this.ctx.createBiquadFilter();
    this.configureFormants(this.exhaustPreset);

    // 11. Digital Waveguide Exhaust Tube Model (Physical pipe delay + damping)
    this.pipeDelay = this.ctx.createDelay(0.06);
    this.updatePipeLength();

    this.pipeDamping = this.ctx.createBiquadFilter();
    this.pipeDamping.type = "lowpass";
    this.pipeDamping.frequency.setValueAtTime(1800, t);

    this.pipeFeedback = this.ctx.createGain();
    this.pipeFeedback.gain.setValueAtTime(-0.22, t);

    // 12. Perspective Acoustic Filters (Cockpit / Tailpipe / Engine Bay)
    this.perspectiveFilterLow = this.ctx.createBiquadFilter();
    this.perspectiveFilterHigh = this.ctx.createBiquadFilter();
    this.perspectiveChassisRes = this.ctx.createBiquadFilter();
    this.perspectiveAirRollOff = this.ctx.createBiquadFilter();
    this.configurePerspective(this.perspective);

    // 13. Tailpipe Cavity Convolver (Spatial Physical Acoustics)
    this.tailpipeConvolver = this.ctx.createConvolver();
    this.tailpipeConvolver.buffer = this.createTailpipeImpulseResponse();

    this.convolverGain = this.ctx.createGain();
    this.convolverGain.gain.setValueAtTime(0.32, t);

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.setValueAtTime(0.78, t);

    // 14. Mixer & Master Gains
    this.combustionGain = this.ctx.createGain();
    this.combustionGain.gain.setValueAtTime(0.68, t);

    this.inductionGain = this.ctx.createGain();
    this.inductionGain.gain.setValueAtTime(0.02, t);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, t);
    this.masterGain.gain.exponentialRampToValueAtTime(0.45, t + 0.12);

    // Signal Routing:
    // [Primary Combustion] ---------------------------------------┐
    // [Bank Interference] -> [bankGain] --------------------------┼-> [combustionGain] -----------------┐
    // [Discrete Puff Pulses] -> [puffGain] -----------------------┘                                     │
    //                                                                                                   ▼
    // [Induction Source] -> [inductionGain] -------------------------------------------------> [Soft Saturation]
    //                                                                                                   │
    //                                                                                                   ▼
    //                                                           [FormantSub] -> [FormantBody] -> [FormantRasp] -> [FormantHigh]
    //                                                                                                   │
    //                                                                      ┌----------------------------┴----------------------------┐
    //                                                                      ▼                                                         ▼
    //                                                             [Waveguide Delay] -> [pipeDamping] -> [pipeFeedback]               │
    //                                                                      │                                                         │
    //                                                                      ▼                                                         ▼
    //                                                                  [dryGain]                                           [tailpipeConvolver]
    //                                                                      │                                                         │
    //                                                                      └----------------------------┬----------------------------┘
    //                                                                                                   ▼
    //                                                                                           [Summed Acoustic Mix]
    //                                                                                                   │
    //                                                                                                   ▼
    //                                                                                        [Perspective Filters]
    //                                                                                                   │
    //                                                                                                   ▼
    //                                                                                             [masterGain] -> [Destination]

    this.primaryOsc.connect(this.combustionGain);
    if (this.bankGain) this.bankGain.connect(this.combustionGain);
    if (this.puffGain) this.puffGain.connect(this.combustionGain);
    if (this.boxerLfoGain) this.boxerLfoGain.connect(this.combustionGain.gain);
    if (this.crossplaneLfoGain) this.crossplaneLfoGain.connect(this.combustionGain.gain);

    this.combustionGain.connect(this.distortionNode);

    this.inductionOsc.connect(this.inductionGain);
    this.inductionGain.connect(this.distortionNode);

    this.distortionNode.connect(this.formantSub);
    this.formantSub.connect(this.formantBody);
    this.formantBody.connect(this.formantRasp);
    this.formantRasp.connect(this.formantHigh);

    // Digital Waveguide Loop
    this.formantHigh.connect(this.pipeDelay);
    this.pipeDelay.connect(this.pipeDamping);
    this.pipeDamping.connect(this.pipeFeedback);
    this.pipeFeedback.connect(this.pipeDelay);

    this.formantHigh.connect(this.dryGain);
    this.pipeDamping.connect(this.dryGain);

    this.formantHigh.connect(this.tailpipeConvolver);
    this.tailpipeConvolver.connect(this.convolverGain);

    // Connect into Perspective Filter Chain
    this.dryGain.connect(this.perspectiveFilterLow);
    this.convolverGain.connect(this.perspectiveFilterLow);

    // Connect gas flow turbulence and gear whine through perspective
    if (this.gasFlowGain) {
      this.gasFlowGain.connect(this.perspectiveFilterLow);
    }
    if (this.gearWhineGain) {
      this.gearWhineGain.connect(this.perspectiveFilterLow);
    }

    this.perspectiveFilterLow.connect(this.perspectiveFilterHigh);
    this.perspectiveFilterHigh.connect(this.perspectiveChassisRes);
    this.perspectiveChassisRes.connect(this.perspectiveAirRollOff);
    this.perspectiveAirRollOff.connect(this.masterGain);

    this.masterGain.connect(this.ctx.destination);

    // Start Generators
    this.primaryOsc.start(t);
    this.bankOsc.start(t);
    this.inductionOsc.start(t);
    this.puffOsc.start(t);

    this.isRunning = true;
    this.updateAcousticDynamics(this.currentRpm, this.throttle);
  }

  public stop() {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    setTimeout(() => {
      try {
        this.primaryOsc?.stop();
        this.bankOsc?.stop();
        this.inductionOsc?.stop();
        this.puffOsc?.stop();
        this.jitterOsc?.stop();
        this.mechNoiseSource?.stop();
        this.gasFlowSource?.stop();
        this.turboOsc?.stop();
        this.gearWhineOsc?.stop();
        this.boxerLfo?.stop();
        this.crossplaneLfo?.stop();

        this.primaryOsc?.disconnect();
        this.bankOsc?.disconnect();
        this.bankGain?.disconnect();
        this.inductionOsc?.disconnect();
        this.puffOsc?.disconnect();
        this.puffGain?.disconnect();
        this.jitterOsc?.disconnect();
        this.mechNoiseSource?.disconnect();
        this.gasFlowSource?.disconnect();
        this.gasFlowGain?.disconnect();
        this.turboOsc?.disconnect();
        this.turboGain?.disconnect();
        this.gearWhineOsc?.disconnect();
        this.gearWhineGain?.disconnect();
        this.boxerLfo?.disconnect();
        this.boxerLfoGain?.disconnect();
        this.crossplaneLfo?.disconnect();
        this.crossplaneLfoGain?.disconnect();
        this.pipeDelay?.disconnect();
        this.pipeFeedback?.disconnect();
        this.tailpipeConvolver?.disconnect();
        this.perspectiveFilterLow?.disconnect();
        this.perspectiveFilterHigh?.disconnect();
        this.perspectiveChassisRes?.disconnect();
        this.perspectiveAirRollOff?.disconnect();
      } catch {
        // Safe guard against audio lifecycle races
      }

      this.primaryOsc = null;
      this.bankOsc = null;
      this.bankGain = null;
      this.inductionOsc = null;
      this.puffOsc = null;
      this.puffGain = null;
      this.jitterOsc = null;
      this.boxerLfo = null;
      this.boxerLfoGain = null;
      this.crossplaneLfo = null;
      this.crossplaneLfoGain = null;
      this.distortionNode = null;
      this.masterGain = null;
      this.isRunning = false;
    }, 130);
  }

  public setRpm(rpm: number) {
    const clamped = Math.max(700, Math.min(this.config.redlineRpm, rpm));
    const previousRpm = this.currentRpm;
    this.currentRpm = clamped;

    if (this.isRunning && this.ctx) {
      this.updateAcousticDynamics(clamped, this.throttle);

      if (previousRpm > clamped + 350 && this.throttle < 0.15) {
        this.checkAndTriggerOverrun(previousRpm, clamped);
      }
    }
  }

  /**
   * Updates dynamic frequencies and gains matching RPM and engine load
   */
  private updateAcousticDynamics(rpm: number, throttle: number) {
    if (!this.ctx || !this.primaryOsc) return;

    const t = this.ctx.currentTime;
    const displacement = Math.max(1.4, this.config.displacementLiters || 2.0);
    const cyl = this.config.cylinders;
    const layout = this.config.cylinderLayout;
    const isRotary = layout === "rotary";

    // 1. Physical 4-Stroke Engine Cycle Frequency (f_cycle = RPM / 120 Hz)
    // In a 4-stroke engine, 1 full cycle takes 2 crank revolutions (720 deg).
    // All engine orders (0.5E, 1.0E, 1.5E, 2.0E, 3.0E, 4.0E, 5.0E, 6.0E) are exact integer harmonics of f_cycle!
    let cycleFreq = isRotary ? (rpm / 60) : (rpm / 120);
    cycleFreq = Math.max(6, cycleFreq);

    // Apply chop-idle camshaft lope if enabled at idle
    if (this.chopIdle && rpm < 1100) {
      const lopeMod = Math.sin(t * 11) * 1.8 + (Math.random() * 0.8 - 0.4);
      cycleFreq = Math.max(6, cycleFreq + lopeMod);
    }

    this.primaryOsc.frequency.setTargetAtTime(cycleFreq, t, 0.035);

    // 2. Discrete Cylinder Blowdown Pulse Generator (percussive exhaust thumps at idle/low RPM)
    if (this.puffOsc && this.puffGain) {
      // Cylinder firing frequency = (RPM / 60) * (cyl / 2)
      const firingRate = isRotary ? (rpm / 60) * 2 : (rpm / 60) * (cyl / 2);
      this.puffOsc.frequency.setTargetAtTime(Math.max(15, firingRate), t, 0.03);

      // At idle (800-1100 RPM), individual cylinder pulses hit the tailpipe with palpable thuds.
      // Above 2200 RPM, discrete pulses smoothly merge into the continuous exhaust roar.
      const puffWeight = Math.max(0.04, 0.38 - (rpm / 2600) * 0.34);
      this.puffGain.gain.setTargetAtTime(puffWeight, t, 0.04);
    }

    // 3. Secondary Bank Pulse Interference Oscillator
    if (this.bankOsc && this.bankGain) {
      if (cyl === 8 && layout === "v-engine") {
        // Crossplane V8: Bank pulse clumping creates phase offset beating at 1.0E (RPM / 60)
        this.bankOsc.frequency.setTargetAtTime(Math.max(10, (rpm / 60) + 0.25), t, 0.04);
        this.bankGain.gain.setTargetAtTime(0.24, t, 0.04);
      } else if (layout === "boxer") {
        // Boxer-4: Unequal length headers cause acoustic delay beating at 1.0E (RPM / 60)
        this.bankOsc.frequency.setTargetAtTime(Math.max(10, rpm / 60), t, 0.04);
        this.bankGain.gain.setTargetAtTime(0.22, t, 0.04);
      } else if (cyl === 6 && layout === "v-engine") {
        // V6: 60-degree split-bank order at 1.5E (RPM / 40)
        this.bankOsc.frequency.setTargetAtTime(Math.max(12, rpm / 40), t, 0.035);
        this.bankGain.gain.setTargetAtTime(0.18, t, 0.04);
      } else if (cyl === 6 && layout === "inline") {
        // Inline-6: High-frequency twin-scroll manifold harmonic (silky smooth)
        this.bankOsc.frequency.setTargetAtTime(Math.max(20, (rpm / 60) * 3), t, 0.035);
        this.bankGain.gain.setTargetAtTime(0.10, t, 0.04);
      } else {
        // Inline-4: Subtle valve overlap rasp
        this.bankOsc.frequency.setTargetAtTime(Math.max(15, (rpm / 60) * 2), t, 0.04);
        this.bankGain.gain.setTargetAtTime(0.08, t, 0.04);
      }
    }

    const isBoxer = layout === "boxer";
    const isFlatplaneV8 =
      cyl === 8 &&
      ((this.config.family || "").toLowerCase().includes("voodoo") ||
        (this.config.engineCode || "").toLowerCase().includes("voodoo") ||
        (this.config.engineCode || "").toLowerCase().includes("gt350"));
    const isCrossplaneV8 = cyl === 8 && layout === "v-engine" && !isFlatplaneV8;

    // 3.5. Dynamic Boxer UEL Gallop Tremolo Modulator (ba-BUMP ... ba-BUMP heartbeat)
    if (this.boxerLfo && this.boxerLfoGain) {
      if (isBoxer) {
        const boxerBeatFreq = Math.max(8, rpm / 60);
        this.boxerLfo.frequency.setTargetAtTime(boxerBeatFreq, t, 0.035);
        const boxerDepth = Math.max(0.18, 0.38 - (rpm / this.config.redlineRpm) * 0.16);
        this.boxerLfoGain.gain.setTargetAtTime(boxerDepth, t, 0.04);
      } else {
        this.boxerLfoGain.gain.setTargetAtTime(0.0001, t, 0.04);
      }
    }

    // 3.6. Dynamic Crossplane V8 Low-Frequency Muscle Loaf Modulator (0.5E waltz syncopation)
    if (this.crossplaneLfo && this.crossplaneLfoGain) {
      if (isCrossplaneV8) {
        const v8StumbleFreq = Math.max(5, rpm / 120);
        this.crossplaneLfo.frequency.setTargetAtTime(v8StumbleFreq, t, 0.04);
        const v8Depth = Math.max(0.12, 0.26 - (rpm / this.config.redlineRpm) * 0.14);
        this.crossplaneLfoGain.gain.setTargetAtTime(v8Depth, t, 0.04);
      } else {
        this.crossplaneLfoGain.gain.setTargetAtTime(0.0001, t, 0.04);
      }
    }

    // 4. Induction Plenum Roar (Scaled by displacement)
    const displacementOffset = Math.max(0, (5.5 - displacement) * 7);
    const inductionFreq = Math.min(190, (46 - displacementOffset) + (rpm / this.config.redlineRpm) * 98);
    this.inductionOsc?.frequency.setTargetAtTime(Math.max(38, inductionFreq), t, 0.05);

    if (this.inductionGain) {
      const loadFactor = this.loadMode === "in-gear" ? 1.35 : 1.0;
      const displacementWeight = Math.min(1.4, 0.85 + (displacement / 4.0) * 0.4);
      const targetInductionGain = (0.02 + throttle * 0.48) * loadFactor * displacementWeight;
      this.inductionGain.gain.setTargetAtTime(Math.min(0.65, targetInductionGain), t, 0.04);
    }

    // 5. Exhaust Gas Flow Turbulence (MAF Whoosh)
    if (this.gasFlowGain && this.gasFlowFilter) {
      const gasSpeed = (rpm / this.config.redlineRpm) * (throttle * 0.75 + 0.25);
      const targetFlowGain = Math.min(0.32, gasSpeed * 0.28 * (displacement / 2.5));
      this.gasFlowGain.gain.setTargetAtTime(targetFlowGain, t, 0.06);

      const flowCutoff = 1100 + gasSpeed * 2800;
      this.gasFlowFilter.frequency.setTargetAtTime(flowCutoff, t, 0.06);
    }

    // 6. Dynamic Turbocharger Boost & Spool Whistle
    if (this.turboOsc && this.turboGain) {
      const maxBoost = this.loadMode === "in-gear" ? 1.75 : 0.35;
      const boostCurve = Math.max(0, (rpm - 2100) / (this.config.redlineRpm - 2100));
      this.currentBoost = boostCurve * throttle * maxBoost;

      const turboPitch = 1600 + this.currentBoost * 2700 + (rpm / this.config.redlineRpm) * 1100;
      const targetTurboGain = this.currentBoost > 0.06 ? Math.min(0.26, this.currentBoost * 0.19) : 0.001;

      this.turboOsc.frequency.setTargetAtTime(turboPitch, t, 0.08);
      this.turboGain.gain.setTargetAtTime(targetTurboGain, t, 0.08);
    }

    // 7. Dynamic Formant Rasp Adjustments
    if (this.formantRasp) {
      const baseRaspFreq = this.exhaustPreset === "straight-pipe" ? 1220 : 980;
      const dynamicRasp = baseRaspFreq + (rpm / this.config.redlineRpm) * 360;
      this.formantRasp.frequency.setTargetAtTime(dynamicRasp, t, 0.06);
    }

    // 8. Straight-Cut Dogbox Transmission Whine (In-Gear Mode)
    if (this.gearWhineOsc && this.gearWhineGain) {
      if (this.loadMode === "in-gear") {
        const whinePitch = 380 + (rpm / this.config.redlineRpm) * 2200;
        const whineGain = Math.min(0.065, 0.005 + (rpm / this.config.redlineRpm) * 0.05 * (throttle * 0.7 + 0.3));
        this.gearWhineOsc.frequency.setTargetAtTime(whinePitch, t, 0.05);
        this.gearWhineGain.gain.setTargetAtTime(whineGain, t, 0.05);
      } else {
        this.gearWhineGain.gain.setTargetAtTime(0.0001, t, 0.05);
      }
    }
  }

  /**
   * Generates a 128-harmonic Fourier series matching the exact crankshaft cylinder order physics.
   *
   * Harmonic index k corresponds to engine order: k = 2 * (Engine Order E).
   * k=1: 0.5E (Cycle fundamental)
   * k=2: 1.0E (Crank revolution)
   * k=3: 1.5E (3-cyl / V6 bank)
   * k=4: 2.0E (Inline-4 firing fundamental)
   * k=5: 2.5E (Inline-5 / V10 bank)
   * k=6: 3.0E (Inline-6 firing fundamental)
   * k=8: 4.0E (V8 firing fundamental)
   * k=10: 5.0E (V10 firing fundamental)
   * k=12: 6.0E (V12 firing fundamental)
   */
  private applyPeriodicWave() {
    if (!this.ctx || !this.primaryOsc) return;

    const nHarmonics = 128;
    const real = new Float32Array(nHarmonics);
    const imag = new Float32Array(nHarmonics);

    const layout = this.config.cylinderLayout;
    const cyl = this.config.cylinders;
    const family = (this.config.family || "").toLowerCase();
    const code = (this.config.engineCode || "").toLowerCase();

    const isFlatplaneV8 =
      cyl === 8 &&
      (family.includes("voodoo") || code.includes("voodoo") || code.includes("gt350"));

    if (cyl === 4 && layout === "inline") {
      // Inline-4 (e.g. Honda K24, Theta II, 4G63, S14):
      // Firing fundamental = 2.0E (k=4). Crisp, punchy mid-frequency bark.
      imag[2] = 0.16; // 1.0E (crank secondary balance)
      imag[4] = 1.0;  // 2.0E (Firing fundamental)
      imag[8] = 0.82; // 4.0E (2nd order harmonic)
      imag[12] = 0.58; // 6.0E
      imag[16] = 0.38; // 8.0E (exhaust manifold rasp)
      imag[20] = 0.24; // 10.0E
      imag[24] = 0.16; // 12.0E
    } else if (cyl === 6 && layout === "inline") {
      // Inline-6 (e.g. 2JZ-GTE, RB26DETT, BMW S54/S58):
      // Perfect 1st & 2nd mechanical balance! ZERO 1.0E or 2.0E wobble.
      // Firing fundamental = 3.0E (k=6). Silky, crystalline, turbine-like singing howl!
      imag[6] = 1.0;   // 3.0E (Firing fundamental)
      imag[12] = 0.92; // 6.0E (2nd harmonic)
      imag[18] = 0.74; // 9.0E (Triad singing overtone)
      imag[24] = 0.55; // 12.0E
      imag[30] = 0.38; // 15.0E
      imag[36] = 0.25; // 18.0E
      imag[42] = 0.16; // 21.0E
      imag[48] = 0.10; // 24.0E
    } else if (cyl === 6 && layout === "v-engine") {
      // V6 (e.g. Nissan VR38DETT, Genesis Lambda 3.3T):
      // 60-degree twin-bank firing creates bank order at 1.5E (k=3). Deep, raspy growl!
      imag[3] = 0.48;  // 1.5E (Bank order growl)
      imag[6] = 1.0;   // 3.0E (Firing fundamental)
      imag[9] = 0.42;  // 4.5E (Bank harmonic)
      imag[12] = 0.80; // 6.0E
      imag[15] = 0.30; // 7.5E
      imag[18] = 0.52; // 9.0E
      imag[24] = 0.35; // 12.0E
    } else if (cyl === 8 && layout === "v-engine") {
      if (isFlatplaneV8) {
        // Flatplane V8 (Shelby GT350 5.2L Voodoo): 180-deg crank, ZERO American sub-bass wobble.
        // Pure high-frequency 4.0E (k=8) scream revving to 8250 RPM!
        imag[8] = 1.0;   // 4.0E (Firing fundamental)
        imag[16] = 0.90; // 8.0E (High scream)
        imag[24] = 0.65; // 12.0E
        imag[32] = 0.45; // 16.0E
        imag[40] = 0.30; // 20.0E
        imag[48] = 0.18; // 24.0E
      } else {
        // Crossplane V8 (GM LS3/LT4, Coyote 5.0, Dodge Hemi): 90-deg crossplane crank.
        // Consecutive bank firings create massive syncopated sub-bass rumble at 0.5E (k=1) and 1.0E (k=2)!
        imag[1] = 0.72;  // 0.5E (Slow bank wobble!)
        imag[2] = 0.88;  // 1.0E (Chest-thumping sub-bass!)
        imag[4] = 0.78;  // 2.0E
        imag[6] = 0.42;  // 3.0E
        imag[8] = 1.0;   // 4.0E (Firing fundamental)
        imag[12] = 0.62; // 6.0E
        imag[16] = 0.70; // 8.0E
        imag[20] = 0.45; // 10.0E
        imag[24] = 0.38; // 12.0E
      }
    } else if (layout === "boxer" && cyl === 4) {
      // Boxer-4 (Subaru EJ20 / EJ25 with UEL Headers):
      // Firing order 1-3-2-4 with 1.3m unequal length crossover pipe.
      // Delivers coupled pairs of pulses: [1-3] ... [2-4], producing the iconic low-end thump.
      imag[1] = 0.65;  // 0.5E (Subie deep cycle wobble)
      imag[2] = 0.95;  // 1.0E (Dominant UEL pulse-pair beat frequency!)
      imag[3] = 0.35;  // 1.5E (Asymmetric crossover resonance)
      imag[4] = 1.0;   // 2.0E (Firing fundamental)
      imag[6] = 0.45;  // 3.0E
      imag[8] = 0.85;  // 4.0E (Exhaust valve opening bark)
      imag[10] = 0.30; // 5.0E
      imag[12] = 0.58; // 6.0E
      imag[16] = 0.42; // 8.0E
      imag[20] = 0.25; // 10.0E
      imag[24] = 0.18; // 12.0E
    } else if (layout === "boxer" && cyl === 6) {
      // Boxer Flat-6 (Porsche 911 GT3 4.0L):
      // Firing fundamental 3.0E (k=6) with dry metallic air-cooled rasp!
      imag[6] = 1.0;   // 3.0E
      imag[12] = 0.95; // 6.0E
      imag[18] = 0.68; // 9.0E
      imag[24] = 0.52; // 12.0E
      imag[36] = 0.35; // 18.0E
    } else if (cyl === 5) {
      // Inline-5 (Audi DAZA / DNWA 2.5 TFSI):
      // Legendary Group B Quattro warble! Firing order 1-2-4-5-3 creates 2.5E (k=5) fundamental!
      imag[2] = 0.28;  // 1.0E
      imag[5] = 1.0;   // 2.5E (Firing fundamental)
      imag[10] = 0.85; // 5.0E
      imag[15] = 0.65; // 7.5E
      imag[20] = 0.48; // 10.0E
      imag[25] = 0.32; // 12.5E
    } else if (cyl === 10) {
      // V10 (BMW S85 5.0L, Audi/Lamborghini 5.2L):
      // 5 firings per revolution (5.0E, k=10). Exotic Formula-1 wail!
      imag[5] = 0.42;  // 2.5E (Bank half-order)
      imag[10] = 1.0;  // 5.0E (Firing fundamental)
      imag[15] = 0.38; // 7.5E
      imag[20] = 0.82; // 10.0E
      imag[30] = 0.58; // 15.0E
      imag[40] = 0.38; // 20.0E
    } else if (cyl === 12) {
      // V12 (6.0L / 6.5L V12):
      // 6 firings per revolution (6.0E, k=12). Pure operatic symphonic howl!
      imag[12] = 1.0;  // 6.0E (Firing fundamental)
      imag[24] = 0.85; // 12.0E
      imag[36] = 0.60; // 18.0E
      imag[48] = 0.40; // 24.0E
    } else if (layout === "rotary") {
      // Mazda Rotary 13B (2-rotor) & 20B (3-rotor):
      // Peripheral exhaust port opening creates ultra-fast pressure shock and staccato brap!
      imag[4] = 1.0;   // 2.0E
      imag[6] = 0.38;  // 3.0E
      imag[8] = 0.82;  // 4.0E
      imag[10] = 0.30; // 5.0E
      imag[12] = 0.68; // 6.0E
      imag[16] = 0.52; // 8.0E
    } else {
      // Default: 3-cylinder or custom
      imag[3] = 1.0;
      imag[6] = 0.82;
      imag[9] = 0.55;
    }

    const periodicWave = this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    this.primaryOsc.setPeriodicWave(periodicWave);
  }

  /**
   * Generates secondary bank periodic wave for asymmetric pulse cancellation
   */
  private applyBankPeriodicWave() {
    if (!this.ctx || !this.bankOsc) return;

    const real = new Float32Array(32);
    const imag = new Float32Array(32);

    imag[1] = 0.8;
    imag[2] = 0.6;
    imag[4] = 0.4;
    imag[6] = 0.25;

    const wave = this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    this.bankOsc.setPeriodicWave(wave);
  }

  /**
   * Generates percussive impulse wave for discrete cylinder blowdown thumps
   */
  private applyPuffPeriodicWave() {
    if (!this.ctx || !this.puffOsc) return;

    const real = new Float32Array(16);
    const imag = new Float32Array(16);

    // Percussive low-frequency Dirac-like pulse shape
    imag[1] = 1.0;
    imag[2] = 0.72;
    imag[3] = 0.45;
    imag[4] = 0.28;

    const wave = this.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    this.puffOsc.setPeriodicWave(wave);
  }

  /**
   * Configures Perspective Filtering (Cockpit Cabin / Exterior Tailpipe / Engine Bay)
   */
  private configurePerspective(perspective: AudioPerspective) {
    if (
      !this.perspectiveFilterLow ||
      !this.perspectiveFilterHigh ||
      !this.perspectiveChassisRes ||
      !this.perspectiveAirRollOff
    ) {
      return;
    }

    switch (perspective) {
      case "tailpipe": {
        const isBoxer = this.config.cylinderLayout === "boxer";
        // Exterior Tailpipe:
        // - Deep 85Hz chest-thumping bass (78Hz for Subaru Boxer)
        // - 190Hz 3-inch exhaust pipe cavity resonance
        // - 1250Hz metallic tip rasp (680Hz throaty burble for Boxer)
        // - 6800Hz high-shelf air dissipation
        this.perspectiveFilterLow.type = "lowshelf";
        this.perspectiveFilterLow.frequency.value = isBoxer ? 78 : 85;
        this.perspectiveFilterLow.gain.value = isBoxer ? 7.5 : 6.0;

        this.perspectiveFilterHigh.type = "peaking";
        this.perspectiveFilterHigh.frequency.value = isBoxer ? 680 : 1250;
        this.perspectiveFilterHigh.gain.value = isBoxer ? 6.5 : 5.5;
        this.perspectiveFilterHigh.Q.value = isBoxer ? 1.8 : 2.2;

        this.perspectiveChassisRes.type = "peaking";
        this.perspectiveChassisRes.frequency.value = isBoxer ? 175 : 190;
        this.perspectiveChassisRes.gain.value = isBoxer ? 5.5 : 4.5;
        this.perspectiveChassisRes.Q.value = 2.0;

        this.perspectiveAirRollOff.type = "highshelf";
        this.perspectiveAirRollOff.frequency.value = 6800;
        this.perspectiveAirRollOff.gain.value = -3.5;
        break;
      }

      case "engine-bay":
        // Under the Hood:
        // - High-pass at 150Hz (exhaust tip is 3m behind car)
        // - Peaking at 2400Hz (+6.5 dB) for direct camshaft valvetrain/injector clicking
        // - Peaking at 3800Hz (+5.0 dB) for intake air suction and turbo compressor whistle
        this.perspectiveFilterLow.type = "highpass";
        this.perspectiveFilterLow.frequency.value = 150;
        this.perspectiveFilterLow.Q.value = 0.9;

        this.perspectiveFilterHigh.type = "peaking";
        this.perspectiveFilterHigh.frequency.value = 2400;
        this.perspectiveFilterHigh.gain.value = 6.5;
        this.perspectiveFilterHigh.Q.value = 2.4;

        this.perspectiveChassisRes.type = "peaking";
        this.perspectiveChassisRes.frequency.value = 3800;
        this.perspectiveChassisRes.gain.value = 5.0;
        this.perspectiveChassisRes.Q.value = 1.8;

        this.perspectiveAirRollOff.type = "allpass";
        break;

      case "cockpit":
      default:
        // Inside the Cabin:
        // - Lowpass at 750Hz (firewall & sound deadening eliminates exterior harshness)
        // - 160Hz firewall intake induction resonance (+6.0 dB)
        // - 58Hz floorpan seat sub-bass rumble (+8.0 dB)
        this.perspectiveFilterLow.type = "lowpass";
        this.perspectiveFilterLow.frequency.value = 750;
        this.perspectiveFilterLow.Q.value = 1.4;

        this.perspectiveFilterHigh.type = "peaking";
        this.perspectiveFilterHigh.frequency.value = 160;
        this.perspectiveFilterHigh.gain.value = 6.0;
        this.perspectiveFilterHigh.Q.value = 1.8;

        this.perspectiveChassisRes.type = "peaking";
        this.perspectiveChassisRes.frequency.value = 58;
        this.perspectiveChassisRes.gain.value = 8.0;
        this.perspectiveChassisRes.Q.value = 2.4;

        this.perspectiveAirRollOff.type = "allpass";
        break;
    }
  }

  /**
   * Updates physical pipe length delay based on engine displacement and chassis geometry
   */
  private updatePipeLength() {
    if (!this.pipeDelay) return;
    const disp = this.config.displacementLiters || 2.0;
    // Compact cars (1.6L-2.0L) have ~2.4m exhaust (~9.5ms delay); Large V8s have ~3.5m exhaust (~14.5ms delay)
    const delay = Math.max(0.0095, Math.min(0.0155, 0.0085 + (disp / 6.0) * 0.006));
    this.pipeDelay.delayTime.setValueAtTime(delay, 0);
  }

  /**
   * Creates a 42ms Tailpipe & Rear Chassis Acoustic Cavity Impulse Response
   */
  private createTailpipeImpulseResponse(): AudioBuffer | null {
    if (!this.ctx) return null;

    const sampleRate = this.ctx.sampleRate;
    const duration = 0.042;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 68);
      const resonance =
        Math.sin(2 * Math.PI * 185 * t) * 0.6 +
        Math.sin(2 * Math.PI * 430 * t) * 0.4;
      const noise = (Math.random() * 2 - 1) * 0.22;

      left[i] = (resonance + noise) * envelope * 0.42;
      right[i] = (resonance * 0.88 + (Math.random() * 2 - 1) * 0.22) * envelope * 0.42;
    }

    return buffer;
  }

  /**
   * Configures the 4-Stage Exhaust Formant Filter Bank based on physical pipe characteristics
   */
  private configureFormants(preset: ExhaustSoundPreset) {
    if (!this.formantSub || !this.formantBody || !this.formantRasp || !this.formantHigh) return;

    const disp = this.config.displacementLiters || 2.0;
    const subFreq = Math.max(70, 105 - (disp / 6.0) * 25); // Large displacement = deeper sub-rumble

    switch (preset) {
      case "straight-pipe":
        this.formantSub.type = "lowshelf";
        this.formantSub.frequency.value = subFreq;
        this.formantSub.gain.value = 6.0;

        this.formantBody.type = "peaking";
        this.formantBody.frequency.value = 240;
        this.formantBody.gain.value = 4.5;
        this.formantBody.Q.value = 1.8;

        this.formantRasp.type = "peaking";
        this.formantRasp.frequency.value = 1200;
        this.formantRasp.gain.value = 7.0;
        this.formantRasp.Q.value = 2.4;

        this.formantHigh.type = "highpass";
        this.formantHigh.frequency.value = 400;
        this.formantHigh.Q.value = 0.7;
        break;

      case "valvetronic":
        this.formantSub.type = "lowshelf";
        this.formantSub.frequency.value = subFreq;
        this.formantSub.gain.value = 4.5;

        this.formantBody.type = "peaking";
        this.formantBody.frequency.value = 260;
        this.formantBody.gain.value = 3.5;
        this.formantBody.Q.value = 2.0;

        this.formantRasp.type = "peaking";
        this.formantRasp.frequency.value = 1050;
        this.formantRasp.gain.value = 4.5;
        this.formantRasp.Q.value = 2.0;

        this.formantHigh.type = "lowpass";
        this.formantHigh.frequency.value = 3200;
        this.formantHigh.Q.value = 1.0;
        break;

      case "sport-resonated":
        this.formantSub.type = "lowshelf";
        this.formantSub.frequency.value = subFreq;
        this.formantSub.gain.value = 3.0;

        this.formantBody.type = "peaking";
        this.formantBody.frequency.value = 280;
        this.formantBody.gain.value = 2.5;
        this.formantBody.Q.value = 2.2;

        this.formantRasp.type = "peaking";
        this.formantRasp.frequency.value = 920;
        this.formantRasp.gain.value = 3.0;
        this.formantRasp.Q.value = 2.2;

        this.formantHigh.type = "lowpass";
        this.formantHigh.frequency.value = 2600;
        this.formantHigh.Q.value = 1.1;
        break;

      case "oem":
      default:
        this.formantSub.type = "lowshelf";
        this.formantSub.frequency.value = subFreq;
        this.formantSub.gain.value = 1.0;

        this.formantBody.type = "peaking";
        this.formantBody.frequency.value = 300;
        this.formantBody.gain.value = 1.5;
        this.formantBody.Q.value = 2.5;

        this.formantRasp.type = "peaking";
        this.formantRasp.frequency.value = 850;
        this.formantRasp.gain.value = 1.0;
        this.formantRasp.Q.value = 2.5;

        this.formantHigh.type = "lowpass";
        this.formantHigh.frequency.value = 1900;
        this.formantHigh.Q.value = 1.4;
        break;
    }
  }

  /**
   * Generates mechanical camshaft valvetrain clicking noise
   */
  private createMechanicalNoise() {
    if (!this.ctx || !this.masterGain) return;

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() > 0.985 ? (Math.random() * 2 - 1) : 0.0;
    }

    this.mechNoiseSource = this.ctx.createBufferSource();
    this.mechNoiseSource.buffer = buffer;
    this.mechNoiseSource.loop = true;

    this.mechFilter = this.ctx.createBiquadFilter();
    this.mechFilter.type = "bandpass";
    this.mechFilter.frequency.value = 2400;
    this.mechFilter.Q.value = 4.5;

    this.mechGain = this.ctx.createGain();
    this.mechGain.gain.value = 0.04;

    this.mechNoiseSource.connect(this.mechFilter);
    this.mechFilter.connect(this.mechGain);
    if (this.masterGain) {
      this.mechGain.connect(this.masterGain);
    }

    this.mechNoiseSource.start();
  }

  /**
   * Generates exhaust gas flow turbulence noise
   */
  private createGasFlowTurbulence() {
    if (!this.ctx || !this.masterGain) return;

    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.12;
    }

    this.gasFlowSource = this.ctx.createBufferSource();
    this.gasFlowSource.buffer = buffer;
    this.gasFlowSource.loop = true;

    this.gasFlowFilter = this.ctx.createBiquadFilter();
    this.gasFlowFilter.type = "lowpass";
    this.gasFlowFilter.frequency.value = 1600;

    this.gasFlowGain = this.ctx.createGain();
    this.gasFlowGain.gain.value = 0.001;

    this.gasFlowSource.connect(this.gasFlowFilter);
    this.gasFlowFilter.connect(this.gasFlowGain);

    this.gasFlowSource.start();
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

  /**
   * Smooth Hyperbolic Tangent (tanh) Soft Saturation Curve.
   * Replaces harsh digital square-wave clipping with warm, analog exhaust chamber compression.
   */
  private makeDistortionCurve(preset: ExhaustSoundPreset): Float32Array<ArrayBuffer> {
    const nSamples = 512;
    const buffer = new ArrayBuffer(nSamples * Float32Array.BYTES_PER_ELEMENT);
    const curve = new Float32Array(buffer);

    let drive = 1.8;
    if (preset === "straight-pipe") drive = 3.2;
    else if (preset === "valvetronic") drive = 2.4;
    else if (preset === "sport-resonated") drive = 2.0;

    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = Math.tanh(drive * x) / Math.tanh(drive);
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
      perspective: this.perspective,
      displacementLiters: this.config.displacementLiters,
    };
  }
}

export const engineAudio = new ProceduralEngineAudio();
