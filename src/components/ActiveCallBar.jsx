import React from 'react';

export default function ActiveCallBar({ isAudioMuted, isVideoMuted, onToggleAudio, onToggleVideo, onEndCall }) {
  return (
    <div className="call-actions-block">
      {/* Кнопка Микрофона */}
      <button 
        className={`btn-mute ${isAudioMuted ? 'btn-status-off' : 'btn-status-on'}`} 
        onClick={onToggleAudio}
      >
        {isAudioMuted ? '🎤 Включить микрофон' : '🎙️ Выключить микрофон'}
      </button>

      {/* Кнопка Камеры */}
      <button 
        className={`btn-mute ${isVideoMuted ? 'btn-status-off' : 'btn-status-on'}`} 
        onClick={onToggleVideo}
      >
        {isVideoMuted ? '📷 Включить камеру' : '📹 Выключить камеру'}
      </button>

      {/* Кнопка сброса */}
      <button className="btn-danger" onClick={onEndCall}>
        Завершить звонок
      </button>
    </div>
  );
}
