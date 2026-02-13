
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Key, FileText, Lock, CheckCircle, Download, ShieldAlert, Image as ImageIcon, Music, Film, Sparkles, AlertCircle } from 'lucide-react';
import { CryptoService } from '../services/crypto';
import { StegoService } from '../services/steganography';
import { GeminiService } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import { SecurityReport, MediaTrack, EncryptionType } from '../types';

interface Props {
  initialTrack: MediaTrack;
  encryptionType: EncryptionType;
  carrierCount: number;
  onActionComplete?: (fileName: string) => void;
}

const ALIEN_MAP: Record<string, string> = {
  'a': '⏃', 'b': '⏁', 'c': '☊', 'd': '⎅', 'e': '⟒', 'f': '⎎', 'g': '☌', 'h': '⊑', 'i': '⟟', 'j': '⟊',
  'k': '☍', 'l': '⌰', 'm': '⋔', 'n': '⋏', 'o': '⍒', 'p': '⌿', 'q': '⍾', 'r': '⍀', 's': '⌇', 't': '⏈',
  'u': '⎍', 'v': '⎐', 'w': '⍙', 'x': '⌖', 'y': '⊬', 'z': '⋇', '0': '⊘', '1': '⊳', '2': '⊴', '3': '⊵',
  '4': '⊶', '5': '⊷', '6': '⊸', '7': '⊹', '8': '⊺', '9': '⊻', '+': '⊼', '/': '⊽', '=': '⊾', ' ': ' ',
  'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ', 'J': 'Ⓙ',
  'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ',
  'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ'
};

