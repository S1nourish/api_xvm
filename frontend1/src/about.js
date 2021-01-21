import React, { useEffect } from "react";
import ReactGA from "react-ga";
import Paper from "@material-ui/core/Paper";
import "./css/tankstats.css";
import "./css/innerpage.css";
import { ThemeContext } from "./context";
const trackingId = process.env.REACT_APP_GA;

export default function About() {
    const { theme } = React.useContext(ThemeContext);

    useEffect(() => {
        ReactGA.initialize(trackingId);
        ReactGA.pageview("/about");
    }, []);

    return (
        <div style={{ padding: "2em", paddingTop: "5em" }}>
            <div className="narrowpage">
                <Paper
                    style={{
                        backgroundColor:
                            theme === "dark" ? "rgb(40, 40, 40)" : "white",
                        padding: "1rem",
                        color:
                            theme === "dark"
                                ? "rgb(230, 230, 230)"
                                : "rgb(50,50,50)",
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: "500" }}>
                            About US
                        </h1>
                        <span
                            style={{
                                fontSize: "0.8rem",
                                lineHeight: "1.3rem",
                                color:
                                    theme === "dark"
                                        ? "rgb(150,150,150)"
                                        : "rgb(100,100,100)",
                            }}
                        >
                            UPDATED 5/1/2019
                        </span>{" "}
                        <br />
                        <br />
                        <span
                            style={{ fontSize: "0.9rem", lineHeight: "1.4rem" }}
                        >
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            <br />
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui 
                            officia deserunt mollit anim id est laborum.
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            <br />
                            <br />
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            <br />
                            <br />
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                             tempor incididunt ut labore et dolore magna aliqua. 
                            <br />
                            <br />
                            <a
                                target="blank"
                                href="#"
                            >
                                Wally_The_Walrus
                            </a>{" "}
                            has helped extensively with the development.
                            <br />
                            <br />
                            Join my{" "}
                            <a target="blank" href="#">
                                Discord server
                            </a>{" "}
                            If you would like to provide feedback, suggestions,
                            and bug reports. <br />
                            <br />
                            Thanks for using! <br />-{" "}
                            <a
                                target="blank"
                                href="#"
                            >
                                _The_Last_Emperor_
                            </a>
                        </span>
                    </div>
                </Paper>
            </div>
        </div>
    );
}
