import {Link, Route, Switch} from "react-router-dom";
import "../SCSS/alarmMonitoring.css";
import React, {useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState} from "react";
import {
    useDateTimeLimit,
    useInstantAlarm,
    useLanguage,
    placeholder, useToken, useTemplate, useModel, useCategoryColor, checkDataResult
} from "../function/usePackage";
import {OptionAuto, PageControl, PrintDownload, Sort, SynAssignJob} from "./common";
import {sortConditionData} from "../data/sortConditionData";
import {PAGE_ALARM_INITIAL_STATE, pageReducer} from "../reducer/pageReducer";
import {CONNECT_SERVER, IS_RUNNING, SERVER} from "../setting";
import {Redirect} from "react-router-dom"
import {FormattedMessage} from "react-intl";
import {allConditionData} from "../data/allConditionData";
import ReactDOM from "react-dom";
import {authContext} from "./mainIndex.js";
import {alarmHistoryGenerator} from "../function/download";
import {convertTime, convertToText} from "../function/convertFunction";
import {dealAlarmHistorySearchData, dealData} from "../function/dealDataFunction";

function AlarmMonitoringArticle(){
    const template = useTemplate()
    return(
        <div className={"article_container1"}>
            <Switch>
                {!template.Account_Plugin.IBMS_Assign_Job && <Redirect to={{pathname:"/"}}/>}
                <Redirect exact from={"/alarmMonitoring"} to={{pathname:"/alarmMonitoring/event", state: {"cc":"cc"}}}/>
                <Route path={"/alarmMonitoring/event"}>
                    <AlarmMonitoringEventArticle/>
                </Route>
                <Route path={"/alarmMonitoring/history"}>
                    <AlarmMonitoringHistoryArticle/>
                </Route>
            </Switch>
        </div>
    )
}

