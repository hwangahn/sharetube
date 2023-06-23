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
        <Space id="chat-box" size={5} align="start">
            <TextArea id="chat-input" placeholder="Enter your message..." value={chatMessage} autoSize={{ minRows: 1, maxRows: 3}} style={{width: "375px"}}
            onChange={(e) => {setChatMessage(e.target.value)}} onPressEnter={handleSendChat} />
            <Button id="submit-chat" type="primary" style={{width: "75px"}} onClick={handleSendChat}>Send</Button>
        </Space>
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
        <div style={{height: "450px", width: "375px", overflowY: "scroll", borderStyle: "solid", borderWidth: ".1px", borderRadius: "5px", paddingBottom: "10px"}} id="chat">
            {allChat.map(Element => {
                if (Element.userID == socket.id) {
                    return (
                        <div style={{width: "350px"}}>
                            <p style={{marginLeft: "auto", marginRight: "5px", marginBottom: "5px", width: "fit-content"}}>{Element.username}</p>
                            <div id="message-wrapper" style={{marginLeft: "10px", marginBottom: "10px", width: "340px"}}>
                                <div id="message" style={{marginLeft: "auto", marginRight: "0", width: "fit-content", 
                                                            borderRadius: "20px", backgroundColor: "#1677FF", color: "#FFFFFF"}}>
                                    <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px", overflowWrap: "break-word", wordBreak: "break-word"}}>{Element.msg}</p>
                                </div>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div style={{width: "350px"}}>
                            <p style={{marginLeft: "15px", marginRight: "auto", marginBottom: "5px", width: "fit-content"}}>{Element.username}</p>
                            <div id="message-wrapper" style={{marginLeft: "10px", marginBottom: "10px", width: "340px"}}>
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
        <div id="chat-box">
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
    let [render, setRender] = useState(false);

    useEffect(() => {

        socket.emit('get users', socket.auth.roomID);
        socket.emit('get chat', socket.auth.roomID);
        
        socket.on('users', (users) => {
            setUserConnected(users);
            setRender(true);
        });
        
        socket.on('user left', () => {
            setUserConnected((userConnected) => {
                return userConnected - 1;
            });
            setRender(true);
        });
        
        socket.on('get chat', (requestID) => {
            socket.emit('all chat', allChat, requestID);
        });
        
        socket.on('all chat', (newAllChat) => {
            let dummy = allChat;
            if (dummy.length === 0) {
                newAllChat.forEach(Element => {
                    dummy.push(Element);
                    console.log(dummy);
                });
            }
            setAllChat(dummy);
            setRender(true);
        });
    
        socket.on('new chat', (userID, username, msg) => {
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
        <div style={{width: "25%", height: "60%", float: "right"}} id="miscellaneous">
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
            console.log(searchKeyword.trimStart().replaceAll(' ', '+'));
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
                console.log(data);
            });
        }
    }

    return (
        <div id="search" style={{}}>
            <Space id="search-box" size={5} style={{display: "flex", width: "960px", justifyContent: "center", alignItems: "center"}} align="start">
                <Input id="search-input" placeholder="Search..." value={searchKeyword} autoSize={{ minRows: 1, maxRows: 3}} style={{width: "375px"}}
                onChange={e => setSearchKeyword(e.target.value)} onPressEnter={handleSearch}/>
                <Button id="submit-search" type="primary" style={{width: "75px"}} onClick={handleSearch}>Search</Button>
            </Space>
        </div>
    )
}

function Player() {

    useEffect(() => {

        window.sendEvent = (state, timestamp) => {
            socket.emit('video event', socket.auth.roomID, state, timestamp);
        }

        socket.on('play video by id', (videoId) => {
            window.setServerResponse(true);
            window.playById(videoId);
        });

        socket.on('video event', (type, timestamp) => {
            window.setServerResponse(true);
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
        <div id="video-player" style={{width: "fit-content", height: "fit-content", marginTop: "30px", marginBottom: "150px"}} >
            <div id="player" style={{backgroundColor: "#1677FF", width: "960px", height: "540px"}} />
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
        <div id="results" style={{width: "960px", height: "fit-content",  marginTop: "30px", marginBottom: "50px"}}>
            <div ref={beginResult} style={{marginBottom: "50px"}}></div>
            {results.map(Element => {

                let handleClick = () => {

                    requestVideoById(Element.id.videoId);

                    setResults([]);
                }

                console.log(Element.snippet.liveBroadcastContent == "live");

                return ( 
                    <div id={`${Element.id.videoId}`} style={{display: "flex", flexDirection: "row", width: "960px", marginBottom: "50px"}}>
                        <div id="thumbnail" style={{width: "300px", height: "225px"}}>
                            <img src={`${Element.snippet.thumbnails.high.url}`} width="300" height="225" style={{borderRadius: "10px"}} />
                            {Element.snippet.liveBroadcastContent == "live" && 
                            <div style={{height: "fit-content", width: "fit-content", backgroundColor: "#fc0905", borderRadius: "5px",
                                        marginLeft: "auto", marginRight: "10px", marginTop: "-55px"}}>
                                <p style={{paddingTop: "3px", paddingBottom: "3px", paddingLeft: "5px", paddingRight: "5px", color: "#FFFFFF"}}>LIVE</p>    
                            </div>}
                        </div>
                        <div id="details" style={{width: "600px", height: "225px", marginLeft: "50px", marginTop: "10px"}}>
                            <h3 style={{marginTop: "-5px"}}>{Element.snippet.title.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}</h3>
                            <p>{Element.snippet.channelTitle.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}</p>
                            <Button type="primary" onClick={handleClick}>Play</Button>
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
        <div style={{display: "flex", height: "60%", float: "left", marginTop: "100px", marginLeft: "250px", 
                    justifyContent: "center", alignItems: "center", flexDirection: "column"}} id="media">
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
                    }

                    window.onPlayerStateChange = (event) => {

                        console.log(event.data);

                        if (event.data == 1 || event.data == 2) { // only consider play (1) and pause (2) events
                            if (!serverResponse) { // check to see if the event was made by server
                                window.sendEvent(event.data, event.target.getCurrentTime()); 
                                // if not (aka made by user), send the event to the server to sync with others in the room
                            }
                            serverResponse = false; // if it is made by server, consume the flag
                        }
                    }

                    window.playById = (videoId) => {
                        player.loadVideoById(videoId, 0);
                    }

                    window.pause = () => {
                        player.pauseVideo();
                    }

                    window.play = (timestamp) => {
                        player.seekTo(timestamp, true);
                        player.playVideo();
                    }

                    `}
                </script>
            </Helmet>
        </div>
    );
}