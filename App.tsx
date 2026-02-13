
import React, { useState, useEffect, useRef } from 'react';
import { AppMode, MediaTrack, User, RecentAction, EncryptionType } from './types';
import Encoder from './components/Encoder';
import Decoder from './components/Decoder';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import { Shield, Lock, Unlock, LayoutDashboard, ChevronLeft, Github, LogOut, Cpu, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [activeTrack, setActiveTrack] = useState<MediaTrack>(MediaTrack.IMAGE);
  const [user, setUser] = useState<User | null>(null);
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [encryptionType, setEncryptionType] = useState<EncryptionType>(EncryptionType.AES_256_GCM);
  const [carrierCount, setCarrierCount] = useState<number>(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('kavach_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedRecent = localStorage.getItem('kavach_recent');
    if (savedRecent) setRecentActions(JSON.parse(savedRecent));
    const savedEncryption = localStorage.getItem('kavach_encryption');
    if (savedEncryption) setEncryptionType(savedEncryption as EncryptionType);
    const savedCount = localStorage.getItem('den_carrier_count');
    if (savedCount) setCarrierCount(parseInt(savedCount, 10));
  }, []);

  // Update theme class on body
  useEffect(() => {
    if (mode === AppMode.DECODE) {
      document.body.classList.add('theme-decode');
    } else {
      document.body.classList.remove('theme-decode');
    }
  }, [mode]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('kavach_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kavach_user');
    setMode(AppMode.DASHBOARD);
  };

  const navigateToTrack = (track: MediaTrack) => {
    setActiveTrack(track);
    setMode(AppMode.ENCODE);
  };

  const handleEncryptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as EncryptionType;
    setEncryptionType(val);
    localStorage.setItem('kavach_encryption', val);
  };

  const incrementCarrierCount = () => {
    const newCount = carrierCount + 1;
    setCarrierCount(newCount);
    localStorage.setItem('den_carrier_count', newCount.toString());
  };

  const addRecentAction = (action: Omit<RecentAction, 'id' | 'timestamp'>) => {
    const newAction: RecentAction = {
      ...action,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    const updated = [newAction, ...recentActions].slice(0, 10);
    setRecentActions(updated);
    localStorage.setItem('kavach_recent', JSON.stringify(updated));
  };

  if (!user) {
    return (
      <Auth onLogin={handleLogin} />
    );
  }

  const isDecode = mode === AppMode.DECODE;
  const primaryColor = isDecode ? 'sky' : 'green';

  return (
    <div className={`min-h-screen flex bg-slate-950 overflow-hidden gradient-bg ${isDecode ? 'theme-decode' : ''}`}>
      <Sidebar activeMode={mode} setMode={setMode} user={user} onLogout={handleLogout} />

      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <header className="glass border-b px-8 py-4 flex items-center justify-between z-40 bg-slate-900/40">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg border bg-${primaryColor}-600/20 border-${primaryColor}-500/30 transition-colors duration-500`}>
              <Shield className={`text-${primaryColor}-500 transition-colors duration-500`} size={20} />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-white italic leading-tight">
                <span className={`text-${primaryColor}-500 text-primary-glow transition-colors duration-500`}>DEN</span>
              </h1>
              <p className={`text-[10px] text-${primaryColor}-400 font-bold tracking-wider uppercase -mt-1 italic transition-colors duration-500`}>
                Strategic Defense Grid
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {(mode === AppMode.ENCODE || mode === AppMode.DECODE) && (
              <nav className={`flex bg-slate-900/80 p-1 rounded-xl border border-${primaryColor}-900/30 shadow-inner transition-colors duration-500`}>
                <button
                  onClick={() => setMode(AppMode.ENCODE)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all text-xs font-black tracking-widest ${
                    mode === AppMode.ENCODE ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <Lock size={14} />
                  <span>ENCODE</span>
                </button>
                <button
                  onClick={() => setMode(AppMode.DECODE)}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all text-xs font-black tracking-widest ${
                    mode === AppMode.DECODE ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <Unlock size={14} />
                  <span>DECODE</span>
                </button>
              </nav>
            )}

            <div className="flex items-center space-x-3 text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <div className={`w-2 h-2 rounded-full bg-${primaryColor}-500 animate-pulse transition-colors duration-500`}></div>
              <span className="font-mono text-[10px] font-bold">NODE: {user.username.toUpperCase()}</span>
            </div>
          </div>
        </header>

        <main className="flex-grow relative overflow-y-auto custom-scrollbar">
          {mode !== AppMode.DASHBOARD && mode !== AppMode.LIBRARY && mode !== AppMode.RECENT && mode !== AppMode.SETTINGS && (
            <button 
              onClick={() => setMode(AppMode.DASHBOARD)}
              className={`absolute top-8 left-8 flex items-center space-x-2 text-${primaryColor}-500 hover:text-${primaryColor}-400 font-black text-xs uppercase tracking-widest transition-all z-10 bg-slate-900/40 px-4 py-2 rounded-full border border-${primaryColor}-900/20 backdrop-blur-sm`}
            >
              <ChevronLeft size={16} />
              <span>Back to Home</span>
            </button>
          )}

          <div className="max-w-7xl mx-auto p-8 md:p-12 min-h-full">
            {mode === AppMode.DASHBOARD && <Dashboard encryptionType={encryptionType} onSelectTrack={navigateToTrack} />}
            {mode === AppMode.ENCODE && (
              <Encoder 
                encryptionType={encryptionType} 
                initialTrack={activeTrack} 
                carrierCount={carrierCount}
                onActionComplete={(name) => {
                  incrementCarrierCount();
                  addRecentAction({type: 'ENCODE', track: activeTrack, fileName: name});
                }} 
              />
            )}
            {mode === AppMode.DECODE && <Decoder initialTrack={activeTrack} />}
            {mode === AppMode.RECENT && (
              <div className="space-y-8 py-12 animate-in fade-in slide-in-from-top-4">
                <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter">Recent <span className={`text-${primaryColor}-500 transition-colors duration-500`}>Activity</span></h2>
                <div className={`glass rounded-[2rem] overflow-hidden border-${primaryColor}-900/20 shadow-2xl transition-colors duration-500`}>
                  {recentActions.length > 0 ? (
                    <table className="w-full text-left">
                      <thead className={`bg-slate-900/80 border-b border-${primaryColor}-900/20 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors duration-500`}>
                        <tr>
                          <th className="px-8 py-5">Operation</th>
                          <th className="px-8 py-5">Carrier</th>
                          <th className="px-8 py-5">Source File</th>
                          <th className="px-8 py-5">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {recentActions.map((action) => (
                          <tr key={action.id} className={`hover:bg-${primaryColor}-500/5 transition-colors group`}>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest ${action.type === 'ENCODE' ? 'bg-green-500/20 text-green-400' : 'bg-sky-500/20 text-sky-400'}`}>
                                {action.type}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-slate-300 font-mono text-xs">{action.track}</td>
                            <td className="px-8 py-5 text-white font-bold text-sm italic">{action.fileName}</td>
                            <td className="px-8 py-5 text-slate-500 font-mono text-[10px]">
                              {new Date(action.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-20 text-center space-y-4">
                      <Lock className="mx-auto text-slate-800" size={64} />
                      <p className="text-slate-600 font-bold">No logs found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="p-6 text-center text-slate-700 text-[9px] border-t border-slate-900 font-mono tracking-widest uppercase bg-slate-950/50 backdrop-blur-md">
          &copy; 2026 Department of CSE | Advanced Steganographic Defense Grid
        </footer>
      </div>
    </div>
  );
};

export default App;
