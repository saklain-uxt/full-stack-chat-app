import { useEffect, useState } from "react";
import { useChatStore } from "../Store/useChatStore";
import { useAuthStore } from "../Store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    notifications,
    isVideoCallActive,
  } = useChatStore();

  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // 🔥 REFRESH USERS WHEN AUTH USER PROFILE CHANGES
  useEffect(() => {
    getUsers();
  }, [getUsers, authUser?.profilePic]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  const sidebarClasses = isVideoCallActive
    ? "hidden"
    : selectedUser
      ? "hidden lg:flex lg:w-72"
      : "flex w-full lg:w-72";

  return (
    <aside className={`h-full border-r border-base-300 flex-col transition-all duration-500 ease-in-out ${sidebarClasses}`}>
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className={`font-medium ${selectedUser ? "hidden lg:block" : ""}`}>Contacts</span>
        </div>

        {/* Online filter */}
        <div className={`mt-3 items-center gap-2 ${selectedUser ? "hidden lg:flex" : "flex"}`}>
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const userUnreadCount = notifications.filter(
            (notif) => notif.senderId === user._id
          ).length;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-3 flex items-center gap-3
                hover:bg-base-300 transition-colors
                ${
                  selectedUser?._id === user._id
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }
              `}
            >
              <div className={`relative ${selectedUser ? "mx-auto lg:mx-0" : "mx-0"}`}>
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full"
                />

                {isOnline && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500
                    rounded-full ring-2 ring-zinc-900"
                  />
                )}

                {userUnreadCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full size-4 flex items-center justify-center animate-pulse ${selectedUser ? "lg:hidden" : "hidden"}`}>
                    {userUnreadCount}
                  </span>
                )}
              </div>

              {/* User info */}
              <div className={`flex-1 items-center justify-between min-w-0 ${selectedUser ? "hidden lg:flex" : "flex"}`}>
                <div className="text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {isOnline ? "Online" : "Offline"}
                  </div>
                </div>
                {userUnreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-2 animate-pulse">
                    {userUnreadCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            No users
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
