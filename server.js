
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = new Map();

io.on('connection', (socket) => {
  const user = socket.handshake.auth.user;
  if (!user) return;

  const userData = { ...user, socketId: socket.id, peerId: null };
  users.set(socket.id, userData);

  socket.broadcast.emit('user_joined_mesh', user);

  users.forEach((u) => {
    if (u.socketId !== socket.id) {
      socket.emit('node_discovery', u);
    }
  });

  socket.on('sync_peer_id', (peerId) => {
    const u = users.get(socket.id);
    if (u) {
      u.peerId = peerId;
      io.emit('node_discovery', u);
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('sendMessage', (msg) => {
    if (msg.groupId) {
      socket.to(msg.groupId).emit('messageReceived', msg);
    } else if (msg.receiverId) {
      const target = Array.from(users.values()).find(u => u.id === msg.receiverId);
      if (target) {
        io.to(target.socketId).emit('messageReceived', msg);
      }
    }
  });

  socket.on('create_group', (group) => {
    socket.join(group.id);
  });

  socket.on('update_profile', (updatedUser) => {
    const u = users.get(socket.id);
    if (u) {
      Object.assign(u, updatedUser);
      socket.broadcast.emit('node_discovery', u);
    }
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`IMP Backend Live on Port ${PORT}`);
});
