import {Redirect, Route, Switch, useParams} from "react-router-dom";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {authContext} from "../mainIndex";
import {fetchSelfTemplate, fetchTokenLogin, successLogin} from "../../function/loginFunction";

function HandleTokenIndex(){
    const auth = useContext(authContext)
    const {token} = useParams()
    const [condition, setCondition] = useState("wait")
    const controller = useRef(false)
    const handleLogin = useCallback(async ()=>{
        // const ac = new AbortController()
        try{
            const response = await fetchTokenLogin(token)
            const data = await response.json()
            const resultData = await successLogin(data)
            resultData.AccountInfo.token = token
            const response2 = await fetchSelfTemplate(token)
            const data2 = await response2.json()
            auth.signIn({...resultData, ...data2})
            localStorage.setItem("token", JSON.stringify(token))
            if(controller.current){
                setCondition("success")
            }
        }catch (e) {
            console.log(e)
            localStorage.removeItem("token")
            if(controller.current){
                setCondition("")
            }
        }
    },[token, auth])
    useEffect(()=>{
        controller.current = true
        handleLogin()
        return ()=>{
            controller.current = false
        }
    },[handleLogin])
    return (
        <Switch>
            {condition==="" && <Redirect to={"/login"}/>}
            {condition==="success" &&
                <>
                    <Route path={"/fixing/:token"}>
                        <Switch>
                            <Redirect to={"/"}/>
                        </Switch>
                    </Route>
                    <Route path={"/fixing/:token/:mainPath"}>
                        <TokenLoginWithPath/>
                    </Route>
                </>
            }
        </Switch>
    )
}

function TokenLoginWithPath() {
    const {mainPath} = useParams()
    return(
        <Switch>
            <Redirect to={"/"+mainPath}/>
        </Switch>
    )
}

export {HandleTokenIndex}