import React from 'react';

export default function VideoWindow({ myVideoRef, friendVideoRef }) {
  return (
    <div className="video-grid">
      <div className="video-box">
        <h3>Вы (Ваша камера)</h3>
        <video ref={myVideoRef} autoPlay playsInline muted className="video-element mirror" />
      </div>
      <div className="video-box">
        <h3>Друг</h3>
        <video ref={friendVideoRef} autoPlay playsInline className="video-element" />
      </div>
    </div>
  );
}