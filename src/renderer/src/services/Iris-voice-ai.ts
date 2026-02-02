import { floatTo16BitPCM, base64ToFloat32, downsampleTo16000 } from '../utils/audioUtils';

export class GeminiLiveService {
  public socket: WebSocket | null = null;
  public audioContext: AudioContext | null = null;
  public mediaStream: MediaStream | null = null;
  public workletNode: AudioWorkletNode | null = null;
  public analyser: AnalyserNode | null = null; // 🎵 FOR SPHERE ANIMATION
  public apiKey: string;
  public isConnected: boolean = false;
  private isMicMuted: boolean = false; // 🔇 MUTE STATE
  
  private nextStartTime: number = 0;
  public model: string = 'models/gemini-2.5-flash-native-audio-preview-12-2025'; 

  constructor() {
    this.apiKey = import.meta.env.VITE_IRIS_AI_API_KEY || '';
  }

  setMute(muted: boolean) {
    this.isMicMuted = muted;
  }

  async connect(): Promise<void> {
    if (!this.apiKey) return console.error("❌ No API Key");

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 🎵 Create Analyser for Visuals
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256; // Fast reaction time
    this.analyser.smoothingTimeConstant = 0.5;

    // ... (AudioWorklet setup same as before) ...
    const audioWorkletCode = `
      class PCMProcessor extends AudioWorkletProcessor {
        process(inputs, outputs, parameters) {
          const input = inputs[0];
          if (input.length > 0) {
            this.port.postMessage(input[0]);
          }
          return true;
        }
      }
      registerProcessor('pcm-processor', PCMProcessor);
    `;
    const blob = new Blob([audioWorkletCode], { type: "application/javascript" });
    const workletUrl = URL.createObjectURL(blob);
    await this.audioContext.audioWorklet.addModule(workletUrl);

    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("🟢 IRIS Connected");
      this.isConnected = true;
      this.nextStartTime = 0; 
      
      const setupMsg = {
        setup: {
          model: this.model,
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
            }
          }
        }
      };
      this.socket?.send(JSON.stringify(setupMsg));
      this.startMicrophone();
    };

    this.socket.onmessage = async (event) => {
      try {
        let response: any;
        if (event.data instanceof Blob) {
          response = JSON.parse(await event.data.text());
        } else {
          response = JSON.parse(event.data);
        }

        const parts = response.serverContent?.modelTurn?.parts;
        if (parts && parts[0]?.inlineData) {
           this.scheduleAudioChunk(parts[0].inlineData.data);
        }
      } catch (err) { }
    };

    this.socket.onclose = (event) => {
      console.log(`🔴 IRIS Disconnected. Code: ${event.code}`);
      this.disconnect();
    };
  }

  async startMicrophone(): Promise<void> {
    if (!this.audioContext) return;
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000 }
      });

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      const inputSampleRate = this.mediaStream.getAudioTracks()[0].getSettings().sampleRate || 48000;

      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-processor');
      
      this.workletNode.port.onmessage = (event) => {
        // 🔇 MUTE LOGIC: If muted, don't send data
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN || this.isMicMuted) return;

        const inputData = event.data;
        const downsampledData = downsampleTo16000(inputData, inputSampleRate);
        const pcmData = floatTo16BitPCM(downsampledData);
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmData)));

        this.socket.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ mimeType: "audio/pcm", data: base64Audio }]
          }
        }));
      };

      source.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);
    } catch (err) { console.error("Mic Error:", err); }
  }

  scheduleAudioChunk(base64Audio: string): void {
    if (!this.audioContext || !this.analyser) return;

    const float32Data = base64ToFloat32(base64Audio);
    const buffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
    buffer.getChannelData(0).set(float32Data);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    // 🎵 CONNECT TO ANALYSER (For Sphere Animation)
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    const currentTime = this.audioContext.currentTime;
    if (this.nextStartTime < currentTime) this.nextStartTime = currentTime + 0.05;
    
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
  }

  sendVideoFrame(base64Image: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({
      realtimeInput: { mediaChunks: [{ mimeType: "image/jpeg", data: base64Image }] }
    }));
  }

  disconnect(): void {
    this.isConnected = false;
    if (this.socket) { this.socket.close(); this.socket = null; }
    if (this.mediaStream) { this.mediaStream.getTracks().forEach(track => track.stop()); this.mediaStream = null; }
    if (this.workletNode) { this.workletNode.disconnect(); this.workletNode = null; }
    if (this.audioContext) { this.audioContext.close(); this.audioContext = null; }
    if (this.analyser) { this.analyser.disconnect(); this.analyser = null; }
  }
}

export const irisService = new GeminiLiveService();