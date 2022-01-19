import {SERVER} from "../setting";
import {accountUrl} from "../data/url";
import {convertDate} from "./convertFunction";

const downloadUrlGenerator = (data, fileName, fileType) => {
    const url = window.URL.createObjectURL(
        new Blob([data])
    )
    const link = document.createElement("a")
    link.href = url
    link.setAttribute(
        "download",
        fileName+"."+fileType
    )
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
}

function reportAlarmGenerator(token, lang, type, filterCondition, timestamp){
    async function reportAlarmDownload(fileType){
        try{
            const response = await fetch(SERVER +
                "/api/IBMS/Web/V1/getAlarmEventHistorical/"+fileType+"/"+lang, {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "filterCondition": filterCondition,
                    "type": type,
                    "datetime": {
                        "start": timestamp.start,
                        "end": timestamp.end
                    }
                })
            })
            return await response.blob()
        }catch (e) {
            console.log(e)
        }
    }
    return reportAlarmDownload
}

function reportAccountGenerator(token, lang, filterCondition){
    async function reportAccountDownload(fileType){
        try{
            const response = await fetch(SERVER +
                "/api/IBMS/Web/V1/report/"+accountUrl+"/"+fileType+"/"+lang, {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "filterCondition": filterCondition,
                })
            })
            return await response.blob()
        }catch (e) {
            console.log(e)
        }
    }
    return reportAccountDownload
}

function reportAccessInstantGenerator(token, lang, filterCondition){
    async function reportAccessInstantDownload(fileType){
        try{
            const response = await fetch(SERVER +
                "/api/IBMS/Web/V1/report/accessInstant/"+fileType+"/"+lang, {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "filterCondition": filterCondition,
                })
            })
            return await response.blob()
        }catch (e) {
            console.log(e)
        }
    }
    return reportAccessInstantDownload
}

function reportAccessPeriodGenerator(token, lang, filterCondition, start, end){
    async function reportAccessPeriodDownload(fileType){
        try{
            const response = await fetch(SERVER +
                "/api/IBMS/Web/V1/report/accessPeriod/"+fileType+"/"+lang, {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "filterCondition": filterCondition,
                    "start": start,
                    "end": end
                })
            })
            return await response.blob()
        }catch (e) {
            console.log(e)
        }
    }
    return reportAccessPeriodDownload
}

function reportChargerInformationGenerator(token, lang, filterCondition, metadata){
    async function reportChargerInformationDownload(fileType){
        try{
            const response = await fetch(SERVER +
                "/api/IBMS/Web/V1/charger/information/"+metadata.charger
                +"/"+fileType+"/"+lang, {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "costData": {
                        "type": metadata.select,
                        "startDay": metadata.costDate.startDay,
                        "endDay": metadata.costDate.endDay
                    },
                    "information": {
                        "startDay": metadata.date.startDay,
                        "endDay": metadata.date.endDay
                    },
                    "filterCondition": filterCondition
                })
            })
            return await response.blob()
        }catch (e) {
            console.log(e)
        }
    }
    return reportChargerInformationDownload
}

function reportChargerUsageGenerator(token, lang, metadata){
    async function reportChargerUsageDownload(fileType){
        try{
            const response = await fetch(SERVER +
                "/api/IBMS/Web/V1/charger/usage/"+metadata.charger
                +"/"+fileType+"/"+lang, {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "startDay": metadata.date.startDay,
                    "endDay": metadata.date.endDay
                })
            })
            return await response.blob()
        }catch (e) {
            console.log(e)
        }
    }
    return reportChargerUsageDownload
}

function reportVisitorGenerator(token, lang, metadata, page, title){
    let startDay
    let endDay
    if(metadata.pageMax===6){
        // console.log(title)
        const titleDate = new Date(title+"/")
        startDay = convertDate(titleDate.getTime()/1000)
        if(titleDate.getMonth()===new Date().getMonth()){
            endDay = convertDate(new Date().getTime()/1000)
        }else{
            endDay = convertDate(new Date(titleDate.getFullYear(),
                titleDate.getMonth()+1, 0).getTime()/1000)
        }
    }else if(metadata.pageMax===2){
        startDay = title+"-01-01"
        if(page===metadata.pageMax){
            endDay = convertDate(new Date().getTime()/1000)
        }else{
            endDay = title+"-12-31"
        }
    }else{
        startDay = metadata.startDay
        endDay = metadata.endDay
    }

    async function reportVisitorDownload(fileType){
        try{
            const response = await fetch(SERVER +
                "/api/IBMS/Web/V1/visitor/"+fileType+"/"+lang, {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "startDay": startDay,
                    "endDay": endDay,
                    "type": metadata.type
                })
            })
            return await response.blob()
        }catch (e) {
            console.log(e)
        }
    }
    return reportVisitorDownload
}

function alarmHistoryGenerator(token, lang, type, filterCondition, timestamp){
    async function alarmHistoryDownload(fileType){
        try{
            const response = await fetch(SERVER +
                "/api/IBMS/Web/V1/alarmHistoryList/"+fileType+"/"+lang, {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "filterCondition": filterCondition,
                    "type": type,
                    "datetime": {
                        "start": timestamp.start,
                        "end": timestamp.end
                    }
                })
            })
            return await response.blob()
        }catch (e) {
            console.log(e)
        }
    }
    return alarmHistoryDownload
}

export {reportAlarmGenerator, downloadUrlGenerator, reportAccountGenerator,
    reportAccessInstantGenerator, reportAccessPeriodGenerator,
    reportChargerInformationGenerator, reportChargerUsageGenerator,
    reportVisitorGenerator, alarmHistoryGenerator
}
