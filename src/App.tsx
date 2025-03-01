import './App.css'
import {Button, List, ListItem, ListItemButton, ListItemText, TextField} from "@mui/material";
import {useEffect, useState} from "react";

function App() {
    const [aplist, setAplist] = useState<{name: string, active: boolean}[]>([{name: "Press scan to start", active: false}]);
    const [selectedAp, setSelectedAp] = useState<string>("");
    const [password, setPassword] = useState("");
    const origin = new URL(window.location.origin);
    const url = `${origin.protocol}//${origin.hostname}:80`;
    const [connecting, setConnecting] = useState<boolean>(false);
    const [scanning, setScanning] = useState<boolean>(false);
    const [modeSet, setModeSet] = useState<boolean>(false);
    const [mode, setMode] = useState<boolean>(false);
    const [baseUrl, setBaseUrl] = useState<string>("");
    const [sitemaps, setSitemaps] = useState<string[]>([]);
    const [urlError, setUrlError] = useState<boolean>(false);
    const [selectedSitemap, setSelectedSitemap] = useState<string>("");
    const [apiKey, setApiKey] = useState<string>("");

    useEffect(() => {
        if (!modeSet) {
            fetch(url + "/deviceData", {method: "POST"})
                .then(res => res.json())
                .then((res) => {
                    if (res.connected) {
                        setMode(res.connected);
                        setSelectedAp(res.ssid);
                        setBaseUrl(res.base);
                        setSelectedSitemap(res.sitemap);
                        if (res.base !== "" && res.sitemap !== "") {
                            const payload = {
                                url: res.base,
                            };

                            fetch(url + "/getSitemaps", {method: "POST", body: JSON.stringify(payload)})
                                .then(res => res.json())
                                .then((res) => {
                                    setSitemaps(res.sitemaps);
                                    console.log(res.sitemaps);
                                })
                                .catch((err) => {
                                    console.log(err);
                                })

                        }
                    }
                    setModeSet(true);
                })
                .catch((err) => {
                    console.log(err);
                })

        }
    }, [modeSet, mode, url]);

    if (!modeSet) {
        return (
            <div></div>
        )
    }

    if (mode) {
        return (
            <div className="App">
                <h2>Setup Openhab</h2>
                <TextField
                    sx={{
                        marginTop: "30px",
                        width: "90%",
                    }}
                    variant={"standard"}
                    label={"Openhab URL"}
                    value={baseUrl}
                    error={urlError}
                    helperText={urlError ? "The URL is not valid" : ""}
                    onChange={(e) => {
                        try {
                            new URL(e.target.value);
                        } catch (_) {
                            setUrlError(true);
                            setBaseUrl(e.target.value);
                            return;
                        }
                        setUrlError(false);
                        setBaseUrl(e.target.value);
                    }}
                ></TextField>
                <Button
                    sx={{marginTop: "10px"}}
                    variant="contained"
                    disabled={baseUrl.length === 0 || connecting || urlError}
                    onClick={() => {
                        if (baseUrl === "") {
                            return;
                        }

                        const payload = {
                            url: baseUrl,
                        };

                        setConnecting(true);
                        setSitemaps([]);
                        fetch(url + "/getSitemaps", {method: "POST", body: JSON.stringify(payload)})
                            .then(res => res.json())
                            .then((res) => {
                                setSitemaps(res.sitemaps);
                                console.log(res.sitemaps);
                            })
                            .catch((err) => {
                                console.log(err);
                            })
                    }}
                >
                    Next
                </Button>
                {sitemaps && sitemaps.length > 0 &&
                    <>
                        <TextField
                            sx={{
                                marginTop: "30px",
                                width: "90%",
                                marginBottom: "30px",
                            }}
                            variant={"standard"}
                            label={"Openhab API token (optional, leave blank to keep current)"}
                            value={apiKey}
                            onChange={(e) => {
                                setApiKey(e.target.value);
                            }}
                        ></TextField>
                        <List sx={{width: "90%", minHeight: "150px", marginTop: "10px", border: "1px solid #c0c0c0"}}>
                            {sitemaps.map((sitemap, idx) => {
                                return (
                                    <ListItem
                                        sx={{marginTop: "3px", marginBottom: "0", paddingTop: "0", paddingBottom: "0"}}
                                        key={idx}>
                                        <ListItemButton
                                            selected={selectedSitemap === sitemap}
                                            onClick={() => {
                                                setSelectedSitemap(sitemap);
                                            }}
                                        >
                                            <ListItemText>
                                                {sitemap}
                                            </ListItemText>
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}

                        </List>
                        <Button
                            sx={{marginTop: "10px"}}
                            variant="contained"
                            disabled={baseUrl.length === 0 || selectedSitemap.length === 0}
                            onClick={() => {
                                const payload = {
                                    url: baseUrl,
                                    sitemap: selectedSitemap,
                                    apiKey: apiKey,
                                };

                                fetch(url + "/setOpenhabData", {method: "POST", body: JSON.stringify(payload)});
                            }}
                        >
                            Save
                        </Button>
                    </>
                }
            </div>
        );
    }

    return (
        <div className="App">
            <h2>Wifi setup</h2>
            <div>Select wifi network</div>
            <List sx={{width: "90%", minHeight: "150px", marginTop: "10px", border: "1px solid #c0c0c0"}}>
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
                                setAplist(aps);
                            }
                        })
                        .catch(() => {
                            setScanning(false);
                        });
                }}
            >
                Scan for wifi networks
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
                    fetch(url + "/connect", {method: "POST", body: JSON.stringify(payload)});
                }}
            >
                Connect
            </Button>

        </div>
    )
}

export default App
