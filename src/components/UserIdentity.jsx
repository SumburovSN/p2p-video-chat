import React from 'react';

// Явно принимаем объект props и достаем из него myId
export default function UserIdentity({ myId }) {
  const copyToClipboard = () => {
    if (!myId) return alert('ID еще не сгенерирован!');
    navigator.clipboard.writeText(myId);
    alert('ID скопирован в буфер обмена!');
  };

  return (
    <div className="id-block">
      <p>
        Ваш ID для друга:{' '}
        <strong className="id-highlight">
          {myId ? myId : 'Генерация (проверьте VPN)...'}
        </strong>
      </p>
      <button className="btn-secondary" onClick={copyToClipboard} disabled={!myId}>
        Скопировать мой ID
      </button>
    </div>
  );
}
