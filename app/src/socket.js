import { io } from "socket.io-client";

let socket = io(process.env.REACT_APP_SERVER_URL, {
    autoConnect: false
});

/**
events type 'get {resource}' are from clients first entering room to retrieve room info
events type '{resource} request' are made by server to request specific resource 
events type '{resource} push' are made by server to push new changes in room to all users
events type 'play video by {type}' are made by server 
other events are made either by client or server to notify about state change
 */

export default socket;