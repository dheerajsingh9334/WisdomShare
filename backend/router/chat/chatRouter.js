const express = require("express");
const chatController = require("../../controllers/chat/chatController");
const isAuthenticated = require("../../middlewares/isAuthenticated");

const chatRouter = express.Router();

chatRouter.get(
  "/messages/:roomId",
  isAuthenticated,
  chatController.getMessages,
);
chatRouter.get("/conversations", isAuthenticated, chatController.getUserChats);
chatRouter.post("/messages", isAuthenticated, chatController.sendMessage);
chatRouter.patch(
  "/messages/read/:roomId",
  isAuthenticated,
  chatController.markRoomAsRead,
);

module.exports = chatRouter;