function AlarmMonitoringEventArticle() {
    const token = useToken()
    const lang = useLanguage()
    const color = useCategoryColor(token, lang)
    const {alarmVariables} = useInstantAlarm(token)
    const eventData = alarmVariables.data
    // const eventData = []
    // eventRowData.map((item) => {
    //     item.floor = item.floor.toString()
    //     item.status = item.status.toString()
    //     eventData.push(item)
    //     return null
    // })
    const alarmData = {
        "High": {"name": {"CN":"高級","EN":"High"}, "count": 0, "value": "High"},
        "Medium": {"name": {"CN":"中級","EN":"Medium"}, "count": 0, "value": "Medium"},
        "Low": {"name": {"CN":"低級","EN":"Low"}, "count": 0, "value": "Low"},
    }
    const floorData = []
    for(let i of allConditionData.floor.data.slice(1)){
        let item={}
        item.floor = i.name[lang]
        item.value = i.value
        item.count = 0
        floorData.push(item)
    }
    for (let event of eventData) {
        alarmData[event.category].count ++
        floorData[allConditionData.floor.index[event.floor]-1].count ++
    }

    const style = {
        "animationDuration" : alarmVariables.delay.toString()+"ms",
        "animationPlayState": (IS_RUNNING?"running": "paused")
    }
    const date = (
        <div className={"datetime"} style={style}>
            <div className={"date"}>
                {alarmVariables.date.getFullYear()}-{(alarmVariables.date.getMonth() + 1).toString().padStart(2, "0")}-{alarmVariables.date.getDate().toString().padStart(2, "0")}
            </div>
            <div className={"time"}>
                {alarmVariables.date.getHours().toString().padStart(2, "0")}:{alarmVariables.date.getMinutes().toString().padStart(2, "0")}:{alarmVariables.date.getSeconds().toString().padStart(2, "0")}
            </div>
        </div>
    )

    const [variables, dispatch] = useReducer(pageReducer, PAGE_ALARM_INITIAL_STATE)
    const {data} = useMemo(()=>(
        dealData(eventData, variables, lang)),
        [eventData, variables, lang])
    const refFloor = useRef()
    const refCategory = useRef()
    function reset() {
        dispatch(
            {type: "RESET_FILTER"})
    }

    return (
        <div className={"articleAlarmMonitoringEvent"}>
            <div className={"nav"}>
                <CountElement data={alarmData["High"]} dispatch={dispatch} refCategory={refCategory} color={color["High"]}/>
                <CountElement data={alarmData["Medium"]} dispatch={dispatch} refCategory={refCategory} color={color["Medium"]}/>
                <CountElement data={alarmData["Low"]} dispatch={dispatch} refCategory={refCategory} color={color["Low"]}/>
                <SynAssignJob/>
            </div>
            <div className={"articleAlarmMonitoringEventInnerContainer"}>
                <SearchEvent reset={reset} dispatch={dispatch} variables={variables}
                             refFloor={refFloor} refCategory={refCategory}
                />
                <div className={"updateTime"}>
                    <div className={"timeContainer"}>
                        <div className={"timeTitle"}><FormattedMessage id={"index.updateTime"}/></div>
                        {date}
                    </div>
                </div>
            </div>
            <div className={"eventInformation"}>
                <Floor floorData={floorData} dispatch={dispatch} refFloor={refFloor}/>
                <ShowEvent dispatch={dispatch} variables={variables} data={data} assignJob={true}/>
            </div>
        </div>
    )
}
function CountElement(props){
    const lang = useLanguage()

    function handleFilter() {
        props.dispatch({
            type: "CHANGE_FILTER_CONDITION",
            payload: {filter: "category", value: props.data.value}
        })
        props.refCategory.current.focus()
    }

    return(
        <div className={"item"} onClick={handleFilter}>
            <div className={"colorDiv"}>
                <div className={"halfCircle up"} style={{backgroundColor: props.color[0]}}/>
                <div className={"halfCircle down"} style={{backgroundColor: props.color[props.color.length-1]}}/>
            </div>
            <div>{props.data.name[lang]}</div>
            <div className={"count"}>{props.data.count}</div>
        </div>
    )

}
function SearchEvent(props) {
    const lang = useLanguage()
    function handleSearch(event) {
        props.dispatch({
            type: "CHANGE_KEYWORD",
            payload: {keyword: event.target.value}
        })
    }
    function handleFilter(event, filterCategory) {
        props.dispatch({
            type: "CHANGE_FILTER_CONDITION",
            payload: {filter: filterCategory, value: event.target.value}
        })
    }
    return(
        <table border={0}>
            <thead>
            <tr>
                <th/>
                <th>{allConditionData.building.title[lang]}</th>
                <th>{allConditionData.floor.title[lang]}</th>
                <th>{allConditionData.category.title[lang]}</th>
                <th>{allConditionData.status.title[lang]}</th>
                <th/>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td className={"td1"}>
                    <input className={"search"} type="text" placeholder={placeholder(lang)}
                           value={props.variables.search}
                           onChange={(event) => {handleSearch(event)}}
                    />
                </td>
                <td className={"td2"}>
                    <select className={"selectFilter"}>
                        <OptionAuto data={allConditionData.building.data}/>
                    </select>
                </td>
                <td className={"td3"}>
                    <select className={"selectFilter"} value={props.variables.filterCondition["floor"]}
                            onChange={event => {handleFilter(event, "floor")}} ref={props.refFloor}>
                        <OptionAuto data={allConditionData.floor.data}/>
                    </select>
                </td>
                <td className={"td4"}>
                    <select className={"selectFilter"} value={props.variables.filterCondition["category"]}
                            onChange={event => {handleFilter(event, "category")}} ref={props.refCategory}
                    >
                        <OptionAuto data={allConditionData.category.data}/>
                    </select>
                </td>
                <td className={"td5"}>
                    <select className={"selectFilter"} value={props.variables.filterCondition["status"]}
                            onChange={event => {handleFilter(event, "status")}}>
                        <OptionAuto data={allConditionData.status.data}/>
                    </select>
                </td>
                <td className={"td6"}>
                    <button className={"secondary_button reset"} onClick={props.reset}>
                        <FormattedMessage id={"button.reset"}/>
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
    )

}
function Floor(props) {
    return(
        <div className={"floorContainer"}>
            <FloorTitle/>
            <div className={"floorInformation"}>
                {props.floorData.map((item, index) => (
                    <FloorElement key={index} data={item} refFloor={props.refFloor} dispatch={props.dispatch}/>
                ))}
            </div>
        </div>
    )
}

