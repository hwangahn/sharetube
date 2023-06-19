import { Button, Input, Space } from "antd";
import socket from "./socket";
import { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { UserOutlined } from "@ant-design/icons"

function Users({shouldReRender, userConnected}) {

    let [reRender, setReRender] = useState(false);
    if (reRender != shouldReRender) {
        setReRender(shouldReRender);
    }

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

function Chat({shouldReRender, allChat}) {

    let [reRender, setReRender] = useState(false);
    if (reRender != shouldReRender) {
        setReRender(shouldReRender);
    }

    return (
        <div style={{height: "450px", width: "375px", overflowY: "scroll", borderStyle: "solid", borderWidth: ".1px", borderRadius: "5px"}} id="chat">
            {allChat.map(Element => {
                if (Element.userID == socket.id) {
                    return (
                        <div style={{width: "350px"}}>
                            <p style={{marginLeft: "auto", marginRight: "5px", width: "fit-content"}}>{Element.username}</p>
                            <div id="message" style={{marginLeft: "auto", marginRight: "0", marginBottom: "10px", width: "fit-content",
                                                        borderRadius: "20px", backgroundColor: "#1677FF", color: "#FFFFFF"}}>
                                <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px"}}>{Element.msg}</p>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div style={{width: "350px"}}>
                            <p style={{marginLeft: "15px", marginRight: "auto", width: "fit-content"}}>{Element.username}</p>
                            <div id="message" style={{marginLeft: "10px", marginRight: "auto", marginBottom: "10px", width: "fit-content", alignContent: "left",
                                                        borderRadius: "20px", backgroundColor: "#d9d7ce" }}>
                                <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px"}}>{Element.msg}</p>
                            </div>
                        </div>
                    )
                }
            })}
        </div>
    )
}

function Chatbox({allChat, chatMessage, setChatMessage, shouldReRender}) {
    return (
        <div id="chat-box">
            <Chat allChat={allChat} shouldReRender={shouldReRender} />
            <br/>
            <ChatInput chatMessage={chatMessage} setChatMessage={setChatMessage} />
        </div>
    )
}

function Searchbox({searchKeyword, setSearchKeyword}) {

    let handleSearch = () => {
        if (searchKeyword.trimStart() != "") {
            console.log(searchKeyword.trimStart().replaceAll(' ', '+'));
            fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${searchKeyword.trimStart().replaceAll(' ', '+')}&key=${process.env.REACT_APP_YT_API_KEY}`, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                return res.json()
            })
            .then(data => {
                console.log(data);
            })
            setSearchKeyword("");
        }
    }

    return (
        <div id="search" style={{width: "fit-content", marginLeft: "475px"}}>
            <Space id="search-box" size={5} style={{width: "fit-content"}} align="start">
                <Input id="search-input" placeholder="Search..." value={searchKeyword} autoSize={{ minRows: 1, maxRows: 3}} style={{width: "375px"}}
                onChange={e => setSearchKeyword(e.target.value)} />
                <Button id="submit-search" type="primary" style={{width: "75px"}} onClick={handleSearch}>Search</Button>
            </Space>
        </div>
    )
}

function Player() {
    return (
        <div id="player" style={{backgroundColor: "#1677FF", width: "1280px", height: "720px", marginTop: "30px", marginLeft: "75px"}}>
            
        </div>
    )
}

function Result() {

}

function Media() {

    let [searchKeyword, setSearchKeyword] = useState("");

    return (
        <div style={{width: "fit-content", height: "60%", float: "left", marginTop: "100px"}} id="media">
            <Searchbox searchKeyword={searchKeyword}
                        setSearchKeyword={(value) => setSearchKeyword(value)} />
            <Player />
            <Result />  
        </div>
    )
}

function Miscellaneous({allChat, chatMessage, userConnected, setChatMessage, shouldReRender, setShouldReRender}) {

    return (
        <div style={{width: "25%", height: "60%", float: "right", marginTop: "140px"}} id="miscellaneous">
            <Users userConnected={userConnected} shouldReRender={shouldReRender} />
            <Chatbox allChat={allChat} 
                    chatMessage={chatMessage} 
                    setChatMessage={setChatMessage}
                    shouldReRender={shouldReRender} />
            {setShouldReRender(false)}
        </div>
    )
}

export default function Home() {

    let [userConnected, setUserConnected] = useState();
    let [allChat, setAllChat] = useState([]);
    let [chatMessage, setChatMessage] = useState("");
    let [shouldReRender, setShouldReRender] = useState(false);

    useEffect(() => {

        socket.emit('get users', socket.auth.roomID);
        socket.emit('get chat', socket.auth.roomID);
        
        socket.on('users', (users) => {
            setShouldReRender(true);
            setUserConnected(users);
        });
        
        socket.on('user left', () => {
            setShouldReRender(true);
            setUserConnected((userConnected) => {
                return userConnected - 1;
            });
        });
        
        socket.on('get chat', (requestID) => {
            socket.emit('all chat', allChat, requestID);
        });
        
        socket.on('all chat', (newAllChat) => {
            if (allChat.length === 0) {
                setShouldReRender(true);
                let dummy = allChat;
                newAllChat.forEach(Element => {
                    dummy.push(Element);
                    console.log(dummy);
                });
                setAllChat(() => {
                    return dummy;
                });
            }
        });
    
        socket.on('new chat', (userID, username, msg) => {
            let newAllChat = allChat;
            newAllChat.push({userID: userID, username: username, msg: msg});
            setShouldReRender(true);
            setAllChat(() => {
                return newAllChat;
            });
        });
    
        return () => {
            socket.off();
        }

    }, [])

    return (
        <div>
            <Media />
            <Miscellaneous allChat={allChat}
                            chatMessage={chatMessage}
                            userConnected={userConnected} 
                            setChatMessage={(value) => {setChatMessage(value)}}
                            shouldReRender={shouldReRender}
                            setShouldReRender={(value) => setShouldReRender(value)} />
        </div>
    );
}