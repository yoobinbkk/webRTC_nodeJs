const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const https = require('https')
const key = fs.readFileSync(path.join(__dirname,'./keys/key.pem'))
const cert = fs.readFileSync(path.join(__dirname, './keys/cert.pem'))
const server = https.createServer({ key, cert, requestCert: false, rejectUnauthorized: false, },app).listen(3000, () => {
    console.log('server is running at port 3000')
})
const io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', (req, res) => res.redirect(`/123`));

// Server - HTML & PeerJS
app.get('/:room', (req, res) => res.sendFile(path.join(__dirname, './views/room.html')));

io.on('connection', (socket) => {
    console.log('connection ! ');
    socket.on('join-room', (roomId, userId) => {
      console.log(`JOIN : roomId - ${roomId} / userId - ${userId}`);
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId);
      socket.on('disconnect', () => socket.to(roomId).emit('user-disconnected', userId));
    });
});
