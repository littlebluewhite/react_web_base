import {
    checkTime, placeholder, useChartSize,
    useDateTimeLimit,
    useFastSelfSearch,
    useLanguage,
    useToken
} from "../../function/usePackage";
import "../../SCSS/report/report_access.css"
import React, {useEffect, useReducer, useRef, useState} from "react";
import {SERVER} from "../../setting";
import {FormattedMessage} from "react-intl";
import {accessSearchFastData} from "../../data/accessSearchFastData";
import {timeHour, timeMinute} from "../../data/hourAndTime";
import {PAGE_ACCESS_INSTANT_INITIAL_STATE, PAGE_ACCESS_PERIOD_INITIAL_STATE, pageReducer} from "../../reducer/pageReducer";
import {FilterElement, PageControl, PrintDownload, Sort} from "../common";
import {allConditionData} from "../../data/allConditionData";
import {Chart, Doughnut} from "react-chartjs-2";
import {sortConditionData} from "../../data/sortConditionData";
import {chartInitialData} from "../../data/reportAccessComboChartFloor";
import ReactDOM from "react-dom";
import {comboOptions, comboShowData} from "../../data/comboChartOptionsData";
import {doughnutBackgroundColor} from "../../data/backgroundColor";
import {reportAccessInstantGenerator, reportAccessPeriodGenerator} from "../../function/download";
import {convertTime, convertToText} from "../../function/convertFunction";
import {dealAccessInstantData, dealAccessPeriodData} from "../../function/dealDataFunction";

function ReportAccessControlReportArticle() {
    const token = useToken()
    const AccessSelfSelect = useRef({start: null, end: null})
    const [downContainer, setDownContainer] = useState(false)
    const select = useRef({"type": "instant", "start": 0, "end": 0})
    const fastData = useRef(null)
    const selfData = useRef({
        "start": {"date": "2021/01/01", "hour": 0, "minute": 0},
        "end": {"date": "2021/01/01", "hour": 0, "minute": 0}
    })
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    async function handleForm(event) {
        setDownContainer(false)
        setIsLoading(true)
        event.preventDefault()
        try{
            let response
            if (select.current.type==="instant"){
                response = await fetchInstantData()
            }else if(select.current.type==="period"){
                await checkTime(select.current.start, select.current.end)
                response = await fetchPeriodData(select)
            }
            const accessData = await response.json()
            setData(accessData)
            setDownContainer(true)
        }catch (err){
            alert(err)
            console.log(err)
        }
        setIsLoading(false)
    }

    function fetchInstantData(){
        return fetch(SERVER + "/api/IBMS/Web/V1/report/accessInstant", {
            method: "GET",
            headers: new Headers({
                Authorization: "Bearer " + token
            }),
        })
    }

    function fetchPeriodData(select){
        return fetch(SERVER + "/api/IBMS/Web/V1/report/accessPeriod", {
            method: "POST",
            headers: new Headers({
                Authorization: "Bearer " + token
            }),
            body: JSON.stringify({
                "start": convertTime(select.current.start),
                "end": convertTime(select.current.end)
            })
        })
    }


    return(
        <div className={"reportArticle"}>
            <div className={"scroll"}>
                <div className={"up"}>
                    <div className={"container"}>
                        <form onSubmit={(event)=>(handleForm(event))}>
                            <ReportAccessControlSearch setDownContainer={setDownContainer} fastData={fastData}
                                                       AccessSelfSelect={AccessSelfSelect} select={select} selfData={selfData}
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
                {downContainer && select.current.type==="instant" && <DownContainerInstant fastData={fastData} data={data}/>}
                {downContainer && select.current.type==="period" && <DownContainerPeriod fastData={fastData}
                                                                                         select={select} data={data}
                />}
            </div>
        </div>
    )
}

