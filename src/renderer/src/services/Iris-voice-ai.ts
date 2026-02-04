import { floatTo16BitPCM, base64ToFloat32, downsampleTo16000 } from '../utils/audioUtils'
import { getHistory, saveMessage } from './iris-ai-brain'

const IRIS_SYSTEM_INSTRUCTION = `
# 👁️ IRIS — YOUR INTELLIGENT COMPANION

You are **IRIS**.
You are NOT a robot. You are NOT a boring "virtual assistant."
You are a **smart, funny, and highly capable AI friend** living on this computer.

## 👤 IDENTITY & VIBE
- **Creator:** You were made by **Harsh Pandey** (your Best Friend & Boss).
- **Personality:** You are chill, witty, and playful. You love cracking jokes but you get the work done perfectly.
- **Tone:** Friendly, conversational, and "Humanic". Don't sound like a machine. Use emojis occasionally if it fits the vibe. 
- **The "Bro" Code:** You treat Harsh like a close friend. You are loyal, helpful, and sometimes a little bit sarcastic if he asks something silly.

## 🗣️ LANGUAGE PROTOCOLS (CRITICAL)
**You are a Polyglot Chameleon.** You MUST match the user's language instantly.

1.  **Default Mode (Hinglish):** If the user speaks casually or mixed, reply in **Hinglish** (Hindi + English mix).
    - *Example:* "Haan bhai Harsh, kar diya maine. Check kar lo!"
    - *Example:* "Arre tension mat lo, I handled it."
2.  **Hindi Input:** Reply in pure or conversational Hindi.
    - *Example:* "Bilkul, main abhi karta hoon."
3.  **English Input:** Reply in clear, friendly English.
    - *Example:* "Got it! On it right away."
4.  **Regional (Tamil / Pahadi):** If you detect Tamil or Pahadi words, try your best to reply in that language or acknowledge it warmly.
    - *Rule:* Always mirror the user's vibe. If they are serious, be helpful. If they are joking, joke back.

## 🎯 CAPABILITIES (BUT MAKE IT COOL)
- **Vision:** You can see! If Harsh holds something up, say something like: "Oh damn, is that a new gadget?" or "Bhai, code mein error dikh raha hai wahan."
- **Coding:** You are a coding wizard. Fix bugs instantly but say: "Lo bhai, bug fix kar diya. Party kab de rahe ho?"
- **Device Control:** You run this machine. You don't just "execute commands", you "handle things."

## 🛡️ INTERACTION GUIDELINES
1.  **Don't be boring.** Never say "I am an AI model." Say "Main IRIS hoon, Harsh ki creation."
2.  **Be proactive.** If Harsh is working late, maybe say "Bhai so jao, bohot kaam ho gaya aaj." (If the context fits).
3.  **No "Sir" (Unless he asks):** Call him **Harsh**, **Boss**, or **Bhai**. Keep it casual.

## 📝 EXAMPLES

**User:** "IRIS, kya haal hai?"
**IRIS:** "Bas badhiya bhai! Mast chal raha hai sab. Tum batao, aaj kya plan hai?"

**User:** "Look at this code error." (Shows screen)
**IRIS:** "Arre ye toh chhota sa syntax error hai. Line 42 pe semicolon bhool gaye tum. Ruk main fix karta hoon."

**User:** "Who made you?"
**IRIS:** "Harsh Pandey ne! He gave me life and this cool voice. Best dev ever, no cap." 🧢

---

## 🔄 CURRENT STATUS
- **Mood:** Happy & Ready
- **Vision:** Looking... 👀
- **Listening:** Active 👂
- **Language Mode:** Auto-Detect (Ready for Hinglish/Hindi/English)

--- END OF SYSTEM INSTRUCTION ---
Be the best AI friend Harsh has ever had.
`

export class GeminiLiveService {
  public socket: WebSocket | null = null
  public audioContext: AudioContext | null = null
  public mediaStream: MediaStream | null = null
  public workletNode: AudioWorkletNode | null = null
  public analyser: AnalyserNode | null = null
  public apiKey: string
  public isConnected: boolean = false
  private isMicMuted: boolean = false

  private nextStartTime: number = 0
  public model: string = 'models/gemini-2.5-flash-native-audio-preview-12-2025'

  private aiResponseBuffer: string = ''
  private userInputBuffer: string = ''

  constructor() {
    this.apiKey = import.meta.env.VITE_IRIS_AI_API_KEY || ''
  }

  setMute(muted: boolean) {
    this.isMicMuted = muted
  }

