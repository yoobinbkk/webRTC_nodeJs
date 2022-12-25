// 서버 관련 변수들
const express = require('express')
const app = express()
const https = require('https');

// 파일 관련 변수들
const path = require('path')
const fs = require("fs");

// ssl/tlc 키로 https 서버 생성
const server = https
    .createServer(
        {
            key: fs.readFileSync("key.pem"),
            cert: fs.readFileSync("cert.pem"),
        },
        app
    )
    .listen(3000, ()=> {
        console.log('server is running at port 3000')
    });
// 그 서버로 웹소켓을 생성
const io = require('socket.io')(server)
// uuId로 roomId 암호화
const { v4: uuidV4 } = require('uuid')

// ejs로 엔진 설정
app.set('view engine', 'ejs')
// public 폴더에 웹페이지
app.use(express.static('public'))

// 루트 주소에 uuid를 부여하고
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})
// 그 uuid를 roomId 키에 넣어 파라미터로 ejs 로 넘기기
app.get('/:room', (req, res) => {
    res.sendFile(path.join(__dirname, './views/room.html'))
})

// 소켓으로 연결할 때
io.on('connection', socket => {

    console.log('connection ! ');
    // 방을 생성하거나 참여하는 이벤트 발생
    socket.on('join-room', (roomId, userId) => {

        console.log(`JOIN : roomId - ${roomId} / userId - ${userId}`);

        // 사용자가 방에 들어왔을 때 user-connected 이벤트 발생
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)
        
        // 사용자가 방을 나갔을 때 user-disconnected 이벤트 발생
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnect', userId)
        })
    })
})