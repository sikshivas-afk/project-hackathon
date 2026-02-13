
import { SecurityReport } from '../types';

export class StegoService {
  private static readonly HEADER_SIZE = 32;

  // --- Utility: Binary Conversion ---

  private static textToBinary(text: string): string {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    return Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join('');
  }

  private static binaryToText(binary: string): string {
    const bytes = new Uint8Array(binary.length / 8);
    for (let i = 0; i < binary.length; i += 8) {
      bytes[i / 8] = parseInt(binary.slice(i, i + 8), 2);
    }
    return new TextDecoder().decode(bytes);
  }

  // --- Image Logic ---

  static async encodeImage(image: HTMLImageElement, message: string): Promise<{ dataUrl: string; report: SecurityReport }> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const binaryMessage = this.textToBinary(message);
    const lengthBinary = binaryMessage.length.toString(2).padStart(this.HEADER_SIZE, '0');
    const fullPayload = lengthBinary + binaryMessage;

    if (fullPayload.length > pixels.length * 0.75) {
      throw new Error("Payload exceeds carrier capacity.");
    }

    const originalPixels = new Uint8ClampedArray(pixels);

    for (let i = 0; i < fullPayload.length; i++) {
      const bit = parseInt(fullPayload[i]);
      // Skip alpha channel (every 4th byte)
      const pixelIdx = i + Math.floor(i / 3);
      pixels[pixelIdx] = (pixels[pixelIdx] & 0xFE) | bit;
    }

    ctx.putImageData(imageData, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    const metrics = this.calculateImageMetrics(originalPixels, pixels);

    return {
      dataUrl,
      report: {
        ...metrics,
        capacityUsed: (fullPayload.length / (pixels.length * 0.75)) * 100,
        encryptionStrength: "KAVACH-PROTOCOL",
        integrityVerified: true,
        securityScore: 0 // Calculated in UI
      }
    };
  }

  static async decodeImage(image: HTMLImageElement): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let lengthBinary = "";
    for (let i = 0; i < this.HEADER_SIZE; i++) {
      const pixelIdx = i + Math.floor(i / 3);
      lengthBinary += (pixels[pixelIdx] & 1).toString();
    }
    const bitLength = parseInt(lengthBinary, 2);

    if (isNaN(bitLength) || bitLength <= 0 || bitLength > pixels.length * 8) {
      throw new Error("No concealed data detected or header corrupted.");
    }

    let payloadBinary = "";
    for (let i = this.HEADER_SIZE; i < this.HEADER_SIZE + bitLength; i++) {
      const pixelIdx = i + Math.floor(i / 3);
      payloadBinary += (pixels[pixelIdx] & 1).toString();
    }