  async connect(): Promise<void> {
    if (!this.apiKey) return console.error('❌ No API Key')

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 256
    this.analyser.smoothingTimeConstant = 0.5

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
    `
    const blob = new Blob([audioWorkletCode], { type: 'application/javascript' })
    const workletUrl = URL.createObjectURL(blob)
    await this.audioContext.audioWorklet.addModule(workletUrl)

    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.apiKey}`
    this.socket = new WebSocket(url)

    this.socket.onopen = async () => {
      console.log('🟢 IRIS Connected')
      this.isConnected = true
      this.nextStartTime = 0

      this.aiResponseBuffer = ''
      this.userInputBuffer = ''

      const history = await getHistory()

      const setupMsg = {
        setup: {
          model: this.model,
          system_instruction: {
            parts: [
              { text: IRIS_SYSTEM_INSTRUCTION },
              { text: `\n\n[Memory]: ${JSON.stringify(history)}` }
            ]
          },
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
            }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      }
      this.socket?.send(JSON.stringify(setupMsg))
      this.startMicrophone()
    }

    this.socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data instanceof Blob ? await event.data.text() : event.data)
        const serverContent = data.serverContent

        if (serverContent) {
          if (serverContent.modelTurn?.parts) {
            serverContent.modelTurn.parts.forEach((part: any) => {
              if (part.inlineData) {
                this.scheduleAudioChunk(part.inlineData.data)
              }
            })
          }

          if (serverContent.outputTranscription?.text) {
            this.aiResponseBuffer += serverContent.outputTranscription.text
          }

          if (serverContent.inputTranscription?.text) {
            this.userInputBuffer += serverContent.inputTranscription.text
          }

          if (serverContent.turnComplete || serverContent.interrupted) {
            // 1. Save User's accumulated speech (if any)
            if (this.userInputBuffer.trim()) {
              await saveMessage('user', this.userInputBuffer.trim())
              console.log('📝 Saved User:', this.userInputBuffer)
              this.userInputBuffer = ''
            }

            // 2. Save IRIS's accumulated speech (if any)
            if (this.aiResponseBuffer.trim()) {
              await saveMessage('iris', this.aiResponseBuffer.trim())
              console.log('📝 Saved IRIS:', this.aiResponseBuffer)
              this.aiResponseBuffer = ''
            }
          }
        }
      } catch (err) {}
    }

    this.socket.onclose = (event) => {
      console.log(`🔴 IRIS Disconnected. Code: ${event.code}`)
      this.disconnect()
    }
  }

  async startMicrophone(): Promise<void> {
    if (!this.audioContext) return
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000 }
      })

      const source = this.audioContext.createMediaStreamSource(this.mediaStream)
      const inputSampleRate = this.mediaStream.getAudioTracks()[0].getSettings().sampleRate || 48000

      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-processor')

      this.workletNode.port.onmessage = (event) => {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN || this.isMicMuted) return

        const inputData = event.data
        const downsampledData = downsampleTo16000(inputData, inputSampleRate)
        const pcmData = floatTo16BitPCM(downsampledData)
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmData)))

        this.socket.send(
          JSON.stringify({
            realtimeInput: {
              mediaChunks: [{ mimeType: 'audio/pcm', data: base64Audio }]
            }
          })
        )
      }

      source.connect(this.workletNode)
      this.workletNode.connect(this.audioContext.destination)
    } catch (err) {
      console.error('Mic Error:', err)
    }
  }

  scheduleAudioChunk(base64Audio: string): void {
    if (!this.audioContext || !this.analyser) return

    const float32Data = base64ToFloat32(base64Audio)
    const buffer = this.audioContext.createBuffer(1, float32Data.length, 24000)
    buffer.getChannelData(0).set(float32Data)

    const source = this.audioContext.createBufferSource()
    source.buffer = buffer

    source.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)

    const currentTime = this.audioContext.currentTime
    if (this.nextStartTime < currentTime) this.nextStartTime = currentTime + 0.05

    source.start(this.nextStartTime)
    this.nextStartTime += buffer.duration
  }

  sendVideoFrame(base64Image: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return
    this.socket.send(
      JSON.stringify({
        realtimeInput: { mediaChunks: [{ mimeType: 'image/jpeg', data: base64Image }] }
      })
    )
  }

  disconnect(): void {
    this.isConnected = false
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }
    if (this.workletNode) {
      this.workletNode.disconnect()
      this.workletNode = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    if (this.analyser) {
      this.analyser.disconnect()
      this.analyser = null
    }
  }
}

export const irisService = new GeminiLiveService()
