import {Button, List, ListItem, ListItemButton, ListItemText, styled, TextField, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {FadeLoader} from "react-spinners";

interface SetupProps {
    className?: string;
}

const Setup = styled((props: SetupProps) => {
    const origin = new URL(window.location.origin);
    const url = `${origin.protocol}//${origin.hostname}:80`;

    const [refresh, setRefresh] = useState(0);
    const [aplist, setAplist] = useState<{name: string, active: boolean}[]>([]);
    const [selectedAp, setSelectedAp] = useState<string>("");
    const [scanning, setScanning] = useState<boolean>(false);
    const [connecting, setConnecting] = useState<boolean>(false);
    const [password, setPassword] = useState("");
    const [spinnerText, setSpinnerText] = useState("");
    const [connectFailed, setConnectFailed] = useState(false);

    useEffect(() => {
        if (scanning) {
            setSpinnerText("Scanning...");
        }
        else if (connecting) {
            setSpinnerText("Connecting...");
        }
        else {
            setSpinnerText("");
        }
    }, [scanning, connecting]);

    useEffect(() => {
        setScanning(true);
        fetch(url + "/scan", {method: "POST"})
            .then(resp => resp.json())
            .then((resp) => {
                setScanning(false);
                if (resp.ap_count === 0) {
                    setAplist([{name: "No networks found", active: false}]);
                } else {
                    const aps: { name: string, active: boolean }[] = [];
                    for (const ap of new Set<string>(resp.aplist)) {
                        aps.push({name: ap, active: true});
                    }
                    console.log(aps);
                    setAplist(aps);
                }
            })
            .catch(() => {
                setScanning(false);
                setAplist([{name: "Error scanning", active: false}]);
            });
    }, [refresh]);

    return (
        <div className={props.className}>
            <h2 style={{textAlign: "center"}}>Wifi Setup</h2>
            <div className={"setupFrame"}>
                <div>Select wifi network</div>
                <List sx={{width: "90%", minHeight: "250px", maxHeight: "250px", overflow: "auto", marginTop: "10px", border: "1px solid #c0c0c0"}}>
                    {aplist.map((item, idx) => {
                        return (
                            <ListItem sx={{marginTop: "3px", marginBottom: "0", paddingTop: "0", paddingBottom: "0"}}
                                      key={idx}>
                                {item.active
                                    ? <ListItemButton
                                        disabled={connecting}
                                        selected={selectedAp === item.name}
                                        onClick={() => {
                                            setSelectedAp(item.name);
                                        }}
                                    >
                                        <ListItemText>
                                            {item.name}
                                        </ListItemText>
                                    </ListItemButton>
                                    : <ListItemText>
                                        {item.name}
                                    </ListItemText>
                                }
                            </ListItem>
                        )
                    })}
                </List>
                <Button
                    sx={{marginTop: "10px"}}
                    variant="contained"
                    disabled={connecting || scanning}
                    onClick={() => {
                        setScanning(true);
                        setSelectedAp("");
                        setAplist([]);
                        fetch(url + "/scan", {method: "POST"})
                            .then(resp => resp.json())
                            .then((resp) => {
                                setRefresh(refresh + 1);
                            })
                            .catch(() => {
                                setScanning(false);
                            });
                    }}
                >
                    Rescan wifi networks
                </Button>
                <TextField
                    sx={{
                        marginTop: "30px",
                        width: "90%",
                    }}
                    variant={"standard"}
                    label={"Wifi password"}
                    value={password}
                    type={"password"}
                    disabled={selectedAp === ""}
                    onChange={(e) => setPassword(e.target.value)}
                ></TextField>
                <Button
                    sx={{marginTop: "10px"}}
                    variant="contained"
                    disabled={password.length === 0}
                    onClick={() => {
                        if (password === "") {
                            return;
                        }

                        const payload = {
                            ssid: selectedAp,
                            password: password,
                        };

                        setConnecting(true);
                        fetch(url + "/connect", {method: "POST", body: JSON.stringify(payload)})
                            .then(resp => resp.json())
                            .then((resp) => {
                                setConnecting(false);
                                if (!resp.connected) {
                                    setConnectFailed(true);
                                }
                                else {
                                    window.location.href="/success.html"
                                }
                            })
                    }}
                >
                    Connect
                </Button>
            </div>
            {spinnerText !== "" &&
                <div className={"spinnerContainer"}>
                    <div className={"spinnerOverlay"}>
                    </div>
                    <div className={"spinner"}>
                        <div style={{flexGrow: "1", display: "flex", alignItems: "center", marginTop: "10px"}} >
                            <FadeLoader
                                color={"blue"}
                                loading={true}
                                margin={10}
                                width={8}
                                height={20}
                            />
                        </div>
                        <Typography fontSize={"x-large"} sx={{marginBottom: "40px"}}>{spinnerText}</Typography>
                    </div>
                </div>
            }
            {connectFailed &&
                <div className={"spinnerContainer"}>
                    <div className={"spinnerOverlay"}>
                    </div>
                    <div className={"spinner"}>
                        <div style={{flexGrow: "1", display: "flex", flexDirection: "column", alignItems: "center",justifyContent: "center"}}>
                            <Typography fontSize={"x-large"} sx={{}}>Connect failed</Typography>
                        </div>
                        <Button
                            variant="contained"
                            sx={{marginBottom: "50px", width: "50%"}}
                            onClick={() => {
                                setConnectFailed(false);
                            }}>
                            OK
                        </Button>
                    </div>
                </div>
            }
        </div>
    );
})((props) => {
    return {
        "& .setupFrame": {
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
        },
        "& .spinnerContainer": {
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
        },
        "& .spinnerOverlay": {
            backgroundColor: "black",
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            zIndex: 1000,
            opacity: 0.2,
        },
        "& .spinner": {
            backgroundColor: "white",
            zIndex: 1001,
            borderRadius: "40px",
            position: "absolute",
            height: "200px",
            width: "320px",
            maxWidth: "80%",
            transform: "translate(-50%, -50%)",
            top: "50%",
            left: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
        },
    };
});


export default Setup
