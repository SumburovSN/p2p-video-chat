import { useEffect, useRef, useState } from 'react';
import { Peer } from 'peerjs';

export function usePeerVideoChat() {
  const [myId, setMyId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [callConnected, setCallConnected] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const [iceConnectionState, setIceConnectionState] = useState('');
  const [iceGatheringState, setIceGatheringState] = useState('');
  const [webRtcConnectionState, setWebRtcConnectionState] = useState('');

  const myVideoRef = useRef(null);
  const friendVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const currentCall = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
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

      // Запускаем автоматический matchmaking
      joinMatchmaking(id);
    });

    // 4. Ожидание входящего звонка
    peer.on('call', (call) => {
      console.log('📞 ВХОДЯЩИЙ CALL от:', call.peer);

      setFriendId(call.peer);

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

  setIceConnectionState(pc.iceConnectionState);
  setWebRtcConnectionState(pc.connectionState);
  setIceGatheringState(pc.iceGatheringState);

  pc.addEventListener('iceconnectionstatechange', () => {
    console.log('🧊 ICE connection state:', pc.iceConnectionState);
    setIceConnectionState(pc.iceConnectionState);
  });

  pc.addEventListener('connectionstatechange', () => {
    console.log('🔗 WebRTC connection state:',pc.connectionState);
    setWebRtcConnectionState(pc.connectionState);
  });

  pc.addEventListener('icegatheringstatechange', () => {
    console.log('📡 ICE gathering state:', pc.iceGatheringState);
    setIceGatheringState(pc.iceGatheringState);
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

    // Подключаемся к Room Manager и пытаемся найти собеседника
  const joinMatchmaking = async (peerId) => {
    try {
      console.log('🏠 Отправляем PeerJS ID в Room Manager:', peerId);

      const response = await fetch('/api/room/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          peerId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Room Manager HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log('🏠 Ответ Room Manager:', data);

      if (data.role === 'waiting') {
        console.log('⏳ Собеседник пока не найден, ждём...');
        return;
      }

      if (data.role === 'connected' && data.friendId) {
        console.log('🤝 Собеседник найден:', data.friendId);

        setFriendId(data.friendId);

        // Небольшая пауза, чтобы PeerJS успел стабилизировать соединение
        setTimeout(() => {
          startCall(data.friendId);
        }, 1000);

        return data.friendId;
      }

      console.warn('⚠️ Неизвестный ответ Room Manager:', data);
    } catch (err) {
      console.error('❌ Ошибка matchmaking:', err);
    }
  };

  const leaveMatchmaking = async (peerId = myId) => {
  if (!peerId) {
    return;
  }

  try {
    console.log('🚪 Выходим из Room Manager:', peerId);

    const response = await fetch('/api/room/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ peerId }),
    });

    if (!response.ok) {
      throw new Error(`Room Manager HTTP ${response.status}`);
    }

    const data = await response.json();

    console.log('🚪 Ответ Room Manager:', data);
  } catch (err) {
    console.error('❌ Ошибка выхода из matchmaking:', err);
  }
};

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

  const endCall = async () => {
  if (currentCall.current) {
    currentCall.current.close();
    currentCall.current = null;
  }

  if (friendVideoRef.current) {
    friendVideoRef.current.srcObject = null;
  }

  await leaveMatchmaking();

  stopLocalStream();
  setCallConnected(false);

  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
  
  setFriendId('');
};

  return {
    myId,
    friendId,
    setFriendId,
    callConnected,
    isAudioMuted,
    isVideoMuted,
    iceConnectionState,
    iceGatheringState,
    webRtcConnectionState,
    myVideoRef,
    friendVideoRef,
    startCall,
    endCall,
    leaveMatchmaking,
    toggleAudio,
    toggleVideo
  };
}
