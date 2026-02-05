import React, { useState, useEffect, useRef } from 'react';
import { AppView, AppState, Message, User, Group, Toast } from './types';
import { ParticleBackground } from './components/ParticleBackground';
import { socket } from './services/socketService';
import { UsersDB, MessagesDB, GroupsDB } from './services/databaseService';
import { CryptoService } from './services/cryptoService';
import { Bell, X } from 'lucide-react';

import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import VideoCall from './components/VideoCall';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Profile from './components/Profile';

const PUBLIC_ROOM_ID = 'GLOBAL_MESH';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    currentView: AppView.LOGIN,
    activeChatId: PUBLIC_ROOM_ID,
    viewingProfileId: null,
    isGroupChat: true,
    messages: [],
    groups: [{ id: PUBLIC_ROOM_ID, name: 'PUBLIC MESH', members: [] }],
    contacts: [],
    friends: [],
    pendingFriendRequests: [],
    activeCallParticipants: [],
    isVoiceOnly: false,
    connected: false,
    toasts: [],
    settings: {
      oggEnabled: false,
      particlesEnabled: true,
      filterEnabled: true,
      encryptionLevel: 'Military'
    }
  });

  const privateKeyRef = useRef<CryptoKey | null>(null);
  const [myPeerId, setMyPeerId] = useState('');

  const addToast = (title: string, message: string, pfp?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts, { id, title, message, pfp }]
    }));
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        toasts: prev.toasts.filter(t => t.id !== id)
      }));
    }, 5000);
  };

  useEffect(() => {
    const init = async () => {
      const storedGroups = await GroupsDB.find();
      const storedMessages = await MessagesDB.find();
      
      const persistentUserStr = localStorage.getItem('imp_user');
      if (persistentUserStr) {
        const user = JSON.parse(persistentUserStr);
        const keyPair = await CryptoService.generateKeyPair();
        privateKeyRef.current = keyPair.privateKey;
        user.publicKey = await CryptoService.exportPublicKey(keyPair.publicKey);
        
        const peerId = await socket.connect(user);
        setMyPeerId(peerId);
        socket.joinRoom(PUBLIC_ROOM_ID);
        
        setState(prev => ({ 
          ...prev, 
          currentUser: user, 
          currentView: AppView.CHAT,
          groups: [...prev.groups, ...storedGroups.filter(g => g.id !== PUBLIC_ROOM_ID)],
          messages: storedMessages,
          connected: true,
          activeChatId: PUBLIC_ROOM_ID,
          isGroupChat: true
        }));
      }
    };
    init();
  }, []);

  useEffect(() => {
    socket.on('messageReceived', async (msg: Message) => {
      const isForMe = msg.receiverId === state.currentUser?.id;
      const isForMyGroup = msg.groupId && state.groups.some(g => g.id === msg.groupId);

      if (!isForMe && !isForMyGroup) return;

      if (isForMe && msg.encrypted && privateKeyRef.current) {
        try {
          msg.originalText = await CryptoService.decrypt(msg.text, privateKeyRef.current);
        } catch (e) {
          msg.originalText = "[Decryption Failed]";
        }
      }
      
      setState(prev => {
        if (prev.messages.some(m => m.id === msg.id)) return prev;
        
        const sender = prev.contacts.find(c => c.id === msg.senderId);
        const isActiveChat = prev.activeChatId === (msg.groupId || msg.senderId);
        
        if (!isActiveChat && sender) {
          addToast(
            msg.groupId === PUBLIC_ROOM_ID ? 'Public Transmission' : (msg.groupId ? 'Cluster Signal' : 'Direct Signal'),
            msg.originalText || msg.text,
            sender.pfp
          );
        }

        return { ...prev, messages: [...prev.messages, msg] };
      });
      MessagesDB.insertOne(msg);
    });

    socket.on('node_discovery', (remoteUser: User & { peerId: string }) => {
      setState(prev => {
        const exists = prev.contacts.some(c => c.id === remoteUser.id);
        if (exists) {
          return {
            ...prev,
            contacts: prev.contacts.map(c => c.id === remoteUser.id ? remoteUser : c)
          };
        }
        return { ...prev, contacts: [...prev.contacts, remoteUser] };
      });
    });

    socket.on('user_joined_mesh', (userData: User) => {
      addToast('Node Online', `${userData.username} has joined the mesh.`);
    });

  }, [state.currentUser, myPeerId, state.groups]);

  const handleLogin = async (username: string, email: string, pfp: string) => {
    const userId = username.toLowerCase().replace(/\s/g, '_');
    const newUser: User = {
      id: userId,
      username,
      email,
      pfp,
      bio: 'New Mesh Node.',
      status: 'online',
      friends: [],
      pendingRequests: [],
      sentRequests: []
    };
    
    const keyPair = await CryptoService.generateKeyPair();
    privateKeyRef.current = keyPair.privateKey;
    newUser.publicKey = await CryptoService.exportPublicKey(keyPair.publicKey);

    const peerId = await socket.connect(newUser);
    setMyPeerId(peerId);
    socket.joinRoom(PUBLIC_ROOM_ID);

    localStorage.setItem('imp_user', JSON.stringify(newUser));
    
    setState(prev => ({ 
      ...prev, 
      currentUser: newUser, 
      currentView: AppView.CHAT, 
      connected: true,
      activeChatId: PUBLIC_ROOM_ID,
      isGroupChat: true
    }));
  };

  const updateProfile = (bio: string) => {
    if (!state.currentUser) return;
    const updated = { ...state.currentUser, bio };
    localStorage.setItem('imp_user', JSON.stringify(updated));
    setState(prev => ({ ...prev, currentUser: updated }));
    socket.emit('update_profile', updated);
  };

  const viewingUser = state.viewingProfileId === state.currentUser?.id 
    ? { ...state.currentUser!, peerId: myPeerId }
    : state.contacts.find(c => c.id === state.viewingProfileId);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {state.settings.particlesEnabled && <ParticleBackground />}
      
      <div className="fixed top-6 right-6 z-[200] space-y-3 w-80 pointer-events-none">
        {state.toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto flex items-center gap-4 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300">
            {toast.pfp && <img src={toast.pfp} className="w-10 h-10 rounded-full border border-white/10" />}
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">{toast.title}</h4>
              <p className="text-[11px] text-zinc-300 truncate font-medium">{toast.message}</p>
            </div>
            <button 
              onClick={() => setState(prev => ({ ...prev, toasts: prev.toasts.filter(t => t.id !== toast.id) }))}
              className="text-zinc-600 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {state.currentView === AppView.LOGIN ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <>
          <Sidebar 
            contacts={state.contacts}
            groups={state.groups}
            friends={state.friends}
            pendingRequests={state.pendingFriendRequests}
            activeId={state.activeChatId}
            onSelect={(id, isGroup) => setState(prev => ({ ...prev, activeChatId: id, isGroupChat: isGroup, currentView: AppView.CHAT }))}
            onViewProfile={(id) => setState(prev => ({ ...prev, viewingProfileId: id, currentView: AppView.PROFILE }))}
            onCreateGroup={(name, memberIds) => {
              const groupId = `group-${Math.random().toString(36).substr(2, 9)}`;
              const newGroup = { id: groupId, name, members: [state.currentUser!.id, ...memberIds] };
              socket.emit('create_group', newGroup);
              setState(prev => ({ ...prev, groups: [...prev.groups, newGroup] }));
              GroupsDB.insertOne(newGroup);
            }} 
            onAddFriend={() => {}}
            onAcceptRequest={() => {}}
            onDeclineRequest={() => {}}
            onSettings={() => setState(prev => ({ ...prev, currentView: AppView.SETTINGS }))}
            onLogout={() => { 
              socket.disconnect(); 
              localStorage.removeItem('imp_user');
              setState(prev => ({ ...prev, currentUser: null, currentView: AppView.LOGIN, connected: false })); 
            }}
            currentUser={{ ...state.currentUser!, peerId: myPeerId } as any}
            connected={state.connected}
            onManualConnect={id => socket.connectToPeer(id)}
          />
          
          <main className="flex-1 flex flex-col relative z-10">
            {state.currentView === AppView.CHAT && (
              <ChatWindow 
                activeId={state.activeChatId}
                isGroup={state.isGroupChat}
                messages={state.messages}
                contacts={state.contacts}
                friends={state.friends}
                groups={state.groups}
                currentUser={state.currentUser!}
                settings={state.settings}
                onSendMessage={(text) => {
                  const newMessage: Message = {
                    id: Math.random().toString(36).substr(2, 9),
                    senderId: state.currentUser!.id,
                    text: text,
                    timestamp: Date.now(),
                    encrypted: !state.isGroupChat,
                    originalText: text,
                    groupId: state.isGroupChat ? state.activeChatId! : undefined,
                    receiverId: !state.isGroupChat ? state.activeChatId! : undefined
                  };
                  
                  setState(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
                  MessagesDB.insertOne(newMessage);
                  socket.emit('sendMessage', newMessage);
                }}
                onStartCall={(voice) => setState(prev => ({ ...prev, currentView: AppView.VIDEO_CALL, isVoiceOnly: voice }))}
              />
            )}
            
            {state.currentView === AppView.PROFILE && viewingUser && (
              <Profile 
                user={viewingUser as any}
                onBack={() => setState(prev => ({ ...prev, currentView: AppView.CHAT }))}
                onMessage={(userId) => setState(prev => ({ ...prev, activeChatId: userId, isGroupChat: false, currentView: AppView.CHAT }))}
                onCall={(userId) => setState(prev => ({ ...prev, activeChatId: userId, currentView: AppView.VIDEO_CALL, isVoiceOnly: false }))}
              />
            )}

            {state.currentView === AppView.VIDEO_CALL && (
              <VideoCall 
                onEndCall={() => setState(prev => ({ ...prev, currentView: AppView.CHAT }))}
                activeId={state.activeChatId}
                isGroup={state.isGroupChat}
                participants={[state.currentUser!, ...state.contacts.slice(0, 3)]}
                isVoiceOnly={state.isVoiceOnly}
                peer={socket.getPeerInstance()}
              />
            )}
            
            {state.currentView === AppView.SETTINGS && (
              <Settings 
                settings={state.settings}
                currentUser={state.currentUser!}
                updateSettings={s => setState(prev => ({ ...prev, settings: s }))}
                updateBio={updateProfile}
                onBack={() => setState(prev => ({ ...prev, currentView: AppView.CHAT }))}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
