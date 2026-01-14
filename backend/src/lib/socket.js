import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// ================== ONLINE USERS ==================
const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  socket.userId = userId; // ✅ STORE USER ID ON SOCKET

  if (userId) userSocketMap[userId] = socket.id;

  // 🔹 CHAT FEATURE (UNCHANGED)
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ================== VIDEO CALL SIGNALING ==================

  //  CALLER clicks START


  //  RECEIVER clicks ACCEPT
 

  //End Call
 

  //  ICE CANDIDATES (UNCHANGED)
 

  // ================== DISCONNECT ==================
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);

    delete userSocketMap[userId];

    // 🔹 CHAT FEATURE (UNCHANGED)
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
