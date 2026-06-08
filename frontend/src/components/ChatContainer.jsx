import { useEffect, useRef } from "react";
import { useChatStore } from "../Store/useChatStore";
import { useAuthStore } from "../Store/useAuthStore";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import VideoCall from "./VideoCall";

import { formatMessageTime, formatMessageDateHeader } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToBroadcast,
    getBroadcasts,
    isVideoCallActive,
    markNotificationsAsRead,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    getBroadcasts();
    markNotificationsAsRead(selectedUser._id);

    subscribeToMessages();
    subscribeToBroadcast();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    subscribeToBroadcast,
    getBroadcasts,
    markNotificationsAsRead,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Group messages and build the list rendering array inserting relative date headers
  const renderedMessages = [];
  let lastDateHeader = null;

  messages.forEach((message, index) => {
    const header = formatMessageDateHeader(message.createdAt);
    if (header !== lastDateHeader) {
      renderedMessages.push(
        <div key={`date-${header}-${index}`} className="flex justify-center my-4">
          <span className="bg-base-200 text-base-content/60 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
            {header}
          </span>
        </div>
      );
      lastDateHeader = header;
    }

    renderedMessages.push(
      <div
        key={message._id}
        className={`chat ${
          message.senderId === authUser._id ? "chat-end" : "chat-start"
        }`}
        ref={index === messages.length - 1 ? messageEndRef : null}
      >
        <div className="chat-image avatar">
          <div className="size-10 rounded-full border">
            <img
              src={
                message.senderId === authUser._id
                  ? authUser.profilePic || "/avatar.png"
                  : selectedUser.profilePic || "/avatar.png"
              }
              alt="profile pic"
            />
          </div>
        </div>
        <div className="chat-header mb-1">
          <time className="text-xs opacity-50 ml-1">
            {formatMessageTime(message.createdAt)}
          </time>
        </div>
        <div className="chat-bubble flex flex-col">
          {message.image && (
            <img
              src={message.image}
              alt="Attachment"
              className="sm:max-w-[200px] rounded-md mb-2"
            />
          )}
          {message.text && <p>{message.text}</p>}
        </div>
      </div>
    );
  });

  const messageList = (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {renderedMessages}
    </div>
  );

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex min-w-0 flex-col overflow-hidden">
      <ChatHeader />
      {messageList}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
