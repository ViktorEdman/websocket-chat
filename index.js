const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const port = 3007
const host = "localhost"

app.use('/chat', express.static('public'))

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const chatLog = []

io.on('connection', (socket) => {
    io.fetchSockets().then(sockets => console.log("Currently connected sockets", sockets.map(socket => socket.id)))
    console.log('a user connected '+socket.id);
    console.log(chatLog)
    io.to(socket.id).emit('chat history', chatLog)
    console.log(socket.handshake.headers["x-real-ip"]);
    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      chatLog.push(msg)
      io.emit('chat message', msg);
    });
  });

server.listen(port, () => {
  console.log(`listening on ${host}:${port}`);
});