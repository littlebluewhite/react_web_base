function fastDataGetFormat(minus){
    const date = new Date(new Date().getFullYear(), new Date().getMonth()-minus)
    return (date.getFullYear() + "/" + (date.getMonth()+1).toString().padStart(2, "0"))
}

function fastDataGetTimeStamp(minus){
    const date = new Date(new Date().getFullYear(), new Date().getMonth()-minus)
    return date.getTime()/1000
}

function fastDataGetFetchFormat(minus, end=false){
    if(minus==="lastYear"){
        return (new Date().getFullYear()-1+"-01-01")
    }
    if(end && minus!==0){
        const date = new Date(new Date().getFullYear(), new Date().getMonth()-minus+1, 0)
        return (date.getFullYear() + "-" + (date.getMonth()+1).toString().padStart(2, "0") + "-"
        + date.getDate().toString().padStart(2, "0"))
    }
    const date = new Date(new Date().getFullYear(), new Date().getMonth()-minus)
    let day = "01"
    if (minus===0){
        day = new Date().getDate().toString().padStart(2, "0")
    }
    return (date.getFullYear() + "-" + (date.getMonth()+1).toString().padStart(2, "0") + "-"
        + day)
}

function convertToYearMonth(endDate, minus){
    const convertDate = new Date(endDate.getFullYear(), endDate.getMonth()-minus)
    return (convertDate.getFullYear()+"-"+(convertDate.getMonth()+1).toString().padStart(2, "0"))
}

export{fastDataGetFormat, fastDataGetTimeStamp, fastDataGetFetchFormat, convertToYearMonth}
