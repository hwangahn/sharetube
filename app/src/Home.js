import { Button, Space } from "antd";
import socket from "./socket";
import { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { UserOutlined } from "@ant-design/icons"

export default function Home() {

    let [userConnected, setUserConnected] = useState([]);
    let [messages, setMessages] = useState([]);
    let [messageQ, setMessageQ] = useState("");

    socket.on('user list', (userList) => {
        setUserConnected(userList);
        console.log(userList);
    });

    socket.on('user left', (userID) => {
        console.log(userID);
        let newUserList = userConnected.filter(Element => {
            return Element.userID !== userID;
        });
        console.log(newUserList);
        setUserConnected(newUserList);
    })

    useEffect(() => {
        socket.emit('get users', socket.auth.roomID);
    }, [])

    return (
        <div>
            <div style={{width: "70%", height: "60%", float: "left"}} id="player">
                
            </div>
            <div style={{width: "30%", height: "60%", float: "right"}} id="miscellaneous">
                <div style={{marginTop: "100px"}} id="users">
                    {userConnected.map(Element => {
                        return <p><UserOutlined /> {Element.username}</p>
                    })}
                </div>
                <br/>
                <div id="chat">
                    <div style={{height: "450px", width: "375px", overflowY: "scroll", borderStyle: "solid", borderWidth: ".1px", borderRadius: "5px"}} id="messages">

                    </div>
                    <br/>
                    <Space id="chat-box" size={5}>
                        <TextArea id="message-q" placeholder="Enter your message..." autoSize={{ minRows: 1, maxRows: 3}} style={{width: "375px"}}
                        onChange={(e) => {setMessageQ(e.target.value)}} />
                        <Button id="submit-message" type="primary" style={{width: "75px"}} onClick={() => {}} >Send</Button>
                    </Space>
                </div>
            </div>
        </div>
    );
}