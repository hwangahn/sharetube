const express = require("express");
require('dotenv').config();
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.urlencoded());
app.use(express.text());
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
    },
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 2 * 60 * 1000,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    }
    
});

let { handleGetChat, handleChatHistory, handleNewChat } = require('./eventHandlers/chatHandler')(io);
let { handleDisconnect, handleJoinRoom, handleCreateRoom } = require('./eventHandlers/roomHandlers')(io);
let { handleGetUsers } = require('./eventHandlers/userHandles')(io);
let { handleGetCurrentVideo, handleCurrentVideo, handleNewVideoById, handleVideoEvent } = require('./eventHandlers/videoHandler')(io);


app.get("/keepalive", (req, res) => {
    console.log("server kept alive");
});

app.get("/health", (req, res) => {
    res.status(200).json({msg: "OK"});
});

io.use((socket, next) => {
    socket.username = socket.handshake.auth.username;
    console.log(`socket ${socket.id} connected`);

    next()
})

io.on("connection", (socket) => {   

    // room related listeners
    socket.on('disconnecting', handleDisconnect);

    socket.on('join room', handleJoinRoom);

    socket.on('create room', handleCreateRoom);

    // user related listeners
    socket.on('get users', handleGetUsers);

    // chat related listeners
    socket.on('get chat', handleGetChat);

    socket.on('chat history', handleChatHistory);

    socket.on('new chat', handleNewChat);

    // video related listeners
    socket.on('get current video', handleGetCurrentVideo);

    socket.on('current video', handleCurrentVideo);

    socket.on('new video by id', handleNewVideoById);

    socket.on('video event', handleVideoEvent);

});


httpServer.listen(process.env.PORT, '0.0.0.0', () => {
    console.log("listening");
});