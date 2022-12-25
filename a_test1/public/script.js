var ROOM_ID = window.location.pathname,
    socket = io('/'),
    videoGrid = document.getElementById('video-grid'),
    myPeer = new Peer(),
    peers = {};
var myVideo = document.createElement('video');
    myVideo.autoplay = true;
    myVideo.setAttribute('playsinline', true);
    
navigator.mediaDevices.getUserMedia({ video: true, audio: true, })
    .then((stream) => {
        addVideoStream(myVideo, stream);
        myPeer.on('call', (call) => {
            call.answer(stream);
            var video = document.createElement('VIDEO');
            call.on('stream', (userVideoStream) => addVideoStream(video, userVideoStream));
        });
        socket.on('user-connected', (userId) => connectToNewUser(userId, stream));
    });
socket.on('user-disconnected', (userId) => {
    if (peers[userId]) peers[userId].close();
});
myPeer.on('open', (id) => socket.emit('join-room', ROOM_ID, id));

function connectToNewUser(userId, stream) {
    var call = myPeer.call(userId, stream);
    var video = document.createElement('VIDEO');
    video.autoplay = true;
    video.setAttribute('playsinline', true);
    call.on('stream', (userVideoStream) => addVideoStream(video, userVideoStream));
    call.on('close', () => video.remove());
    peers[userId] = call;
}
function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.autoplay = true;
    video.setAttribute('playsinline', true);
    video.addEventListener('loadedmetadata', () => video.play());
    videoGrid.append(video);
}