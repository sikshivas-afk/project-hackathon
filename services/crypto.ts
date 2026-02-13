
export class CryptoService {
  private static readonly ALGORITHM = 'AES-GCM';

  static async encrypt(text: string, keyStr: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const key = await this.getKey(keyStr);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv },
      key,
      data
    );

    // Concatenate IV and Ciphertext
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...result));
  }

  static async decrypt(base64: string, keyStr: string): Promise<string> {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const iv = bytes.slice(0, 12);
      const data = bytes.slice(12);
      const key = await this.getKey(keyStr);

      const decrypted = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        data
      );

      return new TextDecoder().decode(decrypted);
    } catch (e) {
      throw new Error("Decryption failed. Invalid key or corrupted data.");
    }
  }

  private static async getKey(keyStr: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyStr.padEnd(32, '0').slice(0, 32));
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.ALGORITHM },
      false,
      ['encrypt', 'decrypt']
    );
  }
}