function FloorTitle() {
    const controller = useRef(false)
    const token = useToken()
    const [personnel, setPersonnel] = useState(0)

    const fetchPersonnel = useCallback(async (token)=>{
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/building",{
                headers: new Headers({
                    Authorization: "Bearer " + token
                })})
            const data = await response.json()
            if(controller.current){
                setPersonnel(parseInt(data.onSiteStaff)+parseInt(data.onSiteVisitors))
            }
        }catch (e){
            if (typeof(e)==="object" && e.json) {
                const data = await e.json()
                console.log(data)
            }
            console.log(e)
        }

    },[])

    useEffect(()=>{
        if(CONNECT_SERVER){
            controller.current = true
            const response = fetchPersonnel(token)
            console.log(response)
            return ()=>{
                controller.current = false
            }
        }
    },[fetchPersonnel, token])
    return(
        <div className={"floorTitle"}>
            <div className={"title1"}>
                <div className={"pageButton"}>
                    <div className={"div_svg"}>
                        <svg width="0.625rem" height="0.9375rem" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.82915 7.24543L9.66 12.0746L7.24543 14.4909L0 7.24543L7.24543 0L9.66 2.41628L4.82915 7.24543Z" fill="#8FCDCC" fillOpacity="0.26"/>
                        </svg>
                    </div>
                    <div className={"div_svg"}>
                        <svg width="0.625rem" height="0.9375rem" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.82958 7.24352L0 2.41564L2.41394 0L9.65745 7.24352L2.41394 14.487L0 12.0714L4.82958 7.24352Z" fill="#8FCDCC" fillOpacity="0.26"/>
                        </svg>
                    </div>
                </div>
                <div className={"titleFloor"}><FormattedMessage id={"alarmEvent.totalFloor"}/></div>
            </div>
            <div className={"title2"}>
                <div className={"title2Text1"}>
                    <FormattedMessage id={"alarmEvent.people"}/>
                </div>
                <div className={"title2Text2"}>{personnel}</div>
                <div className={"title2Text3"}>
                    <FormattedMessage id={"alarmEvent.AlarmCount"}/>
                </div>
            </div>
        </div>
    )
}

function FloorElement(props) {
    let className = "element"
    if(props.data.count>0){
        className="active element"
    }

    function handleFilter() {
        props.dispatch({
            type: "CHANGE_FILTER_CONDITION",
            payload: {filter: "floor", value: props.data.value}
        })
        props.refFloor.current.focus()
    }

    return(
        <div className={className} onClick={handleFilter}>
            <div className={"elementImage"}>
                {props.data.floor}
            </div>
            <div className={"elementNumber"}>
                {props.data.count}
            </div>
        </div>
    )
}

function ShowEvent(props) {
    return(
        <div className={"showEventContainer"}>
            <ShowEventTitle {...props}/>
            <ShowEventTable dealData={props.data.dealData} assignJob={props.assignJob}/>
        </div>
    )
}

function ShowEventTitle(props) {
    function handleChange(event){
        props.dispatch({
            type: "CHANGE_PAGESIZE",
            payload: {value: parseInt(event.target.value, 10)}
        })
    }
    const noData = ()=>{
        if(props.history){
            return <div className={"noData"}><FormattedMessage id={"alarm.filterNoAlarm"}/></div>
        }
        for (let property in props.variables.filterCondition){
            if (props.variables.filterCondition[property] && props.variables.filterCondition.hasOwnProperty(property)){
                return <div className={"noData"}><FormattedMessage id={"alarm.filterNoAlarm"}/></div>
            }
        }
        return <div className={"noData"}><FormattedMessage id={"index.noAlarm"}/></div>
    }

    return(
        <div className={"showEventTitle"}>
            <div className={"title1"}>
                <div className={"title1Front"}>
                    <FormattedMessage id={"alarm.show"}/>
                    <select value={props.variables.pagination.pageSize} onChange={handleChange}>
                        {props.variables.pagination.pageSizeOptions.map((item, index) =>(
                            <option value={item} key={index}>{item}</option>
                        ))}
                    </select>
                    <FormattedMessage id={"alarm.entries"}/>
                </div>
                <PageControl {...props}/>
            </div>
            {props.data.dealData.length===0 && noData()}
            {props.data.dealData.length !== 0 &&
            <div className={"title2"}>
                <Sort data={sortConditionData["time"]} sortCondition={props.variables.sortCondition}
                      dispatch={props.dispatch}/>
                <Sort data={sortConditionData["floor"]} sortCondition={props.variables.sortCondition}
                      dispatch={props.dispatch}/>
                <Sort data={sortConditionData["message"]} sortCondition={props.variables.sortCondition}
                      dispatch={props.dispatch}/>
                <Sort data={sortConditionData["status"]} sortCondition={props.variables.sortCondition}
                      dispatch={props.dispatch}/>
            </div>
            }
        </div>
    )
}

function ShowEventTable(props) {
    const token = useToken()
    const color = useCategoryColor(token)
    return(
        <div className={"showEventTable"}>
            <table className={"table"}>
                <tbody>
                {props.dealData.map((item, index) => (<EventElement key={index} data={item} assignJob={props.assignJob} color={color}/>))}
                </tbody>
            </table>
        </div>
    )
}

