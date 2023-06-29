module.exports = (io) => {

    let handleGetChat = async function (roomID) {

        let socket = this;
        let sockets = await io.in(roomID).fetchSockets();
        
        if (sockets[0]) {
            
            let donor = sockets[0].id;
            
            console.log(`socket ${socket.id} requesting chat history in room ${roomID} from donor ${donor}`);
            socket.to(donor).emit('chat history request', socket.id);

        }

    }

    let handleChatHistory = function (allChat, requestID) {

        let socket = this;

        console.log(`socket ${requestID} receiving chat history in room`);
        socket.to(requestID).emit('chat history push', allChat);

    };

    let handleNewChat = function (roomID, msg) {

        let socket = this;

        console.log(`socket ${socket.id} sent a message to room ${roomID}`);

        socket.emit('new chat push', socket.id, socket.username, msg);
        socket.to(roomID).emit('new chat push', socket.id, socket.username, msg);

    }

    return {
        handleGetChat, 
        handleChatHistory, 
        handleNewChat,
    }

}