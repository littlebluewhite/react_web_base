import React, {useCallback, useContext, useEffect, useState} from 'react';
import {HashRouter, Redirect, Route, Switch, useParams} from "react-router-dom";
import {
    useAdmin,
} from "../function/usePackage";
import {Login} from "./login";
import {Contact} from "./contact";
import {IntlProvider} from "react-intl";
import EN from "../lang/EN.json"
import CN from "../lang/CN.json"
import {Layout} from "./dashboard";
import {Web3d} from "./Web3d";
import {Test} from "./test";
import {HandleTokenIndex} from "./handleTokenLogin/handleTokenIndex";

const HeaderIcon = React.createContext({})

const authContext = React.createContext({})

const langContext = React.createContext("EN")


function App(){
    const auth = useAdmin()
    // console.log(auth.user)

    const [lang, setLang] = useState('EN')
    const [locale, setLocale] = useState(CN)

    const fetchLang = useCallback((lang, setLocale)=>{
        if (lang==="EN"){
            setLocale(EN)
        }else if(lang==="CN"){
            setLocale(CN)
        }
    }, [])

    useEffect(()=>{
        fetchLang(lang, setLocale)
    },[lang, setLocale, fetchLang])

    return(
        <IntlProvider locale={"EN"} messages={locale}>
            <langContext.Provider value={{"lang":lang, "setLang":setLang}}>
                <HashRouter>
                    <authContext.Provider value={auth}>
                        <Switch>
                            <Route exact path={"/"}>
                                {auth.user ?
                                    <Layout/>:
                                    <Redirect to={{pathname: "/login", state:{from: "/"}}}/>
                                }
                            </Route>
                            <Route path={"/login"}>
                                {auth.user ?
                                    <Redirect to={{pathname: "/",}}/> :
                                    <Login/>
                                }
                            </Route>
                            <Route path={"/web3d"}>
                                <Web3d/>
                            </Route>
                            <Route path={"/handleError/:message"}>
                                <HandleError/>
                            </Route>
                            <Route path={"/contact"}>
                                <Contact/>
                            </Route>
                            <Route path={"/fixing/:token"}>
                                <HandleTokenIndex/>
                            </Route>
                            <Route path={"/test"}>
                                <Test/>
                            </Route>
                            <Route path={"/:subPath"}>
                                {auth.user ?
                                    <Layout/>:
                                    <SubPathDirect/>
                                }
                            </Route>
                        </Switch>
                    </authContext.Provider>
                </HashRouter>
            </langContext.Provider>
        </IntlProvider>
    )
}

function HandleError() {
    const auth = useContext(authContext)
    const {message} = useParams()
    auth.signOut()
    return(
        <Redirect to={{pathname: "/login", state:{from: "/", message: message}}}/>
    )
}

function SubPathDirect() {
    const {subPath} = useParams()
    return(
        <Redirect to={{pathname: "/login", state:{from: ("/"+subPath)}}}/>
    )
}

export {App, HeaderIcon, authContext, langContext};
