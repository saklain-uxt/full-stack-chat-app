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
    } catch (error) {
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
    const currentuser=get.selectedUser;
    if(currentuser && currentuser._id===selectedUser._id){
      return;
    }

   
    set({
      selectedUser,
      // messages: [],
     // isVideoCallActive: false, //  close video on chat switch
    })},

  setVideoCallActive:(value)=>set({ isVideoCallActive:value}),

   


}));
