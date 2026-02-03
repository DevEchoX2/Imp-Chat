
export enum AppView {
  LOGIN = 'LOGIN',
  CHAT = 'CHAT',
  VIDEO_CALL = 'VIDEO_CALL',
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE'
}

export interface User {
  id: string;
  username: string;
  email: string; 
  pfp: string;
  bio?: string;
  status: 'online' | 'offline' | 'away';
  isTyping?: boolean;
  publicKey?: string;
  friends: string[]; 
  pendingRequests: string[]; 
  sentRequests: string[]; 
}

export interface Message {
  id: string;
  senderId: string;
  text: string; 
  timestamp: number;
  encrypted: boolean;
  groupId?: string;
  receiverId?: string;
  originalText?: string; 
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  lastMessage?: string;
}

export interface Toast {
  id: string;
  title: string;
  message: string;
  pfp?: string;
}

export interface AppState {
  currentUser: User | null;
  currentView: AppView;
  activeChatId: string | null;
  viewingProfileId?: string | null;
  isGroupChat: boolean;
  messages: Message[];
  groups: Group[];
  contacts: User[]; 
  friends: User[]; 
  pendingFriendRequests: User[]; 
  activeCallParticipants: User[]; 
  isVoiceOnly: boolean; 
  connected: boolean;
  toasts: Toast[];
  settings: {
    oggEnabled: boolean;
    particlesEnabled: boolean;
    filterEnabled: boolean;
    encryptionLevel: 'Standard' | 'Military' | 'Quantum';
  };
}
