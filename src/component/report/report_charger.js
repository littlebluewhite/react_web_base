import {FormattedMessage} from "react-intl";
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from "react";
import "../../SCSS/report/report_charger.css"
import {FilterElement, PageControl, PrintDownload, Sort} from "../common";
import {allConditionData} from "../../data/allConditionData";
import {
    placeholder,
    useChartSize,
    useLanguage,
    useToken
} from "../../function/usePackage";
import {Chart} from "react-chartjs-2";
import ReactDOM from "react-dom";
import {sortConditionData} from "../../data/sortConditionData";
import {
    PAGE_REPORT_CHARGER_INITIAL_STATE,
    PAGE_REPORT_CHARGER_USAGE_INITIAL_STATE,
    pageReducer
} from "../../reducer/pageReducer";
import {
    chargerBarChartOptions,
    gradientColor,
    gradientColorOther,
    gradientHoverColor, gradientHoverColorOther,
    monthMapping
} from "../../data/chargerChart";
import {SERVER} from "../../setting";
import {reportChargerInformationGenerator, reportChargerUsageGenerator} from "../../function/download";
import {dealChargerInformation, dealChargerUsage} from "../../function/dealDataFunction";

function ReportChargerArticle() {
    const token = useToken()
    const [isLoading, setIsLoading] = useState(false)
    const [select, setSelect] = useState("day")
    const [charger, setCharger] = useState("all")
    const initialDate = {
        "cost": {
            "startDay": "",
            "endDay": ""
        },
        "information": {
            "startDay": "",
            "endDay": ""
        },
        "usage": {
            "startDay": "",
            "endDay": ""
        },
        "costChartDate": ""
    }
    const [date, setDate] = useState(initialDate)

    const [data, setData] = useState(null)
    const refMetadata = useRef({
    })

    async function handleForm(event) {
        // console.log(date)
        event.preventDefault()
        setData(null)
        setIsLoading(true)
        refMetadata.current = {
            "charger": charger,
            "select": select,
            "costChartDate": date.costChartDate.split("-").join("/"),
            "date": {
                "startDay": date.information.startDay,
                "endDay": date.information.endDay
            },
            "costDate": {
                "startDay": date.cost.startDay,
                "endDay": date.cost.endDay
            },
        }
        let dealData
        try{
            if(select==="usage") {
                refMetadata.current = {
                    ...refMetadata.current,
                    "date": {
                        "startDay": date.usage.startDay,
                        "endDay": date.usage.endDay
                    }
                }
                const periodDay = (new Date(date.usage.endDay)-new Date(date.usage.startDay))/1000/24/60/60
                const startDate = new Date(date.usage.startDay)
                const rawDate = {}
                for (let i=0; i<=periodDay; i++){
                    let newDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+i)
                    let key = `${newDate.getFullYear()}-${(newDate.getMonth()+1).toString().padStart(2, "0")}-${newDate.getDate().toString().padStart(2, "0")}`
                    rawDate[key] = 0
                }
                // API usage
                const response = await fetch(SERVER + "/api/IBMS/Web/V1/charger/usage/" + charger, {
                    method: "POST",
                    headers: new Headers({
                        Authorization: "Bearer " + token
                    }),
                    body: JSON.stringify({
                            "startDay": date.usage.startDay,
                            "endDay": date.usage.endDay
                    })
                })
                const fetchData = await response.json()
                for(let datum of Object.values(fetchData)[0]){
                    rawDate[datum.date] = datum.usage
                }
                dealData = {[charger]: []}
                for(let datum in rawDate){
                    dealData[charger].push({
                        "date": datum,
                        "usage": rawDate[datum]
                    })
                }
            }else{
                // API day month
                const response = await fetch(SERVER + "/api/IBMS/Web/V1/charger/information/" + charger, {
                    method: "POST",
                    headers: new Headers({
                        Authorization: "Bearer " + token
                    }),
                    body: JSON.stringify({
                        "costData": {
                            "type": select,
                            "startDay": date.cost.startDay,
                            "endDay": date.cost.endDay
                        },
                        "information": {
                            "startDay": date.information.startDay,
                            "endDay": date.information.endDay
                        }
                    })
                })
                const fetchData = await response.json()
                // console.log(fetchData)
                let cardIdList = []
                for(let datum of fetchData.information){
                    cardIdList.push(datum.cardId)
                }
                cardIdList = Array.from(new Set(cardIdList))
                allConditionData.cardId.index = {"": 0}
                allConditionData.cardId.data = [{"name": {"CN":"全部","EN":"All"}, "value": ""}]
                for(let card in cardIdList){
                    allConditionData.cardId.index[cardIdList[card]] = parseInt(card)+1
                    allConditionData.cardId.data.push({
                        "name": {"CN": cardIdList[card], "EN": cardIdList[card]},
                        "value": cardIdList[card]
                    })
                }
                dealData = {...fetchData,
                    "costData": {
                    "labels": Object.keys(fetchData.costData),
                        "data": Object.values(fetchData.costData)
                    },
                }
            }
            setData(dealData)
            setIsLoading(false)
        }catch (e) {
            setIsLoading(false)
            console.log(e)
        }
    }

    const chargerDown = useMemo(()=>{
        if(data){
            return <DownChargerContainer data={data} metadata={refMetadata.current}/>
        }else{
            return null
        }
    },[data])

    return (
        <div className={"reportArticle"}>
            <div className={"scroll"}>
                <div className={"up"}>
                    <div className={"container"}>
                        <form onSubmit={(event)=>(handleForm(event))}>
                            <ReportChargerSearch select={select} setSelect={setSelect} date={date}
                                                 setDate={setDate} charger={charger}
                                                 setCharger={setCharger}
                            />
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
                {chargerDown}
            </div>
        </div>
    )
}

