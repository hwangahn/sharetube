import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "./socket";
import { Affix, Button, Input, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { SearchContext, VideoContext } from "./utils/context";
import { UserOutlined, TeamOutlined, CopyOutlined, SearchOutlined } from "@ant-design/icons";
import Message from "./components/messege";
import Player from "./components/player";
import VideoCard from "./components/videoCard";

function Searchbox() {

    let [value, setValue] = useState("");
    let { setSearchKeyword } = useContext(SearchContext); 

    let handleSearch = () => {
        setSearchKeyword(value); // update when begin fetching results
        setValue("");
    }

    return (
        <div id="search" style={{width: "40%", height: "100%", marginLeft: "auto", marginRight: "auto"}}>
            <Input id="search-input" placeholder="Search..." value={value} style={{width: "85%", marginRight: "1%", borderRadius: "50px", marginTop: "9px"}}
            onChange={e => setValue(e.target.value)} onPressEnter={handleSearch}/>
            <Button id="submit-search" type="primary" shape="circle" icon={<SearchOutlined />} onClick={handleSearch} />
        </div>
    )
}

function Navbar() {
    return (
        <Affix id="nav-bar" offsetTop={8}>
            <div style={{height: "50px", width: "100%", marginTop: "-8px", justifyContent: "center", background: "#ffffff", zIndex: "10"}}>
                <img src="/logo.jpeg" height={50} width={200} style={{display: "float", float: "left", marginLeft: "20px"}} />
                <div style={{display: "float", float: "right", height: "50px", width: "fit-content", marginRight: "20px"}}>
                    <p>Hello, <UserOutlined style={{marginRight: "5px"}} />{socket.auth.username}</p>
                </div>
                <Searchbox />
            </div>
        </Affix>
    )
}

function RoomInfo() {

    let [userConnected, setUserConnected] = useState();
    let [render, setRender] = useState(false);

    let param = useParams()

    useEffect(() => {
        socket.emit('get users', socket.auth.roomID); // request to get number of users when first entering room
        
        socket.on('users push', (users) => { // handle server update user count
            setUserConnected(users);
            setRender(true);
        });

        return () => {
            socket.off('users push');
        }
    }, []);

    let handleClick = () => {
        navigator.clipboard.writeText(param.roomID);
        message.success("Room ID copied");
    }

    return (
        <>
            <div id="info" style={{width: "100%", height: "fit-content"}}>
                <div id="room-id" style={{float: "left", width: "fit-content"}}>
                    <h5 style={{marginBottom: "-10px"}}>Room ID:</h5>
                    <p>{param.roomID}<Button size="small" type="ghost" style={{marginLeft: "5px"}} onClick={handleClick}><CopyOutlined /></Button></p>
                    
                </div>
                <div id="users" style={{float: "right", width: "fit-content"}}>
                    <h5 style={{marginBottom: "-10px"}}>Users:</h5>
                    <p><TeamOutlined /> {userConnected}</p>
                </div>
            </div>
            {render == true && setRender(false)}
        </>
    )
}

function Chatbox() {

    let [chatMessage, setChatMessage] = useState("");
    let [allChat, setAllChat] = useState([]);
    let [render, setRender] = useState(false);

    let lastMessage = useRef(null);
    
    useEffect(() => {
        socket.emit('get chat', socket.auth.roomID);
        
        socket.on('chat history request', (requestID) => {
            socket.emit('chat history', allChat, requestID); // respond with chat history of room
        });
        
        socket.on('chat history push', (newAllChat) => { // handle server send chat history
            let dummy = allChat;
            if (dummy.length === 0) {
                newAllChat.forEach(Element => {
                    dummy.push(Element);
                });
            }
            setAllChat(dummy);
            setRender(true);
        });
    
        socket.on('new chat push', (userID, username, msg) => { // handle server push a new chat 
            let newAllChat = allChat;
            newAllChat.push({userID: userID, username: username, msg: msg});
            setAllChat(newAllChat);
            setRender(true);
        });
    
        return () => {
            socket.off('chat history request');
            socket.off('chat history push');
            socket.off('new chat push');
        }
    }, []);

    useEffect(() => {
        lastMessage.current.scrollIntoView({behavior: "smooth", block: "nearest"});
    }, []);

    let handleSendChat = (e) => {
        e.preventDefault();
        if (chatMessage !== "") {
            socket.emit('new chat', socket.auth.roomID, chatMessage);
            setChatMessage("");
        }
    }

    return (
        <>
            <div id="chat-box" style={{width: "100%", height: "calc(100% - 74.39px)"}}>
                <div id="chat" style={{height: "calc(100% - 64px)", width: "100%", overflowY: "scroll", 
                                        borderStyle: "solid", borderWidth: "1px", borderRadius: "5px", borderColor: "#d9dddc"}}>
                    {allChat.map(Element => {
                        return <Message Element={Element} />
                    })}
                    <div ref={lastMessage} style={{height: "0px"}}></div>
                </div>
                <div id="chat-input" style={{width: "100%", height: "fit-content"}}>
                    <TextArea id="chat-input" placeholder="Enter your message..." value={chatMessage} autoSize={{ minRows: 1, maxRows: 3}} 
                    style={{width: "100%"}} onChange={(e) => {setChatMessage(e.target.value)}} onPressEnter={handleSendChat} />
                    <Button id="submit-chat" type="primary" style={{width: "100%"}} onClick={handleSendChat}>Send</Button>
                </div>
            </div>
            {render == true && setRender(false)}
        </>
    )
}

function Result() {

    let [results, setResults] = useState([]);
    let {searchKeyword, setSearchKeyword} = useContext(SearchContext);

    let beginResult = useRef(null);

    useEffect(() => {
        if (searchKeyword.trimStart() != "") {
            let finalKeyword = searchKeyword.trimStart().replaceAll(' ', '+');
            fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${finalKeyword}&key=${process.env.REACT_APP_YT_API_KEY}&type=video`, {
                method: 'get', 
                headers: { 
                    "Content-Type": "application/json" 
                }, 
            })
            .then(res => {
                return res.json();
            })
            .then(data => {
                setResults(data.items);
                setSearchKeyword("");
                console.log("fetching");
                
                setTimeout(() => {
                    beginResult.current.scrollIntoView({behavior: "smooth"});
                }, 500);
            });
        }
    }, [searchKeyword]);

    return (
        <div id="results" style={{height: "fit-content", marginTop: "30px", marginBottom: "50px", marginLeft: "3%"}}>
            <div ref={beginResult} style={{height: "100px"}}></div>
            {results.map(Element => {
                return <VideoCard Element={Element} />
            })}
        </div>
    )
}

export default function Home() {

    let [searchKeyword, setSearchKeyword] = useState("");
    let [videoDetails, setVideoDetails] = useState();

    return (
        <SearchContext.Provider value={{searchKeyword, setSearchKeyword}}>
            <VideoContext.Provider value={{videoDetails, setVideoDetails}}> 
                <Navbar />
                <Affix id="room-miscellany" offsetTop={68} style={{height: "80%", width: "25%", float: "right", marginRight: "3%"}}>
                    <RoomInfo />
                    <Chatbox />
                </Affix>
                <div id="results" style={{display: "float", float: "left", width: "65%", height: "100%", marginLeft: "3%"}}>
                    <Player />
                    <Result />
                </div>
            </VideoContext.Provider>
        </SearchContext.Provider>
    );
}