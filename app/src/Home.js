import { useEffect, useRef, useState } from "react";
import socket from "./socket";
import { Affix, Button, Input, Space } from "antd";
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

    let handleSendChat = () => {
        if (chatMessage !== "") {
            socket.emit('new chat', socket.auth.roomID, chatMessage);
            setChatMessage("");
        }
    }

    return (
        <Space id="chat-box" size={5} align="start">
            <TextArea id="chat-input" placeholder="Enter your message..." value={chatMessage} autoSize={{ minRows: 1, maxRows: 3}} style={{width: "375px"}}
            onChange={(e) => {setChatMessage(e.target.value)}} />
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
        bottom.current.scrollIntoView({behavior: "smooth"});
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
                                    <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px", wordWrap: "break-word"}}>{Element.msg}</p>
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
                                    <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px", wordWrap: "break-word"}}>{Element.msg}</p>
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
        <div style={{width: "25%", height: "60%", float: "right", marginTop: "140px"}} id="miscellaneous">
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
            })
            setSearchKeyword("");
        }
    }

    return (
        <div id="search" style={{}}>
            <Space id="search-box" size={5} style={{display: "flex", width: "960px", justifyContent: "center", alignItems: "center"}} align="start">
                <Input id="search-input" placeholder="Search..." value={searchKeyword} autoSize={{ minRows: 1, maxRows: 3}} style={{width: "375px"}}
                onChange={e => setSearchKeyword(e.target.value)} />
                <Button id="submit-search" type="primary" style={{width: "75px"}} onClick={handleSearch}>Search</Button>
            </Space>
        </div>
    )
}

function Player() {
    return (
        <div id="player" style={{backgroundColor: "#1677FF", width: "960px", height: "540px", marginTop: "30px", marginBottom: "150px"}}>
            
        </div>
    )
}

function Result({results, render}) {

    let [reRender, setReRender] = useState(false);
    let beginResult = useRef(null);

    useEffect(() => {
        if (render == true) { 
            setReRender(render);
        }
        setTimeout(() => {
            beginResult.current.scrollIntoView({behavior: "smooth"})
        }, 250);
    })

    return (
        <div id="results" style={{width: "960px", height: "fit-content",  marginTop: "30px", marginBottom: "50px"}}>
            <div ref={beginResult} style={{marginBottom: "50px"}}></div>
            {results.map(Element => {
                return ( 
                    <div id={`${Element.id.videoId}`} style={{display: "flex", flexDirection: "row", width: "960px", marginBottom: "50px"}}>
                        <div id="thumbnail" style={{width: "300px", height: "225px"}}>
                            <img src={`${Element.snippet.thumbnails.high.url}`} width="300" height="225" style={{borderRadius: "10px"}} />
                        </div>
                        <div id="details" style={{width: "600px", height: "225px", marginLeft: "50px"}}>
                            <h3 style={{marginTop: "-5px"}}>{Element.snippet.title.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}</h3>
                            <p>{Element.snippet.channelTitle.replaceAll("&quot;", `"`).replaceAll("&#39;", "'")}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function Media() {

    let [results, setResults] = useState([]);
    let [render, setRender] = useState(false);

    return (
        <div style={{display: "flex", height: "60%", float: "left", marginTop: "100px", marginLeft: "250px", 
                    justifyContent: "center", alignItems: "center", flexDirection: "column"}} id="media">
            <Searchbox setResults={(value) => setResults(value)}
                        setRender={(value) => setRender(value)} />
            <Player />
            <Result results={results}
                    render={render} />  
            {render == true && setRender(false)}
        </div>
    )
}

export default function Home() {

    return (
        <div>
            <Media />
            <Affix offsetTop={-100}>
                <Miscellaneous />
            </Affix>
        </div>
    );
}