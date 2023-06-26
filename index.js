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
});

app.get("/keepalive", (req, res) => {
    console.log("server kept alive");
});

app.get("/health", (req, res) => {
    res.status(200).json({msg: "OK"});
})

io.on("connection", (socket) => {   

    socket.username = socket.handshake.auth.username;
    console.log(`socket ${socket.id} connected`);

    socket.on('disconnecting', async () => {

        let iter = socket.rooms.keys();
        iter.next();
        let roomID = iter.next().value;

        let sockets = await io.in(roomID).fetchSockets();

        io.to(roomID).emit('users push', sockets.length - 1);

        console.log(`socket ${socket.id} disconnected`);

    });

    // room related listeners
    socket.on('join room', (roomID) => {

        let roomList = io.sockets.adapter.rooms;

        console.log(roomList);

        if (!roomList.has(roomID)) {

            socket.emit('reject', `Can't find room ${roomID}`);
            console.log(`can't find room ${roomID}. socket ${socket.id} will now disconnect`);

        } else {

            socket.join(roomID);
            socket.emit('allow', roomID);
            console.log(`socket ${socket.id} joined room ${roomID}`);
            
        }

    });

    socket.on('create room', (roomID) => {

        socket.join(roomID);
        socket.emit('allow', roomID);

        console.log(`socket ${socket.id} created room ${roomID}`);

    });

    // user related listeners
    socket.on('get users', async (roomID) => {

        let sockets = await io.in(roomID).fetchSockets();

        console.log(`socket ${socket.id} requesting number of users in room`);
        socket.emit('users push', sockets.length);
        socket.to(roomID).emit('users push', sockets.length);
        
    });

    // chat related listeners
    socket.on('get chat', async (roomID) => {

        let sockets = await io.in(roomID).fetchSockets();
        
        if (sockets[0]) {
            
            let donor = sockets[0].id;
            
            console.log(`socket ${socket.id} requesting chat history in room ${roomID} from donor ${donor}`);
            socket.to(donor).emit('chat history request', socket.id);

        }

    });

    socket.on('chat history', (allChat, requestID) => {

        console.log(`socket ${requestID} receiving chat history in room`);
        socket.to(requestID).emit('chat history push', allChat);

    });

    socket.on('new chat', (roomID, msg) => {

        console.log(`socket ${socket.id} sent a message to room ${roomID}`);

        socket.emit('new chat push', socket.id, socket.username, msg);
        socket.to(roomID).emit('new chat push', socket.id, socket.username, msg);

    });

    // video related listeners
    socket.on('get current video', async (roomID) => {

        let sockets = await io.in(roomID).fetchSockets();
        
        if (sockets[0]) {
            
            let donor = sockets[0].id;
            
            console.log(`socket ${socket.id} requesting video playing in room ${roomID} from donor ${donor}`);
            socket.to(donor).emit('current video request', socket.id);

        }

    });

    socket.on('current video', (currentVideoState, requestID) => {

        console.log(`socket ${requestID} receiving current video state in room`);
        console.log(`current video url is ${currentVideoState.videoUrl}`)

        socket.to(requestID).emit('current video push', currentVideoState);

    })

    socket.on('new video by id', (roomID, videoID) => {

        console.log(`socket ${socket.id} wants to play video ${videoID}`);

        socket.emit('play video by id', videoID);
        socket.to(roomID).emit('play video by id', videoID);

    });

    socket.on('video event', (roomID, type, timestamp) => {

        console.log(`socket ${socket.id} made an event of type ${type} at timestamp ${timestamp} second`);

        socket.to(roomID).emit('video event push', type, timestamp);

    });

});


httpServer.listen(process.env.PORT, '0.0.0.0', () => {
    console.log("listening");
});