import { create } from "zustand";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("incoming-call", ({ fromUserId, offer }) => {
      import("../Store/useCallStore").then(({ useCallStore }) => {
        useCallStore.getState().receiveCall(fromUserId, offer);
      });
    });

    newSocket.on("call-answered", ({ answer }) => {
      import("../Store/useCallStore").then(({ useCallStore }) => {
        useCallStore.getState().acceptAnswer(answer);
      });
    });

    newSocket.on("call-ended", () => {
      import("../Store/useCallStore").then(({ useCallStore }) => {
        useCallStore.getState().endCall(false);
      });
    });

    newSocket.on("ice-candidate", ({ candidate }) => {
      import("../Store/useCallStore").then(({ useCallStore }) => {
        useCallStore.getState().addIceCandidate(candidate);
      });
    });

    newSocket.on("call-unavailable", () => {
      toast.error("That peer is offline right now");
    });

    import("./useChatStore").then(({ useChatStore }) => {
      useChatStore.getState().subscribeToNotifications();
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
    import("./useChatStore").then(({ useChatStore }) => {
      useChatStore.getState().unsubscribeFromNotifications();
    });
    set({ socket: null, onlineUsers: [] });
  },
}));
