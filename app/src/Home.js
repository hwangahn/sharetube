import { Button, Space } from "antd";
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
        <div style={{marginTop: "100px"}} id="users">
            {userConnected.map(Element => {
                return <p><UserOutlined /> {Element.username}</p>
            })}
        </div>
    )
}

function ChatInput({chatMessage, setChatMessage}) {

    let handleSendChat = () => {
        if (chatMessage !== "") {
            socket.emit('chat', socket.auth.roomID, chatMessage);
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
                            <p style={{marginLeft: "auto", marginRight: "0", width: "fit-content"}}>{Element.username}:</p>
                            <div id="message" style={{marginLeft: "auto", marginRight: "0", marginBottom: "10px", width: "fit-content",
                                                        borderRadius: "5px", backgroundColor: "#1677FF", color: "#FFFFFF"}}>
                                <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px"}}>{Element.msg}</p>
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div style={{width: "350px"}}>
                            <p style={{marginLeft: "10px", marginRight: "auto", width: "fit-content"}}>{Element.username}:</p>
                            <div id="message" style={{marginLeft: "10px", marginRight: "auto", marginBottom: "10px", width: "fit-content", alignContent: "left",
                                                        borderRadius: "5px", backgroundColor: "#d9d7ce" }}>
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

function Miscellaneous({allChat, chatMessage, userConnected, setChatMessage, shouldReRender, setShouldReRender}) {
    return (
        <div style={{width: "30%", height: "60%", float: "right"}} id="miscellaneous">
            <Users userConnected={userConnected} shouldReRender={shouldReRender} />
            <br/>
            <Chatbox allChat={allChat} 
                    chatMessage={chatMessage} 
                    setChatMessage={setChatMessage}
                    shouldReRender={shouldReRender} />
            {setShouldReRender(false)}
        </div>
    )
}

function Player() {
    return (
        <div style={{width: "70%", height: "60%", float: "left"}} id="player">
            
        </div>
    )
}

export default function Home() {

    let [userConnected, setUserConnected] = useState([]);
    let [allChat, setAllChat] = useState([]);
    let [chatMessage, setChatMessage] = useState("");
    let [shouldReRender, setShouldReRender] = useState(false);

    useEffect(() => {

        socket.emit('get users', socket.auth.roomID);

        socket.on('user list', (userList) => {
            setShouldReRender(true);
            setUserConnected(userList);
        });
    
        socket.on('user left', (userID) => {
            let newUserList = userConnected.filter(Element => {
                return Element.userID != userID;
            });
            setShouldReRender(true);
            setUserConnected(newUserList);
        });
    
        socket.on('new chat', (userID, username, msg) => {
            let newAllChat = allChat;
            newAllChat.push({userID: userID, username: username, msg: msg});
            setShouldReRender(true);
            setAllChat(newAllChat);
        });
    
        return () => {
            socket.off();
        }

    }, [])

    return (
        <div>
            <Player />
            <Miscellaneous allChat={allChat}
                            chatMessage={chatMessage}
                            userConnected={userConnected} 
                            setChatMessage={(value) => {setChatMessage(value)}}
                            shouldReRender={shouldReRender}
                            setShouldReRender={(value) => setShouldReRender(value)} />
        </div>
    );
}