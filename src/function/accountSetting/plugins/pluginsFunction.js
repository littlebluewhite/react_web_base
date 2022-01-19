const {SERVER} = require("../../../setting");

function fetchEditorPlugins(data, token){
    let url = ""
    for (let layer of data.layers){
        url += `${layer}__`
    }
    url += data.filename
    return fetch(SERVER.slice(0, -4) + "9322/api/account/function_plugins/"+url, {
        method: "PUT",
        headers: new Headers({
            Authorization: "Bearer " + token
        }),
        body: JSON.stringify(data.updateData)
    })
}

function fetchCreatePlugins(data, token){
    let url = ""
    for (let layer of data.layers){
        url += `${layer}__`
    }
    url += `${data.filename}.csv`
    return fetch(SERVER.slice(0, -4) + "9322/api/account/function_plugins/"+url, {
        method: "POST",
        headers: new Headers({
            Authorization: "Bearer " + token
        }),
        body: JSON.stringify(data.updateData)
    })
}

function fetchCreateFolder(folderName, layers, token){
    return fetch(SERVER.slice(0, -4) + "9322/api/account/function_plugins_folder", {
        method: "POST",
        headers: new Headers({
            Authorization: "Bearer " + token
        }),
        body: JSON.stringify({
            "folder_name": folderName,
            "layers": layers
        })
    })
}

export {fetchEditorPlugins, fetchCreatePlugins, fetchCreateFolder}