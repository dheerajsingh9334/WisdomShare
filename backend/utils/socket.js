const { Server } = require("socket.io");
const Chat = require("../models/Chat/Chat");

let io;

// Map: userId (string) -> Set of socketIds
const userSocketMap = new Map();

/**
 * Register a socket for a user. Handles multiple tabs/devices.
 */
const registerUser = (userId, socketId) => {
  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, new Set());
  }
  userSocketMap.get(userId).add(socketId);
};

/**
 * Unregister a socket. Returns true if the user is now fully offline.
 */
const unregisterSocket = (socketId) => {
  let offlineUserId = null;
  for (const [userId, sockets] of userSocketMap.entries()) {
    if (sockets.has(socketId)) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        userSocketMap.delete(userId);
        offlineUserId = userId;
      }
      break;
    }
  }
  return offlineUserId;
};

/**
 * Get all online user IDs.
 */
const getOnlineUsers = () => Array.from(userSocketMap.keys());

/**
 * Send an event to all sockets of a specific user.
 */
const sendToUser = (userId, event, data) => {
  if (!io) return;
  const sockets = userSocketMap.get(userId.toString());
  if (sockets) {
    for (const socketId of sockets) {
      io.to(socketId).emit(event, data);
    }
  }
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow all localhost dev origins + FRONTEND_URL
        const allowed = [
          process.env.FRONTEND_URL,
          process.env.ADMIN_FRONTEND_URL,
          "http://localhost:5173",
          "http://localhost:3000",
        ].filter(Boolean);
        if (!origin || allowed.includes(origin) || /localhost:\d+/.test(origin) || /\.vercel\.app$/.test(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive for now – tighten in production
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── User authentication / presence ──────────────────────────────────────
    socket.on("user_connected", (userId) => {
      if (!userId) return;
      registerUser(userId.toString(), socket.id);
      // Join a private room for targeted events
      socket.join(`user:${userId}`);
      // Broadcast updated online list
      io.emit("online_users", getOnlineUsers());
      console.log(`👤 User ${userId} is online (socket: ${socket.id})`);
    });

    // ─── Chat rooms ───────────────────────────────────────────────────────────
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`👥 Socket ${socket.id} joined room: ${roomId}`);
    });

    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
    });

    // ─── Messaging ────────────────────────────────────────────────────────────
    socket.on("send_message", async (data) => {
      const { senderId, receiverId, message, roomId } = data;

      if (!senderId || !receiverId || !message || !roomId) return;

      try {
        // Save message to database
        const newChat = await Chat.create({
          sender: senderId,
          receiver: receiverId,
          message: message.trim(),
          roomId,
        });

        // Populate sender info
        const populated = await Chat.findById(newChat._id)
          .populate("sender", "username profilePicture")
          .populate("receiver", "username profilePicture");

        // Broadcast to the room (all participants including sender for confirmation)
        io.to(roomId).emit("receive_message", populated);
      } catch (error) {
        console.error("❌ Error saving chat message:", error);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    // ─── Typing indicators ────────────────────────────────────────────────────
    socket.on("typing", ({ roomId, userId, username }) => {
      socket.to(roomId).emit("user_typing", { userId, username });
    });

    socket.on("stop_typing", ({ roomId, userId }) => {
      socket.to(roomId).emit("user_stop_typing", { userId });
    });

    // ─── Read receipts ────────────────────────────────────────────────────────
    socket.on("mark_read", async ({ roomId, userId }) => {
      try {
        await Chat.updateMany(
          { roomId, receiver: userId, isRead: false },
          { $set: { isRead: true } }
        );
        // Notify the room that messages were read
        socket.to(roomId).emit("messages_read", { roomId, userId });
      } catch (err) {
        console.error("❌ Error marking messages as read:", err);
      }
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      const offlineUserId = unregisterSocket(socket.id);
      if (offlineUserId) {
        io.emit("online_users", getOnlineUsers());
        console.log(`🔴 User ${offlineUserId} went offline`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO, sendToUser, getOnlineUsers };
