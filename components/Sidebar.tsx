
import React from 'react';
import { AppMode, User } from '../types';
import { LayoutDashboard, Library, History, Settings, LogOut, Shield } from 'lucide-react';

interface Props {
  activeMode: AppMode;
  setMode: (mode: AppMode) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<Props> = ({ activeMode, setMode, user, onLogout }) => {
  const isDecode = activeMode === AppMode.DECODE;
  const activeColor = isDecode ? 'sky' : 'green';

  const NavItem = ({ mode, icon: Icon, label }: { mode: AppMode, icon: any, label: string }) => {
    const isActive = activeMode === mode;
    // Calculate color based on mode being hovered/active
    const itemColor = mode === AppMode.DECODE ? 'sky' : (mode === AppMode.ENCODE ? 'green' : activeColor);

    return (
      <button
        onClick={() => setMode(mode)}
        className={`group relative w-full aspect-square flex flex-col items-center justify-center transition-all duration-300 ${
          isActive ? `text-${itemColor}-500` : 'text-slate-600 hover:text-white'
        }`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} className="transition-all" />
        <span className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {label}
        </span>
        {isActive && (
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-${itemColor}-500 rounded-l-full shadow-[0_0_15px_var(--theme-primary-glow)] transition-all duration-500`}></div>
        )}
      </button>
    );
  };

  return (
    <aside className={`w-20 bg-slate-950 border-r border-${activeColor}-900/20 flex flex-col items-center py-8 z-50 transition-colors duration-500`}>
      <div className="mb-12 relative group cursor-pointer" onClick={() => setMode(AppMode.DASHBOARD)}>
        <div className={`p-2.5 rounded-2xl border bg-${activeColor}-500/10 border-${activeColor}-500/30 group-hover:scale-110 transition-all duration-500`}>
           <Shield size={24} className={`text-${activeColor}-500 transition-colors duration-500`} />
        </div>
      </div>

      <nav className="flex-grow w-full space-y-4 px-2">
        <NavItem mode={AppMode.DASHBOARD} icon={LayoutDashboard} label="Home" />
        <NavItem mode={AppMode.ENCODE} icon={History} label="Encode" />
        <NavItem mode={AppMode.DECODE} icon={History} label="Decode" />
        <NavItem mode={AppMode.SETTINGS} icon={Settings} label="Config" />
      </nav>

      <div className="mt-auto w-full px-2 space-y-6">
        <div className="w-full aspect-square flex items-center justify-center">
           <div className={`w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-${activeColor}-500 shadow-inner transition-colors duration-500`}>
             {user.username.slice(0, 2).toUpperCase()}
           </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full aspect-square flex items-center justify-center text-slate-700 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
