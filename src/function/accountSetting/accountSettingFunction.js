import {SERVER} from "../../setting";

function deleteAccount(token, deleteArray, variables){
    console.log(variables)
    return fetch(SERVER.slice(0, -4) + "9322/api/account/delete",{
        method: "POST",
        headers: new Headers({
            Authorization: "Bearer " + token
        }),
        body: JSON.stringify({
            "Account": deleteArray.current[0]
        })
    })
}

function deletePlugin(token, deleteArray, variables){
    let url = ""
    for(let layer of variables.layers){
        url += `${layer}__`
    }
    return fetch(SERVER.slice(0, -4) +
        "9322/api/account/function_plugins/"+ url +deleteArray.current[0]
        ,{
        method: "DELETE",
        headers: new Headers({
            Authorization: "Bearer " + token
        })
    })
}

function handlePluginsDelete(setData, data){
    setData(pre=>{
        let result = {...pre}
        let target_dict = result
        for (let layer of data.variables.layers){
            target_dict = target_dict[layer]
        }
        delete target_dict[data.deleteArray.current[0]]
        return result
    })
}

export {deleteAccount, deletePlugin, handlePluginsDelete}