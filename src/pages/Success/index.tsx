
import {styled, Typography} from "@mui/material";
import {useEffect, useState} from "react";

interface SuccessProps {
    className?: string;
}

const Success = styled((props: SuccessProps) => {
    const origin = new URL(window.location.origin);
    const url = `${origin.protocol}//${origin.hostname}:80`;

    const [ipAddress, setIpAddress] = useState<string>("");
    const [hostname, setHostname] = useState<string>("");

    useEffect(() => {
        fetch(url + "/deviceData", {method: "POST"})
            .then(res => res.json())
            .then((res) => {
                setIpAddress(res.ip);
                setHostname(res.hostname);
            })
    }, []);

    return (
        <div className={props.className}>
            <h2 style={{textAlign: "center"}}>Connected</h2>
            <div className={"setupFrame"}>
                <Typography sx={{textAlign: "center"}}>Your device has successfully connected to the internet.</Typography>
                <Typography fontSize={"large"} sx={{textAlign: "center"}}>It has the IP address</Typography>
                <h2>{ipAddress}</h2>
                <Typography sx={{textAlign: "center"}}>Navigate to <a href={`http://${ipAddress}`}>{`http://${ipAddress}`}</a> to complete setup.</Typography>
                <Typography fontSize={"larger"} sx={{marginTop: "20px", color: "#800000", textAlign: "center"}}>NOTE: You will need to reconnect to your wifi before you can access your device.</Typography>
                <Typography sx={{marginTop: "20px", textAlign: "center"}}>You will also be able to find your device on the wifi network by the name</Typography>
                <h2>{hostname}</h2>
            </div>
        </div>
    );
})((props) => {
    return {
        paddingLeft: "20px",
        paddingRight: "20px",
        "& .setupFrame": {
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "10px",
        },
    };
});

export default Success;
