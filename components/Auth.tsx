
import React, { useState } from 'react';
import { Key, Lock, Activity, User as UserIcon, ShieldCheck, Mail } from 'lucide-react';
import { UsersDB } from '../services/databaseService';

interface AuthProps {
  onLogin: (username: string, email: string, pfp: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pfpSeed, setPfpSeed] = useState(Math.random().toString(36).substr(2, 5));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pfpUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${pfpSeed}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    if (!cleanUsername || !cleanEmail || !password.trim()) {
      setError('ALL CREDENTIALS REQUIRED');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userId = cleanUsername.toLowerCase().replace(/\s/g, '_');
      const existing = await UsersDB.find({ id: userId });
      
      if (existing.length > 0) {
        setError('ALIAS UNAVAILABLE ON THIS MESH');
        setLoading(false);
        return;
      }
      
      setTimeout(() => {
        onLogin(cleanUsername, cleanEmail, pfpUrl);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('AUTH TIMEOUT');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-[360px] p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem] shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="relative group cursor-pointer mb-4" onClick={() => setPfpSeed(Math.random().toString(36).substr(2, 5))}>
            <img src={pfpUrl} className="w-20 h-20 rounded-3xl border-2 border-white/10 shadow-xl transition-all group-hover:scale-105" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-3xl transition-opacity">
              <Activity size={20} className="text-white" />
            </div>
          </div>
          <h1 className="text-xl font-black tracking-tighter mb-1 uppercase">IMP PRO PORTAL</h1>
          <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em]">Handshake Protocol v2.4</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <UserIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" />
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-900 border border-zinc-800 text-white pl-12 pr-6 py-3.5 rounded-2xl focus:outline-none focus:border-white transition-all text-xs font-bold placeholder:text-zinc-700"
              placeholder="Alias (e.g. Ghost)"
            />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" />
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-900 border border-zinc-800 text-white pl-12 pr-6 py-3.5 rounded-2xl focus:outline-none focus:border-white transition-all text-xs font-bold placeholder:text-zinc-700"
              placeholder="email@mesh.node"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700" />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-zinc-900 border border-zinc-800 text-white pl-12 pr-6 py-3.5 rounded-2xl focus:outline-none focus:border-white transition-all text-xs font-bold placeholder:text-zinc-700"
              placeholder="Vault Token"
            />
          </div>
          
          {error && (
            <div className="py-1 text-[8px] text-red-500 font-black uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-6 shadow-xl"
          >
            {loading ? 'SYNCING...' : 'INITIALIZE LINK'}
          </button>
        </form>

        <div className="mt-10 flex items-center justify-center gap-8 opacity-5">
          <ShieldCheck size={20} />
          <Key size={20} />
        </div>
      </div>
    </div>
  );
};

export default Auth;
