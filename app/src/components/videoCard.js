import socket from "../socket";
import { useContext } from "react";
import { Button } from "antd";
import { VideoContext } from "../utils/context";

export default function VideoCard({Element}) {

    let { setVideoDetails } = useContext(VideoContext);

    let handleClick = () => {
        setVideoDetails({videoId: Element.id.videoId, 
                        videoTitle: Element.snippet.title.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&"), 
                        videoChannel: Element.snippet.channelTitle.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}); // update video details
        socket.emit('new video by id', socket.auth.roomID, 
            {videoId: Element.id.videoId, 
            videoTitle: Element.snippet.title.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&"), 
            videoChannel: Element.snippet.channelTitle.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}); // request playing video of following details
    }

    return ( 
        <div id={`${Element.id.videoId}`} style={{width: "100%", height: "300px"}}>
            <div id="thumbnail" style={{width: "30%", height: "fit-content", float: "left"}}>
                <img src={`${Element.snippet.thumbnails.high.url}`} style={{width: "100%", height: "auto", borderRadius: "10px"}} />
            </div>
            <div id="details" style={{width: "65%", height: "fit-content", marginLeft: "5%", marginTop: "10px", float: "right"}}>
                <h4 style={{marginTop: "-5px", overflowWrap: "break-word", wordBreak: "break-word"}}>
                    {Element.snippet.title.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}
                </h4>
                <p style={{marginTop: "-5px", overflowWrap: "break-word", wordBreak: "break-word"}}>
                    {Element.snippet.channelTitle.replaceAll("&quot;", `"`).replaceAll("&#39;", "'").replaceAll("&amp;", "&")}
                </p>
                {Element.snippet.liveBroadcastContent != "live" && 
                    <Button type="primary" onClick={handleClick} style={{width: "60px"}}>Play</Button>
                }
                {Element.snippet.liveBroadcastContent == "live" && 
                    <Button type="primary" danger={true} onClick={handleClick} style={{width: "60px"}}>Live</Button>
                }
            </div>
        </div>
    )
}