const Encoder: React.FC<Props> = ({ initialTrack, encryptionType, carrierCount, onActionComplete }) => {
  const [track, setTrack] = useState<MediaTrack>(initialTrack);
  const [fileData, setFileData] = useState<string | ArrayBuffer | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [secretText, setSecretText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [pwStrength, setPwStrength] = useState<{ isWeak: boolean; message: string; type: 'error' | 'warning' | 'success' | 'info' }>({ isWeak: true, message: '', type: 'info' });
  const [suggestedPassword, setSuggestedPassword] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const toAlien = (text: string) => text.split('').map(char => ALIEN_MAP[char] || char).join('');

  useEffect(() => {
    if (!passphrase) {
      setPwStrength({ isWeak: true, message: '', type: 'info' });
      return;
    }
    const hasLetters = /[a-zA-Z]/.test(passphrase);
    const hasNumbers = /[0-9]/.test(passphrase);
    const hasSpecial = /[^a-zA-Z0-9]/.test(passphrase);
    const isLongEnough = passphrase.length >= 8;

    if (!isLongEnough) {
      setPwStrength({ isWeak: true, message: "KEY TOO SHORT (MIN 8)", type: 'error' });
    } else if (!hasLetters || !hasNumbers || !hasSpecial) {
      setPwStrength({ isWeak: true, message: "MISSING COMPLEXITY (A-Z, 0-9, SYMBOLS)", type: 'warning' });
    } else {
      setPwStrength({ isWeak: false, message: "KEY SECURE", type: 'success' });
    }
  }, [passphrase]);

  const fetchStrongSuggestion = async () => {
    setIsSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate one secure, 12-character alphanumeric password with special characters. Return ONLY the string.",
      });
      setSuggestedPassword(response.text?.trim() || null);
    } catch (e) { console.error(e); }
    finally { setIsSuggesting(false); }
  };

  const handleCarrierChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResultUrl(null);
      const reader = new FileReader();
      if (track === MediaTrack.IMAGE || track === MediaTrack.VIDEO) {
        reader.onload = (ev) => setFileData(ev.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        reader.onload = async (ev) => {
          const buffer = ev.target?.result as ArrayBuffer;
          setFileData(buffer);
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          const decoded = await audioContextRef.current.decodeAudioData(buffer.slice(0));
          setAudioBuffer(decoded);
        };
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const handleEncode = async () => {
    if (!fileData || !secretText || !passphrase || pwStrength.isWeak) return;
    setIsProcessing(true);
    try {
      const encrypted = await CryptoService.encrypt(secretText, passphrase);
      const alienGlyphs = toAlien(encrypted);

      let result;
      if (track === MediaTrack.IMAGE) {
        const img = new Image(); img.src = fileData as string;
        await new Promise(r => img.onload = r);
        result = await StegoService.encodeImage(img, alienGlyphs);
        setResultUrl(result.dataUrl);
      } else if (track === MediaTrack.AUDIO && audioBuffer) {
        result = await StegoService.encodeAudio(audioBuffer, alienGlyphs);
        setResultUrl(URL.createObjectURL(result.blob));
      } else if (track === MediaTrack.VIDEO && videoRef.current) {
        result = await StegoService.encodeVideo(videoRef.current, alienGlyphs);
        setResultUrl(result.dataUrl);
      }

      if (result) {
        const score = 90 - (result.report.capacityUsed / 2);
        setReport({ ...result.report, securityScore: Math.min(100, Math.max(0, score)) });
      }
      if (onActionComplete) onActionComplete('Sensitive Message');
    } catch (err: any) {
      alert(err.message || "Encoding failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Stealth <span className="text-green-500 text-green-glow">Encoding</span></h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Active Protocol: {encryptionType}</p>
        </div>
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-green-900/30">
          {[MediaTrack.IMAGE, MediaTrack.AUDIO, MediaTrack.VIDEO].map((t) => (
            <button key={t} onClick={() => {setTrack(t); setFileData(null); setResultUrl(null);}} className={`px-6 py-2 rounded-xl transition-all ${track === t ? 'bg-green-600 text-white' : 'text-slate-500 hover:text-white'}`}>
              <span className="text-[10px] font-black uppercase">{t}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div onClick={() => fileInputRef.current?.click()} className="relative h-80 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/20 flex items-center justify-center cursor-pointer overflow-hidden">
            {fileData ? (
              track === MediaTrack.IMAGE ? <img src={fileData as string} className="w-full h-full object-contain p-4" alt="Preview" /> :
              track === MediaTrack.AUDIO ? <Music size={48} className="text-green-500" /> :
              <video ref={videoRef} src={fileData as string} className="w-full h-full object-contain" muted loop autoPlay />
            ) : <Upload className="text-slate-600" size={40} />}
            <input type="file" ref={fileInputRef} onChange={handleCarrierChange} className="hidden" />
          </div>

          <div className="glass p-10 rounded-[3rem] space-y-8 border-green-900/20">
            <textarea value={secretText} onChange={(e) => setSecretText(e.target.value)} placeholder="Secret Payload..." className="w-full bg-slate-950 border border-slate-900 rounded-3xl p-6 text-white h-32 font-mono text-sm outline-none focus:border-green-500" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Defense Key</span>
                <span className={`text-[8px] font-black uppercase ${pwStrength.type === 'error' ? 'text-red-500' : pwStrength.type === 'success' ? 'text-green-500' : 'text-yellow-500'}`}>{pwStrength.message}</span>
              </div>
              <input type="text" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Key (Mixed symbols req.)" className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-6 py-4 text-white font-mono outline-none focus:border-green-500" />
              <button onClick={fetchStrongSuggestion} className="text-[9px] font-bold text-green-500 uppercase hover:underline flex items-center gap-2">
                <Sparkles size={12} /> {isSuggesting ? 'Thinking...' : 'AI Key Suggestion'}
              </button>
              {suggestedPassword && <div className="p-3 bg-black/40 border border-green-500/20 rounded-xl flex justify-between items-center">
                <code className="text-green-400 text-xs">{suggestedPassword}</code>
                <button onClick={() => setPassphrase(suggestedPassword)} className="bg-green-600 px-3 py-1 rounded text-[8px] text-white">USE</button>
              </div>}
            </div>

            <button onClick={handleEncode} disabled={isProcessing || !fileData || pwStrength.isWeak} className="w-full py-6 bg-green-600 text-white font-black text-xl rounded-3xl uppercase italic shadow-2xl disabled:opacity-20 transition-all">
              {isProcessing ? 'Encoding...' : 'Seal Intelligence'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {resultUrl ? (
            <div className="glass p-10 rounded-[3.5rem] border-green-500/30 glow-green animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-green-400 italic">SEALED_SUCCESS</h3>
                <a href={resultUrl} download="DEN_PROTECTED.png" className="bg-green-500 p-3 rounded-2xl text-white"><Download size={20} /></a>
              </div>
              {track === MediaTrack.AUDIO ? <audio controls src={resultUrl} className="w-full" /> : <img src={resultUrl} className="w-full rounded-2xl" alt="Result" />}
              {report && (
                <div className="mt-8 pt-8 border-t border-green-500/10">
                  <div className="flex justify-between text-xs font-bold text-slate-500"><span>SECURITY SCORE</span><span>{report.securityScore.toFixed(1)}%</span></div>
                  <div className="w-full h-2 bg-slate-950 rounded-full mt-2"><div className="h-full bg-green-500 rounded-full" style={{ width: `${report.securityScore}%` }} /></div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center glass rounded-[4rem] border-slate-800 border-dashed p-20 opacity-40">
              <ShieldAlert size={60} className="text-slate-800" />
              <p className="mt-4 text-xs font-black uppercase text-slate-700 tracking-widest">Awaiting Command</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Encoder;
