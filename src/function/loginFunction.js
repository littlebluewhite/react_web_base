import {SERVER} from "../setting";

function fetchLogin(user){
    return fetch(SERVER.slice(0, -4) + "9322/api/login", {
        method: "POST",
        body: JSON.stringify({
            "Username": user.username,
            "Password": user.password
        })
    })
}

function successLogin(data){
    return new Promise(function(resolve, reject){
        if(Object.keys(data).length===0 || !data.hasOwnProperty("AccountInfo")){
            reject("error user")
        }else{
            resolve(data)
        }
    })
}

function fetchSelfTemplate(token){
    return fetch(SERVER.slice(0, -4) + "9322/api/account/get_self_account_template", {
        method: "GET",
        headers: new Headers({
            Authorization: "Bearer " + token
        }),
    })
}

function fetchTokenLogin(token){
    return fetch(SERVER.slice(0, -4) + "9322/api/login_with_token", {
        method: "GET",
        headers: new Headers({
            Authorization: "Bearer " + token
        }),
    })
}

export{fetchLogin, successLogin, fetchSelfTemplate, fetchTokenLogin}
