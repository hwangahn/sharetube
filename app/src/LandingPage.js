import { Space, Button, Input, message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "./socket";

export default function LandingPage() {

    let [username, setUsername] = useState("");
    let [roomID, setRoomID] = useState("");

    let navigate = useNavigate();

    socket.on('connect_error', (err) => {
        message.error(err);
        socket.disconnect();
    });

    socket.on('reject', (err) => {
        message.error(err);
        socket.disconnect();
    });

    socket.on('allow', (roomID) => {
        socket.credentials.roomID = roomID;
        navigate(`/${roomID}`);
    });

    let connectAndAskRoom = (type, roomID) => {
        socket.connect();
        socket.emit(type, roomID);
    } 

    let handleJoinRoom = () => {

        setUsername(username.trimStart());

        console.log(username);

        if (username === "") {
            message.warning("Please enter a valid username");
        } else if (roomID === "") {
            message.warning("Please enter a valid room ID");
        } else {
            socket.credentials = { username };
            connectAndAskRoom('join room', roomID);
        }


    }

    let handleCreateRoom = () => {

        setUsername(username.trimStart());

        console.log(username);

        if (username === "") {
            message.warning("Please enter a valid username");
        } else {
            socket.credentials = { username };
            connectAndAskRoom('create room', `${Date.now()}`);
        }


    }

    return (
        <div style={{ width: "30%", height: "30%", margin: "0 auto", marginTop: "150px" }}>
            <Space>
                <Input id="username" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            </Space>
            <br/>
            <Space >
                <Button type="primary" onClick={handleCreateRoom}>Create Room</Button>
                <p>or</p>
                <Input id="roomID" placeholder="Room ID" onChange={(e) => setRoomID(e.target.value)} />
                <Button type="primary" onClick={handleJoinRoom}>Join Room</Button>
            </Space>
        </div>
    )
}