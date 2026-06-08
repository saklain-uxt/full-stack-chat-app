import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";

const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

const createPeer = () =>
  new RTCPeerConnection({
    iceServers,
  });

const stopStream = (stream) => {
  stream?.getTracks().forEach((track) => track.stop());
};

export const useCallStore = create((set, get) => ({
  callUser: null,
  incomingCaller: null,
  isCalling: false,
  isReceiving: false,
  peer: null,
  localStream: null,
  remoteStream: null,
  isMicMuted: false,
  isCamOff: false,
  isScreenSharing: false,
  screenStream: null,
  pendingIceCandidates: [],

  startCall: async (toUserId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket || !toUserId) return;

    console.log("[WebRTC] Starting call to:", toUserId);
    try {
      const peer = createPeer();
      console.log("[WebRTC] Peer Connection created");

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("[WebRTC] Local media stream obtained");

      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
        console.log("[WebRTC] Added track to Peer Connection:", track.kind);
      });

      peer.ontrack = (event) => {
        console.log("[WebRTC] ontrack event fired on caller side, stream:", event.streams[0]);
        set({ remoteStream: event.streams[0] });
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("[WebRTC] Generated ICE candidate, sending to:", toUserId);
          socket.emit("ice-candidate", {
            toUserId,
            candidate: event.candidate,
          });
        }
      };

      const offer = await peer.createOffer();
      console.log("[WebRTC] Created offer");
      await peer.setLocalDescription(offer);
      console.log("[WebRTC] Local description set (offer)");

      socket.emit("call-user", { toUserId, offer });
      console.log("[WebRTC] Emitted call-user event with offer");

      set({
        peer,
        localStream,
        callUser: toUserId,
        isCalling: true,
      });
      useChatStore.getState().setVideoCallActive(true);
    } catch (error) {
      toast.error("Camera or microphone permission failed");
      console.error("[WebRTC] Error starting call:", error);
    }
  },

  receiveCall: async (fromUserId, offer) => {
    console.log("[WebRTC] Received call-user event (offer) from:", fromUserId);
    try {
      const peer = createPeer();
      const socket = useAuthStore.getState().socket;
      console.log("[WebRTC] Peer Connection created for receiver");

      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("[WebRTC] Receiver local media stream obtained");

      localStream.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
        console.log("[WebRTC] Added track to receiver Peer Connection:", track.kind);
      });

      peer.ontrack = (event) => {
        console.log("[WebRTC] ontrack event fired on receiver side, stream:", event.streams[0]);
        set({ remoteStream: event.streams[0] });
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("[WebRTC] Receiver generated ICE candidate, sending to:", fromUserId);
          socket?.emit("ice-candidate", {
            toUserId: fromUserId,
            candidate: event.candidate,
          });
        }
      };

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      console.log("[WebRTC] Remote description set (offer) on receiver");

      // Apply queued ICE candidates
      const { pendingIceCandidates } = get();
      if (pendingIceCandidates && pendingIceCandidates.length > 0) {
        console.log(`[WebRTC] Applying ${pendingIceCandidates.length} queued ICE candidates`);
        for (const candidate of pendingIceCandidates) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("[WebRTC] Applied queued ICE candidate successfully");
          } catch (e) {
            console.error("[WebRTC] Error applying queued ICE candidate:", e);
          }
        }
        set({ pendingIceCandidates: [] });
      }

      set({
        peer,
        localStream,
        isReceiving: true,
        incomingCaller: fromUserId,
        callUser: fromUserId,
      });
      useChatStore.getState().setVideoCallActive(true);
    } catch (error) {
      toast.error("Could not receive the call");
      console.error("[WebRTC] Error receiving call:", error);
    }
  },

  answerCall: async () => {
    const { peer, callUser } = get();
    if (!peer || !callUser) return;

    console.log("[WebRTC] Answering call to:", callUser);
    const socket = useAuthStore.getState().socket;
    const answer = await peer.createAnswer();
    console.log("[WebRTC] Created answer");
    await peer.setLocalDescription(answer);
    console.log("[WebRTC] Local description set (answer)");

    socket?.emit("answer-call", {
      toUserId: callUser,
      answer,
    });
    console.log("[WebRTC] Emitted answer-call event");

    set({
      isReceiving: false,
      isCalling: true,
      incomingCaller: null,
    });

    useChatStore.getState().setVideoCallActive(true);
  },

  acceptAnswer: async (answer) => {
    const { peer } = get();
    if (!peer) return;

    console.log("[WebRTC] Received call-answered event (answer)");
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("[WebRTC] Remote description set (answer) on caller");

    // Apply queued ICE candidates
    const { pendingIceCandidates } = get();
    if (pendingIceCandidates && pendingIceCandidates.length > 0) {
      console.log(`[WebRTC] Applying ${pendingIceCandidates.length} queued ICE candidates on caller`);
      for (const candidate of pendingIceCandidates) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("[WebRTC] Applied queued ICE candidate successfully on caller");
        } catch (e) {
          console.error("[WebRTC] Error applying queued ICE candidate on caller:", e);
        }
      }
      set({ pendingIceCandidates: [] });
    }
  },

  addIceCandidate: async (candidate) => {
    if (!candidate) return;
    const { peer } = get();

    if (!peer || !peer.remoteDescription) {
      console.log("[WebRTC] Queueing ICE candidate because peer or remoteDescription is not set/ready yet");
      set((state) => ({
        pendingIceCandidates: [...(state.pendingIceCandidates || []), candidate],
      }));
      return;
    }

    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("[WebRTC] Added ICE candidate successfully");
    } catch (error) {
      console.error("[WebRTC] Error adding ICE candidate:", error);
    }
  },

  endCall: (emit = true) => {
    const { peer, localStream, screenStream, callUser } = get();
    const socket = useAuthStore.getState().socket;

    if (emit && callUser) {
      socket?.emit("end-call", { toUserId: callUser });
    }

    peer?.close();
    stopStream(localStream);
    if (screenStream) {
      stopStream(screenStream);
    }

    set({
      callUser: null,
      incomingCaller: null,
      isCalling: false,
      isReceiving: false,
      peer: null,
      localStream: null,
      remoteStream: null,
      isMicMuted: false,
      isCamOff: false,
      isScreenSharing: false,
      screenStream: null,
      pendingIceCandidates: [],
    });

    useChatStore.getState().setVideoCallActive(false);
  },

  toggleMic: () => {
    const { localStream, isMicMuted } = get();
    if (!localStream) return;
    
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = isMicMuted;
      set({ isMicMuted: !isMicMuted });
    }
  },

  toggleCam: () => {
    const { localStream, isCamOff } = get();
    if (!localStream) return;
    
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = isCamOff;
      set({ isCamOff: !isCamOff });
    }
  },

  toggleScreenShare: async (forceValue) => {
    const { peer, localStream, isScreenSharing, screenStream } = get();
    if (!peer) return;

    const shouldShare = typeof forceValue === "boolean" ? forceValue : !isScreenSharing;

    if (shouldShare) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];

        const sender = peer.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          get().toggleScreenShare(false);
        };

        set({
          isScreenSharing: true,
          screenStream: stream,
        });
      } catch (error) {
        console.error("Failed to share screen:", error);
        toast.error("Screen sharing cancelled or failed");
      }
    } else {
      if (screenStream) {
        stopStream(screenStream);
      }
      
      const localVideoTrack = localStream?.getVideoTracks()[0];
      if (localVideoTrack) {
        const sender = peer.getSenders().find((s) => s.track?.kind === "video");
        if (sender) {
          await sender.replaceTrack(localVideoTrack);
        }
      }

      set({
        isScreenSharing: false,
        screenStream: null,
      });
    }
  },
}));
