import ReactDOM from "react-dom";
import React from "react";
import reportWebVitals from "./reportWebVitals";
import {App} from "./component/mainIndex";


const appRoot = document.getElementById('root')

ReactDOM.render(
    <App/>,
    appRoot
)


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
