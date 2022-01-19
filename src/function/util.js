function deepCopy(data){
    if(Array.isArray(data)){
        return handleArray(data)
    }else if(typeof(data)==="object"){
        return handleDict(data)
    }else{
        return data
    }
}

function handleArray(data){
    let result = []
    for(let datum of data){
        result.push(deepCopy(datum))
    }
    return result
}

function handleDict(data){
    let result = {...data}
    for(let key in data){
        result[key] = deepCopy(data[key])
    }
    return result
}

export {deepCopy}