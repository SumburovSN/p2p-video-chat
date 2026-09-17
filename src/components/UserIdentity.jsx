import React from 'react';

export default function UserIdentity({ shareableLink }) {
  const copyToClipboard = () => {
    if (!shareableLink) return alert('Ссылка еще формируется...');
    navigator.clipboard.writeText(shareableLink);
    alert('Ссылка на комнату скопирована! Отправьте её другу.');
  };

  return (
    <div className="id-block">
      <p>
        🔴 Ссылка на вашу комнату:{' '}
        <strong className="id-highlight" style={{ fontSize: '0.9em', display: 'block', margin: '5px 0', wordBreak: 'break-all' }}>
          {shareableLink || 'Генерация комнаты...'}
        </strong>
      </p>
      <button className="btn-secondary" onClick={copyToClipboard} disabled={!shareableLink}>
        🔗 Скопировать ссылку для друга
      </button>
    </div>
  );
}