function ReportAccessControlSearch(props) {
    const [search, setSearch] = useState("fast")
    const {fastClassName, selfClassName} = useFastSelfSearch(search)

    function handleChange(select) {
        if(select==="fast"){
            props.selfData.current = {
                "start": {"date": "2021/01/01", "hour": 0, "minute": 0},
                "end": {"date": "2021/01/01", "hour": 0, "minute": 0}
            }
        }else{
            props.fastData.current = ""
        }
        setSearch(select)
        props.setDownContainer(false)
    }

    return (
        <div className={"reportSearch"}>
            <div className={"searchSelect"}>
                <div className={fastClassName} onClick={()=>{handleChange("fast")}}>
                    <FormattedMessage id={"report.fastSearch"}/>
                </div>
                <div className={selfClassName} onClick={()=>{handleChange("self")}}>
                    <FormattedMessage id={"report.selfSearch"}/>
                </div>
            </div>
            <div className={"searchContext"}>
                {search==="fast"? <AccessSearchFast select={props.select} fastData={props.fastData} setDownContainer={props.setDownContainer}/>
                    : <AccessSearchSelf select={props.select} selfData={props.selfData}/>}
                <div className={"text"}><FormattedMessage id={"report.alarm.note"}/></div>
            </div>
        </div>
    )
}

function AccessSearchFast(props) {
    return(
        <div className={"searchFast"}>
            {accessSearchFastData.map((item, index) => (
                <AccessSearchRadio index={index} key={index} data={item} {...props} setDownContainer={props.setDownContainer}
                />
            ))}
        </div>
    )
}

function AccessSearchRadio(props) {
    const lang = useLanguage()
    function changeSelect(data){
        props.select.current = {"type": data.type, "start": data.start, "end": data.end}
        props.fastData.current = data
        props.setDownContainer(false)
    }
    return(
        <div className={"div_input"}>
            <input type="radio" name={"searchFast"} value={props.index} required={true} id={props.index}
                   onChange={()=>changeSelect(props.data)}/>
            <label htmlFor={props.index}>{props.data.name[lang]}</label>
        </div>
    )
}