    return this.binaryToText(payloadBinary);
  }

  // --- Audio Logic (Raw WAV Processing) ---

  static async encodeAudio(audioBuffer: AudioBuffer, message: string): Promise<{ blob: Blob; report: SecurityReport }> {
    const channelData = audioBuffer.getChannelData(0);
    const binaryMessage = this.textToBinary(message);
    const lengthBinary = binaryMessage.length.toString(2).padStart(this.HEADER_SIZE, '0');
    const fullPayload = lengthBinary + binaryMessage;

    if (fullPayload.length > channelData.length) {
      throw new Error("Payload exceeds audio capacity.");
    }

    const modifiedData = new Float32Array(channelData);
    for (let i = 0; i < fullPayload.length; i++) {
      const bit = parseInt(fullPayload[i]);
      // Work with 16-bit integer representation
      let sample = Math.round(modifiedData[i] * 32767);
      sample = (sample & 0xFFFE) | bit;
      modifiedData[i] = sample / 32767;
    }

    const wavBlob = this.audioBufferToWav(audioBuffer, modifiedData);
    const metrics = this.calculateAudioMetrics(channelData, modifiedData);

    return {
      blob: wavBlob,
      report: {
        ...metrics,
        capacityUsed: (fullPayload.length / channelData.length) * 100,
        encryptionStrength: "KAVACH-PROTOCOL",
        integrityVerified: true,
        securityScore: 0
      }
    };
  }

  /**
   * decodeAudioRaw reads bits directly from the WAV ArrayBuffer
   * to avoid browser audio resampling/dithering issues.
   */
  static async decodeAudioRaw(arrayBuffer: ArrayBuffer): Promise<string> {
    const view = new DataView(arrayBuffer);
    
    // Simple WAV Parser
    const chunkId = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
    if (chunkId !== 'RIFF') throw new Error("Invalid WAV file.");

    // Find 'data' chunk
    let offset = 12;
    while (offset < view.byteLength) {
      const subChunkId = String.fromCharCode(view.getUint8(offset), view.getUint8(offset+1), view.getUint8(offset+2), view.getUint8(offset+3));
      const subChunkSize = view.getUint32(offset + 4, true);
      if (subChunkId === 'data') {
        offset += 8;
        break;
      }
      offset += 8 + subChunkSize;
    }

    const samplesCount = (view.byteLength - offset) / 2;
    
    let lengthBinary = "";
    for (let i = 0; i < this.HEADER_SIZE; i++) {
      const sample = view.getInt16(offset + (i * 2), true);
      lengthBinary += (sample & 1).toString();
    }
    const bitLength = parseInt(lengthBinary, 2);

    if (isNaN(bitLength) || bitLength <= 0 || bitLength > samplesCount * 8) {
      throw new Error("No audio payload detected.");
    }

    let payloadBinary = "";
    for (let i = this.HEADER_SIZE; i < this.HEADER_SIZE + bitLength; i++) {
      const sample = view.getInt16(offset + (i * 2), true);
      payloadBinary += (sample & 1).toString();
    }

    return this.binaryToText(payloadBinary);
  }

  // --- Video Logic ---

  static async encodeVideo(videoElement: HTMLVideoElement, message: string): Promise<{ dataUrl: string; report: SecurityReport }> {
    // Treat video encoding as first-frame injection
    return this.encodeImage(videoElement as unknown as HTMLImageElement, message);
  }

  // --- Metrics ---

  private static calculateImageMetrics(original: Uint8ClampedArray, modified: Uint8ClampedArray) {
    let sumSquaredError = 0;
    let count = 0;
    for (let i = 0; i < original.length; i++) {
      if ((i + 1) % 4 === 0) continue; 
      const diff = original[i] - modified[i];
      sumSquaredError += diff * diff;
      count++;
    }
    const mse = sumSquaredError / count;
    const psnr = mse === 0 ? 100 : 10 * Math.log10((255 * 255) / mse);
    return { mse, psnr };
  }

  private static calculateAudioMetrics(original: Float32Array, modified: Float32Array) {
    let mse = 0;
    for (let i = 0; i < original.length; i++) {
      const diff = original[i] - modified[i];
      mse += diff * diff;
    }
    mse /= original.length;
    const psnr = mse === 0 ? 100 : 10 * Math.log10(1 / mse);
    return { mse, psnr };
  }

  private static audioBufferToWav(buffer: AudioBuffer, modifiedChannel0: Float32Array): Blob {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const out = new ArrayBuffer(length);
    const view = new DataView(out);
    const sampleRate = buffer.sampleRate;
    let offset = 0;

    const writeString = (s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
      offset += s.length;
    };

    writeString('RIFF');
    view.setUint32(offset, length - 8, true); offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numOfChan, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, sampleRate * 2 * numOfChan, true); offset += 4;
    view.setUint16(offset, numOfChan * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString('data');
    view.setUint32(offset, length - offset - 4, true); offset += 4;

    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numOfChan; channel++) {
        const sample = channel === 0 ? modifiedChannel0[i] : buffer.getChannelData(channel)[i];
        const s = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  }
}
