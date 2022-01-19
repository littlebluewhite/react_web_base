import React from "react";
import {deepCopy} from "../../util";

function rangeClassName(value){
    if(value){
        return ""
    }else{
        return "style0"
    }
}

function setDataReturn(pre, field, data){
    if(pre[field]===1){
        data[field] = 0
        return {...pre, [field]: 0}
    }else if(pre[field]===0){
        data[field] = 1
        return {...pre, [field]: 1}
    }
}


function rangeArrayValue(field, data){
    if(data.includes(field)){
        return 1
    }else{
        return 0
    }
}

function rangeArrayClassName(field, data){
    if(data.includes(field)){
        return ""
    }else{
        return "style0"
    }
}

function subHandleClick(field, setData, preData, data){
    const index = data.indexOf(field)
    if(index>=0){
        setData(pre=>{
            const result = [...pre]
            preData.splice(index, 1)
            result.splice(index, 1)
            return result
        })
    }else{
        setData(pre=>{
            const result = [...pre]
            preData.push(field)
            result.push(field)
            return result
        })
    }
}

function mergeClassName(type, hoverList, field){
    const defaultClassName = type + " circle"
    if(hoverList[type][field].length===0){
        return defaultClassName + " none"
    }else{
        return defaultClassName
    }
}

// merge page hover mouseEnter and mouseLeave
function handleMouse(hover, type, field, setIsHover) {
    setIsHover(pre => {
            let result = {
                ...pre,
                "on": {...pre.on},
                "off": {...pre.off}
            }
            result[type][field] = hover
            return result
        }
    )
}

// when "on" of "off" circle hover show data
function hoverData(type, field, isHover, hoverList) {
    if (!isHover[type][field]) {
        return null
    } else {
        const list = hoverList[type][field]
        return (
            <>
                <div className={"hoverData"}>
                    {list.map((item, index) => (
                        <div className={"rowContainer"} key={index}>
                            <div className={type+" colorBox"}/>
                            <div className={"text"}>{type}:</div>
                            <div className={"text"}>{item}</div>
                        </div>
                    ))}
                </div>
                <div className={"triangle"}/>
            </>
        )
    }
}

function mergeSelectData(mergeSchemas, mergeSelect){
    if(Array.isArray(mergeSchemas)){
        return handleMergeArray(mergeSchemas, mergeSelect)
    }else if(typeof(mergeSchemas)){
        return handleMergeDict(mergeSchemas, mergeSelect)
    }
}

function handleMergeArray(mergeSchemas, mergeSelect){
    let result = []
    for(let datum of Object.values(mergeSelect)){
        for(let item of datum){
            if(!result.includes(item)){
                result.push(item)
            }
        }
    }
    return result
}

function handleMergeDict(mergeSchemas, mergeSelect){
    let result = {}
    for(let key in mergeSchemas){
        if(typeof(mergeSchemas[key])!=="object"){
            result[key] = 0.0
            for(let datum of Object.values(mergeSelect)){
                if(datum[key]>0){
                    result[key] = 1.0
                    break
                }
            }
        }else{
            const newSelectData = {}
            for(let name in mergeSelect){
                newSelectData[name] = mergeSelect[name][key]
                if(!newSelectData[name]){
                    newSelectData[name] = deepCopy(mergeSchemas[key])
                }
            }
            result[key] = mergeSelectData(mergeSchemas[key], newSelectData)
        }
    }
    // console.log(result)
    return result
}

export {rangeClassName, setDataReturn, rangeArrayValue,
    rangeArrayClassName, subHandleClick, mergeClassName,
    handleMouse, hoverData, mergeSelectData
}