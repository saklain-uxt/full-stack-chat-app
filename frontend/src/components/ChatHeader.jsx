


import { Code2, MessageSquare, Phone, PhoneCall, X } from "lucide-react";
import { useChatStore } from "../Store/useChatStore";
import { useCallStore } from "../Store/useCallStore";


const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { startCall, isCalling, isReceiving, answerCall } = useCallStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">

        {/* User Info */}
        <div className="flex items-center gap-3">
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3>{selectedUser.fullName}</h3>
          </div>
        </div>

        {/* RIGHT ACTION */}
        <div className="flex items-center gap-4">
          {isReceiving ? (
            <button
              onClick={answerCall}
              className="btn btn-success btn-sm gap-2"
            >
              <PhoneCall className="size-4" />
              Accept
            </button>
          ) : (
            <button
              onClick={() => startCall(selectedUser._id)}
              className="btn btn-sm gap-2"
              disabled={isCalling}
            >
              <Phone className="size-4" />
              <span className="hidden sm:inline">
                {isCalling ? "Calling" : "Call"}
              </span>
            </button>
          )}

          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
