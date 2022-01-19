import {FormattedMessage} from "react-intl";
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from "react";
import {useChartSize, useDateTimeLimit, useLanguage, useToken} from "../../function/usePackage";
import {visitorFastData} from "../../data/visitorFastData";
import {convertToYearMonth, fastDataGetFetchFormat} from "../../function/fastDataFunction";
import {PrintDownload, Sort} from "../common";
import {SERVER} from "../../setting";
import {PAGE_REPORT_VISITOR_INITIAL_STATE, pageReducer} from "../../reducer/pageReducer";
import "../../SCSS/report/report_visitor.css"
import {Doughnut, Line} from "react-chartjs-2";
import {sortConditionData} from "../../data/sortConditionData";
import {reportVisitorGenerator} from "../../function/download";
import {dealVisitorData} from "../../function/dealDataFunction";

function ReportVisitorArticle(){
    const token = useToken()
    const [isLoading, setIsLoading] = useState()
    const [data, setData] = useState()
    const [select, setSelect] = useState({
        "type": "",
        "option": "",
        "selfStart": "",
        "selfEnd": "",
    })
    const metadataRef = useRef({
        "type": "",
        "startDay": "",
        "endDay": ""
    })
    // console.log(select)

    const handleForm = useCallback(async (event, select, token) =>{
        event.preventDefault()
        setData(null)
        setIsLoading(true)
        const metadata = {}
        if (select.type==="fast"){
            metadata.type=visitorFastData[select.option]["type"]
            metadata.startDay=fastDataGetFetchFormat(visitorFastData[select.option]["start"])
            metadata.endDay=fastDataGetFetchFormat(visitorFastData[select.option]["end"], true)
            metadata.select="fast"
        }else if (select.type==="self"){
            metadata.type="day"
            metadata.startDay=select.selfStart
            metadata.endDay=select.selfEnd
            metadata.select="self"
        }
        try{
            metadataRef.current = metadata
            // API
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/visitor", {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "type": metadata.type,
                    "startDay": metadata.startDay,
                    "endDay": metadata.endDay
                })
            })
            const data = await response.json()
            // const data = visitorData
            const saveData = {}
            if(metadata.select==="fast"){
                const dealData = {}
                if(metadata.type==="day"){
                    metadata.pageMax=6
                    for(let i=5; i>=0; i--){
                        dealData[convertToYearMonth(new Date(metadata.endDay), i)] = {
                            "title": convertToYearMonth(new Date(metadata.endDay), i),
                            "data": []
                        }
                    }
                    for (let datum of data.report){
                        dealData[datum.timeText.slice(0, 7)].data.push(datum)
                    }
                }else{
                    metadata.pageMax=2
                    for(let i=1; i>=0; i--){
                        dealData[(new Date(metadata.endDay).getFullYear()-i).toString()] = {
                            "title": (new Date(metadata.endDay).getFullYear()-i).toString(),
                            "data": []
                        }
                    }
                    for(let datum of data.report){
                        dealData[datum.start.slice(0, 4)].data.push(datum)
                    }
                }
                const value = Object.values(dealData)
                for(let i=1; i<=value.length; i++){
                    saveData[i] = value[i-1]
                }
            }else{
                metadata.pageMax=1
                saveData[1] = {
                    "title": "",
                    "data": data.report
                }
            }
            // console.log(data)
            // console.log(saveData)
            setData(saveData)
        }catch (e) {
            console.log(e)
        }
        setIsLoading(false)
    },[])


    const  visitorDown = useMemo(()=>{
        if(data){
            return <DownVisitor data={data} metadata={metadataRef.current}/>
        }else{
            return null
        }
    },[data])

    function handleReset() {
        setSelect(pre=>({
            ...pre,
            "option": "0",
            "selfStart": "",
            "selfEnd": "",
        }))
    }

    return (
        <div className={"reportArticle"}>
            <div className={"scroll"}>
                <div className={"up"}>
                    <div className={"container"}>
                        <form onSubmit={(event)=>(handleForm(event, select, token))}>
                            <ReportVisitorSearch select={select} setSelect={setSelect}
                            />
                            <div className={"div_button"}>
                                <button type="submit" className={"secondary_button submit"}><FormattedMessage id={"button.submit"}/></button>
                                <button type="reset" className={"secondary_button"} onClick={handleReset}><FormattedMessage id={"button.reset"}/></button>
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
                {visitorDown}
            </div>
        </div>
    )
}

