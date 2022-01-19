import {
    useChartSize,
    useDateTimeLimit,
    useFastSelfSearch,
    useLanguage, useModel,
    useToken
} from "../../function/usePackage";
import React, {useMemo, useReducer, useRef, useState} from "react";
import {PAGE_ALARM_INITIAL_STATE, pageReducer} from "../../reducer/pageReducer";
import {SERVER} from "../../setting";
import {alarmSearchFastData, MonthSearchData} from "../../data/alarmSearchFastData";
import {FormattedMessage} from "react-intl";
import {FilterElement, PageControl, PrintDownload, Sort} from "../common";
import {allConditionData} from "../../data/allConditionData";
import {Doughnut, Line} from "react-chartjs-2";
import ReactDOM from "react-dom";
import {ShowEventTable} from "../alarmMonitoringArticle";
import {sortConditionData} from "../../data/sortConditionData";
import "../../SCSS/report/report_alarm.css"
import {doughnutBackgroundColor} from "../../data/backgroundColor";
import {alarmHistoryGenerator, reportAlarmGenerator} from "../../function/download";
import {dealReportAlarmFastData, dealReportAlarmSelfData, eventSort} from "../../function/dealDataFunction";

function  ReportAlarmStatisticArticle() {
    const token = useToken()
    const [AlarmStatisticVariables, AlarmStatisticDispatch] = useReducer(pageReducer, PAGE_ALARM_INITIAL_STATE)
    const [search, setSearch] = useState("fast")
    const [downContainer, setDownContainer] = useState(false)
    const fastSelect = useRef(0)
    const selfSelect = useRef({start: null, end: null})
    const [selfSelect2, setSelfSelect2] = useState({start: null, end: null})
    const [eventData, setEventData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    function fetchFastData(start, end) {
        if(end==="now"){
            end = new Date()
        }
        return fetch(SERVER + "/api/IBMS/Web/V1/getAlarmEventHistorical", {
            method: "POST",
            headers: new Headers({
                'Content-Type': 'application/json',
                Authorization: "Bearer " + token
            }),
            body: JSON.stringify({
                "filterCondition": {"floor": "", "category": "", "status": ""},
                "type": "day",
                "datetime": {
                    "start": start.getTime() / 1000,
                    "end": end.getTime() / 1000
                }
            })
        })
    }

    function fetchSelfData(datetime){
        // console.log(new Date(datetime.end+"/23:59:59").getTime() / 1000)
        return fetch(SERVER + "/api/IBMS/Web/V1/getAlarmEventHistorical", {
            method: "POST",
            headers: new Headers({
                'Content-Type': 'application/json',
                Authorization: "Bearer " + token
            }),
            body: JSON.stringify({
                "filterCondition": {"floor": "", "category": "", "status": ""},
                "type": "day",
                "datetime": {
                    "start": new Date(datetime.start+"/").getTime() / 1000,
                    "end": new Date(datetime.end+"/23:59:59").getTime() / 1000
                }
            })
        })
    }

    async function handleForm(event) {
        setDownContainer(false)
        setIsLoading(true)
        event.preventDefault()
        if(search==="fast"){
            function toYearMonth(date, i){
                const endDate = new Date(date.getFullYear(), date.getMonth()-i)
                return endDate.getFullYear().toString()+"/"+ (endDate.getMonth()+1).toString().padStart(2, "0")
            }
            function toYear(date, i){
                return (date.getFullYear()-i).toString()
            }
            const preData = {}
            const saveData = []
            let fastDate
            let value = alarmSearchFastData[fastSelect.current].value
            if(value==="now"){
                fastDate = new Date()
            }else{
                fastDate=value
            }
            if (alarmSearchFastData[fastSelect.current].type === "year") {
                for(let i=1; i>=0; i--){
                    let title = toYear(fastDate, i)
                    let start = new Date(title).getTime()/1000
                    let end
                    if(i===0 && value==="now"){
                        end = new Date().getTime()/1000
                    }else{
                        end = new Date(parseInt(title)+1, 0, 0, 23,
                            59, 59).getTime()/1000
                    }
                    // console.log("title: ", title)
                    // console.log("type(title): ", typeof(title))
                    preData[title]= []
                    saveData.push({
                        "title": title,
                        "timestamp": {
                            "start": start,
                            "end": end,
                        },
                        "data":[]
                    })
                }
                AlarmStatisticDispatch({
                    type: "CHANGE_PAGE_MAX",
                    payload: {value: 2}
                })
            } else if (alarmSearchFastData[fastSelect.current].type === "month") {
                for(let i=5; i>=0; i--){
                    let title = toYearMonth(fastDate, i)
                    let start = new Date(title).getTime()/1000
                    let end
                    if(i===0 && value==="now"){
                        end = new Date().getTime()/1000
                    }else{
                        end = new Date(parseInt(title.slice(0, 4)), parseInt(title.slice(5)),
                            0, 23, 59, 59).getTime()/1000
                    }
                    preData[title] = []
                    saveData.push({
                        "title": title,
                        "timestamp": {
                            "start": start,
                            "end": end,
                        },
                        "data": []
                    })
                }
                AlarmStatisticDispatch({
                    type: "CHANGE_PAGE_MAX",
                    payload: {value: 6}
                })
            }
            try{
                // let response = await fetchFastData(alarmSearchFastData[fastSelect.current].type, alarmSearchFastData[fastSelect.current].value)
                let response = await fetchFastData(
                    alarmSearchFastData[fastSelect.current].startValue, alarmSearchFastData[fastSelect.current].value)
                let data = await response.json()
                // console.log(data)
                if(alarmSearchFastData[fastSelect.current].type === "year"){
                    for(let datum of data){
                        preData[toYear(new Date(datum.time*1000), 0)].push(datum)
                    }
                }else if(alarmSearchFastData[fastSelect.current].type === "month"){
                    for(let datum of data){
                        preData[toYearMonth(new Date(datum.time*1000), 0)].push(datum)
                    }
                }
                for (let saveDatum of saveData){
                    saveDatum.data = preData[saveDatum.title]
                }
                setEventData(saveData)
                setDownContainer(true)
            }catch (err){
                console.log(err)
            }
        }else if(search==="self"){
            setSelfSelect2({start: selfSelect.current.start, end: selfSelect.current.end})
            try{
                const response = await fetchSelfData(selfSelect.current)
                const data = await response.json()
                // console.log(data)
                setEventData(data)
                setDownContainer(true)

            }catch (err){
                console.log(err)
            }
        }
        setIsLoading(false)
    }
    return(
        <div className={"reportArticle"}>
            <div className={"scroll"}>
                <div className={"up"}>
                    <div className={"container"}>
                        <form action="" onSubmit={(event)=> (handleForm(event))}>
                            <ReportAlarmStatisticSearch search={search} setSearch={setSearch}
                                                        fastSelect={fastSelect} selfSelect={selfSelect}
                                                        setDownContainer={setDownContainer}/>
                            <div className={"div_button"}>
                                <button type="submit" className={"secondary_button submit"}><FormattedMessage id={"button.submit"}/></button>
                                <button type="reset" className={"secondary_button"}><FormattedMessage id={"button.reset"}/></button>
                            </div>
                        </form>
                    </div>
                </div>
                {isLoading &&
                    <div className={"loadingContainer"}>
                        <div className="loader loader-1">
                            <div className="loader-outter"/>
                            <div className="loader-inner"/>
                        </div>
                    </div>
                }
                {downContainer && search==="fast" && <DownContainerFast fastData={alarmSearchFastData[fastSelect.current]}
                                                                        eventData={eventData}
                                                                        AlarmStatisticVariables={AlarmStatisticVariables}
                                                                        AlarmStatisticDispatch={AlarmStatisticDispatch}
                />}
                {downContainer && search==="self" && <DownContainerSelf eventData={eventData} selfSelect={selfSelect2}/>}
            </div>
        </div>
    )
}

function ReportAlarmStatisticSearch(props) {
    const {fastClassName, selfClassName} = useFastSelfSearch(props.search)

    function handleChange(select) {
        props.setSearch(select)
        props.setDownContainer(false)
    }

    return (
        <div className={"reportSearch"}>
            <div className={"searchSelect"}>
                <div className={fastClassName} onClick={() => {
                    handleChange("fast")
                }}><FormattedMessage id={"report.fastSearch"}/></div>
                <div className={selfClassName} onClick={() => {
                    handleChange("self")
                }}><FormattedMessage id={"report.selfSearch"}/></div>
            </div>
            <div className={"searchContext"}>
                {props.search === "fast" ?
                    <SearchFast fastSelect={props.fastSelect} setDownContainer={props.setDownContainer}/>
                    : <SearchSelf selfSelect={props.selfSelect}/>}
                <div className={"text"}><FormattedMessage id={"report.alarm.note"}/></div>
            </div>
        </div>
    )
}

function SearchFast(props){
    return(
        <div className={"searchFast"}>
            {alarmSearchFastData.map((item, index) => (
                <SearchRadio index={index} key={index} fastSelect={props.fastSelect}
                             setDownContainer={props.setDownContainer}
                />
            ))}
        </div>
    )
}

function SearchRadio(props) {
    const lang = useLanguage()
    function handleFastSelect(event) {
        props.setDownContainer(false)
        props.fastSelect.current = event.target.value
    }

    return(
        <div className={"div_input"}>
            <input type="radio" name={"searchFast"} value={props.index} required={true} id={props.index}
                   onChange={(event) => {handleFastSelect(event)}}/>
            <label htmlFor={props.index}>{alarmSearchFastData[props.index].name[lang]}</label>
        </div>
    )
}

function SearchSelf(props) {
    const {firstMaxDate, lastMinDate, changeFirstDate, changeLastDate} = useDateTimeLimit()

    function handleStartDate(event) {
        changeFirstDate(event)
        props.selfSelect.current = {...props.selfSelect.current, start: event.target.value}
    }
    function handleEndDate(event){
        changeLastDate(event)
        props.selfSelect.current = {...props.selfSelect.current, end: event.target.value}
    }
    return(
        <div className={"searchSelf"}>
            <div className={"div_input"}>
                <input id="firstDate" name="firstDate" type="date" required={true}
                       onChange={(event) => {handleStartDate(event)}}
                       max={firstMaxDate}/>
                <span className={"to"}>~</span>
                <input id="lastDate" name="lastDate" type="date" required={true}
                       onChange={(event) => {handleEndDate(event)}}
                       min={lastMinDate}/>
            </div>
        </div>
    )
}

function DownContainerFast(props) {
    const allData = {}
    allData.eventData = dealReportAlarmFastData(props.eventData, props.AlarmStatisticVariables)
    allData.labels = Array(0)
    allData.dealData = {}
    allData.statisticData = Array(0)
    allData.fastData = props.fastData
    switch (props.fastData.type2){
        case "daily":
            allData.eventData.type="day"
            let datetime = new Date(allData.eventData.title)
            let lastDate
            if(props.AlarmStatisticVariables.pagination.current === props.AlarmStatisticVariables.pagination.pageMax && props.fastData.isNew){
                lastDate = new Date().getDate()
            }else{
                lastDate = new Date(datetime.getFullYear(), datetime.getMonth()+1, 0).getDate()
            }
            allData.labels = Array.from(Array(lastDate).keys(), x=>(datetime.getMonth()+1).toString()+"/"+(x+1).toString())
            for(let label of allData.labels){
                allData.dealData[label.split('/')[1]] = Array(0)
            }
            for(let datum of allData.eventData.data){
                // allData.dealData[parseInt(datum.time.slice(8, 10))].push(datum)
                allData.dealData[new Date(datum.time*1000).getDate()].push(datum)
            }
            for(let label of allData.labels){
                allData.statisticData.push(allData.dealData[label.split('/')[1]].length)
            }
            break;
        case "weekly":
            allData.eventData.type="week"
            function getWeekNumber(d) {
                d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
                d.setUTCDate(d.getUTCDate() + (yearStart.getUTCDay()));
                const weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
                return [d.getUTCFullYear(), weekNo];
            }
            let lastWeek
            if(props.AlarmStatisticVariables.pagination.current === props.AlarmStatisticVariables.pagination.pageMax){
                lastWeek = getWeekNumber(new Date())[1]
            }else{
                lastWeek = getWeekNumber(new Date(parseInt(allData.eventData.title)+1, 0, 0))[1]
            }
            allData.labels = Array.from(Array(lastWeek).keys(), x=>([("W"+(x+1).toString().padStart(2, "0")), allData.eventData.title]))
            for(let i=1; i<=lastWeek; i++){
                allData.dealData[i] = Array(0)
            }
            for(let datum of allData.eventData.data){
                // allData.dealData[getWeekNumber(new Date(datum.time.slice(0, 10)))[1]].push(datum)
                allData.dealData[getWeekNumber(new Date(datum.time*1000))[1]].push(datum)
            }
            for(let i=1; i<=lastWeek; i++){
                allData.statisticData.push(allData.dealData[i].length)
            }
            break;
        case "monthly":
            allData.eventData.type="month"
            let lastMonth
            if(props.AlarmStatisticVariables.pagination.current === props.AlarmStatisticVariables.pagination.pageMax){
                lastMonth = new Date().getMonth()+1
            }else{
                lastMonth = 12
            }
            allData.labels = Array.from(Array(lastMonth).keys(), x=>(MonthSearchData[x][0]))
            for(let i=1; i<=lastMonth; i++){
                allData.dealData[i] = Array(0)
            }
            for(let datum of allData.eventData.data){
                // allData.dealData[new Date(datum.time.slice(0, 7)).getMonth()+1].push(datum)
                allData.dealData[new Date(datum.time*1000).getMonth()+1].push(datum)
            }
            for(let i=1; i<=lastMonth; i++){
                allData.statisticData.push(allData.dealData[i].length)
            }
            break;
        default:
            return null
    }
    return(
        <div className={"downContainer"}>
            <FilterCondition AlarmStatisticDispatch={props.AlarmStatisticDispatch} AlarmStatisticVariables={props.AlarmStatisticVariables}/>
            <DownContainerTitle
                AlarmStatisticVariables={props.AlarmStatisticVariables}
                AlarmStatisticDispatch={props.AlarmStatisticDispatch} allData={allData}/>
            <DownContainerChart allData={allData}/>
            <DownContainerTable allData={allData} AlarmStatisticVariables={props.AlarmStatisticVariables}/>
        </div>
    )
}

function FilterCondition(props) {
    let style = null
    if(props.AlarmStatisticVariables.filterCondition.floor==="" && props.AlarmStatisticVariables.filterCondition.category==="" &&
    props.AlarmStatisticVariables.filterCondition.status===""){
        style = {"display": "none"}
    }

    function handleFilter(event, filter){
        props.AlarmStatisticDispatch({
            type: "CHANGE_FILTER_CONDITION(NO_CHANGE_PAGE)",
            payload: {
                filter: filter,
                value: event.target.value
            }
        })
    }

    function handleReset() {
        props.AlarmStatisticDispatch({
            type: "RESET_FILTER"
        })
    }

    return(
        <div className={"filterConditionContainer"}>
            <div className={"resetContainer"} style={style}>
                <div className={"resetButton"} onClick={handleReset}>
                    <FormattedMessage id={"button.reset"}/>
                    <svg width="0.875rem" height="0.875rem" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5409 2.24576C2.67705 0.910792 4.34576 0.0515839 6.22751 0.00187766C9.69275 -0.0833331 12.6822 2.74282 12.7816 6.20806C12.8261 7.82532 12.2706 9.31179 11.3213 10.4607L13.8218 12.9611C14.0594 13.1988 14.0594 13.5841 13.8218 13.8218C13.5841 14.0594 13.1988 14.0594 12.9611 13.8218L10.4607 11.3213C9.35544 12.2347 7.93762 12.7835 6.39083 12.7835C3.40844 12.7835 0.908923 10.7384 0.205933 7.97618C0.092318 7.53593 0.440263 7.10277 0.901822 7.10277C1.21426 7.10277 1.4983 7.3158 1.58351 7.61404C2.20129 10.0425 4.6014 11.761 7.29974 11.2781C9.2667 10.9302 10.8786 9.36086 11.2621 7.39391C11.8869 4.21981 9.45842 1.42206 6.39083 1.42206C4.84283 1.42206 3.46525 2.14635 2.54923 3.26119L3.64987 4.36893C3.8771 4.58906 3.72088 4.9725 3.40134 4.9725H0.355052C0.156226 4.9725 6.12809e-06 4.81628 6.12809e-06 4.61746V1.57118C-0.000405628 1.50108 0.019941 1.43243 0.058482 1.37388C0.0970229 1.31533 0.152033 1.2695 0.21658 1.24216C0.281127 1.21482 0.352322 1.2072 0.421192 1.22026C0.490062 1.23332 0.553525 1.26647 0.603584 1.31554L1.5409 2.24576Z" fill="#8FCDCC"/>
                        <path d="M6.39083 4.9725C7.17193 4.9725 7.81101 5.61159 7.81101 6.39268C7.81101 7.17378 7.17193 7.81286 6.39083 7.81286C5.60973 7.81286 4.97064 7.17378 4.97064 6.39268C4.97064 5.61159 5.60973 4.9725 6.39083 4.9725Z" fill="#8FCDCC"/>
                    </svg>
                </div>
            </div>
            <div className={"filterCondition"}>
                <FilterElement filter={allConditionData.building} handleFilter={handleFilter}/>
                <FilterElement filter={allConditionData.floor} handleFilter={handleFilter} value={props.AlarmStatisticVariables.filterCondition.floor}/>
                <FilterElement filter={allConditionData.category} handleFilter={handleFilter} value={props.AlarmStatisticVariables.filterCondition.category}/>
                <FilterElement filter={allConditionData.status} handleFilter={handleFilter} value={props.AlarmStatisticVariables.filterCondition.status}/>
            </div>
        </div>
    )
}

function DownContainerTitle(props) {
    const token = useToken()
    const lang = useLanguage()
    const reportAlarmDownload = reportAlarmGenerator(token, lang,
        props.allData.eventData.type, props.AlarmStatisticVariables.filterCondition,
        props.allData.eventData.timestamp)
    let classNameArrowLeft = "pageChangeButton active"
    if(props.AlarmStatisticVariables.pagination.current===1){
        classNameArrowLeft = "pageChangeButton"
    }
    let classNameArrowRight = "pageChangeButton active"
    if(props.AlarmStatisticVariables.pagination.current===props.AlarmStatisticVariables.pagination.pageMax){
        classNameArrowRight  = "pageChangeButton"
    }
    function pagePre() {
        if(props.AlarmStatisticVariables.pagination.current !== 1){
            props.AlarmStatisticDispatch({
                type: "TO_PREVIOUS_PAGE"
            })
        }
    }

    function pageNext() {
        if(props.AlarmStatisticVariables.pagination.current!==props.AlarmStatisticVariables.pagination.pageMax){
            props.AlarmStatisticDispatch({
                type: "TO_NEXT_PAGE"
            })
        }
    }

    return(
        <div className={"title"}>
            <div className={"item1"}/>
            <div className={"item2"}>
                <div className={classNameArrowLeft} onClick={pagePre}>
                    <div className={"arrowLeft"}/>
                </div>
                <div className={"text"}>
                    {props.allData.eventData.title} - <FormattedMessage id={"report.alarm.title"}/>{props.allData.fastData.title[lang]}
                </div>
                <div className={classNameArrowRight} onClick={pageNext}>
                    <div className={"arrowRight"}/>
                </div>
            </div>
            <PrintDownload download={reportAlarmDownload} fileName={"alarm_report"}/>
        </div>
    )
}

function DownContainerChart(props) {
    const {lineBorder, lineRadius, size} = useChartSize()
    const options = {
        plugins: {
                legend: false,
                tooltip: true
        },
        scales: {
            x: {
                offset: true,
                grid: {
                    borderWidth: 3,
                    borderColor: "#84E2F7",
                    display: false
                },
                ticks:{
                    font:{
                        size: size,
                    },
                    color: "#84E2F7"
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    borderWidth: 3,
                    borderColor: "#84E2F7",
                    display: true,
                    color: "rgba(143, 205, 204, 0.15",
                    drawTicks: false
                },
                ticks: {
                    font:{
                        size: size,
                    },
                    crossAlign: "center",
                    color: "#84E2F7",
                    padding: 14
                }
            }
        }
    }
    const data = {
        labels: props.allData.labels,
        datasets: [
        {
            label: "Alarm Statistic: ",
            fill: false,
            lineTension: 0,
            pointStyle: "rect",
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "#84E2F7",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "rgba(132, 226, 247, 0.2)",
            pointBackgroundColor: "#84E2F7",
            pointBorderWidth: 0,
            pointHoverRadius: lineRadius,
            pointHoverBackgroundColor: "#84E2F7",
            pointHoverBorderColor: "rgba(132, 226, 247, 0.2)",
            pointHoverBorderWidth: lineBorder,
            pointRadius: lineRadius,
            pointHitRadius: lineRadius,
            data: props.allData.statisticData
        }
        ]
    };
    return(
        <div className={"chart"}>
            <Line data={data} width={100} height={40} options={options} type={"Line"}/>
        </div>
    )
}

function DownContainerTable(props) {
    const lang = useLanguage()
    return (
        <div className={"downContainerTable"}>
            <div
                className={"countTotal"}>{props.allData.eventData.title}, {props.allData.fastData.text[lang]}<FormattedMessage
                id={"report.alarm.match1"}/>{props.allData.eventData.data.length}<FormattedMessage
                id={"report.alarm.match2"}/></div>
            <div className={"statisticContainer"}>
                <StatisticTable allData={props.allData}
                                label={props.allData.labels.slice(0, props.allData.fastData.slice)}
                                statiticArray={props.allData.statisticData.slice(0, props.allData.fastData.slice)}
                                start={0}
                                AlarmStatisticVariables={props.AlarmStatisticVariables}/>
                {props.allData.labels[props.allData.fastData.slice] &&
                <StatisticTable allData={props.allData}
                                label={props.allData.labels.slice(props.allData.fastData.slice)}
                                statiticArray={props.allData.statisticData.slice(props.allData.fastData.slice)}
                                start={props.allData.fastData.slice}
                                AlarmStatisticVariables={props.AlarmStatisticVariables}
                />}
            </div>
        </div>
    )
}

function StatisticTable(props) {
    const lang = useLanguage()
    const [showModel, setShowModel] = useState(false)
    const [index, setIndex] = useState(null)
    function closeModel(){
        setShowModel(false)
    }
    function openModel(index) {
        setIndex(index)
        setShowModel(true)
    }
    const model = (showModel && (
        <EventList data={props.allData.dealData[index]} onCloseModel={closeModel}
                   title={props.allData.fastData.title[lang]} allData={props.allData}
                   label={props.allData.labels[index-1]}
                   index={index-1}
                   type={props.allData.eventData.type}
                   filterCondition={props.AlarmStatisticVariables.filterCondition}/>))
    return(
        <div className={"statisticTable"}>
            {model}
            <div className={"title dataTitle"}>
                <div className={"titleText1"}><FormattedMessage id={"report.alarm.time"}/></div>
                <div className={"titleText2"}><FormattedMessage id={"report.alarm.counts"}/></div>
            </div>
            <div className={"div_table"}>
                <table>
                    <tbody>
                    {props.statiticArray.map((item, index) => (
                        <tr onClick={() => {openModel((index+props.start+1).toString())}} key={index}>
                            <td className={"td1"}>
                                {props.allData.fastData.type2==="daily" &&
                                `${props.allData.eventData.title.slice(0, 4)}-${props.allData.eventData.title.slice(5)}-${props.label[index].split('/')[1].padStart(2, "0")}`}
                                {props.allData.fastData.type2==="weekly" &&
                                `${props.label[index][0]}-${props.label[index][1]}`}
                                {props.allData.fastData.type2==="monthly" &&
                                `${MonthSearchData[index+props.start][1]}-${props.allData.eventData.title.slice(0, 4)}`}
                                {(props.allData.eventData.data.length !== 0) &&
                                ("("+(Math.round(item/props.allData.eventData.data.length*10000)/100)+"%)")}
                            </td>
                            <td className={"td2"}>{item} <FormattedMessage id={"report.alarm.times"}/></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function EventList(props) {
    // console.log(props.allData)

    const token = useToken()
    const lang = useLanguage()
    const container = useModel()
    const datetime = () => {
        switch (props.type) {
            case "day":
                const date = `${props.allData.eventData.title.slice(0, 4)}/${props.allData.eventData.title.slice(5)}/${props.label.split('/')[1].padStart(2, "0")}`
                return{
                    "start": new Date(date).getTime()/1000,
                    "end": new Date(date).getTime()/1000+86399
                }
            case "week":
                const yearStartDate = new Date(props.label[1]+"/")
                const plusDate = ((7-yearStartDate.getDay())%7)
                const weekNumber = parseInt(props.label[0].slice(1))
                const endDateTimestamp = yearStartDate.getTime()/1000 + ((weekNumber-1)*7+plusDate)*86400 + 86399
                const startDateTimestamp = weekNumber===1? yearStartDate.getTime()/1000:
                    endDateTimestamp - 86400*7 +1
                return{
                    "start": startDateTimestamp,
                    "end": endDateTimestamp
                }
            case "month":
                const year = parseInt(props.allData.eventData.title)
                const month = parseInt(props.index)
                const startDate = new Date(year, month, 1)
                const endDate = new Date(year, month+1, 0)
                return{
                    "start": startDate.getTime()/1000,
                    "end": endDate.getTime()/1000
                }
            case "selfDay":
                return {
                    "start": new Date(props.datetime+"/").getTime()/1000,
                    "end": new Date(props.datetime+"/").getTime()/1000 + 86399
                }
            default:
                return{}
        }
    }
    // datetime()
    const alarmHistoryDownload = alarmHistoryGenerator(token, lang, props.type,
        props.filterCondition, datetime())
    return (
        ReactDOM.createPortal(
            <div className={"model2"}>
                <div className={"eventListContainer"}>
                    <div className={"close"} onClick={props.onCloseModel}>
                        <svg width="2.125rem" height="2.125rem" viewBox="0 0 34 34" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19.3568 17.0007L24.0718 12.2873C24.2267 12.1325 24.3495 11.9486 24.4333 11.7463C24.5171 11.544 24.5603 11.3271 24.5603 11.1082C24.5603 10.8892 24.5171 10.6723 24.4333 10.47C24.3495 10.2677 24.2267 10.0838 24.0718 9.92898C23.917 9.77413 23.7331 9.6513 23.5308 9.5675C23.3285 9.48369 23.1117 9.44056 22.8927 9.44056C22.6737 9.44056 22.4568 9.48369 22.2545 9.5675C22.0522 9.6513 21.8683 9.77413 21.7135 9.92898L17.0002 14.644L12.2868 9.92898C11.9741 9.61625 11.5499 9.44056 11.1077 9.44056C10.6654 9.44056 10.2412 9.61625 9.9285 9.92898C9.61576 10.2417 9.44007 10.6659 9.44007 11.1082C9.44007 11.3271 9.4832 11.544 9.56701 11.7463C9.65081 11.9486 9.77365 12.1325 9.9285 12.2873L14.6435 17.0007L9.9285 21.714C9.61576 22.0267 9.44007 22.4509 9.44007 22.8932C9.44007 23.3354 9.61576 23.7596 9.9285 24.0723C10.2412 24.3851 10.6654 24.5607 11.1077 24.5607C11.5499 24.5607 11.9741 24.3851 12.2868 24.0723L17.0002 19.3573L21.7135 24.0723C22.0262 24.3851 22.4504 24.5607 22.8927 24.5607C23.3349 24.5607 23.7591 24.3851 24.0718 24.0723C24.3846 23.7596 24.5603 23.3354 24.5603 22.8932C24.5603 22.4509 24.3846 22.0267 24.0718 21.714L19.3568 17.0007ZM17.0002 33.6673C7.79516 33.6673 0.333496 26.2057 0.333496 17.0007C0.333496 7.79565 7.79516 0.333984 17.0002 0.333984C26.2052 0.333984 33.6668 7.79565 33.6668 17.0007C33.6668 26.2057 26.2052 33.6673 17.0002 33.6673Z"
                                fill="#8FCDCC"/>
                        </svg>
                    </div>
                    <div className={"eventList"}>
                        <div className={"title"}>
                            <div className={"titleText"}><FormattedMessage
                                id={"report.alarm.total"}/> {props.data.length} <FormattedMessage
                                id={"report.alarm.total2"}/></div>
                            <div className={"titleText2"}>{props.title}</div>
                            <PrintDownload download={alarmHistoryDownload} fileName={"alarm_history_list"}/>
                        </div>
                        <ShowEvent filterData={props.data}/>
                    </div>
                </div>
            </div>,
            container
        )
    )
}

function ShowEvent(props) {
    const [variables, dispatch] = useReducer(pageReducer, PAGE_ALARM_INITIAL_STATE)
    const dealData = eventSort(props.filterData, variables.sortCondition)
    return(
        <div className={"showEventContainer"}>
            <ShowEventTitle variables={variables} dispatch={dispatch}/>
            <ShowEventTable dealData={dealData}/>
        </div>
    )
}

function ShowEventTitle(props) {
    return(
        <div className={"title"}>
            <Sort data={sortConditionData["time"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["floor"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["message"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["status"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
        </div>
    )
}

function  DownContainerSelf(props) {
    const token = useToken()
    const lang = useLanguage()
    const [alarmVariables, alarmDispatch] = useReducer(pageReducer, PAGE_ALARM_INITIAL_STATE)
    const {data} = useMemo(() => (
            dealReportAlarmSelfData(props.eventData, alarmVariables, props.selfSelect)),
        [props.eventData, alarmVariables, props.selfSelect])
    const timestamp = {
        "start": new Date(props.selfSelect.start + "/").getTime() / 1000,
        "end": new Date(props.selfSelect.end + "/").getTime() / 1000 + 86399
    }
    const reportAlarmDownload = reportAlarmGenerator(token, lang, "day",
        alarmVariables.filterCondition, timestamp
    )

    return (
        <div className={"downContainerSelf"}>
            <FilterCondition AlarmStatisticVariables={alarmVariables}
                             AlarmStatisticDispatch={alarmDispatch}
            />
            <div className={"selfTitle"}>
                <div className={"selfText"}>
                    <div className={"textContainer"}>
                        <div className={"textContainer2"}>
                            <div><FormattedMessage id={"report.alarm.title2"}/></div>
                            <div><FormattedMessage id={"report.alarm.from"}/> {props.selfSelect.start} <FormattedMessage
                                id={"report.alarm.to"}/> {props.selfSelect.end}</div>
                            <div className={"textCountAndPage"}>
                                <div>
                                    <FormattedMessage
                                        id={"report.alarm.match1"}/>{data.metadata.totalEvents}<FormattedMessage
                                    id={"report.alarm.match2"}/>
                                </div>
                            </div>

                        </div>
                        <PageControl dispatch={alarmDispatch} variables={alarmVariables} data={data}/>
                    </div>
                </div>
                <PrintDownload download={reportAlarmDownload} fileName={"alarm_report"}/>
            </div>
            <div className={"chartAndTable"}>
                <SelfTable data={data} alarmVariables={alarmVariables} metadata={data.metadata}/>
                <SelfChart statisticData={data.metadata.statisticData} labels={data.metadata.labels}/>
            </div>
        </div>
    )
}

function SelfTable(props) {
    console.log("data: ", props.data)
    const lang = useLanguage()
    const [showModel, setShowModel] = useState(false)
    const [detailData, setDetailData] = useState(null)
    const indexRef = useRef()

    function closeModel() {
        setShowModel(false)
    }

    function openModel(data, index) {
        setDetailData(data)
        setShowModel(true)
        indexRef.current = index
    }

    const model = (showModel && (
        <EventList data={detailData} onCloseModel={closeModel}
                   title={{"CN": "日报表", "EN": "Daily Report"}[lang]}
                   type={"selfDay"}
                   filterCondition={props.alarmVariables.filterCondition}
                   datetime={props.data.showData[indexRef.current].datetime}
        />))
    return (
        <div className={"statisticTable"}>
            {model}
            <div className={"title"}>
                <div className={"titleText1"}><FormattedMessage id={"report.alarm.time"}/></div>
                <div className={"titleText2"}><FormattedMessage id={"report.alarm.counts"}/></div>
            </div>
            <div className={"div_table"}>
                <table>
                    <tbody>
                    {props.data.showData.map((item, index) => (
                        <tr onClick={() => {
                            openModel(item.data, index)
                        }} key={index}>
                            <td className={"td1"}>
                                {item.datetime} {props.metadata.totalEvents!==0 && "(" + (Math.round((item.data.length / props.metadata.totalEvents) * 10000) / 100) + ")"}
                                {props.total!==0 && "%"}
                            </td>
                            <td className={"td2"}>{item.data.length} <FormattedMessage id={"report.alarm.times"}/></td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function SelfChart(props) {
    const {border, size, labelWidth} = useChartSize()
    const [chartHoverData, setChartHoverData] = useState({
        "isOpen": false,
        "index": null
    })

    const countData = useMemo(() => {
        let result = []
        for (let i of props.labels) {
            result.push(props.statisticData[i])
        }
        return {
            "chart": result,
            "sum": result.reduce((a, b) => a + b, 0),
            "backgroundColor": doughnutBackgroundColor,
        }
    }, [props.labels, props.statisticData])

    const data = useMemo(() => ({
        maintainAspectRatio: false,
        responsive: false,
        labels: props.labels,
        datasets: [
            {
                data: countData.chart,
                backgroundColor: countData.backgroundColor,
            }
        ]
    }), [props.labels, countData])
    const options = useMemo(() => ({
        // events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        elements: {
            arc: {
                borderWidth: border,
                borderColor: "#00262f",
            }
        },
        onHover: function (evt, element) {
            if (element.length !== 0) {
                const index = element["0"].index
                setChartHoverData({"isOpen": true, "index": index})
            } else {
                setChartHoverData({"isOpen": false, "index": null})
            }
        },
        plugins: {
            tooltip: {
                // Tooltip will only receive click events
                // events: ["click"]
            },
            legend: {
                display: true,
                position: "top",
                labels: {
                    boxWidth: labelWidth,
                    color: "#8FCDCC",
                    font: {
                        size: size,
                        family: "Noto Sans SC",

                    }
                }
            }
        }
    }), [border, labelWidth, size])
    const chart = useMemo(() => {
        return <Doughnut data={data} options={options} type={"Doughnut"}/>
    }, [data, options])

    return (
        <div className={"right"}>
            <div className={"chart"}>
                {props.labels.length !== 0 &&
                <div className={"text"}><FormattedMessage id={"report.alarm.messages"}/></div>
                }
                {chart}
            </div>
            {chartHoverData.isOpen &&
            <div className={"chartData"}>
                <div className={"color"} style={{backgroundColor: countData.backgroundColor[chartHoverData.index]}}/>
                <div className={"text"}>
                    {props.labels[chartHoverData.index]},&nbsp;<span
                    className={"numberWord"}>{countData.chart[chartHoverData.index]}</span>
                    <FormattedMessage id={"report.alarm.times"}/>
                    &nbsp;<span className={"numberWord"}>
                    ({Math.round((countData.chart[chartHoverData.index] / countData.sum) * 10000) / 100})%</span>
                </div>
            </div>
            }
        </div>
    )
}

export {ReportAlarmStatisticArticle}