function ReportChargerSearch(props) {
    const {setDate} = {...props}
    const itemClass = useCallback((select) => {
        if (select === props.select) {
            return "item active"
        } else {
            return "item"
        }
    }, [props.select])

    const changeSelect = useCallback((select, setSelect, setDate) => {
        setSelect(select)
        setDate({
            "cost": {
                "startDay": "",
                "endDay": ""
            },
            "information": {
                "startDay": "",
                "endDay": ""
            },
            "usage": {
                "startDay": "",
                "endDay": ""
            },
            "costChartDate":""
        })
    }, [])
    const handleFilter = (event)=>{
        props.setCharger(event.target.value)
    }
    const context3 = ()=>{
        if(props.select==="day"){
            return <Context3Day date={props.date} setDate={props.setDate}/>
        }else if(props.select==="month"){
            return <Context3Month date={props.date} setDate={props.setDate}/>
        }else if(props.select==="usage"){
            return <Context3Usage date={props.date} setDate={props.setDate} setCharger={props.setCharger}/>
        }
    }
    return (
        <div className={"reportSearch"}>
            <div className={"searchSelect"}>
                <div className={itemClass("day")} onClick={() => {
                    changeSelect("day", props.setSelect, setDate)
                }}>
                    <FormattedMessage id={"report.charger.byDay"}/>
                </div>
                <div className={itemClass("month")} onClick={() => {
                    changeSelect("month", props.setSelect, setDate)
                }}>
                    <FormattedMessage id={"report.charger.byMonth"}/>
                </div>
                <div className={itemClass("usage") + " borderN"} onClick={() => {
                    changeSelect("usage", props.setSelect, setDate)
                }}>
                    <FormattedMessage id={"report.charger.use"}/>
                </div>
            </div>
            <div className={"searchContext2"}>
                <div className={"filterContainer"}>
                    <FilterElement filter={allConditionData.chargingStation}/>
                    <FilterElement filter={allConditionData.charger} value={props.charger}
                                   handleFilter={handleFilter} slice={props.select==="usage"? 1: null}/>
                </div>
                <div className={"context2"}>
                    <svg width="1.4375rem" height="5.75rem" viewBox="0 0 23 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L22 46L1 91" stroke="#8FCDCC" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className={"context3"}>
                    {context3()}
                </div>
            </div>
        </div>
    )
}

function Context3Day(props) {
    const [value, setValue] = useState("")
    const handleChange = useCallback((event, setDate)=>{
        const value = event.target.value
        setValue(value)
        const date = new Date(value)
        setDate({
            "cost": {
                "startDay": value.slice(0, 8) + "01",
                "endDay": value.slice(0, 8) + new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
            },
            "information": {
                "startDay": value,
                "endDay": value
            },
            "usage": {
                "startDay": "",
                "endDay": ""
            },
            "costChartDate": value
        })
    },[])
    return (
        <>
            <div className={"dateContainer"}>
                <input type="date" required={true}
                       onChange={event=>handleChange(event, props.setDate)}
                       value={value}/>
            </div>
        </>
    )
}

