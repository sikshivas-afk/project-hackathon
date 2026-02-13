
import React from 'react';
import { ImageIcon, Music, Film, ArrowRight, Shield } from 'lucide-react';
import { MediaTrack, EncryptionType } from '../types';

interface Props {
  encryptionType: EncryptionType;
  onSelectTrack: (track: MediaTrack) => void;
}

const Dashboard: React.FC<Props> = ({ onSelectTrack, encryptionType }) => {
  const TrackButton = ({ track, icon: Icon, label, description, colorClass }: any) => (
    <button
      onClick={() => onSelectTrack(track)}
      className={`group relative aspect-[3/4] shield-shape flex flex-col items-center justify-center text-center transition-all duration-700 hover:scale-[1.05] overflow-hidden bg-slate-900/40 border border-green-500/20 hover:border-green-400/60 shadow-2xl group`}
    >
      {/* Dynamic Background Glow - Reverted to Green on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-10 group-hover:opacity-40 transition-opacity duration-700`}></div>
      
      {/* High-tech Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* Persistent Shield Silhouette */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
        <Shield size={340} strokeWidth={0.5} className="text-green-500 group-hover:text-green-400 transition-colors duration-700" />
      </div>

      {/* Track Icon wrapped in a Shield */}
      <div className={`relative z-10 p-10 mb-4 transition-all duration-700 group-hover:scale-[0.2] group-hover:-translate-y-40 group-hover:opacity-0`}>
        <div className="relative">
          <Shield size={120} strokeWidth={1} className="text-green-500/30" />
          <div className="absolute inset-0 flex items-center justify-center text-green-500">
            <Icon size={48} strokeWidth={1.5} />
          </div>
        </div>
      </div>
      
      {/* Maximising Label on Hover - Adjusted scale to 1.7 to ensure it fits without clipping */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none px-6">
        <h3 className="text-3xl md:text-4xl font-black text-white transition-all duration-700 scale-100 group-hover:scale-[1.7] group-hover:text-green-400 group-hover:text-green-glow select-none tracking-tighter italic uppercase drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] whitespace-nowrap">
          {label}
        </h3>
      </div>
      
      {/* Meta Information */}
      <div className="relative z-10 mt-6 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-8">
        <p className="text-slate-400 text-sm max-w-[200px] leading-relaxed font-medium px-4">
          {description}
        </p>
      </div>
      
      {/* Action Prompt - Enhanced for visibility */}
      <div className="absolute bottom-12 flex flex-col items-center space-y-3 opacity-0 group-hover:opacity-100 transform translate-y-10 group-hover:translate-y-0 transition-all duration-700 delay-150 z-30 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-6 py-2.5 rounded-full border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center space-x-3">
          <span className="text-green-400 font-mono text-xs font-black tracking-[0.25em] uppercase text-green-glow">
            ACTIVATE {track} SHIELD
          </span>
          <ArrowRight size={16} className="text-green-400 animate-bounce" />
        </div>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-green-500/60 to-transparent rounded-full animate-pulse transition-colors duration-700"></div>
      </div>

      {/* Outer Glow Border */}
      <div className="absolute inset-0 border-[6px] border-transparent group-hover:border-green-500/10 shield-shape transition-all duration-700"></div>
    </button>
  );

  return (
    <div className="space-y-16 py-12">
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-3 px-6 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-black tracking-[0.4em] uppercase mb-4 shadow-xl shadow-green-900/20 backdrop-blur-md">
          <Shield size={16} className="animate-pulse" />
          <span>Defensive Grid Operational</span>
        </div>
        
        {/* Updated Heading per User Request */}
        <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-2xl">
          I WANT TO <span className="text-green-500 text-green-glow">HIDE</span> IN...
        </h2>
        
        <p className="text-slate-400 text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
          Select a digital carrier to serve as the ultimate defense for your intelligence. Supporting stealth concealment of PDF, Word, and Excel assets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto px-8">
        <TrackButton 
          track={MediaTrack.IMAGE} 
          icon={ImageIcon} 
          label="IMAGE" 
          description="Embed deep within pixel matrices using PVD injection."
          colorClass="from-green-600 to-emerald-950"
        />
        <TrackButton 
          track={MediaTrack.AUDIO} 
          icon={Music} 
          label="AUDIO" 
          description="Inaudible frequency modification for sonic extraction."
          colorClass="from-emerald-600 to-teal-950"
        />
        <TrackButton 
          track={MediaTrack.VIDEO} 
          icon={Film} 
          label="VIDEO" 
          description="Temporal frame distribution for massive encrypted payloads."
          colorClass="from-green-700 to-green-950"
        />
      </div>

      <div className="flex justify-center pt-12">
        <div className="glass px-12 py-6 rounded-full flex items-center space-x-16 border-green-900/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
          
          <div className="flex flex-col items-start relative z-10">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">CRYPTO ENGINE</span>
            <span className="text-base text-green-400 font-mono font-black tracking-widest text-green-glow">{encryptionType}</span>
          </div>
          <div className="w-px h-12 bg-slate-800"></div>
          <div className="flex flex-col items-start relative z-10">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">INTEGRITY</span>
            <span className="text-base text-green-400 font-mono font-black tracking-widest text-green-glow">MD5 VERIFIED</span>
          </div>
          <div className="w-px h-12 bg-slate-800"></div>
          <div className="flex flex-col items-start relative z-10">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">CAPACITY</span>
            <span className="text-base text-green-400 font-mono font-black tracking-widest text-green-glow">MULTI-FILE ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;