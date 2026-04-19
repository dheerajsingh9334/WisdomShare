const asyncHandler = require("express-async-handler");
const Chat = require("../../models/Chat/Chat");

const buildRoomId = (userA, userB) => {
  return [userA.toString(), userB.toString()].sort().join("_");
};

const chatController = {
  getMessages: asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const messages = await Chat.find({ roomId })
      .select("sender receiver message roomId isRead createdAt")
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: messages.reverse(),
      hasMore: messages.length === limit,
      nextCursor: null,
      message: "Messages fetched successfully",
    });
  }),

  getUserChats: asyncHandler(async (req, res) => {
    const userId = req.user;
    const chats = await Chat.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .select("sender receiver message roomId isRead createdAt")
      .populate("sender receiver", "username profilePicture")
      .sort({ createdAt: -1 })
      .lean();

    // Deduplicate and get latest messages for each conversation
    const conversations = {};
    chats.forEach((chat) => {
      const otherUser =
        chat.sender._id.toString() === userId.toString()
          ? chat.receiver
          : chat.sender;
      if (
        !conversations[otherUser._id] ||
        conversations[otherUser._id].createdAt < chat.createdAt
      ) {
        conversations[otherUser._id] = chat;
      }
    });

    const conversationList = Object.values(conversations).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.json({
      success: true,
      data: conversationList,
      hasMore: false,
      nextCursor: null,
      message: "Conversations fetched successfully",
    });
  }),

  sendMessage: asyncHandler(async (req, res) => {
    const senderId = req.user;
    const { receiverId, message } = req.body;

    if (!receiverId || !message?.trim()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "receiverId and message are required",
        });
    }

    const roomId = buildRoomId(senderId, receiverId);

    const created = await Chat.create({
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
      roomId,
      isRead: false,
    });

    const saved = await Chat.findById(created._id)
      .select("sender receiver message roomId isRead createdAt")
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture")
      .lean();

    res.status(201).json({
      success: true,
      data: saved,
      hasMore: false,
      nextCursor: null,
      message: "Message sent successfully",
    });
  }),

  markRoomAsRead: asyncHandler(async (req, res) => {
    const userId = req.user;
    const { roomId } = req.params;

    const result = await Chat.updateMany(
      { roomId, receiver: userId, isRead: false },
      { $set: { isRead: true } },
    );

    res.json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      hasMore: false,
      nextCursor: null,
      message: "Messages marked as read",
    });
  }),
};

module.exports = chatController;