function Context3Month(props) {
    const [value, setValue] = useState("")

    function handleChange(event, setDate) {
        const value = event.target.value
        setValue(value)
        const date = new Date(value)
        setDate({
            "cost": {
                "startDay": value.slice(0, 5) + "01-01",
                "endDay": value.slice(0, 5) + "12-31"
            },
            "information": {
                "startDay": value + "-01",
                "endDay": value + "-" + new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate().toString().padStart(2, "0")
            },
            "usage": {
                "startDay": "",
                "endDay": ""
            },
            "costChartDate": value
        })
    }

    return(
        <>
            <div className={"dateContainer"}>
                <input type="month" required={true}
                       onChange={event=>handleChange(event, props.setDate)}
                       value={value}
                />
            </div>
        </>
    )
}

function Context3Usage(props) {
    const lang = useLanguage()
    const {setCharger} = props
    const [value, setValue] = useState({
        "select": "fast",
        "range": {
            "startDay": "",
            "endDay": ""
        },
        "fast": "1",
    })

    function handleSelect(select) {
        setValue(pre=>({...pre, "select": select}))
        if(select==="range"){
            props.setDate(pre=>({
                ...pre, "usage": {
                    "startDay": value.range.startDay, "endDay": value.range.endDay
                }
            }))
        }else if(select==="fast"){
            setFastData(value.fast, props.setDate)
        }
    }

    function handleRangeDate(event, type){
        setValue(pre=>({...pre, "range": {...pre.range, [type]: event.target.value}}))
        props.setDate(pre=>({
            ...pre,
            "usage": {
                ...pre.usage,
                [type]: event.target.value
            },
        }))
    }

    const setFastData = useCallback((value, setDate)=>{
        const now = new Date()
        const preDate = new Date(now.getFullYear(),
            now.getMonth()-parseInt(value), now.getDate())
        setDate(pre=>({
            ...pre,
            "usage": {
                    "startDay": `${preDate.getFullYear()}-${(preDate.getMonth() + 1).toString().padStart(2, "0")}-${preDate.getDate().toString().padStart(2, "0")}`,
                    "endDay": `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`
            }
        }))
    },[])

    function handleFast(event) {
        setValue(pre=>({...pre, "fast": event.target.value}))
        setFastData(event.target.value, props.setDate)
    }

    useEffect(()=>{
        setCharger("B1-1")
    },[setCharger])

    useEffect(()=>{
        setFastData("1", props.setDate)
    },[props.setDate, setFastData])

    return (
        <>
            <div className={"rangeContainer"} onClick={()=>handleSelect("range")}>
                <input type="radio" value={"range"} onChange={()=>handleSelect("range")}
                       checked={value.select==="range"}/>
                <input type="date" value={value.range.startDay}
                       disabled={value.select!=="range"}
                       required={true} max={value.range.endDay}
                       onChange={event=>handleRangeDate(event, "startDay")}/>
                <div className={"svgContainer"}>
                    <svg width="1.125rem" height="0.375rem" viewBox="0 0 18 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0 5.90055C0.693333 2.00721 2.57333 0.0605469 5.64 0.0605469C6.36 0.0605469 7 0.193879 7.56 0.460546C8.14667 0.700546 8.8 1.06055 9.52 1.54055C10.16 1.94055 10.68 2.23388 11.08 2.42055C11.5067 2.60721 11.9467 2.70055 12.4 2.70055C13.0933 2.70055 13.68 2.47388 14.16 2.02055C14.6667 1.54055 14.9733 0.900546 15.08 0.100546H17.8C17.1333 3.99388 15.24 5.94055 12.12 5.94055C11.4267 5.94055 10.8133 5.82055 10.28 5.58055C9.74667 5.34055 9.09333 4.98055 8.32 4.50055C7.68 4.10055 7.16 3.80721 6.76 3.62055C6.36 3.40721 5.90667 3.30055 5.4 3.30055C4.70667 3.30055 4.10667 3.54055 3.6 4.02055C3.09333 4.47388 2.78667 5.10054 2.68 5.90055H0Z"
                            fill="#8FCDCC"/>
                    </svg>

                </div>
                <input type="date" value={value.range.endDay}
                       disabled={value.select!=="range"}
                       required={true} min={value.range.startDay}
                       onChange={event=>handleRangeDate(event, "endDay")}/>
            </div>
            <div className={"fastContainer"} onClick={()=>handleSelect("fast")}>
                <input type="radio" value={"fast"} onChange={()=>handleSelect("fast")}
                       checked={value.select==="fast"}/>
                <select className={"selectFilter"} required={true}
                        disabled={value.select!=="fast"}
                        value={value.fast}
                        onChange={event=>handleFast(event)}>
                    <option value="1">
                        {{"EN": "last month","CN": "近一个月"}[lang]}
                    </option>
                    <option value="2">
                        {{"EN": "last two months","CN": "近两个月"}[lang]}
                    </option>
                    <option value="3">
                        {{"EN": "last three months","CN": "近三个月"}[lang]}
                    </option>
                </select>
            </div>
        </>
    )
}

