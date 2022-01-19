import "../SCSS/login.css"
import {useContext, useEffect, useRef, useState} from "react";
import {authContext} from "./mainIndex.js";
import {Redirect, Switch, useHistory, useLocation} from "react-router-dom";
import {useGetIndexPicture} from "../function/usePackage";
import {fetchLogin, fetchSelfTemplate, successLogin} from "../function/loginFunction";

function Login(){
    let storageToken = localStorage.getItem("token")
    const location = useLocation()
    const history = useHistory()
    const {from} = location.state || {"from":"/"}
    const auth = useContext(authContext)
    const [user, setUser] = useState({"username": "", "password": ""})
    const controller = useRef(false)
    const indexImage = useGetIndexPicture(controller)
    const [message, setMessage] = useState(null)

    async function handleLogin(event) {
        event.preventDefault()
        try{
            const response = await fetchLogin(user)
            const data = await response.json()
            const resultData = await successLogin(data)
            const response2 = await fetchSelfTemplate(resultData.AccountInfo.token)
            const data2 = await response2.json()
            auth.signIn({...resultData, ...data2})
            localStorage.setItem("token", JSON.stringify(resultData.AccountInfo.token))
            history.replace(from)
        }catch (err){
            console.log(err)
            setMessage(err)
        }
    }

    function handleChange(event, item) {
        setUser(pre=>({...pre, [item]: event.target.value}))
    }

    useEffect(()=>{
        controller.current = true
        if(typeof(location)==="object" && !storageToken && controller.current){
            if(location.state){
                if(location.state.hasOwnProperty("message")){
                    setMessage(location.state.message)
                }
            }
        }
        return ()=>{controller.current = false}
    },[location, history, auth, storageToken])

    return(
        <>
            {storageToken ?
                <Switch>
                    <Redirect to={"/fixing/"+storageToken.slice(1, -1)+from}/>
                </Switch>
                :
                <div className={"loginContainer"}>
                    <div className="imageContainer">
                        <div className={"imageDiv"}>
                            <img src={indexImage} alt={"index"}/>
                        </div>
                    </div>
                    <form onSubmit={(event)=>(handleLogin(event))}>
                        <div className="div_table">
                            <div className={"usernameContainer"}>
                                <input type="text" className="login_input username" value={user.username}
                                       onChange={(event)=>(handleChange(event, "username"))}
                                       placeholder="Username" required={true}/>
                            </div>
                            <div className={"passwordContainer"}>
                                <input type="password" className="login_input password" value={user.password}
                                       onChange={(event)=>(handleChange(event, "password"))}
                                       placeholder="Password" required={true}/>
                            </div>
                            <div className={"messageContainer"}>
                                {message}
                            </div>
                            <button className="login">Login</button>
                            <div className={"helpText"}>Any help?</div>
                            <div className={"helpText"}>Need an account?Sign Up</div>
                        </div>
                    </form>
                </div>
            }
        </>
    )
}

export {Login};
