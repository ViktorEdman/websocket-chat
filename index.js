const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const repl = require('node:repl')

const { Server } = require("socket.io");
const io = new Server(server);

const port = 3007
const host = "localhost"

app.use('/chat', express.static('public'))

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

function listConnections() {
  io.fetchSockets()
  .then(sockets => console.log("Currently connected sockets", 
    sockets.map(socket => {
      return {
                id: socket.id,
                name: socket?.name,
                ip: socket.IP,
                connected: socket.connected}
              })
    ))
}

const chatLog = [
  "Person: Detta är helt seriöst en riktig chattlog",
  "Person2: Ja, precis, detta är inte alls sample data",
  "Person: Tänk om vi bara är påhittade av admin? 😱",
  "Person3: Vad du än gör, logga inte in som admin och skriv /clear!!!!"
]

io.on('connection', (socket) => {
    socket.IP = socket.handshake.headers["x-real-ip"];

    console.log('a user connected '+socket.id);
    listConnections();
    io.to(socket.id).emit('chat history', chatLog)

    
    
    socket.on('chat message', (msg) => {
      if (msg.toLowerCase() === "admin: /clear") {
          chatLog.length=0
          socket.emit("chat history", chatLog)
          return
        }
      socket.name = msg.split(':')[0]
      console.log('message: ' + msg);
      chatLog.push(msg)
      io.emit('chat message', msg);
      listConnections();
    });
  });

server.listen(port, () => {
  console.log(`listening on ${host}:${port}`);
});

repl.start({
  prompt: "admin console>",
  useGlobal: true
})