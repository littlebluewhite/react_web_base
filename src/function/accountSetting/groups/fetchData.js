import {SERVER} from "../../../setting";

function fetchCreateGroup(token, createData, name){
    return fetch(SERVER.slice(0, -4) + "9322/api/account/create_template",{
        method: "POST",
        headers: new Headers({
            Authorization: "Bearer " + token
        }),
        body: JSON.stringify({
            "NewTemplateName": name,
            "Template": [],
            ...createData
        })
    })
}

function fetchGroupsUpdate(data, token){
    return fetch(SERVER.slice(0, -4) + "9322/api/account/update_template",{
        method: "POST",
        headers: new Headers({
            Authorization: "Bearer " + token
        }),
        body: JSON.stringify({
            "OriTemplateName": data.groupName,
            "Template": [],
            ...data.groupData
        })
    })
}


export {fetchCreateGroup, fetchGroupsUpdate}