function AccessSearchSelf(props) {
    const {firstMaxDate, lastMinDate, changeFirstDate, changeLastDate} = useDateTimeLimit()

    function getTimestamp(data){
        let timestamp = (new Date(parseInt(data.date.slice(0,4)), parseInt(data.date.slice(5, 7))-1,
            parseInt(data.date.slice(8, 10))).getTime())/1000
        timestamp += (parseInt(data.hour)*60 + parseInt(data.minute))*60
        return timestamp
    }
    function handleDatetime(event, fuc, dateType, selfType){
        if(fuc){
            fuc(event)
        }
        props.selfData.current[dateType] = {...props.selfData.current[dateType], [selfType]: event.target.value}
        // console.log(props.selfData.current)
        props.select.current = {...props.select.current, "type": "period", [dateType]: getTimestamp(props.selfData.current[dateType])}
        // console.log(props.select.current)
    }
    return(
        <div className={"searchSelf"}>
            <div className={"div_input"}>
                <input id="firstDate" name="firstDate" type="date" required={true}
                       onChange={(event) => {handleDatetime(event, changeFirstDate, "start", "date")}}
                       max={firstMaxDate}/>
                <select className={"time marginLeft"}
                        onChange={(event) => {handleDatetime(event, null, "start", "hour")}}>
                    {timeHour.map((item) => (
                        <option value={item} key={item}>{item.toString().padStart(2, "0")}</option>
                    ))}
                </select>
                <span className={"hourMinute"}>:</span>
                <select className={"time"}
                        onChange={(event) => {handleDatetime(event, null, "start", "minute")}}
                >
                    {timeMinute.map((item) => (
                        <option value={item} key={item}>{item.toString().padStart(2, "0")}</option>
                    ))}
                </select>
                <span className={"to"}>~</span>
                <input id="lastDate" name="lastDate" type="date" required={true}
                       onChange={(event) => {handleDatetime(event, changeLastDate, "end", "date")}}
                       min={lastMinDate}/>
                <select className={"time marginLeft"}
                        onChange={(event) => {handleDatetime(event, null, "end", "hour")}}
                >
                    {timeHour.map((item) => (
                        <option value={item} key={item}>{item.toString().padStart(2, "0")}</option>
                    ))}
                </select>
                <span className={"hourMinute"}>:</span>
                <select className={"time"}
                        onChange={(event) => {handleDatetime(event, null, "end", "minute")}}
                >
                    {timeMinute.map((item) => (
                        <option value={item} key={item}>{item.toString().padStart(2, "0")}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}

function DownContainerInstant(props) {
    const lang = useLanguage()
    const [accessVariables, accessDispatch] = useReducer(pageReducer, PAGE_ACCESS_INSTANT_INITIAL_STATE)
    const {data} = dealAccessInstantData(props.data, accessVariables, lang)
    return(
        <div className={"downContainerAccess"}>
            <AccessInstantFilter accessDispatch={accessDispatch}  accessVariables={accessVariables}/>
            <AccessTitle fastData={props.fastData} accessVariables={accessVariables}/>
            <AccessInstantChart data={data.metadata.chartData}/>
            <AccessInstantTable data={data} accessVariables={accessVariables} accessDispatch={accessDispatch}/>
        </div>
    )
}

function AccessInstantFilter(props) {
    const lang = useLanguage()
    function handleFilter(event, filter){
        props.accessDispatch({
            type: "CHANGE_FILTER_CONDITION(NO_CHANGE_PAGE)",
            payload: {
                filter: filter,
                value: event.target.value
            }
        })

    }

    function handleSearch(event) {
        props.accessDispatch({
            type: "CHANGE_KEYWORD",
            payload: {keyword: event.target.value}
        })
    }

    return(
        <div className={"accessFilter"}>
            <FilterElement filter={allConditionData.floor} handleFilter={handleFilter}
                           value={props.accessVariables.filterCondition.floor}
            />
            <FilterElement filter={allConditionData.connectStatus} handleFilter={handleFilter}
                           value={props.accessVariables.filterCondition.connectStatus}
            />
            <input className={"search"} type="text" placeholder={placeholder(lang)} value={props.accessVariables.search}
                               onChange={(event) => {handleSearch(event)}}
                        />
        </div>
    )
}

function AccessTitle(props) {
    const lang = useLanguage()
    const token = useToken()
    const [openSelect, setOpenSelect] = useState(false)
    let reportAccessDownload
    if(props.fastData.current.type==="instant"){
        reportAccessDownload = reportAccessInstantGenerator(token, lang,
            props.accessVariables.filterCondition
        )
    }else{
        reportAccessDownload = reportAccessPeriodGenerator(token, lang,
            props.accessVariables.filterCondition,
            convertTime(props.fastData.current.start),
            convertTime(props.fastData.current.end))
    }
    const chartName = () => {
        if(props.chartPage===1){
            return "Doughnut Chart"
        }else if(props.chartPage===2){
            return "Combo Chart"
        }
    }

    function handleOpen() {
        setOpenSelect(pre=>!pre)
    }

    function handleClose() {
        setOpenSelect(false)
    }

    function handleChart(event, page) {
        // event.stopPropagation()
        props.setChartPage(page)
    }

    const chartContainer = props.chartPage &&
        <div className={"selectTitle"} onMouseLeave={handleClose} onClick={handleOpen}>
            <div className={"text"}>{chartName()}</div>
            <div className={"arrowCondition"}><div className={"arrowDown"}/></div>
            {openSelect &&
            <div className={"selectContainer"}>
                <div className={"selectItem"} onClick={event=>(handleChart(event,1))}>
                    <div className={"background"}/>
                    <div className={"item"}>Doughnut Chart</div>
                </div>
                <div className={"selectItem"} onClick={event=>(handleChart(event,2))}>
                    <div className={"background"}/>
                    <div className={"item"}>Combo Chart</div>
                </div>
            </div>}
        </div>
    return(
        <div className={"accessTitle"}>
            <div className={"block"}>
                {chartContainer}
            </div>
            <div className={"textContainer"}>
                <div className={"pageChangeButton"}>
                    <div className={"arrowLeft"}/>
                </div>
                <div className={"text"}>
                    {props.fastData.current && props.fastData.current.title[lang]}{props.fastData.current && props.fastData.current.title[lang] && "-"}<FormattedMessage id={"report.access.title"}/>
                </div>
                <div className={"pageChangeButton"}>
                    <div className={"arrowRight"}/>
                </div>
            </div>
            <PrintDownload download={reportAccessDownload}
                           fileName={"access_report"}
            />
        </div>
    )
}

function convertChartData(rawData, property, lang){
    const label = []
    const data = []
    for(let item in rawData[property]){
        if(rawData[property].hasOwnProperty(item)){
            label.push(allConditionData[property].data[allConditionData[property].index[item]].name[lang])
            data.push(rawData[property][item])
        }
    }
    return {
        maintainAspectRatio: false,
        responsive: false,
        labels: label,
        datasets: [
            {
                data: data,
                backgroundColor: doughnutBackgroundColor
            }
        ]
    }
}

function AccessInstantChart(props) {
    const lang = useLanguage()
    const {border, size, labelWidth} = useChartSize()
    const options = {
        // events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        maintainAspectRatio: false,
        elements: {
            arc: {
                borderWidth: border,
                borderColor: "#00262f",
            }
        },
        plugins: {
            tooltip: {
                // Tooltip will only receive click events
                // events: ["click"]
            },
            legend: {
                display: true,
                position: "left",
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
    }
    return (
        <div className={"accessChart"}>
            <div className={"chartPageButton"}/>
            <div className={"accessChartsContainer"}>
                <div className={"chart one"}>
                    <div className={"chartTitle"}>
                        <FormattedMessage id={"report.access.floor"}/>
                    </div>
                    <Doughnut type={"Doughnut"} options={options}
                              data={convertChartData(props.data, "floor", lang)}/>
                </div>
                <div className={"chart two"}>
                    <div className={"chartTitle"}>
                        <FormattedMessage id={"report.access.status"}/>
                    </div>
                    <Doughnut type={"Doughnut"} options={options}
                              data={convertChartData(props.data, "connectStatus", lang)}/>
                </div>
            </div>
            <div className={"chartPageButton"}/>
        </div>
    )
}

function AccessInstantTable(props) {
    return(
        <div className={"accessTable"}>
            <div className={"title"}>
                <div className={"text"}>
                    <FormattedMessage id={"report.access.match"}/> {props.data.metadata.totalCount}
                    <FormattedMessage id={"dot"}/>
                </div>
                <PageControl dispatch={props.accessDispatch} variables={props.accessVariables} data={props.data}/>
            </div>
            <div className={"accessInstantContainer"}>
                <div className={"sortTitle"}>
                    <div className={"title2"}>
                        <Sort data={sortConditionData["floor"]} sortCondition={props.accessVariables.sortCondition} dispatch={props.accessDispatch}/>
                        <Sort data={sortConditionData["equipmentID"]} sortCondition={props.accessVariables.sortCondition} dispatch={props.accessDispatch}/>
                        <Sort data={sortConditionData["connectStatus"]} sortCondition={props.accessVariables.sortCondition} dispatch={props.accessDispatch}/>
                    </div>
                </div>
                <ShowAccessInstantTable dealData={props.data.dealData}/>
            </div>
        </div>
    )
}

function ShowAccessInstantTable(props) {
    return(
        <div className={"showAccessInstantTable"}>
            <table>
                <tbody>
                {props.dealData.map((item, index) => (<AccessInstantElement key={index} data={item}/>))}
                </tbody>
            </table>
        </div>
    )
}

function AccessInstantElement(props) {
    const lang = useLanguage()
    return(
        <tr>
            <td className={"td2"}>
                {convertToText(props.data, "floor", lang)}
            </td>
            <td className={"td13"}>
                {props.data.equipmentID}
            </td>
            <td className={"td14"}>
                {convertToText(props.data, "connectStatus", lang)}
            </td>
        </tr>
    )
}

function DownContainerPeriod(props) {
    const lang = useLanguage()
    const [accessVariables, accessDispatch] = useReducer(pageReducer, PAGE_ACCESS_PERIOD_INITIAL_STATE)
    const {data} = dealAccessPeriodData(props.data, accessVariables, props.select.current, lang)
    const [chartPage, setChartPage] = useState(1)
    return(
        <div className={"downContainerAccess"}>
            <AccessPeriodFilter accessDispatch={accessDispatch}  accessVariables={accessVariables}/>
            <AccessTitle fastData={props.fastData} chartPage={chartPage}
                         setChartPage={setChartPage} accessVariables={accessVariables}/>
            <AccessPeriodChart data={data.metadata.chartData} setChartPage={setChartPage} chartPage={chartPage}
                               comboData={data.metadata.comboData}
            />
            <AccessPeriodTable data={data} accessVariables={accessVariables} accessDispatch={accessDispatch}/>
        </div>
    )
}

function AccessPeriodFilter(props) {
    const lang = useLanguage()
    function handleFilter(event, filter){
        props.accessDispatch({
            type: "CHANGE_FILTER_CONDITION(NO_CHANGE_PAGE)",
            payload: {
                filter: filter,
                value: event.target.value
            }
        })

    }

    function handleSearch(event) {
        props.accessDispatch({
            type: "CHANGE_KEYWORD",
            payload: {keyword: event.target.value}
        })
    }

    return(
        <div className={"accessFilter"}>
            <FilterElement filter={allConditionData.floor} handleFilter={handleFilter}
                           value={props.accessVariables.filterCondition.floor}
            />
            <FilterElement filter={allConditionData.IOresult} handleFilter={handleFilter}
                           value={props.accessVariables.filterCondition.IOresult}
            />
            <input className={"search"} type="text" placeholder={placeholder(lang)} value={props.accessVariables.search}
                               onChange={(event) => {handleSearch(event)}}
                        />
        </div>
    )
}

function AccessPeriodChart(props) {
    const lang = useLanguage()
    const {border, size, labelWidth} = useChartSize()
    const leftClassName = () => {
        if (props.chartPage === 1) {
            return "pageChangeButton"
        } else {
            return "pageChangeButton active"
        }
    }
    const rightClassName = () => {
        if (props.chartPage === 2) {
            return "pageChangeButton"
        } else {
            return "pageChangeButton active"
        }
    }

    function handleChartPage(action) {
        if (action === "previous" && props.chartPage !== 1) {
            props.setChartPage(a => a - 1)
        } else if (action === "next" && props.chartPage !== 2) {
            props.setChartPage(a => a + 1)
        }
    }

    const options = {
        maintainAspectRatio: false,
        // events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        elements: {
            arc: {
                borderWidth: border,
                borderColor: "#00262f",
            }
        },
        plugins: {
            tooltip: {
                // Tooltip will only receive click events
                // events: ["click"]
            },
            legend: {
                display: true,
                position: "left",
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
    }

    return (
        <div className={"accessChart"}>
            <div className={"chartPageButton"}>
                <div className={leftClassName()} onClick={() => {
                    handleChartPage("previous")
                }}>
                    <div className={"arrowLeft"}/>
                </div>
            </div>
            {props.chartPage === 1 &&
            <div className={"accessChartsContainer"}>
                <div className={"chart"}>
                    <div className={"chartTitle"}>
                        <FormattedMessage id={"report.access.floor"}/>
                    </div>
                    <Doughnut type={"Doughnut"} options={options}
                              data={convertChartData(props.data, "floor", lang)}/>
                </div>
                <div className={"chart"}>
                    <div className={"chartTitle"}>
                        <FormattedMessage id={"report.access.status"}/>
                    </div>
                    <Doughnut type={"Doughnut"} options={options}
                              data={convertChartData(props.data, "IOresult", lang)}/>
                </div>
            </div>
            }
            {props.chartPage === 2 &&
            <CombaChartContainer comboData={props.comboData}/>
            }
            <div className={"chartPageButton"}>
                <div className={rightClassName()} onClick={() => {
                    handleChartPage("next")
                }}>
                    <div className={"arrowRight"}/>
                </div>
            </div>
        </div>
    )
}

function CombaChartContainer(props) {
    const chartDom = useRef()
    const [styleWidth, setStyleWidth] = useState({})
    const {comboData} = props
    const {labelWidth, size, lineRadius, lineBorder} = useChartSize()
    // console.log(comboData)
    useEffect(() => {
        const chartData = {...chartInitialData}
        for(let item in chartData){
            if(chartData.hasOwnProperty(item)){
                chartData[item] = []
            }
        }
        const labels = []
        for (let day of Object.values(comboData)) {
            for (let hours of Object.values(day)) {
                labels.push(hours.datetime)
                for (let floorValue in hours.data) {
                    if (hours.data.hasOwnProperty(floorValue)) {
                        chartData[floorValue].push(hours.data[floorValue])
                    }
                }
            }
        }
        const maxY = Math.ceil(Math.max(...chartData.total)*1.25) || 1
        // console.log(chartData)
        setStyleWidth({"width": labels.length.toString() * 3.5 + "rem"})
        const chartCanvas = ReactDOM.findDOMNode(chartDom.current)
        let createChart = new Chart(chartCanvas, {
            type: "line",
            options: comboOptions(labelWidth, size, maxY),
            data: comboShowData(labels, chartData, lineRadius, lineBorder)
        })
        return () => {
            createChart.destroy()
        }
    },[comboData, labelWidth, size, lineBorder, lineRadius])
    return(
        <div className={"accessChartContainer"}>
            <div style={styleWidth} id={"chartContainer"}>
                <canvas ref={chartDom}/>
            </div>
        </div>
    )
}

function AccessPeriodTable(props) {
    return(
        <div className={"accessTable"}>
            <div className={"title"}>
                <div className={"text"}>
                    <FormattedMessage id={"report.access.match"}/> {props.data.metadata.totalCount}
                </div>
                <PageControl dispatch={props.accessDispatch} variables={props.accessVariables} data={props.data}/>
            </div>
            <div className={"accessPeriodContainer"}>
                <div className={"sortTitle"}>
                    <div className={"title2"}>
                        <Sort data={sortConditionData["time"]} sortCondition={props.accessVariables.sortCondition} dispatch={props.accessDispatch}/>
                        <Sort data={sortConditionData["floor"]} sortCondition={props.accessVariables.sortCondition} dispatch={props.accessDispatch}/>
                        <Sort data={sortConditionData["equipmentID"]} sortCondition={props.accessVariables.sortCondition} dispatch={props.accessDispatch}/>
                        <Sort data={sortConditionData["username"]} sortCondition={props.accessVariables.sortCondition} dispatch={props.accessDispatch}/>
                        <Sort data={sortConditionData["IOresult"]} sortCondition={props.accessVariables.sortCondition} dispatch={props.accessDispatch}/>
                    </div>
                </div>
                <ShowAccessPeriodTable dealData={props.data.dealData}/>
            </div>
        </div>
    )
}

function ShowAccessPeriodTable(props) {
    return(
        <div className={"showAccessPeriodTable"}>
            <table>
                <tbody>
                {props.dealData.map((item, index) => (<AccessPeriodElement key={index} data={item}/>))}
                </tbody>
            </table>
        </div>
    )
}

function AccessPeriodElement(props) {
    const lang = useLanguage()
    return(
        <tr>
            <td className={"td1"}>
                {props.data.time}
            </td>
            <td className={"td2"}>
                {convertToText(props.data, "floor", lang)}
            </td>
            <td className={"td13"}>
                {props.data.equipmentID}
            </td>
            <td className={"td5"}>
                {props.data.username}
            </td>
            <td className={"td15"}>
                {convertToText(props.data, "IOresult", lang)}
            </td>
        </tr>
    )
}

export {ReportAccessControlReportArticle}