function ReportVisitorSearch(props) {
    const {select, setSelect} = props
    const lang = useLanguage()
    const {firstMaxDate, lastMinDate, changeFirstDate, changeLastDate} = useDateTimeLimit()


    const itemClass = useCallback((eventSelect) => {
        if (eventSelect === select.type) {
            return "item active"
        } else {
            return "item"
        }
    }, [select])

    const handleSelect = useCallback((eventSelect, selfStart="", selfEnd="") => {
        setSelect(pre=>({...pre, "type": eventSelect}))
        if(eventSelect==="self"){
            setSelect(pre=>({
                ...pre,
                "selfStart": selfStart,
                "selfEnd": selfEnd
            }))
        }
    }, [setSelect])

    function handleFastSelect(event) {

        setSelect(pre=>({
            ...pre,
            "option": event.target.value
        }))
    }

    function handleStartDate(event) {
        changeFirstDate(event)
        setSelect(pre=>({
            ...pre,
            "selfStart": event.target.value
        }))
    }

    function handleEndDate(event) {
        changeLastDate(event)
        setSelect(pre=>({
            ...pre,
            "selfEnd": event.target.value
        }))
    }

    useEffect(()=>{
        setSelect(pre=>({...pre, "type": "fast", "option": "0"}))
    },[setSelect])

    return (
        <div className={"reportSearch"}>
            <div className={"searchSelect"}>
                <div className={itemClass("fast")} onClick={() => {handleSelect("fast")}}>
                    <FormattedMessage id={"report.fastSearch"}/>
                </div>
                <div className={itemClass("self")}
                     onClick={() => {handleSelect("self", props.select.selfStart, props.select.selfEnd)}}>
                    <FormattedMessage id={"report.selfSearch"}/>
                </div>
            </div>
            <div className={"searchContext"}>
                {select.type==="fast" &&
                <div className={"searchFast"}>
                    {visitorFastData.map((item, index)=>(
                        <div className={"div_input"} key={index}>
                            <input type="radio" name={"searchFast"} value={item.value} required={true} id={item.value}
                                   checked={item.value===select.option}
                                   onChange={(event) => {handleFastSelect(event)}}/>
                            <label htmlFor={item.value}>{item.name[lang]}</label>
                        </div>
                    ))}
                </div>
                }
                {select.type==="self" &&
                <div className={"searchSelf"}>
                    <div className={"div_input"}>
                        <input id="firstDate" name="firstDate" type="date" required={true} value={select.selfStart}
                               onChange={(event) => {handleStartDate(event)}}
                               max={firstMaxDate}/>
                        <span className={"to"}>~</span>
                        <input id="lastDate" name="lastDate" type="date" required={true} value={select.selfEnd}
                               onChange={(event) => {handleEndDate(event)}}
                               min={lastMinDate}/>
                    </div>
                    <div className={"text"}><FormattedMessage id={"report.visitor.searchNote"}/></div>
                </div>
                }
            </div>
        </div>
    )
}

