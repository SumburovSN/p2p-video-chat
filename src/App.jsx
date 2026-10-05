import React from 'react';
import { usePeerVideoChat } from './hooks/usePeerVideoChat';
import VideoControls from './components/VideoControls';
import VideoGrid from './components/VideoGrid';

export default function App() {
  const chat = usePeerVideoChat();

  return (
    <div className="app-container">
      <h1>📹 P2P Видеочат</h1>
      
      <VideoControls
        myId={chat.myId}
        friendId={chat.friendId}
        callConnected={chat.callConnected}
        
        iceConnectionState={chat.iceConnectionState}
        iceGatheringState={chat.iceGatheringState}
        webRtcConnectionState={chat.webRtcConnectionState}
        
        isAudioMuted={chat.isAudioMuted}
        isVideoMuted={chat.isVideoMuted}
        onEndCall={chat.endCall}
        onToggleAudio={chat.toggleAudio}
        onToggleVideo={chat.toggleVideo}
      />

      <VideoGrid 
        myVideoRef={chat.myVideoRef}
        friendVideoRef={chat.friendVideoRef}
      />
    </div>
  );
}
