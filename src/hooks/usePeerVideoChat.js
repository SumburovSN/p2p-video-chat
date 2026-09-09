import { useEffect, useRef, useState } from 'react';
import { Peer } from 'peerjs';

export function usePeerVideoChat() {
  const [myId, setMyId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [callConnected, setCallConnected] = useState(false);
  
  // Новые стейты для отслеживания состояния микрофона и камеры
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);

  const myVideoRef = useRef(null);
  const friendVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const currentCall = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    // const peer = new Peer()
    const peer = new Peer({
      host: 'sumburovsn-p2p-signaling-server-f526.twc1.net', // Ваш домен Timeweb
      secure: true,
      port: 443,
      path: '/myapp',
      // ВОТ ЭТОТ БЛОК. Обратите внимание на точный адрес 'stun:://google.com'
      config: {
        iceServers: [
          { urls: 'stun:://google.com' }
        ]
      }
    });

    peer.on('open', (id) => setMyId(id));

    peer.on('call', (call) => {
      getUserMediaStream()
        .then((stream) => {
          call.answer(stream);
          currentCall.current = call;
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
    
    // Применяем текущие настройки mute, если поток пересоздается
    stream.getAudioTracks().forEach(track => track.enabled = !isAudioMuted);
    stream.getVideoTracks().forEach(track => track.enabled = !isVideoMuted);
    
    return stream;
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    // Сбрасываем кнопки при завершении
    setIsAudioMuted(false);
    setIsVideoMuted(false);
  };

  // Функция переключения микрофона (Вкл/Выкл)
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  // Функция переключения камеры (Вкл/Выкл)
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const startCall = async () => {
    if (!friendId) return alert('Введите ID друга!');

    try {
      const stream = await getUserMediaStream();
      const call = peerInstance.current.call(friendId, stream);
      currentCall.current = call;

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
  };

  return {
    myId,
    friendId,
    setFriendId,
    callConnected,
    isAudioMuted,
    isVideoMuted,
    myVideoRef,
    friendVideoRef,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo
  };
}
