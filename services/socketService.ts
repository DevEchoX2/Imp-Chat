
import { Peer, DataConnection, MediaConnection } from 'peerjs';
import { User, Message, Group } from '../types';

type SocketCallback = (data: any) => void;

class GlobalPeerSocket {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private handlers: { [key: string]: SocketCallback[] } = {};
  public myPeerId: string = '';
  public connected: boolean = false;

  constructor() {}

  async connect(user: User): Promise<string> {
    return new Promise((resolve) => {
      const peerId = `imp-${user.id}-${Math.random().toString(36).substr(2, 4)}`;
      this.peer = new Peer(peerId);

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        this.connected = true;
        console.log('Connected to Global Mesh with ID:', id);
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('Peer Error:', err);
      });
    });
  }

  private setupConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.trigger('user_connected', { peerId: conn.peer });
    });

    conn.on('data', (data: any) => {
      const { type, payload } = data as { type: string, payload: any };
      if (this.handlers[type]) {
        this.handlers[type].forEach(cb => cb(payload));
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.trigger('user_disconnected', { peerId: conn.peer });
    });
  }

  on(event: string, callback: SocketCallback) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(callback);
  }

  private trigger(event: string, data: any) {
    if (this.handlers[event]) {
      this.handlers[event].forEach(cb => cb(data));
    }
  }

  emit(event: string, payload: any, targetPeerId?: string) {
    const packet = { type: event, payload };
    
    if (targetPeerId) {
      const conn = this.connections.get(targetPeerId);
      if (conn) conn.send(packet);
    } else {
      this.connections.forEach(conn => conn.send(packet));
    }
  }

  connectToPeer(targetPeerId: string) {
    if (!this.peer || targetPeerId === this.myPeerId) return;
    const conn = this.peer.connect(targetPeerId);
    this.setupConnection(conn);
  }

  getPeerInstance() {
    return this.peer;
  }

  disconnect() {
    this.peer?.destroy();
    this.connected = false;
    this.connections.clear();
  }
}

export const socket = new GlobalPeerSocket();
