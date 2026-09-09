import React from 'react';

export default function CallDialer({ friendId, setFriendId, onStartCall }) {
  return (
    <div className="dial-block" style={{ marginTop: '20px' }}>
      <input 
        type="text" 
        placeholder="Вставьте ID друга" 
        value={friendId} 
        onChange={(e) => setFriendId(e.target.value)}
        className="input-field"
      />
      <button className="btn-primary" onClick={onStartCall}>Позвонить</button>
    </div>
  );
}
