import { useEffect, useRef, useState } from 'react';
import { Peer } from 'peerjs';

export function usePeerVideoChat() {
  const [myId, setMyId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [callConnected, setCallConnected] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [shareableLink, setShareableLink] = useState(''); // Новое: ссылка для друга

  const myVideoRef = useRef(null);
  const friendVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const currentCall = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    // 1. Проверяем, зашел ли пользователь уже по чьей-то ссылке комнаты
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = urlParams.get('room');

    if (roomIdFromUrl) {
      setFriendId(roomIdFromUrl);
    }

    // 2. Инициализируем PeerJS
    // const peer = new Peer({
    //   config: {
    //     iceServers: [
    //         {
    //           urls: "stun:stun.relay.metered.ca:80",
    //         },
    //         {
    //           urls: "turn:global.relay.metered.ca:80",
    //           username: "685537b16ab53969fb5a4762",
    //           credential: "yALWD7THSXqDmn+K",
    //         },
    //         {
    //           urls: "turn:global.relay.metered.ca:80?transport=tcp",
    //           username: "685537b16ab53969fb5a4762",
    //           credential: "yALWD7THSXqDmn+K",
    //         },
    //         {
    //           urls: "turn:global.relay.metered.ca:443",
    //           username: "685537b16ab53969fb5a4762",
    //           credential: "yALWD7THSXqDmn+K",
    //         },
    //         {
    //           urls: "turns:global.relay.metered.ca:443?transport=tcp",
    //           username: "685537b16ab53969fb5a4762",
    //           credential: "yALWD7THSXqDmn+K",
    //         },
    //     ],
    //     // Указываем WebRTC перебирать абсолютно все доступные типы подключений
    //     iceTransportPolicy: 'all'
    //   }
    // });
    // const peer = new Peer();
    const peer = new Peer({
      host: 'sumburovsn.fvds.ru',
      secure: true,
      port: 443,
      path: '/myapp',
      config: {
        iceServers: [
          {
            urls: 'stun:sumburovsn.fvds.ru:3478',
          },
          {
            urls: [
              'turn:sumburovsn.fvds.ru:3478?transport=udp',
              'turn:sumburovsn.fvds.ru:3478?transport=tcp',
              'turns:sumburovsn.fvds.ru:5349?transport=tcp',
            ],
            username: 'videochat',
            credential: 'XATSxXBh5kQW5cd9CRqNrOb8PEiWviiR',
          },
        ],
      }
    });

    peer.on('open', (id) => {
      setMyId(id);
      console.log('🆔 Мой PeerJS ID:', id);

      // 3. Логика генерации ссылки:
      if (!roomIdFromUrl) {
        // Если мы первые — добавляем наш ID в адресную строку и создаем ссылку
        const newUrl = `${window.location.origin}${window.location.pathname}?room=${id}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
        setShareableLink(newUrl);
      } else {
        // Если мы перешли по ссылке друга — формируем ссылку на основе его ID
        setShareableLink(window.location.href);
      }
    });

    // 4. Ожидание входящего звонка
    peer.on('call', (call) => {
      console.log('📞 ВХОДЯЩИЙ CALL от:', call.peer);
      getUserMediaStream()
        .then((stream) => {
          call.answer(stream);
          currentCall.current = call;

          // диагностика ICE
          setupIceDiagnostics(call);

          call.on('stream', (remoteStream) => {
            if (friendVideoRef.current) friendVideoRef.current.srcObject = remoteStream;
          });
          setCallConnected(true);
        })
        .catch(err => console.error('Ошибка входящего вызова:', err));
    });

    peerInstance.current = peer;

    return () => {
      stopLocalStream();
      if (peerInstance.current) peerInstance.current.destroy();
    };
  }, []);

  // Автоматический звонок: как только сеть PeerJS выдала нам ID, И в URL был ID друга — звоним сами!
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = urlParams.get('room');

    // Важно: звоним только если мы зашли по ссылке (roomIdFromUrl существует) 
    // и наш собственный myId уже готов, но звонок еще не соединен
    if (myId && roomIdFromUrl && roomIdFromUrl !== myId && !callConnected) {
      // Краткая пауза, чтобы браузер успел стабилизировать сокеты
      const timer = setTimeout(() => {
        startCall(roomIdFromUrl);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [myId, callConnected]);

  const getUserMediaStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (myVideoRef.current) myVideoRef.current.srcObject = stream;
    return stream;
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setIsAudioMuted(false);
    setIsVideoMuted(false);
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };
  
  const setupIceDiagnostics = (call) => {
  const pc = call.peerConnection;

  if (!pc) {
    console.warn('WebRTC: peerConnection ещё недоступен');
    return;
  }

  console.log('WebRTC: peerConnection создан');

  console.log('🔎 Initial ICE state:', pc.iceConnectionState);
  console.log('🔎 Initial connection state:', pc.connectionState);
  console.log('🔎 Initial signaling state:', pc.signalingState);
  console.log('🔎 Initial ICE gathering state:', pc.iceGatheringState);

  pc.addEventListener('iceconnectionstatechange', () => {
    console.log(
      '🧊 ICE connection state:',
      pc.iceConnectionState
    );
  });

  pc.addEventListener('connectionstatechange', () => {
    console.log(
      '🔗 WebRTC connection state:',
      pc.connectionState
    );
  });

  pc.addEventListener('icegatheringstatechange', () => {
    console.log(
      '📡 ICE gathering state:',
      pc.iceGatheringState
    );
  });

  pc.addEventListener('signalingstatechange', () => {
    console.log(
      '📶 Signaling state:',
      pc.signalingState
    );
  });

  pc.addEventListener('icecandidate', (event) => {
    if (event.candidate) {
      console.log(
        '🧊 ICE candidate:',
        event.candidate.candidate
      );
    }
  });

  pc.addEventListener('icecandidateerror', (event) => {
    console.error(
      '❌ ICE candidate error:',
      {
        url: event.url,
        errorCode: event.errorCode,
        errorText: event.errorText,
        address: event.address,
        port: event.port
      }
    );
  });
};
  // диагностика ICE
  // */}

  const startCall = async (targetId = friendId) => {    
    const idToCall = targetId || friendId;
    console.log('📞 ПЫТАЕМСЯ ПОЗВОНИТЬ:', idToCall);

    if (!idToCall) return alert('Нет ID для звонка!');

    try {
      const stream = await getUserMediaStream();
      const call = peerInstance.current.call(idToCall, stream);
      currentCall.current = call;

      // диагностика ICE
      setupIceDiagnostics(call);

      call.on('stream', (remoteStream) => {
        if (friendVideoRef.current) friendVideoRef.current.srcObject = remoteStream;
      });
      setCallConnected(true);
    } catch (err) {
      console.error('Ошибка при старте звонка:', err);
    }
  };

  const endCall = () => {
    if (currentCall.current) currentCall.current.close();
    if (friendVideoRef.current) friendVideoRef.current.srcObject = null;
    stopLocalStream();
    setCallConnected(false);
    // Очищаем адресную строку при сбросе, возвращая чистый сайт
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    setShareableLink('');
    setFriendId('');
  };

  return {
    myId,
    friendId,
    setFriendId,
    callConnected,
    isAudioMuted,
    isVideoMuted,
    shareableLink, // Прокидываем готовую ссылку наружу
    myVideoRef,
    friendVideoRef,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo
  };
}
