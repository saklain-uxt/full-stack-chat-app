// import { create } from "zustand";
// import { useAuthStore } from "./useAuthStore";
// import { useChatStore } from "./useChatStore";


  

// export const useCallStore = create((set, get) => ({
//   // ================== STATE ==================
//   callUser: null,          // userId of other user in call
//   incomingCaller: null,   //  WHO is calling (UI depends on this)
//   isCalling: false,       // call active
//   isReceiving: false,     // incoming call ringing
//   peer: null,
//   localStream: null,
//   remoteStream: null,

//   // ================== CALLER ==================
//   startCall: async (toUserId) => {
//     const socket = useAuthStore.getState().socket;

//     const peer = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     const localStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });

//     localStream.getTracks().forEach((track) => {

//       peer.addTrack(track, localStream);
//     });

//     peer.ontrack = (event) => {
//       console.log("CALLER got remote stream", event.streams);
//       set({ remoteStream: event.streams[0] });
//     };

//     peer.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket?.emit("ice-candidate", {
//           toUserId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     const offer = await peer.createOffer();
//     await peer.setLocalDescription(offer);

//     socket?.emit("call-user", { toUserId, offer });

//     set({
//       peer,
//       localStream,
//       callUser: toUserId,
//       isCalling: true,
//     });
//     import("../Store/useChatStore").then(({ useChatStore }) => {
//   useChatStore.getState().setVideoCallActive(true);
// });



//   },

//   // ================== RECEIVER (AUTO FROM SOCKET) ==================
//   receiveCall: async (fromUserId, offer) => {
//   const peer = new RTCPeerConnection({
//     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//   });

//   // 🔥 1. GET CAMERA FIRST (IMPORTANT)
//   const localStream = await navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true,
//   });

//   localStream.getTracks().forEach((track) => {
//     peer.addTrack(track, localStream);
//   });

//   // 🔥 2. HANDLE REMOTE TRACK
//   peer.ontrack = (event) => {
//     set({ remoteStream: event.streams[0] });
//   };

//   peer.onicecandidate = (event) => {
//     if (event.candidate) {
//       useAuthStore.getState().socket.emit("ice-candidate", {
//         toUserId: fromUserId,
//         candidate: event.candidate,
//       });
//     }
//   };

//   // 🔥 3. SET REMOTE OFFER
//   await peer.setRemoteDescription(
//     new RTCSessionDescription(offer)
//   );

//   set({
//     peer,
//     localStream,
//     isReceiving: true,
//     incomingCaller: fromUserId,
//     callUser: fromUserId,
//   });
// },

 



 

 

//   // ================== ACCEPT ==================
//   answerCall: async () => {
//   const { peer, callUser } = get();
//   if (!peer) return;

//   const socket = useAuthStore.getState().socket;

//   // 🔥 CREATE ANSWER AFTER TRACKS EXIST
//   const answer = await peer.createAnswer();
//   await peer.setLocalDescription(answer);

//   socket.emit("answer-call", {
//     toUserId: callUser,
//     answer,
//   });

//   set({
//     isReceiving: false,
//     isCalling: true,
//     incomingCaller: null,
//   });

//   useChatStore.getState().setVideoCallActive(true);
// },


 

//   // ================== END ==================

//   // ================== END ==================


//   endCall: (emit = true) => {
//   const { peer, localStream, callUser } = get();
//   const socket = useAuthStore.getState().socket;

//   // 🔔 notify other user ONLY if local click
//   if (emit && callUser) {
//     socket?.emit("end-call", { toUserId: callUser });
//   }

//   // 🔥 MEDIA CLEANUP
//   peer?.close();
//   localStream?.getTracks().forEach((t) => t.stop());

//   // 🔥 STATE RESET
//   set({
//     callUser: null,
//     incomingCaller: null,
//     isCalling: false,
//     isReceiving: false,
//     peer: null,
//     localStream: null,
//     remoteStream: null,
//   });

//   // 🔥 UI RESET (SYNC — THIS FIXES IT);

//   useChatStore.getState().setVideoCallActive(false);
  
    

  
// },

   




 

// }));
