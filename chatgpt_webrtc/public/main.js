const socket = io();
const video = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const startButton = document.getElementById('start-button');
const callButton = document.getElementById('call-button');
const hangupButton = document.getElementById('hangup-button');

let pc;
let localStream;

startButton.addEventListener('click', start);
callButton.addEventListener('click', call);
hangupButton.addEventListener('click', hangup);

function start() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        video.srcObject = stream;
        localStream = stream;
        const peer = new Peer({
          initiator: true,
          stream: stream,
          trickle: false
        });
        peer.on('signal', signal => {
            socket.emit('offer', signal);
        });
        peer.on('stream', stream => {
        remoteVideo.srcObject = stream;
        });
        socket.on('answer', (id, signal) => {
        peer.signal(signal);
        });
        socket.on('candidate', (id, signal) => {
        peer.signal(signal);
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
  
  function call() {
    pc.signal({ trickle: false, offer: true });
  }
  
  function hangup() {
    localStream.getTracks().forEach(track => {
      track.stop();
    });
    pc.destroy();
    pc = null;
    video.srcObject = null;
    remoteVideo.srcObject = null;
  }