function DownChargerContainer(props) {
    return (
        <div className={"downChargerContainer"}>
            {props.metadata.select==="usage"? <DownChargerUsage {...props}/>: <DownChargerCost {...props}/>}
        </div>
    )
}

function DownChargerCost(props) {
    const lang = useLanguage()
    const token = useToken()
    const [chargerVariables, chargerDispatch] = useReducer(pageReducer, PAGE_REPORT_CHARGER_INITIAL_STATE)
    const [informationData, totalCount] = dealChargerInformation(props.data.information, chargerVariables, lang)
    const reportChargerInformationDownload = reportChargerInformationGenerator(token,
        lang, chargerVariables.filterCondition, props.metadata)

    function handleSearch(event) {
        chargerDispatch({
            type: "CHANGE_KEYWORD",
            payload: {keyword: event.target.value}
        })
    }

    function handleFilter(event, filter){
        chargerDispatch({
            type: "CHANGE_FILTER_CONDITION(NO_CHANGE_PAGE)",
            payload: {
                filter: filter,
                value: event.target.value
            }
        })
    }

    return(
        <div className={"downCharger"}>
            <div className={"mainTitle"}>
                <div className={"block"}/>
                <div className={"title"}>
                    {{
                        "day": props.metadata.date.startDay,
                        "month": props.metadata.date.startDay.slice(0, 7)}[props.metadata.select]}
                    &nbsp; — &nbsp;
                    {allConditionData.charger.data[allConditionData.charger.index[props.metadata.charger]].name[lang]}
                    <FormattedMessage id={"report.charger"}/>
                    <FormattedMessage id={"report.charger.title"}/>
                    <FormattedMessage id={"report.charger."+props.metadata.select+".report"}/>
                </div>
                <PrintDownload download={reportChargerInformationDownload}
                               fileName={"charger_information"}
                />
            </div>
            <ChargerCostChart costData={props.data.costData} metadata={props.metadata}/>
            <div className={"chargerInformationContainer"}>
                <div className={"informationTitle"}>
                    {props.metadata.costChartDate}{", "}
                    {allConditionData.charger.data[allConditionData.charger.index[props.metadata.charger]].name[lang]}
                    <FormattedMessage id={"report.charger"}/>
                    <FormattedMessage id={"report.charger.title"}/>
                    {" $" + props.data.costData.data[props.data.costData.labels.indexOf(props.metadata.costChartDate)]}
                    <FormattedMessage id={"comma"}/>
                    <FormattedMessage id={"report.charger.match"}/>
                    {props.data.information.length}
                </div>
                <div className={"searchContainer"}>
                    <input className={"search"} type="text" placeholder={placeholder(lang)}
                           value={chargerVariables.search}
                           onChange={(event) => {handleSearch(event)}}
                    />
                    <FilterElement filter={allConditionData.cardId} handleFilter={handleFilter}
                                   value={chargerVariables.filterCondition.cardId}/>
                    <div className={"text"}>
                        <FormattedMessage id={"report.charger.selectId.text"}/>
                        ${Math.round(totalCount*1000)/1000}
                    </div>
                </div>
                <ChargerDataContainer informationData={informationData} chargerVariables={chargerVariables}
                                      chargerDispatch={chargerDispatch}
                />
            </div>
        </div>
    )
}

