import React from 'react';

export default function UserIdentity({
  myId,
  friendId,
  callConnected,
  iceConnectionState,
  iceGatheringState,
  webRtcConnectionState
}) {
  return (
    <div className="id-block">
      <p>
        🆔 <strong>Мой PeerJS ID:</strong>
      </p>

      <strong className="id-highlight">
        {myId || 'Получение PeerJS ID...'}
      </strong>

      <p>
        🏠 <strong>Matchmaking:</strong>{' '}
        {friendId
          ? '🤝 Собеседник найден'
          : '⏳ Ищем собеседника...'}
      </p>

      <p>
        👤 <strong>Собеседник:</strong>
      </p>

      <strong className="id-highlight">
        {friendId || '—'}
      </strong>

      <p>
        📹 <strong>WebRTC:</strong>{' '}
        {callConnected
          ? '🟢 Соединение установлено'
          : '⏳ Соединение не установлено'}
      </p>

      <hr />

      <p>
        🧊 <strong>ICE connection:</strong>{' '}
        {iceConnectionState || '—'}
      </p>

      <p>
        📡 <strong>ICE gathering:</strong>{' '}
        {iceGatheringState || '—'}
      </p>

      <p>
        🔗 <strong>WebRTC connection:</strong>{' '}
        {webRtcConnectionState || '—'}
      </p>
    </div>
  );
}
