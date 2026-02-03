
import React from 'react';
import { User } from '../types';
import { ArrowLeft, MessageSquare, Video, Shield, MapPin, Globe, Calendar } from 'lucide-react';

interface ProfileProps {
  user: User & { peerId?: string };
  onBack: () => void;
  onMessage: (userId: string) => void;
  onCall: (userId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onBack, onMessage, onCall }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-y-auto scrollbar-hide animate-in fade-in duration-500">
      <div className="h-64 relative shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/20 to-black"></div>
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 p-3 bg-black/50 backdrop-blur-xl border border-white/5 rounded-2xl text-white hover:bg-white hover:text-black transition-all z-10"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="px-12 -mt-24 relative z-10 flex flex-col items-center">
        <div className="relative group">
          <img 
            src={user.pfp} 
            className="w-40 h-40 rounded-[3rem] border-4 border-black shadow-2xl transition-transform group-hover:scale-105" 
            alt={user.username}
          />
          <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-black ${
            user.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-600'
          }`}></div>
        </div>

        <h1 className="mt-8 text-4xl font-black tracking-tighter text-white uppercase">{user.username}</h1>
        <p className="text-zinc-500 font-mono text-xs mt-2 tracking-widest uppercase">ID: {user.peerId || user.id}</p>

        <div className="flex items-center gap-4 mt-10">
          <button 
            onClick={() => onMessage(user.id)}
            className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <MessageSquare size={16} /> TRANSMIT
          </button>
          <button 
            onClick={() => onCall(user.id)}
            className="px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border border-white/5 flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-xl"
          >
            <Video size={16} /> CALL NODE
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-16 pb-20">
          <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] space-y-6">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Node Metadata</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-zinc-300">Security Layer</span>
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase">E2EE ACTIVE</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-zinc-500" />
                <span className="text-xs font-bold text-zinc-300">Region</span>
              </div>
              <span className="text-[10px] font-black text-zinc-500 uppercase">Global Mesh</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-zinc-500" />
                <span className="text-xs font-bold text-zinc-300">Node Uptime</span>
              </div>
              <span className="text-[10px] font-black text-zinc-500 uppercase">99.9%</span>
            </div>
          </div>

          <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] space-y-6">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Connection Logs</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-mono text-zinc-400">Handshake verified @ {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-mono text-zinc-400">RSA-OAEP Key Exchange Complete</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-mono text-zinc-400">Mesh route optimized: Node -> Peer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
