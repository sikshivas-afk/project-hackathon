
import React, { useState, useRef } from 'react';
import { Upload, Unlock, Activity, ShieldX, Copy, Music, Sparkles, Binary } from 'lucide-react';
import { CryptoService } from '../services/crypto';
import { StegoService } from '../services/steganography';
import { MediaTrack } from '../types';

interface Props {
  initialTrack: MediaTrack;
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

const REVERSE_ALIEN_MAP = Object.fromEntries(Object.entries(ALIEN_MAP).map(([k, v]) => [v, k]));

const Decoder: React.FC<Props> = ({ initialTrack }) => {
  const [track, setTrack] = useState<MediaTrack>(initialTrack);
  const [fileData, setFileData] = useState<string | ArrayBuffer | null>(null);
  const [rawBuffer, setRawBuffer] = useState<ArrayBuffer | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedSecret, setExtractedSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoElementRef = useRef<HTMLVideoElement>(null);

  const fromAlien = (text: string) => text.split('').map(char => REVERSE_ALIEN_MAP[char] || char).join('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null); setExtractedSecret(null);
      const reader = new FileReader();
      if (track === MediaTrack.AUDIO) {
        reader.onload = (ev) => {
          setRawBuffer(ev.target?.result as ArrayBuffer);
          setFileData(ev.target?.result as ArrayBuffer);
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (ev) => setFileData(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDecode = async () => {
    if (!fileData || !passphrase) return;
    setIsProcessing(true); setError(null); setExtractedSecret(null);
    try {
      let extractedAlien = "";
      if (track === MediaTrack.IMAGE) {
        const img = new Image(); img.src = fileData as string;
        await new Promise(r => img.onload = r);
        extractedAlien = await StegoService.decodeImage(img);
      } else if (track === MediaTrack.AUDIO && rawBuffer) {
        extractedAlien = await StegoService.decodeAudioRaw(rawBuffer);
      } else if (track === MediaTrack.VIDEO && videoElementRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoElementRef.current.videoWidth;
        canvas.height = videoElementRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoElementRef.current, 0, 0);
        const frameImg = new Image(); frameImg.src = canvas.toDataURL();
        await new Promise(r => frameImg.onload = r);
        extractedAlien = await StegoService.decodeImage(frameImg);
      }

      const ciphertext = fromAlien(extractedAlien);
      const original = await CryptoService.decrypt(ciphertext, passphrase);
      setExtractedSecret(original);
    } catch (err: any) {
      setError(err.message || "Extraction Failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-8">
      <header className="flex justify-between items-end">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Extraction <span className="text-sky-500">Unit</span></h2>
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-sky-900/30 shadow-lg">
          {[MediaTrack.IMAGE, MediaTrack.AUDIO, MediaTrack.VIDEO].map((t) => (
            <button key={t} onClick={() => {setTrack(t); setFileData(null);}} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${track === t ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div onClick={() => fileInputRef.current?.click()} className="h-64 border-2 border-dashed border-sky-800/30 rounded-[2.5rem] bg-slate-900/20 flex items-center justify-center cursor-pointer hover:border-sky-500/50 transition-all shadow-inner">
            {fileData ? (
              track === MediaTrack.AUDIO ? <Music className="text-sky-500" /> : <img src={fileData as string} className="w-full h-full object-contain p-4" alt="Carrier" />
            ) : <Upload className="text-slate-600" />}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>
          <div className="glass p-8 rounded-[2.5rem] space-y-4 border-sky-900/20 shadow-2xl">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-sky-500 uppercase tracking-widest px-1">Authentication Key</label>
              <input type="text" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Enter Auth Key..." className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-6 py-4 text-white font-mono outline-none focus:border-sky-500 transition-all shadow-inner" />
            </div>
            <button onClick={handleDecode} disabled={isProcessing || !fileData} className="w-full py-5 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl uppercase italic shadow-xl shadow-sky-900/20 disabled:opacity-20 transition-all active:scale-[0.98]">
              {isProcessing ? 'Processing...' : 'Execute Recovery'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl text-red-500 font-bold uppercase text-center animate-pulse">Critical Error: {error}</div>}
          {extractedSecret ? (
            <div className="glass p-10 rounded-[2.5rem] border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.1)] animate-in zoom-in-95">
              <h4 className="font-black text-sky-400 uppercase italic mb-4 flex items-center space-x-2">
                <Unlock size={18} />
                <span>Intel Recovered</span>
              </h4>
              <div className="bg-slate-950 p-6 rounded-2xl font-mono text-sky-400 break-all border border-sky-900/20 shadow-inner text-sm leading-relaxed">
                {extractedSecret}
              </div>
              <button 
                onClick={() => {navigator.clipboard.writeText(extractedSecret);}}
                className="mt-6 flex items-center space-x-2 text-[10px] font-black text-sky-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                <Copy size={14} />
                <span>Copy to Clipboard</span>
              </button>
            </div>
          ) : !error && (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center opacity-40 p-12 text-center space-y-4">
              <Activity size={48} className="text-slate-700 animate-pulse" />
              <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">Extraction engine on standby</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Decoder;
