import React, { useState } from 'react';
import { User, Group } from '../types';
import { 
  Plus, 
  ShieldCheck, 
  Power, 
  LayoutGrid, 
  MessageSquare, 
  Globe, 
  Settings2,
  Check,
  X,
  Bell,
  Link,
  Copy,
  Zap,
  Users,
  User as UserIcon,
  Globe2
} from 'lucide-react';

interface SidebarProps {
  contacts: User[];
  groups: Group[];
  friends: User[];
  pendingRequests: User[];
  activeId: string | null;
  onSelect: (id: string, isGroup: boolean) => void;
  onViewProfile: (id: string) => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
  onAddFriend: (id: string) => void;
  onAcceptRequest: (id: string) => void;
  onDeclineRequest: (id: string) => void;
  onSettings: () => void;
  onLogout: () => void;
  currentUser: User & { peerId?: string } | null;
  connected: boolean;
  onManualConnect: (peerId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  contacts, 
  groups, 
  friends,
  pendingRequests,
  activeId, 
  onSelect, 
  onViewProfile,
  onCreateGroup,
  onAddFriend,
  onAcceptRequest,
  onDeclineRequest,
  onSettings, 
  onLogout,
  currentUser,
  connected,
  onManualConnect
}) => {
  const [tab, setTab] = useState<'chats'|'discovery'|'node'>('chats');
  const [targetId, setTargetId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const copyId = () => {
    if (currentUser?.peerId) {
      navigator.clipboard.writeText(currentUser.peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleFinalCreateGroup = () => {
    if (newGroupName && selectedMembers.length > 0) {
      onCreateGroup(newGroupName, selectedMembers);
      setNewGroupName('');
      setSelectedMembers([]);
      setIsCreatingGroup(false);
    }
  };

  const publicGroup = groups.find(g => g.id === 'GLOBAL_MESH');
  const privateGroups = groups.filter(g => g.id !== 'GLOBAL_MESH');

  return (
    <aside className="w-[320px] flex flex-col h-full bg-zinc-950 z-20 border-r border-white/5 shadow-2xl">
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black tracking-tighter text-white">IMP <span className="text-[10px] text-zinc-600 tracking-widest">GLOBAL</span></h1>
          <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
            <span className="text-[7px] text-zinc-400 font-black uppercase">{connected ? 'MESH LIVE' : 'SYNCING'}</span>
          </div>
        </div>

        <div className="flex bg-zinc-900/60 p-1 rounded-xl mb-4 border border-zinc-800">
          <button onClick={() => setTab('chats')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black tracking-widest transition-all ${tab === 'chats' ? 'bg-white text-black' : 'text-zinc-500'}`}>CHATS</button>
          <button onClick={() => setTab('node')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black tracking-widest transition-all ${tab === 'node' ? 'bg-white text-black' : 'text-zinc-500'}`}>NODE</button>
          <button onClick={() => setTab('discovery')} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black tracking-widest transition-all ${tab === 'discovery' ? 'bg-white text-black' : 'text-zinc-500'}`}>MESH</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-4">
        {tab === 'node' && (
          <div className="space-y-6 p-2 animate-in fade-in slide-in-from-left-2">
            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
              <h3 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-3">Your Global Node ID</h3>
              <div className="flex items-center justify-between bg-black p-3 rounded-xl border border-zinc-800">
                <code className="text-[10px] font-mono text-emerald-500">{currentUser?.peerId}</code>
                <button onClick={copyId} className="text-zinc-600 hover:text-white transition-colors">
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-[7px] text-zinc-600 mt-2 font-medium">Share this with peers to bridge media connections across the internet.</p>
            </div>

            <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
              <h3 className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-3">Bridge to Peer</h3>
              <div className="flex gap-2">
                <input 
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  placeholder="imp-xxxx-xxxx"
                  className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-[10px] focus:outline-none focus:border-emerald-500 transition-all font-mono"
                />
                <button 
                  onClick={() => { onManualConnect(targetId); setTargetId(''); }}
                  className="bg-white text-black px-3 rounded-xl hover:scale-105 transition-all"
                >
                  <Zap size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'chats' && (
          <div className="space-y-4">
            {publicGroup && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest px-2">Global Lobby</span>
                <button
                  onClick={() => onSelect(publicGroup.id, true)}
                  className={`w-full flex items-center gap-3 px-3 py-4 rounded-2xl border transition-all ${
                    activeId === publicGroup.id 
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-emerald-500/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeId === publicGroup.id ? 'bg-black text-emerald-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    <Globe2 size={20} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-black text-xs tracking-tight">{publicGroup.name}</div>
                    <div className={`text-[8px] font-black uppercase tracking-widest ${activeId === publicGroup.id ? 'text-black/60' : 'text-zinc-600'}`}>All Nodes Connected</div>
                  </div>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between px-2 pt-2">
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Clusters & DMs</span>
              <button 
                onClick={() => setIsCreatingGroup(!isCreatingGroup)} 
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isCreatingGroup ? 'bg-white text-black rotate-45' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
              >
                <Plus size={14} />
              </button>
            </div>

            {isCreatingGroup && (
              <div className="p-3 bg-zinc-900/60 border border-emerald-500/20 rounded-2xl animate-in zoom-in-95 duration-200">
                <input 
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="Cluster Name"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-[10px] mb-3 focus:outline-none focus:border-emerald-500"
                />
                <div className="max-h-32 overflow-y-auto mb-3 space-y-1 pr-1">
                  {contacts.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => toggleMember(c.id)}
                      className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-[9px] font-bold transition-all ${selectedMembers.includes(c.id) ? 'bg-white text-black' : 'text-zinc-500 hover:bg-zinc-800'}`}
                    >
                      <img src={c.pfp} className="w-5 h-5 rounded-md" />
                      {c.username}
                      {selectedMembers.includes(c.id) && <Check size={10} className="ml-auto" />}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleFinalCreateGroup}
                  disabled={!newGroupName || selectedMembers.length === 0}
                  className="w-full py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-30 transition-all"
                >
                  CREATE CLUSTER
                </button>
              </div>
            )}

            <div className="space-y-1">
              {privateGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => onSelect(group.id, true)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    activeId === group.id ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-zinc-400 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <Users size={16} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-bold text-xs truncate">{group.name}</div>
                    <div className={`text-[8px] font-black uppercase tracking-widest ${activeId === group.id ? 'text-zinc-500' : 'text-zinc-600'}`}>MESH CLUSTER</div>
                  </div>
                </button>
              ))}

              {contacts.map(user => (
                <div
                  key={user.id}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeId === user.id ? 'bg-white text-black' : 'text-zinc-400 hover:bg-zinc-900/40'
                  }`}
                  onClick={() => onSelect(user.id, false)}
                >
                  <div className="relative group/avatar" onClick={(e) => { e.stopPropagation(); onViewProfile(user.id); }}>
                    <img src={user.pfp} className="w-9 h-9 rounded-full border border-zinc-800 transition-transform group-hover/avatar:scale-110" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full"></div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-bold text-xs truncate">{user.username}</div>
                    <div className={`text-[8px] font-black uppercase tracking-widest ${activeId === user.id ? 'text-zinc-500' : 'text-zinc-600'}`}>Direct Connection</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer group" onClick={() => currentUser && onViewProfile(currentUser.id)}>
            <img src={currentUser?.pfp} className="w-10 h-10 rounded-full border border-white/10 group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-opacity">
              <UserIcon size={14} className="text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black truncate">{currentUser?.username}</div>
            <div className="text-[7px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
              <ShieldCheck size={8} /> SECURE NODE
            </div>
          </div>
          <button onClick={onLogout} className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all">
            <Power size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
