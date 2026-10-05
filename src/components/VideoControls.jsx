import React from 'react';
import UserIdentity from './UserIdentity';
import ActiveCallBar from './ActiveCallBar';

export default function VideoControls({ 
  myId,
  friendId,
  callConnected,

  iceConnectionState,
  iceGatheringState,
  webRtcConnectionState,

  isAudioMuted, 
  isVideoMuted,
  onEndCall,
  onToggleAudio,
  onToggleVideo 
}) {
  return (
    <div className="controls-container">
      <UserIdentity
        myId={myId}
        friendId={friendId}
        callConnected={callConnected}
        iceConnectionState={iceConnectionState}
        iceGatheringState={iceGatheringState}
        webRtcConnectionState={webRtcConnectionState}
      />

      <br />

      <ActiveCallBar 
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
        onToggleAudio={onToggleAudio}
        onToggleVideo={onToggleVideo}
        onEndCall={onEndCall}
      />
    </div>
  );
}
