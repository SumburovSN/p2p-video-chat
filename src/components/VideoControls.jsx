import React from 'react';
import UserIdentity from './UserIdentity'; // Теперь эта строчка загорится ярко!
import CallDialer from './CallDialer';
import ActiveCallBar from './ActiveCallBar';

export default function VideoControls({ 
  myId, 
  friendId, 
  setFriendId, 
  callConnected, 
  isAudioMuted, 
  isVideoMuted, 
  onStartCall, 
  onEndCall,
  onToggleAudio,
  onToggleVideo 
}) {
  return (
    <div className="controls-container">
      <UserIdentity
        myId={myId}
      />      

      <br />

      {/* Переключаем панели набора номера или управления звонком */}
      {!callConnected ? (
        <CallDialer 
          friendId={friendId} 
          setFriendId={setFriendId} 
          onStartCall={onStartCall} 
        />
      ) : (
        <ActiveCallBar 
          isAudioMuted={isAudioMuted}
          isVideoMuted={isVideoMuted}
          onToggleAudio={onToggleAudio}
          onToggleVideo={onToggleVideo}
          onEndCall={onEndCall}
        />
      )}
    </div>
  );
}
