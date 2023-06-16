import { message } from "antd";
import { io } from "socket.io-client";

let socket = io("http://localhost:4000/", {
    autoConnect: false
});

export default socket;