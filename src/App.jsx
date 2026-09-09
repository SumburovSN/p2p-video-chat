import React from 'react';
import { usePeerVideoChat } from './hooks/usePeerVideoChat';
import VideoControls from './components/VideoControls';
import VideoGrid from './components/VideoGrid';

export default function App() {
  const chat = usePeerVideoChat();

  return (
    <div className="app-container">
      <h1>📹 P2P Видеочат</h1>
      
      {/* 
        Здесь важно передать ВСЕ переменные из хука chat в компонент управления,
        чтобы подкомпоненты (UserIdentity, CallDialer) их увидели.
      */}
      <VideoControls 
        myId={chat.myId}
        friendId={chat.friendId}
        setFriendId={chat.setFriendId}
        callConnected={chat.callConnected}
        isAudioMuted={chat.isAudioMuted}
        isVideoMuted={chat.isVideoMuted}
        onStartCall={chat.startCall}
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
