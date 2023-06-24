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

app.use("/keepalive", (req, res) => {
    res.status(200).json({res: "kept alive"});
})

io.on("connection", (socket) => {   

    socket.username = socket.handshake.auth.username;
    console.log(`socket ${socket.id} connected`);

    socket.on('disconnecting', () => {

        let iter = socket.rooms.keys();
        iter.next();
        let roomID = iter.next().value;
        io.to(roomID).emit('user left');
        console.log(`socket ${socket.id} disconnected`);

    });

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

    socket.on('get users', async (roomID) => {

        let sockets = await io.in(roomID).fetchSockets();

        console.log(`socket ${socket.id} requesting number of users in room`);
        socket.emit('users', sockets.length);
        socket.to(roomID).emit('users', sockets.length);
        
    });

    socket.on('get chat', async (roomID) => {

        
        let sockets = await io.in(roomID).fetchSockets();
        
        if (sockets[0]) {
            
            let donor = sockets[0].id;
            
            console.log(`socket ${socket.id} requesting chat history from donor ${donor}`);
            socket.to(donor).emit('get chat', socket.id);

        }

    });

    socket.on('all chat', (allChat, requestID) => {

        console.log(`socket ${requestID} receiving chat history in room`);
        socket.to(requestID).emit('all chat', allChat);

    });

    socket.on('new chat', (roomID, msg) => {

        console.log(`socket ${socket.id} sent a message to room ${roomID}`);

        socket.emit('new chat', socket.id, socket.username, msg);
        socket.to(roomID).emit('new chat', socket.id, socket.username, msg);

    });

    socket.on('new video by id', (roomID, videoID) => {

        console.log(`socket ${socket.id} requested to play video ${videoID}`);

        socket.emit('play video by id', videoID);
        socket.to(roomID).emit('play video by id', videoID);

    })

    socket.on('video event', (roomID, type, timestamp) => {

        console.log(`socket ${socket.id} posted an event of type ${type} at timestamp ${timestamp} second`);

        socket.to(roomID).emit('video event', type, timestamp);

    })

});


httpServer.listen(process.env.PORT, () => {
    console.log("listening");
});