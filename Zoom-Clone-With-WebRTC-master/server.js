// 서버 관련 변수들
const express = require('express')
const app = express()
const https = require('https');
const fs = require("fs");

// ssl/tlc 키로 서버 생성
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

// uuId로 roomId 암호화
const { v4: uuidV4 } = require('uuid')

// ejs로 엔진 설정
app.set('view engine', 'ejs')
// public 폴더에 웹페이지
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

const io = require('socket.io')(server)
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        // console.log(roomId, userId)
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnect', userId)
        })
    })
})