function EventElement(props) {
    const template = useTemplate()
    const lang = useLanguage()
    const [showAssignJob, setShowAssignJob] = useState(false)
    const [showModel, setShowModel] = useState(false)
    const operateData = useRef()

    function sendToAssignJob() {
        setShowAssignJob(true)
    }
    function closeAssignJob() {
        setShowAssignJob(false)
    }

    function handleOpen(data) {
        operateData.current = data
        setShowModel(true)
    }

    const model = useMemo(()=>{
        return showModel && (<AlarmOperate setShowModel={setShowModel} data={operateData.current}/>)
    },[showModel])

    return(
        <tr>
            {model}
            <td className={"td1"}>
                {convertTime(props.data.time)}
            </td>
            <td className={"td2"}>
                {convertToText(props.data, "floor", lang)}
            </td>
            <td className={"td3"}>
                {props.data.deviceName}-{props.data.message}
            </td>
            <td className={"td4"}>
                <div className={"td4Text"}>
                    <div className={"status"}>
                        {convertToText(props.data, "status", lang)}
                        {props.data.dispatchStatus && ("(派工: "+props.data.dispatchStatus+")")}
                        <br/>
                        {props.data.assignJobNumber &&
                            <FormattedMessage id={"alarm.assignJobNumber"}/>
                        }
                        {lang==="EN" && props.data.assignJobNumber && <br/>}
                        {props.data.assignJobNumber}
                    </div>
                    <div className={"td4TextImage"}>
                        <Link to={"/alarmSetting/category"}>
                            <div className={"colorDiv"}>
                                <div className={"halfCircle up"} style={{backgroundColor: props.color[props.data.category][0]}}/>
                                <div className={"halfCircle down"} style={{backgroundColor: props.color[props.data.category][props.color[props.data.category].length-1]}}/>
                            </div>
                        </Link>
                        {template.Account_Plugin.IBMS_Assign_Job===1 && props.assignJob &&
                        (
                            <div className={"div_assignJob"}
                                 onMouseEnter={sendToAssignJob} onMouseLeave={closeAssignJob}
                                 onClick={()=>(handleOpen(props.data))}
                            >
                                {showAssignJob && <OperatorTitle
                                    data={props.data}
                                    closeAssignJob={closeAssignJob}
                                />}
                                <svg width="1.375rem" height="1.1875rem" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.5 3.4596V4.27674H2.48286C1.82833 4.28081 1.20153 4.54155 0.737236 5.00291C0.272939 5.46427 0.00822059 6.08939 0 6.74388V16.1725C0.00412064 16.8297 0.26703 17.4588 0.731766 17.9235C1.1965 18.3883 1.82563 18.6512 2.48286 18.6553H19.5329C19.8582 18.6553 20.1803 18.591 20.4806 18.466C20.781 18.3411 21.0537 18.1579 21.283 17.9272C21.5123 17.6964 21.6937 17.4226 21.8167 17.1214C21.9398 16.8203 22.0021 16.4978 22 16.1725V6.74388C22 6.08956 21.7401 5.46203 21.2774 4.99935C20.8147 4.53667 20.1872 4.27674 19.5329 4.27674H16.5V3.4596C16.5063 3.13166 16.4471 2.80577 16.3259 2.50098C16.2047 2.19619 16.024 1.91862 15.7943 1.68451C15.5645 1.4504 15.2905 1.26444 14.988 1.13752C14.6856 1.01059 14.3609 0.945253 14.0329 0.945313H7.98286C7.65474 0.94737 7.33024 1.01404 7.02788 1.14151C6.72553 1.26897 6.45124 1.45475 6.22069 1.68822C5.99013 1.9217 5.80782 2.1983 5.68416 2.50223C5.56051 2.80617 5.49793 3.13148 5.5 3.4596ZM7.98286 2.62674H14.0329C14.249 2.63121 14.456 2.71512 14.6143 2.86246C14.768 3.02295 14.8527 3.23736 14.85 3.4596V4.27674H7.15V3.4596C7.15321 3.23548 7.24336 3.02137 7.40143 2.86246C7.5597 2.71512 7.76667 2.63121 7.98286 2.62674ZM5.5 5.92674H19.5329C19.6406 5.92491 19.7477 5.94484 19.8476 5.98534C19.9475 6.02584 20.0382 6.08608 20.1143 6.16245C20.2656 6.31813 20.3502 6.52676 20.35 6.74388V9.22674H17.05V8.39388C17.0502 8.17676 16.9656 7.96813 16.8143 7.81246C16.6587 7.6608 16.4501 7.57591 16.2329 7.57591C16.0156 7.57591 15.807 7.6608 15.6514 7.81246C15.4957 7.96654 15.4056 8.17488 15.4 8.39388V9.22674H6.6V8.39388C6.60022 8.17676 6.51564 7.96813 6.36429 7.81246C6.20874 7.6608 6.0001 7.57591 5.78286 7.57591C5.56562 7.57591 5.35697 7.6608 5.20143 7.81246C5.04571 7.96654 4.95562 8.17488 4.95 8.39388V9.22674H1.65V6.74388C1.65562 6.52488 1.74571 6.31654 1.90143 6.16245C1.97751 6.08608 2.06821 6.02584 2.16812 5.98534C2.26802 5.94484 2.37507 5.92491 2.48286 5.92674H5.5ZM15.4 10.8767V12.2439C15.4032 12.468 15.4934 12.6821 15.6514 12.841C15.807 12.9927 16.0156 13.0776 16.2329 13.0776C16.4501 13.0776 16.6587 12.9927 16.8143 12.841C16.968 12.6805 17.0527 12.4661 17.05 12.2439V10.8767H20.35V16.0939C20.3528 16.2018 20.3332 16.3091 20.2927 16.4091C20.2521 16.5092 20.1914 16.5998 20.1143 16.6753C20.039 16.7538 19.9488 16.8165 19.8489 16.8597C19.7491 16.9028 19.6416 16.9256 19.5329 16.9267H2.48286C2.37296 16.9236 2.26481 16.8984 2.16491 16.8524C2.065 16.8065 1.97539 16.741 1.90143 16.6596C1.82221 16.5849 1.75906 16.4947 1.71583 16.3948C1.6726 16.2948 1.6502 16.1871 1.65 16.0782V10.8767H4.95V12.2439C4.95321 12.468 5.04336 12.6821 5.20143 12.841C5.35697 12.9927 5.56562 13.0776 5.78286 13.0776C6.0001 13.0776 6.20874 12.9927 6.36429 12.841C6.51802 12.6805 6.60266 12.4661 6.6 12.2439V10.8767H15.4Z" fill="#00EAFF"/>
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    )
}

function AlarmOperate(props) {
    const container = useModel()
    const [target, setTarget] = useState("remove")
    const isNeedDispatch = useMemo(()=>{
        if(props.data.dispatchStatus==="無法處理" ||
            props.data.dispatchStatus==="无法处理" || props.data.dispatchStatus==="取消派工"
        ){
            return true
        }
        return !props.data.assignJobNumber

    },[props])

    function handleClose() {
        props.setShowModel(false)
    }

    function preventBubble(event) {
        event.stopPropagation()
    }

    const targetClass = useCallback((title, target)=>{
        if(title===target){
            return "target active"
        }else{
            return "target"
        }
    },[])

    const changeTarget = useCallback((event, title) => {
        event.stopPropagation()
        setTarget(title)
    },[])

    const context = useCallback((target, data, setShowModel)=>{
        if(target==="dispatch"){
            return <ContextDispatch data={data} setShowModel={setShowModel}/>
        }else if(target==="remove"){
            return <ContextDeal data={data} setShowModel={setShowModel} deal={"remove"}/>
        }else if(target==="needAck"){
            return <ContextDeal data={data} setShowModel={setShowModel} deal={"needAck"}/>
        }
    },[])

    return (
        ReactDOM.createPortal(
            <div className={"model2"} onClick={handleClose}>
                <div className={"alarmOperate"} onClick={(event)=>preventBubble(event)}>
                    <div className={"leftContainer"}>
                        <div className={targetClass("remove", target)} onClick={event =>changeTarget(event, "remove")}>
                            <FormattedMessage id={"dispatch.remove.status"}/>
                        </div>
                        {isNeedDispatch &&
                        <div className={targetClass("dispatch", target)}
                             onClick={event => changeTarget(event, "dispatch")}>
                            <FormattedMessage id={"dispatch"}/>
                        </div>
                        }
                        {(props.data.status==="1" || props.data.status==="2") &&
                            <div className={targetClass("needAck", target)}
                                 onClick={event => changeTarget(event, "needAck")}>
                                <FormattedMessage id={"dispatch.needAck.status"}/>
                            </div>
                        }
                    </div>
                    <div className={"rightContainer"}>
                        {context(target, props.data, props.setShowModel)}
                    </div>
                    <div className={"close"} onClick={handleClose}>
                        <svg width="2.125rem" height="2.125rem" viewBox="0 0 34 34" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19.3568 17.0007L24.0718 12.2873C24.2267 12.1325 24.3495 11.9486 24.4333 11.7463C24.5171 11.544 24.5603 11.3271 24.5603 11.1082C24.5603 10.8892 24.5171 10.6723 24.4333 10.47C24.3495 10.2677 24.2267 10.0838 24.0718 9.92898C23.917 9.77413 23.7331 9.6513 23.5308 9.5675C23.3285 9.48369 23.1117 9.44056 22.8927 9.44056C22.6737 9.44056 22.4568 9.48369 22.2545 9.5675C22.0522 9.6513 21.8683 9.77413 21.7135 9.92898L17.0002 14.644L12.2868 9.92898C11.9741 9.61625 11.5499 9.44056 11.1077 9.44056C10.6654 9.44056 10.2412 9.61625 9.9285 9.92898C9.61576 10.2417 9.44007 10.6659 9.44007 11.1082C9.44007 11.3271 9.4832 11.544 9.56701 11.7463C9.65081 11.9486 9.77365 12.1325 9.9285 12.2873L14.6435 17.0007L9.9285 21.714C9.61576 22.0267 9.44007 22.4509 9.44007 22.8932C9.44007 23.3354 9.61576 23.7596 9.9285 24.0723C10.2412 24.3851 10.6654 24.5607 11.1077 24.5607C11.5499 24.5607 11.9741 24.3851 12.2868 24.0723L17.0002 19.3573L21.7135 24.0723C22.0262 24.3851 22.4504 24.5607 22.8927 24.5607C23.3349 24.5607 23.7591 24.3851 24.0718 24.0723C24.3846 23.7596 24.5603 23.3354 24.5603 22.8932C24.5603 22.4509 24.3846 22.0267 24.0718 21.714L19.3568 17.0007ZM17.0002 33.6673C7.79516 33.6673 0.333496 26.2057 0.333496 17.0007C0.333496 7.79565 7.79516 0.333984 17.0002 0.333984C26.2052 0.333984 33.6668 7.79565 33.6668 17.0007C33.6668 26.2057 26.2052 33.6673 17.0002 33.6673Z"
                                fill="#8FCDCC"/>
                        </svg>
                    </div>
                </div>
            </div>,
            container
        )
    )
}

function ContextDispatch(props){
    const token = useToken()

    const handleDispatch = useCallback(async (data, setShowModel)=> {
        try{
            const response = await fetch(SERVER+"/api/IBMS/Web/V1/assignJob",{
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "EventID": data.eventId,
                    "ObjectID": data.objectId,
                    "AlarmCategoryLevel": data.category,
                    "AlarmMessage": data.message
                })
            })
            console.log(response)
            setShowModel(false)
        }catch (e) {
            console.log(e)
            alert(e)
        }
    },[token])

    return(
        <div className={"contextDispatch"}>
            <div className={"title"}>
                <FormattedMessage id={"dispatch.title"}/>
            </div>
            <div className={"information"}>
                <EventInformation data={props.data}/>
            </div>
            <div className={"buttonContainer"}>
                <div className={"secondary_button save"}
                     onClick={()=>handleDispatch(props.data, props.setShowModel)}>
                    <FormattedMessage id={"yes"}/>
                </div>
            </div>
        </div>
    )
}

