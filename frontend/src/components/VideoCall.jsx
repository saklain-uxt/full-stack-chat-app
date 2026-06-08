import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, Monitor, Phone, PhoneOff, UserRound } from "lucide-react";
import { useCallStore } from "../Store/useCallStore";
import { useChatStore } from "../Store/useChatStore";

const VideoCall = () => {
  const {
    localStream,
    remoteStream,
    isReceiving,
    isCalling,
    callUser,
    isMicMuted,
    isCamOff,
    isScreenSharing,
    answerCall,
    endCall,
    toggleMic,
    toggleCam,
    toggleScreenShare,
  } = useCallStore();

  const { users } = useChatStore();
  const peerUser = users.find((u) => u._id === callUser);
  const peerName = peerUser ? peerUser.fullName : "Peer User";
  const peerPic = peerUser?.profilePic;

  const [isSwapped, setIsSwapped] = useState(false);

  const mainVideoRef = useCallback((node) => {
    if (node) {
      const activeStream = isSwapped ? localStream : remoteStream;
      console.log("[VideoCall] Attaching stream to main video, swapped:", isSwapped, activeStream);
      node.srcObject = activeStream;
      if (activeStream) {
        node.play().catch((err) => console.error("[VideoCall] main play error:", err));
      }
    }
  }, [localStream, remoteStream, isSwapped]);

  const pipVideoRef = useCallback((node) => {
    if (node) {
      const activeStream = isSwapped ? remoteStream : localStream;
      console.log("[VideoCall] Attaching stream to PIP video, swapped:", isSwapped, activeStream);
      node.srcObject = activeStream;
      if (activeStream) {
        node.play().catch((err) => console.error("[VideoCall] PIP play error:", err));
      }
    }
  }, [localStream, remoteStream, isSwapped]);

  const wrapperRef = useRef(null);

  // Drag state for PIP local video
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const isDragging = useRef(false);
  const startOffset = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartTouch = useRef({ x: 0, y: 0 });

  // Call duration state
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!remoteStream) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [remoteStream]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Drag Handlers
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !wrapperRef.current) return;
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    let newX = e.clientX - startOffset.current.x;
    let newY = e.clientY - startOffset.current.y;

    const pipWidth = 160;
    const pipHeight = 112;

    if (newX < 16) newX = 16;
    if (newY < 16) newY = 16;
    if (newX + pipWidth > wrapperRect.width - 16) {
      newX = wrapperRect.width - pipWidth - 16;
    }
    if (newY + pipHeight > wrapperRect.height - 16) {
      newY = wrapperRect.height - pipHeight - 16;
    }

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = (e) => {
    if (isDragging.current) {
      isDragging.current = false;
      const dx = Math.abs(e.clientX - dragStartPos.current.x);
      const dy = Math.abs(e.clientY - dragStartPos.current.y);
      if (dx < 5 && dy < 5) {
        setIsSwapped((prev) => !prev);
      }
    }
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    const touch = e.touches[0];
    startOffset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
    dragStartTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || !wrapperRef.current) return;
    const touch = e.touches[0];
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    let newX = touch.clientX - startOffset.current.x;
    let newY = touch.clientY - startOffset.current.y;

    const pipWidth = 160;
    const pipHeight = 112;

    if (newX < 16) newX = 16;
    if (newY < 16) newY = 16;
    if (newX + pipWidth > wrapperRect.width - 16) {
      newX = wrapperRect.width - pipWidth - 16;
    }
    if (newY + pipHeight > wrapperRect.height - 16) {
      newY = wrapperRect.height - pipHeight - 16;
    }

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = (e) => {
    if (isDragging.current) {
      isDragging.current = false;
      const touch = e.changedTouches?.[0];
      if (touch) {
        const dx = Math.abs(touch.clientX - dragStartTouch.current.x);
        const dy = Math.abs(touch.clientY - dragStartTouch.current.y);
        if (dx < 5 && dy < 5) {
          setIsSwapped((prev) => !prev);
        }
      }
    }
  };

  // 1. Incoming Call Screen
  if (isReceiving) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center bg-zinc-950 text-white p-6 overflow-hidden">
        {/* Ringing waves animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="absolute w-72 h-72 rounded-full border border-primary animate-ping" />
          <div className="absolute w-96 h-96 rounded-full border border-primary animate-ping [animation-delay:0.5s]" />
        </div>

        {/* Profile Card */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="size-28 rounded-full overflow-hidden border-4 border-base-200 shadow-2xl">
            <img src={peerPic || "/avatar.png"} alt={peerName} className="size-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold">{peerName}</h2>
          <p className="text-zinc-400 animate-pulse">Incoming call...</p>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-16 left-0 right-0 z-10 flex justify-center gap-8 px-6">
          <button
            onClick={() => endCall(true)}
            className="btn btn-circle btn-error size-16 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <PhoneOff className="size-8 text-white" />
          </button>
          <button
            onClick={answerCall}
            className="btn btn-circle btn-success size-16 flex items-center justify-center shadow-lg hover:scale-105 transition-transform animate-bounce"
          >
            <Phone className="size-8 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Outgoing Call Screen (Dialing)
  if (isCalling && !remoteStream) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center bg-zinc-950 text-white p-6 overflow-hidden">
        {/* Calling waves animation */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="absolute w-72 h-72 rounded-full border border-secondary animate-ping" />
          <div className="absolute w-96 h-96 rounded-full border border-secondary animate-ping [animation-delay:0.5s]" />
        </div>

        {/* Profile Card */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="size-28 rounded-full overflow-hidden border-4 border-base-200 shadow-2xl">
            <img src={peerPic || "/avatar.png"} alt={peerName} className="size-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold">{peerName}</h2>
          <p className="text-zinc-400 animate-pulse">Calling...</p>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-16 left-0 right-0 z-10 flex justify-center px-6">
          <button
            onClick={() => endCall(true)}
            className="btn btn-circle btn-error size-16 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <PhoneOff className="size-8 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Call Screen
  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative h-full w-full overflow-hidden bg-neutral text-neutral-content select-none"
    >
      {/* Fullscreen Background Video */}
      <video
        ref={mainVideoRef}
        autoPlay
        playsInline
        muted={isSwapped}
        className={`h-full w-full object-cover ${
          (isSwapped ? (localStream && !isCamOff) : remoteStream) ? "block" : "hidden"
        }`}
      />
      {/* Background Placeholder */}
      {isSwapped ? (
        (isCamOff || !localStream) && (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-zinc-900">
            <VideoOff className="size-16 opacity-40 animate-pulse text-white" />
            <p className="text-sm opacity-60 text-white">Camera Off</p>
          </div>
        )
      ) : (
        !remoteStream && (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-zinc-900">
            <UserRound className="size-16 opacity-40 animate-pulse text-white" />
            <p className="text-sm opacity-60 text-white">Connecting video stream...</p>
          </div>
        )
      )}

      {/* Local Video PIP (Draggable & Clickable) */}
      <div
        style={{
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: "move",
          zIndex: 50,
        }}
        className="transition-shadow shadow-2xl rounded-lg overflow-hidden border-2 border-white/20 bg-zinc-950"
      >
        <video
          ref={pipVideoRef}
          autoPlay
          muted={!isSwapped}
          playsInline
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`h-28 w-40 object-cover pointer-events-auto ${
            (isSwapped ? remoteStream : (localStream && !isCamOff)) ? "block" : "hidden"
          }`}
        />
        {/* PIP Placeholder */}
        {isSwapped ? (
          !remoteStream && (
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="h-28 w-40 flex flex-col items-center justify-center bg-zinc-900 text-white gap-1 select-none pointer-events-auto"
            >
              <UserRound className="size-5 opacity-60 animate-pulse" />
              <span className="text-[10px] opacity-60">Connecting...</span>
            </div>
          )
        ) : (
          (isCamOff || !localStream) && (
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="h-28 w-40 flex items-center justify-center bg-zinc-900 text-white gap-2 select-none pointer-events-auto"
            >
              <VideoOff className="size-5 opacity-60" />
              <span className="text-[10px] opacity-60">Camera Off</span>
            </div>
          )
        )}
      </div>

      {/* Top Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/60 to-transparent p-4 rounded-t-lg">
        <div className="flex flex-col text-white">
          <span className="font-semibold text-lg drop-shadow-md">{peerName}</span>
          <span className="text-xs text-zinc-300 drop-shadow-md">Active Call</span>
        </div>
        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-mono border border-white/10 drop-shadow-md pointer-events-auto">
          {formatTime(seconds)}
        </div>
      </div>

      {/* Controls Overlay Panel */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center items-center gap-4 px-6 pointer-events-none">
        <div className="flex items-center gap-4 p-3 rounded-full bg-black/60 border border-white/10 backdrop-blur-md pointer-events-auto shadow-2xl">
          {/* Mute Mic */}
          <button
            onClick={toggleMic}
            className={`btn btn-circle ${
              isMicMuted ? "btn-error text-white" : "btn-ghost hover:bg-white/20 text-white"
            } size-12 flex items-center justify-center`}
            title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMicMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>

          {/* Toggle Camera */}
          <button
            onClick={toggleCam}
            className={`btn btn-circle ${
              isCamOff ? "btn-error text-white" : "btn-ghost hover:bg-white/20 text-white"
            } size-12 flex items-center justify-center`}
            title={isCamOff ? "Enable Camera" : "Disable Camera"}
          >
            {isCamOff ? <VideoOff className="size-5" /> : <Video className="size-5" />}
          </button>

          {/* Toggle Screen Share */}
          <button
            onClick={() => toggleScreenShare()}
            className={`btn btn-circle ${
              isScreenSharing ? "btn-success text-white" : "btn-ghost hover:bg-white/20 text-white"
            } size-12 flex items-center justify-center`}
            title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
          >
            <Monitor className="size-5" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-white/20 mx-1" />

          {/* End Call */}
          <button
            onClick={() => endCall(true)}
            className="btn btn-circle btn-error size-12 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            title="End Call"
          >
            <PhoneOff className="size-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
