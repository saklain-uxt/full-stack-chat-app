


import { X } from "lucide-react";
import { useChatStore } from "../Store/useChatStore";


const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  



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
          {/* {isIncomingCall ? (
            <button
              onClick={answerCall}
              className="bg-green-600 text-white px-4 py-1 rounded-full animate-pulse"
            >
              Accept
            </button>
          ) : (
            <button onClick={startVideoCall}>
              <Video className="w-6 h-6" />
            </button>
          )} */}

          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;

