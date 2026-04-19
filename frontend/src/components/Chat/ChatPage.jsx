import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversationsAPI,
  fetchMessagesAPI,
  markRoomAsReadAPI,
  sendMessageAPI,
} from "../../APIServices/chat/chatAPI";
import {
  clearMessageDraft,
  setMessageDraft,
  setSelectedConversation,
} from "../../redux/slices/chatSlice";

const buildRoomId = (userA, userB) =>
  [userA, userB].map(String).sort().join("_");

const formatMessageTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ChatPage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const location = useLocation();

  const currentUserId = useSelector((state) => {
    const auth = state.auth?.userAuth;
    return (
      auth?._id ||
      auth?.id ||
      auth?.user?._id ||
      auth?.data?.user?._id ||
      auth?.userInfo?.data?.user?._id ||
      null
    );
  });
  const selectedConversation = useSelector(
    (state) => state.chat?.selectedConversation,
  );
  const messageDraft = useSelector((state) => state.chat?.messageDraft || "");
  const [localMessage, setLocalMessage] = useState(messageDraft);

  const searchParams = new URLSearchParams(location.search);
  const targetUserId = searchParams.get("userId");
  const targetUsername = searchParams.get("username") || "User";

  const { data: conversationsResp, isLoading: isLoadingConversations } =
    useQuery({
      queryKey: ["chat", "conversations"],
      queryFn: fetchConversationsAPI,
      enabled: Boolean(currentUserId),
      refetchInterval: 15000,
      staleTime: 10000,
    });

  const conversations = conversationsResp?.data || [];

  const normalizedConversations = useMemo(() => {
    return conversations.map((chat) => {
      const sender = chat.sender;
      const receiver = chat.receiver;
      const isSender = String(sender?._id) === String(currentUserId);
      const peer = isSender ? receiver : sender;

      return {
        roomId: chat.roomId,
        peer,
        latestMessage: chat.message,
        createdAt: chat.createdAt,
      };
    });
  }, [conversations, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    if (targetUserId) {
      const roomId = buildRoomId(currentUserId, targetUserId);
      const selectedRoomId = selectedConversation?.roomId;
      const selectedPeerId = selectedConversation?.peer?._id;
      const selectedPeerName = selectedConversation?.peer?.username || "User";

      // Prevent dispatch loops by only updating store when target conversation changes.
      if (
        String(selectedRoomId || "") !== String(roomId) ||
        String(selectedPeerId || "") !== String(targetUserId) ||
        selectedPeerName !== targetUsername
      ) {
        dispatch(
          setSelectedConversation({
            roomId,
            peer: { _id: targetUserId, username: targetUsername },
          }),
        );
      }
      return;
    }

    if (!selectedConversation && normalizedConversations.length > 0) {
      dispatch(setSelectedConversation(normalizedConversations[0]));
    }
  }, [
    currentUserId,
    dispatch,
    normalizedConversations,
    selectedConversation,
    targetUserId,
    targetUsername,
  ]);

  const activeRoomId = selectedConversation?.roomId;

  const { data: messagesResp, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["chat", "messages", activeRoomId],
    queryFn: () => fetchMessagesAPI(activeRoomId),
    enabled: Boolean(activeRoomId),
    refetchInterval: 5000,
    staleTime: 3000,
  });

  const messages = messagesResp?.data || [];

  const markReadMutation = useMutation({
    mutationFn: markRoomAsReadAPI,
  });

  useEffect(() => {
    if (!activeRoomId) return;
    markReadMutation.mutate(activeRoomId);
  }, [activeRoomId]);

  const sendMessageMutation = useMutation({
    mutationFn: sendMessageAPI,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: ["chat", "messages", activeRoomId],
      });
      const previous = queryClient.getQueryData([
        "chat",
        "messages",
        activeRoomId,
      ]);

      const optimisticMessage = {
        _id: `optimistic-${Date.now()}`,
        sender: { _id: currentUserId, username: "You" },
        receiver: { _id: payload.receiverId },
        message: payload.message,
        roomId: activeRoomId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["chat", "messages", activeRoomId], (old) => {
        const oldMessages = old?.data || [];
        return { ...(old || {}), data: [...oldMessages, optimisticMessage] };
      });

      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["chat", "messages", activeRoomId],
          context.previous,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", activeRoomId],
      });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      dispatch(clearMessageDraft());
      setLocalMessage("");
    },
  });

  const handleSend = () => {
    const text = localMessage.trim();
    const receiverId = selectedConversation?.peer?._id;

    if (!text || !receiverId || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      receiverId,
      message: text,
    });
  };

  const onDraftChange = (value) => {
    setLocalMessage(value);
    dispatch(setMessageDraft(value));
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <aside className="lg:col-span-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Conversations
            </h2>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {isLoadingConversations ? (
              <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                Loading conversations...
              </p>
            ) : normalizedConversations.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                No conversations yet.
              </p>
            ) : (
              normalizedConversations.map((conversation) => {
                const isActive =
                  selectedConversation?.roomId === conversation.roomId;
                return (
                  <button
                    key={conversation.roomId}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() =>
                      dispatch(setSelectedConversation(conversation))
                    }
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {conversation.peer?.username || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {conversation.latestMessage || "No messages yet"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="lg:col-span-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex flex-col min-h-[70vh]">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedConversation?.peer?.username || "Select a conversation"}
            </h3>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {!activeRoomId ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a conversation from the left.
              </p>
            ) : isLoadingMessages ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading messages...
              </p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No messages yet. Start the conversation.
              </p>
            ) : (
              messages.map((msg) => {
                const mine = String(msg.sender?._id) === String(currentUserId);
                return (
                  <div
                    key={msg._id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        mine
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p
                        className={`text-[10px] mt-1 ${mine ? "text-blue-100" : "text-gray-400"}`}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            {sendMessageMutation.isError && (
              <p className="mb-2 text-xs text-red-500">
                {sendMessageMutation.error?.response?.data?.message ||
                  sendMessageMutation.error?.message ||
                  "Failed to send message"}
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={localMessage}
                onChange={(e) => onDraftChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="Type a message"
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                disabled={!activeRoomId}
              />
              <button
                onClick={handleSend}
                disabled={
                  !activeRoomId ||
                  !localMessage.trim() ||
                  sendMessageMutation.isPending
                }
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatPage;