function DownVisitor(props) {
    const token = useToken()
    const lang = useLanguage()
    const [visitorVariables, visitorDispatch] = useReducer(pageReducer, PAGE_REPORT_VISITOR_INITIAL_STATE(props.metadata.pageMax))
    const {dealData, chartData, title} = dealVisitorData(props.data, visitorVariables, props.metadata.type)
    const reportVisitorDownload = reportVisitorGenerator(token, lang,
        props.metadata, visitorVariables.pagination.current, title.title)

    let classNameArrowLeft = "pageChangeButton active"
    if(visitorVariables.pagination.current===1){
        classNameArrowLeft = "pageChangeButton"

    }
    let classNameArrowRight = "pageChangeButton active"
    if(visitorVariables.pagination.current===props.metadata.pageMax){
        classNameArrowRight = "pageChangeButton"
    }

    function pagePre() {
        if(visitorVariables.pagination.current!==1) {
            visitorDispatch({
                type: "TO_PREVIOUS_PAGE"
            })
        }
    }

    function pageNext() {
        if(visitorVariables.pagination.current!==props.metadata.pageMax) {
            visitorDispatch({
                type: "TO_NEXT_PAGE"
            })
        }
    }

    return (
        <div className={"downVisitor"}>
            <div className={"mainTitle"}>
                <div className={"block"}/>
                <div className={"title"}>
                    <div className={classNameArrowLeft} onClick={pagePre}>
                        <div className={"arrowLeft"}/>
                    </div>
                    <div className={"text"}>
                        {title.title} {title.title && " - "}
                        <FormattedMessage id={"report.visitor"}/>
                        <FormattedMessage id={"report.visitor."+props.metadata.type}/>
                    </div>
                    <div className={classNameArrowRight} onClick={pageNext}>
                        <div className={"arrowRight"}/>
                    </div>
                </div>
                <PrintDownload download={reportVisitorDownload}
                               fileName={"visitor_report"}/>
            </div>
            <div className={"chart1Container"}>
                <VisitorStatisticChart data={chartData.chart1Data}/>
            </div>
            <div className={"chart2Container"}>
                <div className={"chart2Title"}>
                    <FormattedMessage id={"report.visitor.reason"}/>
                </div>
                <VisitorReasonChart data={chartData.chart2Data}/>
            </div>
            <div className={"tableTitle"}>
                {props.metadata.select==="fast" &&
                title.title}
                {props.metadata.select==="self" &&
                (<FormattedMessage id={"report.charger.from"}/>)}
                {props.metadata.select==="self" &&
                props.metadata.startDay}
                {props.metadata.select==="self" &&
                (<FormattedMessage id={"report.charger.to"}/>)}
                {props.metadata.select==="self" &&
                props.metadata.endDay}
                {",  "}
                <FormattedMessage id={"report.visitor.scheduled"}/>{": "+title.totalData+", "}
                <FormattedMessage id={"report.visitor.present"}/>{": "+title.presentData+", "}
                <FormattedMessage id={"report.visitor.absent"}/>{": "+title.absentData}
            </div>
            <VisitorDataContainer data={dealData} dispatch={visitorDispatch}
                                  variables={visitorVariables}/>
        </div>
    )
}

