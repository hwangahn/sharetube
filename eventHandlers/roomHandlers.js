module.exports = (io) => {

    let handleDisconnect = async function (reasons) {

        let socket = this;

        let iter = socket.rooms.keys();
        iter.next();
        let roomID = iter.next().value;

        let sockets = await io.in(roomID).fetchSockets();

        io.to(roomID).emit('users push', sockets.length - 1);

        console.log(`socket ${socket.id} disconnected because ${reasons}`);

    }

    let handleJoinRoom = function (roomID) {

        let socket = this;

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

    }

    let handleCreateRoom = function (roomID) {

        let socket = this;

        socket.join(roomID);
        socket.emit('allow', roomID);

        console.log(`socket ${socket.id} created room ${roomID}`);

    }

    return {
        handleDisconnect, 
        handleJoinRoom, 
        handleCreateRoom
    }

}