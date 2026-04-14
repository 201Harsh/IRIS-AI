export function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
}

export function float32ToBase64PCM(float32Array: Float32Array): string {
  const int16Array = floatTo16BitPCM(float32Array);
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
  }
  return btoa(binary);
}

export function base64ToFloat32(base64String: string): Float32Array {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }
  return float32Array;
}

export function downsampleTo16000(float32Array: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) return float32Array;
  
  const compression = inputSampleRate / 16000;
  const length = Math.floor(float32Array.length / compression);
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index] = float32Array[Math.floor(inputIndex)];
    inputIndex += compression;
    index++;
  }
  return result;
}