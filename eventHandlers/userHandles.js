module.exports = (io) => {

    let handleGetUsers = async function (roomID) {

        let socket = this;

        let sockets = await io.in(roomID).fetchSockets();

        console.log(`socket ${socket.id} requesting number of users in room`);
        socket.emit('users push', sockets.length);
        socket.to(roomID).emit('users push', sockets.length);

    }

    return {
        handleGetUsers
    }

}