function ContextDeal(props) {
    const token = useToken()
    const auth = useContext(authContext)
    const urlFunc = useCallback((deal) =>{
        if(deal==="remove"){
            return "Close"
        }else if(deal==="needAck"){
            return "Ack"
        }
    },[])
    const [textValue, setTextValue] = useState("")
    const handleAlarm = useCallback(async (event, token, data, setShowModel, textValue, auth) => {
        event.preventDefault()
        const body = {
            "EventId": data.eventId,
            "SigningPersonnel1": auth.user.AccountInfo.AccountId,
            "SigningComment1": textValue
        }
        try {
            let response = await fetch(SERVER.slice(0, -4) + "9322/api/CCAU/NADI_3DOCMS/CCAU/alarm/"+urlFunc(props.deal), {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify(body)
            })
            console.log(response)
            const data = await response.json()
            // console.log(data)
            const data2 = await checkDataResult(data)
            console.log(data2)
            setShowModel(false)
        } catch (e) {
            console.log("e: ", e)
            alert(e["Message"])
        }
        // setShowModel(false)
    }, [urlFunc, props.deal])

    function handleText(event) {
        setTextValue(event.target.value)
    }

    return (
        <div className={"contextRemove"}>
            <form onSubmit={(event) => handleAlarm(event, token, props.data,
                props.setShowModel, textValue, auth)}>
                <div className={"title"}>
                    <FormattedMessage id={"dispatch." + props.deal + ".title"}/>
                </div>
                <div className={"information"}>
                    <EventInformation data={props.data}/>
                    <div className={"itemContainer"}>
                        <div className={"key active"}>
                            <FormattedMessage id={"dispatch.comment"}/>*
                        </div>
                        <div className={"value active"}>
                            <textarea cols={30} rows={4} required={true} value={textValue}
                                      onChange={event => handleText(event)}/>
                        </div>
                    </div>
                </div>
                <div className={"buttonContainer"}>
                    <button className={"secondary_button save"}>
                        <FormattedMessage id={"yes"}/>
                    </button>
                </div>
            </form>
        </div>
    )
}

