const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const server = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  }, app);
// const server = require('http').Server(app);
const io = require('socket.io')(server);
const Peer = require('peer');
// const peerServer = Peer({ port: 9000 });

app.use(express.static('public'));

io.on('connection', socket => {
    const peer = new Peer();
    peer.on('signal', signal => {
      socket.emit('offer', socket.id, signal);
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
  });

server.listen(3001);