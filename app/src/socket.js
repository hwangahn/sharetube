import { io } from "socket.io-client";

let socket = io(process.env.REACT_APP_URL, {
    autoConnect: false
});

export default socket;