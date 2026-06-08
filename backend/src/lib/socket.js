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

const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}


io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  socket.userId = userId;

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("call-user", ({ toUserId, offer }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (!receiverSocketId) {
      socket.emit("call-unavailable", { toUserId });
      return;
    }

    io.to(receiverSocketId).emit("incoming-call", {
      fromUserId: userId,
      offer,
    });
  });

  socket.on("answer-call", ({ toUserId, answer }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-answered", {
        fromUserId: userId,
        answer,
      });
    }
  });

  socket.on("end-call", ({ toUserId }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-ended", { fromUserId: userId });
    }
  });

  socket.on("ice-candidate", ({ toUserId, candidate }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ice-candidate", {
        fromUserId: userId,
        candidate,
      });
    }
  });


  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
