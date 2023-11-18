import socket from "../socket";

export default function Message({ Element }) {
    if (Element.userID == socket.id) {
        return (
            <div style={{width: "100%"}}>
                <p style={{marginLeft: "auto", marginRight: "20px", marginBottom: "5px", width: "fit-content"}}>{Element.username}</p>
                <div id="message-wrapper" style={{marginLeft: "2%", marginBottom: "10px", width: "95%"}}>
                    <div id="message" style={{marginLeft: "auto", marginRight: "0", width: "fit-content", 
                                                borderRadius: "20px", backgroundColor: "#1677FF", color: "#FFFFFF"}}>
                        <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px", overflowWrap: "break-word", wordBreak: "break-word"}}>{Element.msg}</p>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div style={{width: "100%"}}>
                <p style={{marginLeft: "15px", marginRight: "auto", marginBottom: "5px", width: "fit-content"}}>{Element.username}</p>
                <div id="message-wrapper" style={{marginLeft: "2%", marginBottom: "10px", width: "95%"}}>
                    <div id="message" style={{marginLeft: "0", marginRight: "auto", width: "fit-content",
                                                borderRadius: "20px", backgroundColor: "#d9d7ce"}}>
                        <p style={{padding: "10px", marginTop: "-3px", marginBottom: "-3px", overflowWrap: "break-word", wordBreak: "break-word"}}>{Element.msg}</p>
                    </div>
                </div>
            </div>
        )
    }
}