function EventInformation(props){
    const lang = useLanguage()
    return(
        <>
            <div className={"itemContainer"}>
                <div className={"key"}>
                    <FormattedMessage id={"dispatch.startTime"}/>
                </div>
                <div className={"value"}>
                    {convertTime(props.data.time)}
                </div>
            </div>
            <div className={"itemContainer"}>
                <div className={"key"}>
                    <FormattedMessage id={"dispatch.floor"}/>
                </div>
                <div className={"value"}>
                    {convertToText(props.data, "floor", lang)}
                </div>
            </div>
            <div className={"itemContainer"}>
                <div className={"key"}>
                    <FormattedMessage id={"dispatch.equipment"}/>
                </div>
                <div className={"value"}>
                    {props.data.deviceName}
                </div>
            </div>
            <div className={"itemContainer"}>
                <div className={"key"}>
                    <FormattedMessage id={"dispatch.message"}/>
                </div>
                <div className={"value"}>
                    {props.data.message}
                </div>
            </div>
            <div className={"itemContainer"}>
                <div className={"key"}>
                    <FormattedMessage id={"dispatch.status"}/>
                </div>
                <div className={"value"}>
                    {convertToText(props.data, "status", lang)}
                </div>
            </div>
        </>
    )
}

function OperatorTitle() {

    return(
        <div className={"operatorTitle"}>
            <FormattedMessage id={"alarm.operate"}/>
        </div>
    )
}

