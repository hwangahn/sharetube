import { useContext, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import socket from "../socket";
import { VideoContext } from "../utils/context";

export default function Player() {

    let { videoDetails, setVideoDetails } = useContext(VideoContext);

    let beginPlayer = useRef(null);

    useEffect(() => {
        beginPlayer.current.scrollIntoView({behavior: "smooth"});

        window.sendEvent = (state, timestamp) => { // when player's state change and is not server's request, call the function to emit event to server
            socket.emit('video event', socket.auth.roomID, state, timestamp);
        }

        window.getCurrentVideo = () => {
            socket.emit('get current video', socket.auth.roomID); // runs when first enter room 
        }

        socket.on('current video request', (requestID) => {
            let currentVideoState = window.getVideoState();

            if (currentVideoState.state != 5) {

                // insert video info
                currentVideoState.videoId = videoDetails.videoId; 
                currentVideoState.videoTitle = videoDetails.videoTitle;
                currentVideoState.videoChannel = videoDetails.videoChannel;

                socket.emit('current video', currentVideoState, requestID);
            }
        });

        socket.on('current video push', (currentVideoState) => { 
            window.setServerResponse(true); // indicates that this is a server request
            setVideoDetails({videoId: currentVideoState.videoId,
                            videoTitle: currentVideoState.videoTitle,
                            videoChannel: currentVideoState.videoChannel}); // update video details
            window.playById(currentVideoState.videoId, currentVideoState.state, currentVideoState.currentTime);
        })

        socket.on('play video by id', (videoDetails) => { // server request 
            window.setServerResponse(true); // indicates that this is a server request
            setVideoDetails(videoDetails); // update video details
            window.playById(videoDetails.videoId);
        });

        socket.on('video event push', (type, timestamp) => { // server request video state change
            window.setServerResponse(true); // indicates that this is a server request
            if (type == 1) {
                window.play(timestamp);
            } else if (type == 2) {
                window.pause();
            }
        });

        return () => {
            socket.off('current video request');
            socket.off('current video push');
            socket.off('play video by id');
            socket.off('video event push');
        }
    }, [videoDetails]);

    return (
        <>
            <div id="video" style={{height: "100%", marginLeft: "3%"}}>
                <div ref={beginPlayer}></div>
                <div id="player" style={{width: "100%", height: "80%", paddingTop: "10px"}} />
                <div id="video-details" style={{width: "100%", height: "20%", paddingTop: "10px"}}>
                    <h3 style={{overflowWrap: "break-word", wordBreak: "break-word"}}>
                        {videoDetails?.videoTitle}
                    </h3>
                    <p>
                        {videoDetails?.videoChannel}
                    </p>
                </div>
            </div>
            <Helmet>
                <script>
                    {`
                    let tag;
                    let player = null;
                    let serverResponse = false;

                    window.setServerResponse = (value) => {
                        serverResponse = value;
                    }

                    tag = document.createElement('script');
                    tag.src = "https://www.youtube.com/iframe_api";
                    var firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                    window.onYouTubeIframeAPIReady = () => {
                        player = new YT.Player('player', {
                            height: '540',
                            width: '960',
                            host: "https://www.youtube-nocookie.com",
                            playerVars: {
                                'playsinline': 1, 
                                'modestbranding': 1, 
                                'fs': 0
                            },
                            events: {
                                'onReady': onPlayerReady,
                                'onStateChange': onPlayerStateChange
                            }
                        });
                    }

                    // standard youtube iframe api initialization code

                    window.onPlayerReady = (event) => {
                        window.getCurrentVideo();
                    }

                    window.onPlayerStateChange = (event) => {

                        if (event.data == 1 || event.data == 2) { // only consider play (1) and pause (2) events
                            if (!serverResponse) { // check to see if the event was made by server
                                window.sendEvent(event.data, event.target.getCurrentTime()); 
                                // if not (made by user), send the event to the server to sync with other clients in the room
                            }
                            serverResponse = false; // if it is made by server, consume the flag
                        }
                    }

                    window.playById = (videoId, state = 1, currentTime = 0) => {
                        player.loadVideoById(videoId, currentTime);
                        if (state == 2) {
                            player.pauseVideo();
                            serverResponse = false;
                        }
                    }

                    window.pause = () => {
                        player.pauseVideo();
                    }

                    window.play = (timestamp) => {
                        player.seekTo(timestamp, true);
                        player.playVideo();
                    }

                    window.getVideoState = () => {
                        if (!player) {
                            return null;
                        } else {
                            return {state: player.getPlayerState(), currentTime: player.getCurrentTime()}
                        }
                    }

                    `}
                </script>
            </Helmet>
        </>
    )
}