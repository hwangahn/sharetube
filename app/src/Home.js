import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import socket from "./socket";
import { Affix, Button, Input, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { UserOutlined, TeamOutlined, CopyOutlined, SearchOutlined } from "@ant-design/icons";

const SearchContext = createContext(null);
const VideoContext = createContext(null);

function Searchbox() {

    let [value, setValue] = useState("");
    let { setSearchKeyword } = useContext(SearchContext); 

    let handleSearch = () => {
        setSearchKeyword(value); // update when begin fetching results
        setValue("");
    }

    return (
        <div id="search" style={{width: "40%", height: "100%", marginLeft: "auto", marginRight: "auto"}}>
            <Input id="search-input" placeholder="Search..." value={value} style={{width: "85%", marginRight: "1%", borderRadius: "50px", marginTop: "9px"}}
            onChange={e => setValue(e.target.value)} onPressEnter={handleSearch}/>
            <Button id="submit-search" type="primary" shape="circle" icon={<SearchOutlined />} onClick={handleSearch} />
        </div>
    )
}

function Navbar() {
    return (
        <Affix id="nav-bar" offsetTop={8}>
            <div style={{height: "50px", width: "100%", marginTop: "-8px", justifyContent: "center", background: "#ffffff", zIndex: "10"}}>
                <img src="/logo.jpeg" height={50} width={200} style={{display: "float", float: "left", marginLeft: "20px"}} />
                <div style={{display: "float", float: "right", height: "50px", width: "fit-content", marginRight: "20px"}}>
                    <p>Hello, <UserOutlined style={{marginRight: "5px"}} />{socket.auth.username}</p>
                </div>
                <Searchbox />
            </div>
        </Affix>
    )
}

function Info() {

    let [userConnected, setUserConnected] = useState();
    let [render, setRender] = useState(false);

    let param = useParams()

    useEffect(() => {
        socket.emit('get users', socket.auth.roomID); // request to get number of users when first entering room
        
        socket.on('users push', (users) => { // handle server update user count
            setUserConnected(users);
            setRender(true);
        });

        return () => {
            socket.off('users push');
        }
    }, []);

    let handleClick = () => {
        navigator.clipboard.writeText(param.roomID);
        message.success("Room ID copied");
    }

    return (
        <>
            <div id="info" style={{width: "100%", height: "fit-content"}}>
                <div id="room-id" style={{float: "left", width: "fit-content"}}>
                    <h5 style={{marginBottom: "-10px"}}>Room ID:</h5>
                    <p>{param.roomID}<Button size="small" type="ghost" style={{marginLeft: "5px"}} onClick={handleClick}><CopyOutlined /></Button></p>
                    
                </div>
                <div id="users" style={{float: "right", width: "fit-content"}}>
                    <h5 style={{marginBottom: "-10px"}}>Users:</h5>
                    <p><TeamOutlined /> {userConnected}</p>
                </div>
            </div>
            {render == true && setRender(false)}
        </>
    )
}

function Message({Element}) {
    if (Element.userID == socket.id) {
        return (
            <div style={{width: "100%"}}>
                <p style={{marginLeft: "auto", marginRight: "20px", marginBottom: "5px", width: "fit-content"}}>{Element.username}</p>
                <div id="message-wrapper" style={{marginLeft: "2%", marginBottom: "10px", width: "95%"}}>
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
                <div id="message-wrapper" style={{marginLeft: "2%", marginBottom: "10px", width: "95%"}}>
                    <div id="message" style={{marginLeft: "0", marginRight: "auto", width: "fit-content",
                                                borderRadius: "20px", backgroundColor: "#d9d7ce"}}>
                        <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px", overflowWrap: "break-word", wordBreak: "break-word"}}>{Element.msg}</p>
                    </div>
                </div>
            </div>
        )
    }
}

function Chatbox() {

    let [chatMessage, setChatMessage] = useState("");
    let [allChat, setAllChat] = useState([]);
    let [render, setRender] = useState(false);

    let lastMessage = useRef(null);
    
    useEffect(() => {
        socket.emit('get chat', socket.auth.roomID);
        
        socket.on('chat history request', (requestID) => {
            socket.emit('chat history', allChat, requestID); // respond with chat history of room
        });
        
        socket.on('chat history push', (newAllChat) => { // handle server send chat history
            let dummy = allChat;
            if (dummy.length === 0) {
                newAllChat.forEach(Element => {
                    dummy.push(Element);
                });
            }
            setAllChat(dummy);
            setRender(true);
        });
    
        socket.on('new chat push', (userID, username, msg) => { // handle server push a new chat 
            let newAllChat = allChat;
            newAllChat.push({userID: userID, username: username, msg: msg});
            setAllChat(newAllChat);
            setRender(true);
        });
    
        return () => {
            socket.off('chat history request');
            socket.off('chat history push');
            socket.off('new chat push');
        }
    }, []);

    useEffect(() => {
        lastMessage.current.scrollIntoView({behavior: "smooth", block: "nearest"});
    });

    let handleSendChat = (e) => {
        e.preventDefault();
        if (chatMessage !== "") {
            socket.emit('new chat', socket.auth.roomID, chatMessage);
            setChatMessage("");
        }
    }

    return (
        <>
            <div id="chat-box" style={{width: "100%", height: "calc(100% - 74.39px)"}}>
                <div id="chat" style={{height: "calc(100% - 64px)", width: "100%", overflowY: "scroll", 
                                        borderStyle: "solid", borderWidth: "1px", borderRadius: "5px", borderColor: "#d9dddc"}}>
                    {allChat.map(Element => {
                        return <Message Element={Element} />
                    })}
                    <div ref={lastMessage} style={{height: "0px"}}></div>
                </div>
                <div id="chat-input" style={{width: "100%", height: "fit-content"}}>
                    <TextArea id="chat-input" placeholder="Enter your message..." value={chatMessage} autoSize={{ minRows: 1, maxRows: 3}} 
                    style={{width: "100%"}} onChange={(e) => {setChatMessage(e.target.value)}} onPressEnter={handleSendChat} />
                    <Button id="submit-chat" type="primary" style={{width: "100%"}} onClick={handleSendChat}>Send</Button>
                </div>
            </div>
            {render == true && setRender(false)}
        </>
    )
}

function RoomMiscellany() {
    return (
        <Affix id="room-miscellany" offsetTop={68} style={{height: "80%", width: "25%", float: "right", marginRight: "3%"}}>
            <Info />
            <Chatbox />
        </Affix>
    )
}

function Video() {

    let { videoDetails, setVideoDetails } = useContext(VideoContext);

    let beginPlayer = useRef(null);

    useEffect(() => {
        beginPlayer.current.scrollIntoView({behavior: "smooth"})

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
        <div id="video" style={{float: "left", width: "65%", height: "100%", marginLeft: "3%"}}>
            <div ref={beginPlayer}></div>
            <div id="player" style={{width: "100%", height: "80%", paddingTop: "10px"}} />
            <div id="video-details" style={{width: "100%", height: "20%", paddingTop: "10px"}}>
                <h3 style={{overflowWrap: "break-word", wordBreak: "break-word"}}>
                    {videoDetails && videoDetails.videoTitle}
                </h3>
                <p>
                    {videoDetails && videoDetails.videoChannel}
                </p>
            </div>
        </div>
    )
}

function VideoCard({Element}) {

    let { setVideoDetails } = useContext(VideoContext);

    let handleClick = () => {
        setVideoDetails({videoId: Element.id.videoId, 
                        videoTitle: Element.snippet.title.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&"), 
                        videoChannel: Element.snippet.channelTitle.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}); // update video details
        socket.emit('new video by id', socket.auth.roomID, 
            {videoId: Element.id.videoId, 
            videoTitle: Element.snippet.title.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&"), 
            videoChannel: Element.snippet.channelTitle.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}); // request playing video of following details
    }

    return ( 
        <div id={`${Element.id.videoId}`} style={{width: "100%", height: "300px"}}>
            <div id="thumbnail" style={{width: "30%", height: "fit-content", float: "left"}}>
                <img src={`${Element.snippet.thumbnails.high.url}`} style={{width: "100%", height: "auto", borderRadius: "10px"}} />
            </div>
            <div id="details" style={{width: "65%", height: "fit-content", marginLeft: "5%", marginTop: "10px", float: "right"}}>
                <h4 style={{marginTop: "-5px", overflowWrap: "break-word", wordBreak: "break-word"}}>
                    {Element.snippet.title.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}
                </h4>
                <p style={{marginTop: "-5px", overflowWrap: "break-word", wordBreak: "break-word"}}>
                    {Element.snippet.channelTitle.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}
                </p>
                {Element.snippet.liveBroadcastContent != "live" && 
                    <Button type="primary" onClick={handleClick} style={{width: "60px"}}>Play</Button>
                }
                {Element.snippet.liveBroadcastContent == "live" && 
                    <Button type="primary" danger={true} onClick={handleClick} style={{width: "60px"}}>Live</Button>
                }
            </div>
        </div>
    )
}

function Result() {

    let [results, setResults] = useState([]);
    let {searchKeyword, setSearchKeyword} = useContext(SearchContext);

    let beginResult = useRef(null);

    useEffect(() => {
        if (searchKeyword.trimStart() != "") {
            let finalKeyword = searchKeyword.trimStart().replaceAll(' ', '+');
            fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${finalKeyword}&key=${process.env.REACT_APP_YT_API_KEY}&type=video`, {
                method: 'get', 
                headers: { 
                    "Content-Type": "application/json" 
                }, 
            })
            .then(res => {
                return res.json();
            })
            .then(data => {
                setResults(data.items);
                setSearchKeyword("");
                console.log("fetching");
                
                setTimeout(() => {
                    beginResult.current.scrollIntoView({behavior: "smooth"});
                }, 500);
            });
        }
    }, [searchKeyword]);

    return (
        <div id="results" style={{display: "float", float: "left", width: "65%", height: "fit-content", marginTop: "30px", marginBottom: "50px", marginLeft: "3%"}}>
            <div ref={beginResult} style={{height: "100px"}}></div>
            {results.map(Element => {
                return <VideoCard Element={Element} />
            })}
        </div>
    )
}

export default function Home() {

    let [searchKeyword, setSearchKeyword] = useState("");
    let [videoDetails, setVideoDetails] = useState();

    return (
        <SearchContext.Provider value={{searchKeyword, setSearchKeyword}}>
            <VideoContext.Provider value={{videoDetails, setVideoDetails}}> 
                <Navbar />
                <RoomMiscellany />
                <Video />
                <Result />
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
                            if (!player || !player.getVideoUrl()) {
                                return null;
                            } else {
                                return {state: player.getPlayerState(), currentTime: player.getCurrentTime()}
                            }
                        }

                        `}
                    </script>
                </Helmet>
            </VideoContext.Provider>
        </SearchContext.Provider>
    );
}