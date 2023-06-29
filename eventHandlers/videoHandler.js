module.exports = (io) => {

    let handleGetCurrentVideo = async function (roomID) {

        let socket = this;

        let sockets = await io.in(roomID).fetchSockets();
        
        if (sockets[0]) {
            
            let donor = sockets[0].id;
            
            console.log(`socket ${socket.id} requesting video playing in room ${roomID} from donor ${donor}`);
            socket.to(donor).emit('current video request', socket.id);

        }

    }

    let handleCurrentVideo = function (currentVideoState, requestID) {

        let socket = this;

        console.log(`socket ${requestID} receiving current video state in room`);

        socket.to(requestID).emit('current video push', currentVideoState);

    }

    let handleNewVideoById = function (roomID, videoDetails) {

        let socket = this;

        console.log(`socket ${socket.id} wants to play video ${videoDetails.videoId}`);

        socket.emit('play video by id', videoDetails);
        socket.to(roomID).emit('play video by id', videoDetails);

    }

    let handleVideoEvent = function (roomID, type, timestamp) {

        let socket = this;

        console.log(`socket ${socket.id} made an event of type ${type} at timestamp ${timestamp} second`);

        socket.to(roomID).emit('video event push', type, timestamp);

    }

    return {
        handleGetCurrentVideo, 
        handleCurrentVideo,
        handleNewVideoById, 
        handleVideoEvent
    }

}