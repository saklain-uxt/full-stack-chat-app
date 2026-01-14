

// import { useEffect, useRef } from "react";
// import { useCallStore } from "../Store/useCallStore";

// const VideoCall = () => {
//   const {
//     localStream,
//     remoteStream,
//     isReceiving,
//     answerCall,
//     endCall,
//   } = useCallStore();

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   useEffect(() => {
//     if (remoteVideoRef.current && remoteStream) {
//       remoteVideoRef.current.srcObject = remoteStream;
//       remoteVideoRef.current.play().catch(() => {});
//     }

//     if (localVideoRef.current && localStream) {
//       localVideoRef.current.srcObject = localStream;
//       localVideoRef.current.play().catch(() => {});
//     }
//   }, [remoteStream, localStream]);

//   return (
//     <div className="relative w-full h-full bg-black">

//       {/* ✅ ALWAYS RENDER REMOTE VIDEO */}
//       <video
//         ref={remoteVideoRef}
//         autoPlay
//         playsInline
//         className="w-full h-full object-cover"
//       />

//       {/* LOCAL VIDEO OVERLAY */}
//       <video
//         ref={localVideoRef}
//         autoPlay
//         muted
//         playsInline
//         className={`absolute bottom-4 right-4
//           w-32 h-24 sm:w-40 sm:h-28
//           rounded-lg border-2 border-white
//           object-cover
//           ${localStream ? "block" : "hidden"}`}
//       />

//       {/* INCOMING CALL UI */}
//       {isReceiving && (
//         <div className="absolute inset-0 bg-black/70
//                         flex flex-col items-center justify-center gap-4 text-white z-10">
//           <p className="text-lg font-semibold">Incoming call…</p>
//           <button
//             onClick={answerCall}
//             className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-700"
//           >
//             Accept
//           </button>
//         </div>
//       )}

//       {/* END CALL */}
//       <button
//         onClick={() => endCall(true)}
//         className="absolute top-4 right-4
//                    bg-red-600 hover:bg-red-700
//                    text-white px-4 py-2 rounded-full z-10"
//       >
//         End
//       </button>
//     </div>
//   );
// };

// export default VideoCall;


