import {allConditionData} from "../data/allConditionData";

function convertDate(timestamp) {
    const date = new Date(timestamp * 1000)
    return `${date.getFullYear().toString()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
}

function convertTime(timestamp) {
    const date = new Date(timestamp * 1000)
    return `${date.getFullYear().toString()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
}

function convertToText(datum, property, lang) {
    return (allConditionData[property].data[allConditionData[property].index[datum[property]]].name[lang])
}

export {convertTime, convertDate, convertToText};
