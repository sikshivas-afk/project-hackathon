
import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, Mail, ArrowRight, Zap, AlertTriangle } from 'lucide-react';
import { User } from '../types';

interface Props {
  onLogin: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password || (isSignup && !email)) return;

    // Retrieve existing accounts from localStorage
    const storedUsersJson = localStorage.getItem('den_registry');
    const registeredUsers: any[] = storedUsersJson ? JSON.parse(storedUsersJson) : [];

    if (isSignup) {
      // Check if user already exists
      const exists = registeredUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (exists) {
        setError("CODENAME ALREADY REGISTERED IN GRID");
        return;
      }

      // Create new account
      const newUser = { username, email, password };
      registeredUsers.push(newUser);
      localStorage.setItem('den_registry', JSON.stringify(registeredUsers));
      
      onLogin({ username, email });
    } else {
      // Login attempt
      const userMatch = registeredUsers.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && u.password === password
      );

      if (userMatch) {
        onLogin({ username: userMatch.username, email: userMatch.email });
      } else {
        const justUser = registeredUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (!justUser) {
          setError("UNAUTHORIZED: ACCOUNT NOT FOUND");
        } else {
          setError("INVALID AUTHENTICATION KEYPHRASE");
        }
      }
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 relative">
        {/* Background Decor */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-green-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-green-600/10 blur-[120px] rounded-full"></div>

        <div className="text-center space-y-2 relative">
          <div className="inline-block p-4 rounded-[2rem] bg-slate-900 border border-green-500/20 shadow-2xl glow-green mb-4">
            <Shield className="text-green-500" size={48} />
          </div>
          <h1 className="text-8xl font-black text-white italic tracking-tighter uppercase leading-none">
            <span className="text-green-500 text-green-glow">DEN</span>
          </h1>
          <p className="text-green-400 font-black text-xs uppercase tracking-[0.2em] italic drop-shadow-sm">
            <span className="underline decoration-green-500/50 decoration-2 underline-offset-2">D</span>ecoding and <span className="underline decoration-green-500/50 decoration-2 underline-offset-2">E</span>ncoding <span className="underline decoration-green-500/50 decoration-2 underline-offset-2">N</span>ovice
          </p>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em] pt-2">Strategic Defense System v4.0.26</p>
        </div>

        <div className="glass p-10 rounded-[3rem] border-green-900/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap className="text-green-500" size={80} />
          </div>

          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-900 mb-8">
            <button 
              onClick={() => { setIsSignup(false); setError(null); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isSignup ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              System Login
            </button>
            <button 
              onClick={() => { setIsSignup(true); setError(null); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isSignup ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3 text-red-500 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={18} />
              <span className="text-[10px] font-black tracking-widest uppercase">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="text" 
                  placeholder="USERNAME / CODENAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-green-500 outline-none font-mono text-sm transition-all"
                  required
                />
              </div>

              {isSignup && (
                <div className="relative animate-in slide-in-from-top-2 duration-300">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="email" 
                    placeholder="SECURE EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-green-500 outline-none font-mono text-sm transition-all"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="password" 
                  placeholder="AUTH KEYPHRASE"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-green-500 outline-none font-mono text-sm transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-[0.4em] rounded-2xl transition-all shadow-xl shadow-green-900/20 flex items-center justify-center space-x-3 italic"
            >
              <span>{isSignup ? 'Initialize Profile' : 'Gain System Entry'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center space-x-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-green-500/20 animate-pulse"></div>
            <span>End-to-End Encryption Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
