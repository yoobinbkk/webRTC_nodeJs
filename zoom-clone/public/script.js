// 루트 주소로 소켓을 발동
const socket = io('/')

// 피어 아이디 설정
// const Peer = require('peer');
const peer = new Peer();

// 피어 목록
const peers = {}

socket.emit('join-room', ROOM_ID, peer)

// room.html의 자리
const videoGrid = document.getElementById('video-grid')
// 비디오 객체를 video-grid에 삽입
const myVideo = document.createElement('video')
myVideo.muted = true

// 웹캠과 오디오 요청
navigator.mediaDevices.getUserMedia({
    // 비디오와 오디오를 킴
    video: true,
    audio: true
    // 요청이 성공하면 자기 영상을 추가하고 시작
}).then(stream => {
    addVideoStream(myVideo, stream)

    // 피어가 접속하면
    peer.on('call', call => {
        // 피어의 영상을 받고
        call.answer(stream)
        const video = document.createElement('video')
        // 피어에게 자신의 영상 객체 보내기
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    // 소켓을 통해 피어와 연결
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

// socket.on('user-connected', userId => {
//     console.log('User connected: ' + userId)
// })


// 피어와 연결하고 피어의 비디오를 추가하는 함수
function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}


// 비디오 객체를 videoGrid에 더하고 실행하는 함수
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}