function ChargerDataContainer(props) {
    return (
        <div className={"chargerDataContainer"}>
            <div className={"sortTitle"}>
                <div className={"title2"}>
                    <Sort data={sortConditionData["chargerId"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["cardId"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["company"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["memberId"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["cardUser"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["carNumber"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["startTime"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["endTime"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["chargeTime"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["electricity"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["unitPrice"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                    <Sort data={sortConditionData["cost"]} sortCondition={props.chargerVariables.sortCondition} dispatch={props.chargerDispatch}/>
                </div>
            </div>
            <ShowChargerInformation dealData={props.informationData}/>
        </div>
    )
}

function ShowChargerInformation(props) {
    return(
        <div className={"showChargerInformation"}>
            {props.dealData.length===0 &&
                <div className={"noData"}>
                    <FormattedMessage id={"noMatchData"}/>
                </div>
            }
            <table>
                <tbody>
                {props.dealData.map((item, index) => (<ChargerInformationElement key={index} data={item}/>))}
                </tbody>
            </table>
        </div>
    )
}

function ChargerInformationElement(props){
    return(
        <tr>
            <td className={"td1"}>
                {props.data.chargerId}
            </td>
            <td className={"td2"}>
                {props.data.cardId}
            </td>
            <td className={"td3"}>
                {props.data.company}
            </td>
            <td className={"td4"}>
                {props.data.memberId}
            </td>
            <td className={"td5"}>
                {props.data.cardUser}
            </td>
            <td className={"td6"}>
                {props.data.carNumber}
            </td>
            <td className={"td7"}>
                {props.data.startTime}
            </td>
            <td className={"td8"}>
                {props.data.endTime}
            </td>
            <td className={"td9"}>
                {props.data.chargeTime}
            </td>
            <td className={"td10"}>
                {props.data.electricity}
            </td>
            <td className={"td11"}>
                {props.data.unitPrice}
            </td>
            <td className={"td12"}>
                {props.data.cost}
            </td>
        </tr>
    )
}

function ChargerCostChart(props) {
    const lang = useLanguage()
    const chartDom = useRef()
    const {size} = useChartSize()
    useEffect(() => {
        const index = props.costData.labels.indexOf(props.metadata.costChartDate).toString()
        const labels = () => {
            const result = []
            for (let label of props.costData.labels) {
                if(props.metadata.select==="month"){
                    label = parseInt(label.slice(5))
                    const labelData = monthMapping[label][lang]
                    result.push(labelData)
                }else{
                    result.push(label.slice(5))
                }
            }
            return result
        }
        const targetData = []
        const otherData = []
        for (let datumIndex in props.costData.data){
            if (datumIndex===index){
                targetData.push(props.costData.data[datumIndex])
                otherData.push(0)
            }else{
                targetData.push(0)
                otherData.push(props.costData.data[datumIndex])
            }
        }
        const chartCanvas = ReactDOM.findDOMNode(chartDom.current)
        const data = {
            labels: labels(),
            datasets: [
                {
                    label: {"EN": "Cost", "CN": "花费"}[lang],
                    backgroundColor: gradientColor(chartCanvas),
                    hoverBackgroundColor: gradientHoverColor(chartCanvas),
                    hoverBorderColor: "rgba(168,231,255,0.5)",
                    hoverBorderWidth: 4,
                    barPercentage: 0.7,
                    data: targetData
                },
                {
                    label: {"EN": "Cost", "CN": "花费"}[lang],
                    backgroundColor: gradientColorOther(chartCanvas),
                    hoverBackgroundColor: gradientHoverColorOther(chartCanvas),
                    hoverBorderColor: "rgba(168,231,255,0.5)",
                    hoverBorderWidth: 4,
                    barPercentage: 0.7,
                    data: otherData
                },
            ]
        }
        let createChart = new Chart(chartCanvas, {
            type: "bar",
            options: chargerBarChartOptions(size),
            data: data
        })
        return () => {
            createChart.destroy()
        }
    }, [lang, props.costData, size, props.metadata])
    return (
        <div className={"chargerChart"}>
            <div className={"dollar"}>{"( $ )"}</div>
            <canvas ref={chartDom}/>
        </div>
    )
}

function DownChargerUsage(props) {
    const token = useToken()
    const lang = useLanguage()
    const reportChargerUsageDownload = reportChargerUsageGenerator(token, lang, props.metadata)
    return(
        <div className={"downCharger"}>
            <div className={"mainTitle"}>
                <div className={"block"}/>
                <div className={"title"}>
                    {props.metadata.charger}
                    <FormattedMessage id={"report.charger.usage"}/>
                    &nbsp;—&nbsp;{props.metadata.date.startDay}
                    <FormattedMessage id={"report.charger.to"}/>
                    {props.metadata.date.endDay}
                </div>
                <PrintDownload download={reportChargerUsageDownload}
                               fileName={"charger_usage"}
                />
            </div>
            <ChargerUsageChart {...props}/>
            <ChargerUsageData {...props}/>
        </div>
    )
}

function ChargerUsageChart(props) {
    const clientWidth = document.documentElement.clientWidth
    const lang = useLanguage()
    const chartDom = useRef()
    const {size} = useChartSize()
    const [styleWidth, setStyleWidth] = useState({})
    useEffect(() => {
        const chartCanvas = ReactDOM.findDOMNode(chartDom.current)
        const labels=[]
        const usageChartData = []
        for (let item of Object.values(props.data)[0]){
            let element = []
            element.push(item.date.slice(0, 4))
            element.push(item.date.slice(5))
            labels.push(element)
            usageChartData.push(item.usage)
        }

        const chartWidth = usageChartData.length >= 31? usageChartData.length.toString():31

        setStyleWidth({
            "width": chartWidth * clientWidth/43+"px",
            "height": "100%"
        })

        const data = {
            labels: labels,
            datasets: [
                {
                    label: {"EN": "Usage Rate: ", "CN": "利用率"}[lang],
                    backgroundColor: gradientColorOther(chartCanvas),
                    hoverBackgroundColor: gradientHoverColorOther(chartCanvas),
                    barPercentage: 0.7,
                    hoverBorderColor: "rgba(168,231,255,0.5)",
                    hoverBorderWidth: 4,
                    borderColor: "rgba(190,237,255, 0.0)",
                    data: usageChartData
                }
            ]
        }
        let createChart = new Chart(chartCanvas, {
            type: "bar",
            options: chargerBarChartOptions(size),
            data: data
        })
        return () => {
            createChart.destroy()
        }
    }, [size, props.data, lang, clientWidth])
    return (
        <div className={"chargerChart usage"}>
            <div style={styleWidth} id={"chartContainer"}>
                <canvas ref={chartDom}/>
            </div>
        </div>
    )
}

function ChargerUsageData(props) {
    const [chargerVariables, chargerDispatch] = useReducer(pageReducer, PAGE_REPORT_CHARGER_USAGE_INITIAL_STATE)
    const {data} = dealChargerUsage(Object.values(props.data)[0], chargerVariables, props.metadata.charger)
    data.metadata = {...data.metadata, ...props.metadata}
    return(
        <div className={"chargerUsageContainer"}>
            <div className={"titleContainer"}>
                <div className={"titleItem"}>
                    <div>
                        <FormattedMessage id={"report.charger.from"}/>
                        {props.metadata.date.startDay}
                        <FormattedMessage id={"report.charger.to"}/>
                        {props.metadata.date.endDay}
                    </div>
                    <div>
                        <FormattedMessage id={"report.charger.match"}/>
                        {data.metadata.totalCount}
                    </div>
                </div>
                <PageControl dispatch={chargerDispatch} variables={chargerVariables} data={data}/>
            </div>
            <div className={"chargerUsageTableContainer"}>
                <ChargerUsageTable dealData={data.dealData.slice(0, 20)} sort={true}
                                   dispatch={chargerDispatch} variables={chargerVariables}/>
                <ChargerUsageTable dealData={data.dealData.slice(20)} sort={false}/>
            </div>
        </div>
    )
}

function ChargerUsageTable(props) {
    const lang = useLanguage()
    return(
        <div className={"chargerUsageTable"}>
            <div className={"sortTitle"}>
                <div className={"title2"}>
                    {props.sort?
                        <>
                            <Sort data={sortConditionData["date"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                            <Sort data={sortConditionData["chargerId"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                            <Sort data={sortConditionData["usage"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                        </>:
                        <>
                            <div className={sortConditionData["date"].className + " no_cursor"}>
                                <div>{sortConditionData["date"].detail[lang]}</div>
                            </div>
                            <div className={sortConditionData["chargerId"].className + " no_cursor"}>
                                <div>{sortConditionData["chargerId"].detail[lang]}</div>
                            </div>
                            <div className={sortConditionData["usage"].className + " no_cursor"}>
                                <div>{sortConditionData["usage"].detail[lang]}</div>
                            </div>
                        </>
                    }
                </div>
            </div>
            <div className={"showChargerUsage"}>
                <table>
                    <tbody>
                    {props.dealData.map((item, index) => (<ChargerUsageElement key={index} data={item}/>))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function ChargerUsageElement(props){
    return(
        <tr>
            <td className={"td1"}>
                {props.data.date}
            </td>
            <td className={"td2"}>
                {props.data.charger}
            </td>
            <td className={"td3"}>
                {props.data.usage}%
            </td>
        </tr>
    )
}

export {ReportChargerArticle}