function AlarmMonitoringHistoryArticle(){
    const [variables, dispatch] = useReducer(pageReducer, PAGE_ALARM_INITIAL_STATE)
    const [data, setData] = useState([])
    const [open, setOpenDown] = useState(false)
    const downloadData = useRef()
    return(
        <div className={"articleAlarmHistorySearch"}>
            <SearchHistory dispatch={dispatch} variables={variables} setData={setData}
                           setOpen={setOpenDown} downloadData={downloadData}/>
            {open &&
            <HistoryEvent data={data} dispatch={dispatch} variables={variables} downloadData={downloadData}/>
            }
        </div>
    )
}

function SearchHistory(props) {
    const token = useToken()
    const lang = useLanguage()
    const {firstMaxDate, lastMinDate, firstMaxTime, lastMinTime,changeFirstDate,
        changeLastDate, changeFirstTime, changeLastTime} = useDateTimeLimit()

    async function handleForm(event) {
        event.preventDefault()
        props.setOpen(false)
        const start = new Date(props.variables.datetime.firstDate + "/" +props.variables.datetime.firstTime)
        const end = new Date(props.variables.datetime.lastDate + "/" +props.variables.datetime.lastTime)
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/getAlarmEventHistorical", {
                method: "POST",
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "filterCondition": props.variables.filterCondition,
                    "type": "day",
                    "datetime": {
                        "start": start.getTime() / 1000,
                        "end": end.getTime() / 1000
                    }
                })
            })
            const data = await response.json()
            props.downloadData.current = {
                "filterCondition": props.variables.filterCondition,
                "datetime": {
                    "start": start.getTime() / 1000,
                    "end": end.getTime() / 1000
                }
            }
            props.setData(data)
            props.setOpen(true)
        }catch (e) {
            console.log(e)
        }
    }

    function handleFilter(event, filter) {
        props.dispatch({
            type: "CHANGE_FILTER_CONDITION(NO_CHANGE_PAGE)",
            payload: {
                filter: filter,
                value: event.target.value
            }
        })
    }

    function handleDatetime(event, dateType, func) {
        func(event)
        props.dispatch({
            type: "CHANGE_DATETIME",
            payload: {
                dateType: dateType,
                value: event.target.value
            }
        })
    }

    function handleReset() {
        props.dispatch({
            type: "RESET_ALARM_HISTORY_SEARCH"
        })
    }

    return(
        <div className={"searchConditionContainer"}>
            <div className={"searchCondition"}>
                <form action="" onSubmit={handleForm}>
                    <div className={"AlarmHistoryTable"}>
                        <table>
                            <tbody>
                            <tr>
                                <td className={"td1"}>{allConditionData.building.title[lang]}</td>
                                <td className={"td2"}>
                                    <select className={"selectFilter"}>
                                        <OptionAuto data={allConditionData.building.data}/>
                                    </select>
                                </td>
                                <td className={"td3"}>{allConditionData.floor.title[lang]}</td>
                                <td className={"td4"}>
                                    <select className={"selectFilter"} value={props.variables.filterCondition.floor}
                                            onChange={(event) => {handleFilter(event, "floor")}}>
                                        <OptionAuto data={allConditionData.floor.data}/>
                                    </select>
                                </td>
                                <td className={"td5"}>{allConditionData.category.title[lang]}</td>
                                <td className={"td6"}>
                                    <select className={"selectFilter"} value={props.variables.filterCondition.category}
                                            onChange={(event) => {handleFilter(event, "category")}}>
                                        <OptionAuto data={allConditionData.category.data}/>
                                    </select>
                                </td>
                                <td className={"td7"}>{allConditionData.status.title[lang]}</td>
                                <td className={"td8"}>
                                    <select className={"selectFilter"} value={props.variables.filterCondition.status}
                                                    onChange={(event) => {handleFilter(event, "status")}}>
                                        <OptionAuto data={allConditionData.status.data}/>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td><label htmlFor="firstDate"><FormattedMessage id={"alarmHistory.startDate"}/></label></td>
                                <td><input type="date" id="firstDate" name="firstDate" value={props.variables.datetime.firstDate} required={true}
                                           onChange={(event) => {handleDatetime(event,"firstDate",changeFirstDate)}}
                                           max={firstMaxDate}/></td>
                                <td className={"td3"}><label htmlFor="firstTime"><FormattedMessage id={"alarmHistory.startTime"}/></label></td>
                                <td><input type="time" id="firstTime" name="firstTime" value={props.variables.datetime.firstTime} required={true}
                                           onChange={(event) => {handleDatetime(event,"firstTime",changeFirstTime)}}
                                           max={firstMaxTime}/></td>
                                <td><label htmlFor="lastDate"><FormattedMessage id={"alarmHistory.endDate"}/></label></td>
                                <td><input type="date" id="lastDate" name="lastDate" value={props.variables.datetime.lastDate} required={true}
                                           onChange={(event) => {handleDatetime(event,"lastDate",changeLastDate)}}
                                           min={lastMinDate}/></td>
                                <td className={"td3"}><label htmlFor="lastTime"><FormattedMessage id={"alarmHistory.endTime"}/></label></td>
                                <td><input type="time" id="lastTime" name="lastTime" value={props.variables.datetime.lastTime} required={true}
                                           onChange={(event) => {handleDatetime(event,"lastTime",changeLastTime)}}
                                           min={lastMinTime}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className={"foot"}>
                        <FormattedMessage id={"alarmHistory.note"}/>
                    </div>
                    <div className={"div_button"}>
                        <button className={"secondary_button submit"}><FormattedMessage id={"button.submit"}/></button>
                        <button className={"secondary_button buttonRight reset"} type={"reset"} onClick={handleReset}><FormattedMessage id={"button.reset"}/></button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function HistoryEvent(props) {
    const token = useToken()
    const lang = useLanguage()
    const {data} = dealAlarmHistorySearchData(props.data, props.variables)
    const alarmHistoryDownload = alarmHistoryGenerator(token, lang, "day",
        props.downloadData.current.filterCondition, props.downloadData.current.datetime)
    return(
        <div className={"historyEvent"}>
            <div className={"downloadContainer"}>
                <PrintDownload download={alarmHistoryDownload} fileName={"alarm_history_list"}/>
            </div>
            <ShowEvent data={data} variables={props.variables} dispatch={props.dispatch} history={true}/>
        </div>
    )
}

export {AlarmMonitoringArticle, ShowEventTable};