function VisitorStatisticChart(props) {
    const clientWidth = document.documentElement.clientWidth
    const lang = useLanguage()
    const {size, lineRadius, lineBorder} = useChartSize()
    console.log(props.data)
    const styleWidth = () => {
        const chartWidth = props.data.chartTitle.length >= 31? props.data.chartTitle.length.toString(): 31
        return({
            "width": chartWidth * clientWidth/42+"px",
        })
    }

    const chart = useMemo(()=>{
        const chartData = {
            labels: props.data.chartTitle,
            datasets: [
                {
                    label: {"CN":"到访数","EN":"Present Amounts"}[lang],
                    fill: false,
                    lineTension: 0,
                    pointStyle: "triangle",
                    backgroundColor: "#807522",
                    borderColor: "#807522",
                    borderCapStyle: "butt",
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: "miter",
                    pointBorderColor: "#807522",
                    pointBackgroundColor: "#807522",
                    pointBorderWidth: 0,
                    pointHoverRadius: lineRadius,
                    pointHoverBackgroundColor: "#807522",
                    pointHoverBorderColor: "#807522",
                    pointHoverBorderWidth: lineBorder,
                    pointRadius: lineRadius,
                    pointHitRadius: lineRadius,
                    data: props.data.presentData,
                },
                {
                    label: {"CN":"预定访客数","EN":"Scheduled Visitors"}[lang],
                    fill: false,
                    lineTension: 0,
                    pointStyle: "rect",
                    backgroundColor: "#84E2F7",
                    borderColor: "#84E2F7",
                    borderCapStyle: "butt",
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: "miter",
                    pointBorderColor: "#84E2F7",
                    pointBackgroundColor: "#84E2F7",
                    pointBorderWidth: 0,
                    pointHoverRadius: lineRadius,
                    pointHoverBackgroundColor: "#84E2F7",
                    pointHoverBorderColor: "#84E2F7",
                    pointHoverBorderWidth: lineBorder,
                    pointRadius: lineRadius,
                    pointHitRadius: lineRadius,
                    data: props.data.totalData,
                },
                {
                    label: {"CN":"未到访","EN":"Absent Amounts"}[lang],
                    fill: false,
                    lineTension: 0,
                    pointStyle: "circle",
                    backgroundColor: "#4C4697",
                    borderColor: "#4C4697",
                    borderCapStyle: "butt",
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: "miter",
                    pointBorderColor: "#4C4697",
                    pointBackgroundColor: "#4C4697",
                    pointBorderWidth: 0,
                    pointHoverRadius: lineRadius,
                    pointHoverBackgroundColor: "#4C4697",
                    pointHoverBorderColor: "#4C4697",
                    pointHoverBorderWidth: lineBorder,
                    pointRadius: lineRadius,
                    pointHitRadius: lineRadius,
                    data: props.data.absentData,
                },
            ]
        }
        const options = {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    reverse: false,
                    fullSize: false,
                    display: true,
                    position: "top",
                    align: "start",
                    labels: {
                        boxWidth: size * 1.5,
                        boxHeight: size * 0.2,
                        color: "#8FCDCC",
                        font: {
                            size: size,
                            family: "Noto Sans SC",

                        }
                    },
                },
                tooltip: true,
            },
            interaction: {
                mode: 'x',
                intersect: true
            },
            responsive: true,
            scales: {
                x: {
                    stacked: false,
                    offset: true,
                    grid: {
                        borderWidth: 3,
                        borderColor: "#84E2F7",
                        display: false
                    },
                    ticks: {
                        font: {
                            size: size * 0.9,
                        },
                        color: "#84E2F7"
                    }
                },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    grid: {
                        borderWidth: 3,
                        borderColor: "#84E2F7",
                        display: true,
                        color: "rgba(143, 205, 204, 0.15",
                        drawTicks: false
                    },
                    ticks: {
                        font: {
                            size: size,
                        },
                        crossAlign: "center",
                        color: "#84E2F7",
                        padding: 14
                    }
                }
            }
        }
        return (<Line data={chartData} options={options} type={"Line"}/>)
    },[size, lineRadius, lineBorder, props.data, lang])
    return (
        <div className={"visitorStatisticChart"} style={styleWidth()}>
            {chart}
        </div>
    )
}

