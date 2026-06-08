import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // ================== STATE ==================
  messages: [],
  broadcasts: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  notifications: [],

  // 🔥 Video UI control
  isVideoCallActive: false,

  // ================== USERS ==================
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // ================== MESSAGES ==================
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  // ================== BROADCASTS ==================
  getBroadcasts: async () => {
    try {
      const res = await axiosInstance.get("/messages/broadcasts");
      set({ broadcasts: res.data });
    } catch {
      toast.error("Failed to load broadcasts");
    }
  },

  // ================== SOCKET ==================
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage"); // ✅ prevent duplicates

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({ messages: [...get().messages, newMessage] });
    });
  },

  subscribeToBroadcast: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("receiveMessage"); // ✅ prevent duplicates

    socket.on("receiveMessage", (message) => {
      set({ broadcasts: [...get().broadcasts, message] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("receiveMessage");
  },

  // ================== VIDEO CALL ==================
  

 

  // ================== UI ==================
  setSelectedUser: (selectedUser) =>{
    const currentUser = get().selectedUser;
    if(currentUser && selectedUser && currentUser._id===selectedUser._id){
      return;
    }

    if (selectedUser) {
      get().markNotificationsAsRead(selectedUser._id);
    }
   
    set({
      selectedUser,
      // messages: [],
     // isVideoCallActive: false, //  close video on chat switch
    })},

  setVideoCallActive:(value)=>set({ isVideoCallActive:value}),

  // ================== NOTIFICATIONS ==================
  getNotifications: async () => {
    try {
      const res = await axiosInstance.get("/messages/notifications");
      set({ notifications: res.data });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },

  markNotificationsAsRead: async (senderId) => {
    try {
      await axiosInstance.put(`/messages/notifications/read/${senderId}`);
      set({
        notifications: get().notifications.filter(
          (notif) => notif.senderId !== senderId
        ),
      });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  },

  subscribeToNotifications: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Fetch initial unread notifications from DB on connection
    get().getNotifications();

    socket.off("newNotification"); // prevent duplicates

    socket.on("newNotification", (notification) => {
      const { selectedUser } = get();
      // If we are currently chatting with the sender, mark it read immediately
      if (selectedUser && notification.senderId === selectedUser._id) {
        axiosInstance.put(`/messages/notifications/read/${notification.senderId}`).catch(console.error);
        return;
      }
      set({ notifications: [...get().notifications, notification] });
    });
  },

  unsubscribeFromNotifications: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newNotification");
  },

   


}));
