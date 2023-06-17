import { Navigate, Outlet } from "react-router-dom";
import { message } from "antd";
import socket from "./socket";
import Home from "./Home";

export default function ProtectedRoute() {
    if (!socket.connected) {
        message.error('Please choose your username');
        return <Navigate to='/' />
    } else {
        return <Outlet/>;
    }
}