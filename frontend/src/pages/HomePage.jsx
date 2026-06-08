


import { useChatStore } from "../Store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import VideoCall from "../components/VideoCall";

const HomePage = () => {
  const { selectedUser, isVideoCallActive } = useChatStore();

  return (
    <div className="h-screen bg-base-200 overflow-hidden">
      <div className={`flex items-center justify-center transition-all duration-500 ease-in-out relative ${isVideoCallActive ? "pt-0 px-0 h-screen w-screen z-50" : "pt-20 px-4 h-[calc(100vh-8rem)] z-0"}`}>
        <div className={`bg-base-100 shadow-xl w-full h-full transition-all duration-500 ease-in-out ${isVideoCallActive ? "rounded-none max-w-none" : "rounded-lg max-w-[1600px]"}`}>
          <div className="flex h-full overflow-hidden relative">
            <Sidebar />

            {isVideoCallActive ? (
              <div className="flex-1 flex min-w-0 flex-col overflow-hidden h-full w-full">
                <VideoCall />
              </div>
            ) : !selectedUser ? (
              <NoChatSelected />
            ) : (
              <ChatContainer />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
