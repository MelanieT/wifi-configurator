import {use, useEffect} from "react";

interface HomeProps {
    className?: string;
}

const Home = (props: HomeProps) => {
    const origin = new URL(window.location.origin);
    const url = `${origin.protocol}//${origin.hostname}:80`;

    useEffect(() => {
        fetch(url + "/deviceData", {method: "POST"})
            .then(res => res.json())
            .then((res) => {
                if (!res.connected) {
                    window.location.href = "/setup";

                    return <></>;
                }
            })
    }, []);

    return (
        <div className={props.className}>
        </div>
    );
}

export default Home;