function VisitorReasonChart(props) {
    const {border, size} = useChartSize()
    const lang = useLanguage()
    const [chartHover, setChartHover] = useState({
        "isOpen": false,
        "index": null
    })

    const hoverData = useMemo(()=>{
        const labels = {
            "CN": ["商务洽谈", "送文件", "参加培训", "参加会议", "其他"],
            "EN": ["Business", "Document", "Training", "Meeting", "Other"]
        }[lang]
        const totalData = (parseInt(props.data.business)+
            parseInt(props.data.document)+
            parseInt(props.data.training)+
            parseInt(props.data.meeting)+
            parseInt(props.data.other))
        const backgroundColor = ["#804459", "#807942", "#806237", "#257377", "#1B648D"]
        const chartData = [props.data.business, props.data.document,
                    props.data.training, props.data.meeting,
                    props.data.other]
        return{labels, totalData, backgroundColor, chartData}
    },[props.data, lang])

    const chart = useMemo(()=>{
        const options = {
            maintainAspectRatio: false,
            elements: {
                arc: {
                    borderWidth: border*0.5,
                    borderColor: "#00262f",
                }
            },
            onHover: function (evt, element) {
                if (element.length !== 0) {
                    const index = element["0"].index
                    setChartHover({"isOpen": true, "index": index})
                } else {
                    setChartHover({"isOpen": false, "index": null})
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
                        boxWidth: size * 2,
                        boxHeight: size * 0.6,
                        color: "#8FCDCC",
                        font: {
                            size: size,
                            family: "Noto Sans SC",

                        }
                    },
                }
            }
        }
        const chartData = {
        labels: hoverData.labels,
        datasets: [
            {
                data: hoverData.chartData,
                backgroundColor: hoverData.backgroundColor,
            }
        ]
    }
        return (<Doughnut type={"doughnut"} data={chartData} options={options}/>)
    },[size, border, hoverData])
    return (
        <div className={"visitorReasonChart"}>
            <div className={"chartContainer"}>
                {chart}
            </div>
            {chartHover.isOpen &&
            <div className={"chartData"}>
                <div className={"color"} style={{backgroundColor: hoverData.backgroundColor[chartHover.index]}}/>
                <div className={"text"}>
                    {hoverData.labels[chartHover.index]}{","}&nbsp;
                    <span className={"numberWord"}>
                        {hoverData.chartData[chartHover.index]+" "}
                    </span>
                    <FormattedMessage id={"index.access.times"}/>
                    {","}&nbsp;
                    <span className={"numberWord"}>
                        {Math.round((hoverData.chartData[chartHover.index]/hoverData.totalData)*10000)/100}%
                    </span>
                </div>
            </div>
            }
        </div>
    )
}

function VisitorDataContainer(props) {
    return (
        <div className={"visitorDataContainer"}>
            <div className={"sortTitle"}>
                <div className={"title2"}>
                    <div className={"sortContainer"}>
                        <Sort data={sortConditionData["timeText"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                    <div className={"sortContainer"}>
                        <Sort data={sortConditionData["total"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                    <div className={"sortContainer"}>
                        <Sort data={sortConditionData["appointment"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                    <div className={"sortContainer borderGreen"}>
                        <Sort data={sortConditionData["invitation"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                    <div className={"sortContainer borderGreen"}>
                        <Sort data={sortConditionData["present"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                    <div className={"sortContainer"}>
                        <Sort data={sortConditionData["absent"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                    <div className={"sortContainer sub"}>
                        <div className={"visitorSubject"}>
                            <FormattedMessage id={"report.visitor.reason2"}/>
                        </div>
                        <Sort data={sortConditionData["business"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                    <div className={"sortContainer sub"}>
                        <div className={"visitorSubject"}/>
                        <Sort data={sortConditionData["document"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                    <div className={"sortContainer sub"}>
                        <div className={"visitorSubject"}/>
                        <Sort data={sortConditionData["training"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                    <div className={"sortContainer sub"}>
                        <div className={"visitorSubject"}/>
                        <Sort data={sortConditionData["meeting"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                    <div className={"sortContainer sub"}>
                        <div className={"visitorSubject"}/>
                        <Sort data={sortConditionData["other"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                </div>
            </div>
            <ShowVisitorData dealData={props.data}/>
        </div>
    )
}

function ShowVisitorData(props) {
    return (
        <div className={"showVisitorData"}>
            <table>
                <tbody>
                {props.dealData.map((item, index) => (<VisitorDataElement key={index} data={item}/>))}
                </tbody>
            </table>
        </div>
    )
}

function VisitorDataElement(props){
    return(
        <tr>
            <td>
                {props.data.timeText}
            </td>
            <td>
                {props.data.total}
            </td>
            <td>
                {props.data.appointment}
            </td>
            <td>
                {props.data.invitation}
            </td>
            <td>
                {props.data.present}
            </td>
            <td>
                {props.data.absent}
            </td>
            <td>
                {props.data.business}
            </td>
            <td>
                {props.data.document}
            </td>
            <td>
                {props.data.training}
            </td>
            <td>
                {props.data.meeting}
            </td>
            <td>
                {props.data.other}
            </td>
        </tr>
    )
}

export {ReportVisitorArticle}
