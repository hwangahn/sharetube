import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import socket from "./socket";
import { Affix, Button, Input, Space, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import { UserOutlined } from "@ant-design/icons"

function Users({userConnected, render}) {

    let [reRender, setReRender] = useState(false);

    useEffect(() => {
        if (render == true) {
            setReRender(true);
        }
    })

    return (
        <div id="users">
            <p><UserOutlined /> {userConnected}</p>
        </div>
    )
}

function ChatInput({chatMessage, setChatMessage}) {

    let handleSendChat = (e) => {
        e.preventDefault();
        if (chatMessage !== "") {
            socket.emit('new chat', socket.auth.roomID, chatMessage);
            setChatMessage("");
        }
    }

    return (
        <div id="chat-box" style={{width: "75%"}}>
                <TextArea id="chat-input" placeholder="Enter your message..." value={chatMessage} autoSize={{ minRows: 1, maxRows: 3}} style={{width: "100%", marginTop: "-10px"}}
                onChange={(e) => {setChatMessage(e.target.value)}} onPressEnter={handleSendChat} />
                <Button id="submit-chat" type="primary" style={{width: "100%", marginTop: "5px"}} onClick={handleSendChat}>Send</Button>
        </div>
    )
}

function Chat({allChat, render}) {

    let bottom = useRef(null);
    let [reRender, setReRender] = useState(false);

    useEffect(() => {
        if (render == true) { 
            setReRender(render);
        }
        bottom.current.scrollIntoView({behavior: "smooth", block: "nearest"});
    })

    return (
        <div style={{height: "425px", width: "75%", overflowY: "scroll", 
                    borderStyle: "solid", borderWidth: ".1px", borderRadius: "5px", borderColor: "#d9dddc", paddingBottom: "10px"}} id="chat">
            {allChat.map(Element => {
                if (Element.userID == socket.id) {
                    return (
                        <div style={{width: "100%"}}>
                            <p style={{marginLeft: "auto", marginRight: "15px", marginBottom: "5px", width: "fit-content"}}>{Element.username}</p>
                            <div id="message-wrapper" style={{marginLeft: "3%", marginBottom: "10px", width: "95%"}}>
                                <div id="message" style={{marginLeft: "auto", marginRight: "0", width: "fit-content", 
                                                            borderRadius: "20px", backgroundColor: "#1677FF", color: "#FFFFFF"}}>
                                    <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px", overflowWrap: "break-word", wordBreak: "break-word"}}>{Element.msg}</p>
                                </div>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div style={{width: "100%"}}>
                            <p style={{marginLeft: "15px", marginRight: "auto", marginBottom: "5px", width: "fit-content"}}>{Element.username}</p>
                            <div id="message-wrapper" style={{marginLeft: "3%", marginBottom: "10px", width: "95%"}}>
                                <div id="message" style={{marginLeft: "0", marginRight: "auto", width: "fit-content",
                                                            borderRadius: "20px", backgroundColor: "#d9d7ce"}}>
                                    <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px", overflowWrap: "break-word", wordBreak: "break-word"}}>{Element.msg}</p>
                                </div>
                            </div>
                        </div>
                    )
                }
            })}
            <div ref={bottom}></div>
        </div>
    )
}

function Chatbox({allChat, chatMessage, setChatMessage, render}) {
    return (
        <div id="chat-box" style={{width: "100%"}}>
            <Chat allChat={allChat} render={render} />
            <br/>
            <ChatInput chatMessage={chatMessage} setChatMessage={setChatMessage} />
        </div>
    )
}

function Miscellaneous() {

    let [userConnected, setUserConnected] = useState();
    let [allChat, setAllChat] = useState([]);
    let [chatMessage, setChatMessage] = useState("");
    let [render, setRender] = useState(false); // flag to re-render child component

    useEffect(() => {

        // runs when first enter room 
        socket.emit('get users', socket.auth.roomID);
        socket.emit('get chat', socket.auth.roomID);
        
        socket.on('users push', (users) => { 
            setUserConnected(users);
            setRender(true);
        });
        
        socket.on('chat history request', (requestID) => {
            socket.emit('chat history', allChat, requestID); // respond with chat history of room
        });
        
        socket.on('chat history push', (newAllChat) => {
            let dummy = allChat;
            if (dummy.length === 0) {
                newAllChat.forEach(Element => {
                    dummy.push(Element);
                });
            }
            setAllChat(dummy);
            setRender(true);
        });
    
        socket.on('new chat push', (userID, username, msg) => { // server push a new chat from an user in the room
            let newAllChat = allChat;
            newAllChat.push({userID: userID, username: username, msg: msg});
            setAllChat(newAllChat);
            setRender(true);
        });
    
        return () => {
            socket.off();
        }

    }, []);

    return (
        <div style={{height: "60%", width: "25%", float: "right", marginRight: "3%"}} id="miscellaneous">
            <Users userConnected={userConnected}
                    render={render} />
            <Chatbox allChat={allChat} 
                    chatMessage={chatMessage} 
                    setChatMessage={(value) => setChatMessage(value)}
                    render={render} />
            {render == true && setRender(false)}
        </div>
    )
}

function Searchbox({setResults, setRender}) {

    let [searchKeyword, setSearchKeyword] = useState("");

    let handleSearch = () => {
        if (searchKeyword.trimStart() != "") {
            setRender(true);
            fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${searchKeyword.trimStart().replaceAll(' ', '+')}&key=${process.env.REACT_APP_YT_API_KEY}&type=video`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                return res.json()
            })
            .then(data => {
                setResults(data.items);
            });
        }
    }

    return (
        <div id="search" >
            <Space id="search-box" size={5} block={true} style={{display: "flex", width: "50%", justifyContent: "center", alignItems: "center", marginLeft: "25%"}} align="start">
                <Input id="search-input" placeholder="Search..." value={searchKeyword} autoSize={{ minRows: 1, maxRows: 3}} style={{width: "375px"}}
                onChange={e => setSearchKeyword(e.target.value)} onPressEnter={handleSearch}/>
                <Button id="submit-search" type="primary" style={{width: "75px"}} onClick={handleSearch}>Search</Button>
            </Space>
        </div>
    )
}

function Player() {

    useEffect(() => {

        window.sendEvent = (state, timestamp) => { // when player's state change and is not server's request, call the function to emit event to server
            socket.emit('video event', socket.auth.roomID, state, timestamp);
        }

        window.getCurrentVideo = () => {
            socket.emit('get current video', socket.auth.roomID); // runs when first enter room 
        }

        socket.on('current video request', (requestID) => {
            let currentVideoState = window.getVideoState(); 

            if (currentVideoState) { // if playing queue is not empty
                socket.emit('current video', currentVideoState, requestID);
            } 
        });

        socket.on('current video push', (currentVideoState) => { 
            window.setServerResponse(true); // indicates that this is a server request
            window.playWithState(currentVideoState);
        })

        socket.on('play video by id', (videoId) => { // server request 
            window.setServerResponse(true); // indicates that this is a server request
            window.playById(videoId);
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
            socket.off();
        }

    }, []);

    return (
        <div id="video-player" style={{width: "100%", height: "540px", marginTop: "30px", marginBottom: "150px"}} >
            <div id="player" style={{backgroundColor: "#1677FF", width: "100%", height: "100%"}} />
        </div>
    )
}

function Result({results, render, setResults}) {

    let [reRender, setReRender] = useState(false);
    let beginResult = useRef(null);

    let requestVideoById = (videoId) => {
        socket.emit('new video by id', socket.auth.roomID, videoId);
    }

    useEffect(() => {
        if (render == true) { 
            setReRender(render);
        }
        setTimeout(() => {
            beginResult.current.scrollIntoView({behavior: "smooth"})
        }, 250);
    });

    return (
        <div id="results" style={{width: "100%", height: "fit-content", marginTop: "30px", marginBottom: "50px"}}>
            <div ref={beginResult} style={{height: "100px"}}></div>
            {results.map(Element => {

                let handleClick = () => {

                    requestVideoById(Element.id.videoId);

                    setResults([]);
                }

                return ( 
                    <div id={`${Element.id.videoId}`} style={{width: "100%", height: "250px"}}>
                        <div id="thumbnail" style={{width: "30%", height: "fit-content", float: "left"}}>
                            <img src={`${Element.snippet.thumbnails.high.url}`} style={{width: "100%", height: "auto", borderRadius: "10px"}} />
                        </div>
                        <div id="details" style={{width: "65%", height: "fit-content", marginLeft: "5%", float: "right"}}>
                            <h3 style={{maxHeight: "225px", marginTop: "-5px", overflowWrap: "break-word", wordBreak: "break-word"}}>
                                {Element.snippet.title.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}
                            </h3>
                            <p style={{marginTop: "-5px", overflowWrap: "break-word", wordBreak: "break-word"}}>
                                {Element.snippet.channelTitle.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}
                            </p>
                            <Space>
                                {Element.snippet.liveBroadcastContent != "live" && 
                                    <Button type="primary" onClick={handleClick} style={{width: "60px"}}>Play</Button>
                                }
                                {Element.snippet.liveBroadcastContent == "live" && 
                                    <Button type="primary" danger={true} onClick={handleClick} style={{width: "60px"}}>Live</Button>
                                }
                            </Space>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function Media() {

    let [player, setPlayer] = useState(window.getPlayer());
    let [results, setResults] = useState([]);
    let [render, setRender] = useState(false);

    useEffect(() => {
        window.setPlayer = (value) => {
            setPlayer(value);
        }
    })

    return (
        <div style={{float: "left", width: "50%", marginTop: "100px", marginLeft: "10%", 
                    justifyContent: "center", alignItems: "center"}} id="media">
            <Searchbox setResults={(value) => setResults(value)}
                        setRender={(value) => setRender(value)} />
            <Player />
            <Result results={results}
                    render={render} 
                    setResults={(value) => setResults(value)}/>  
            {render == true && setRender(false)}
        </div>
    )
}

export default function Home() {
    return (
        <div>
            <Media />
            <Affix offsetTop={140}>
                <Miscellaneous />
            </Affix>
            <Helmet>
                <script>
                    {`

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
                        window.setPlayer(event.data);
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

                    window.playById = (videoId) => {
                        player.loadVideoById(videoId, 0);
                    }

                    window.playWithState = ({videoUrl, state, currentTime}) => { // gets called after server sent back the current video and playing state in room

                        const params = videoUrl.split('=');
                        const videoId = params[params.length - 1];

                        player.loadVideoById(videoId, currentTime);
                        if (state == 2) {
                            player.pauseVideo();
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
                        if (!player || !player.getVideoUrl()) {
                            return null;
                        } else {
                            return {videoUrl: player.getVideoUrl(), state: player.getPlayerState(), currentTime: player.getCurrentTime()}
                        }
                    }

                    `}
                </script>
            </Helmet>
        </div>
    );
}