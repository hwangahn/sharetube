const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.urlencoded());
app.use(express.text());
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
    },
});

io.on("connection", (socket) => {   

    socket.on('connect', () => {
        console.log(`socket ${socket.id} connected`);
    })

    socket.on('disconnect', () => {
        console.log(`socket ${socket.id} disconnected`);
    })

    socket.on('join room', (roomID) => {

        let roomList = io.sockets.adapter.rooms;
        let hasRoom = false;

        console.log(roomList);

        for ([key, value] of roomList.entries()) {
            if (key == roomID) {
                hasRoom = true;
                break;
            }
        }

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

        console.log(`${socket.username} created room ${roomID}`);

    })

    socket.on('chat', (roomID, msg) => {
        console.log(roomID);
        console.log(msg);
    });

    socket.on('change timestamp', (roomID, timestamp) => {
        console.log(roomID);
        console.log(timestamp);
    })

});


httpServer.listen(4000, () => {
    console.log("listening");
});