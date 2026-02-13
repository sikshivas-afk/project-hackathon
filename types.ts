
export interface SecurityReport {
  psnr: number;
  mse: number;
  capacityUsed: number;
  encryptionStrength: string;
  integrityVerified: boolean;
  aiAnalysis?: string;
  securityScore: number; // Percentage 0-100
}

export enum MediaTrack {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  ENCODE = 'ENCODE',
  DECODE = 'DECODE',
  LIBRARY = 'LIBRARY',
  SETTINGS = 'SETTINGS',
  RECENT = 'RECENT'
}

export enum EncryptionType {
  AES_256_GCM = 'AES-256-GCM',
  AES_128_GCM = 'AES-128-GCM',
  AES_256_CBC = 'AES-256-CBC',
  CHACHA20_POLY1305 = 'CHACHA20-POLY1305'
}

export interface User {
  username: string;
  email: string;
}

export interface RecentAction {
  id: string;
  type: 'ENCODE' | 'DECODE';
  track: MediaTrack;
  timestamp: number;
  fileName: string;
}

export interface StegoResult {
  dataUrl?: string;
  blob?: Blob;
  report: SecurityReport;
}