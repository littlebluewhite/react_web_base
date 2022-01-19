import {
    placeholder, useAccountGroup,
    useChartSize,
    useLanguage,
    useTemplate,
    useToken
} from "../../function/usePackage";
import "../../SCSS/report/report_account.css";
import React, {useCallback, useEffect, useReducer, useRef, useState} from "react";
import {PAGE_REPORT_ACCOUNT_INITIAL_STATE, pageReducer} from "../../reducer/pageReducer";
import {SERVER} from "../../setting";
import {Redirect, Route, Switch} from "react-router-dom";
import {FormattedMessage} from "react-intl";
import {FilterElement, PrintDownload, Sort} from "../common";
import {Doughnut} from "react-chartjs-2";
import {sortConditionData} from "../../data/sortConditionData";
import {allConditionData} from "../../data/allConditionData";
import {accountUrl} from "../../data/url";
import {reportAccountGenerator} from "../../function/download";
import {convertTime} from "../../function/convertFunction";
import {dealAccountData} from "../../function/dealDataFunction";

function ReportAccountReportArticle() {
    const controller = useRef(false)
    const template = useTemplate()
    const token = useToken()
    const lang = useLanguage()
    const [variables, dispatch] = useReducer(pageReducer, PAGE_REPORT_ACCOUNT_INITIAL_STATE)
    const [data, setData] = useState([])
    const groupData = useAccountGroup(true)
    allConditionData["accessLevel"] = groupData
    const accountData = dealAccountData(data, variables, lang)

    const fetchAccount = useCallback(async(token)=>{
        try{
            const response =  await fetch(SERVER + "/api/IBMS/Web/V1/report/"+accountUrl, {
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
            })
            const data = await response.json()
            if(controller.current){
                setData(data)
            }
        }catch (e) {
            console.log(e)
        }
    },[])

    useEffect(()=>{
        controller.current = true
        fetchAccount(token)
        return()=>{
            controller.current = false
        }
    },[token, fetchAccount])

    function handleSearch(event) {
        dispatch({
            type: "CHANGE_KEYWORD",
            payload: {keyword: event.target.value}
        })
    }

    return(
        <div className={"reportArticle"}>
            {!template.Account_Plugin.IBMS_Account_R &&
            <Switch>
                <Route>
                    <Redirect to={"/"}/>
                </Route>
            </Switch>
            }
            <div className={"accountScroll"}>
                <div className={"accountUp"}>
                    <div className={"searchContainer"}>
                        <input className={"search"} type="text" placeholder={placeholder(lang)} value={variables.search}
                               onChange={(event) => {handleSearch(event)}}
                        />
                    </div>
                    <ConditionAccountTable variables={variables} dispatch={dispatch} groupData={groupData}/>
                </div>
                <DownAccountStatistic statistic={accountData.statistic} variables={variables}/>
                <DownAccountTable data={accountData.account} variables={variables} dispatch={dispatch}/>
            </div>
        </div>
    )
}

function ConditionAccountTable(props) {
    let style = null
    if (props.variables.filterCondition.accessLevel === "") {
        style = {"display": "none"}
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

    function handleReset() {
        props.dispatch({
            type: "RESET_FILTER_ACCOUNT"
        })
    }

    return (
        <div className={"filterConditionContainer"}>
            <div className={"resetContainer"} style={style}>
                <div className={"resetButton"} onClick={handleReset}>
                    <FormattedMessage id={"button.reset"}/>
                    <svg width="0.875rem" height="0.875rem" viewBox="0 0 14 14" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M1.5409 2.24576C2.67705 0.910792 4.34576 0.0515839 6.22751 0.00187766C9.69275 -0.0833331 12.6822 2.74282 12.7816 6.20806C12.8261 7.82532 12.2706 9.31179 11.3213 10.4607L13.8218 12.9611C14.0594 13.1988 14.0594 13.5841 13.8218 13.8218C13.5841 14.0594 13.1988 14.0594 12.9611 13.8218L10.4607 11.3213C9.35544 12.2347 7.93762 12.7835 6.39083 12.7835C3.40844 12.7835 0.908923 10.7384 0.205933 7.97618C0.092318 7.53593 0.440263 7.10277 0.901822 7.10277C1.21426 7.10277 1.4983 7.3158 1.58351 7.61404C2.20129 10.0425 4.6014 11.761 7.29974 11.2781C9.2667 10.9302 10.8786 9.36086 11.2621 7.39391C11.8869 4.21981 9.45842 1.42206 6.39083 1.42206C4.84283 1.42206 3.46525 2.14635 2.54923 3.26119L3.64987 4.36893C3.8771 4.58906 3.72088 4.9725 3.40134 4.9725H0.355052C0.156226 4.9725 6.12809e-06 4.81628 6.12809e-06 4.61746V1.57118C-0.000405628 1.50108 0.019941 1.43243 0.058482 1.37388C0.0970229 1.31533 0.152033 1.2695 0.21658 1.24216C0.281127 1.21482 0.352322 1.2072 0.421192 1.22026C0.490062 1.23332 0.553525 1.26647 0.603584 1.31554L1.5409 2.24576Z"
                            fill="#8FCDCC"/>
                        <path
                            d="M6.39083 4.9725C7.17193 4.9725 7.81101 5.61159 7.81101 6.39268C7.81101 7.17378 7.17193 7.81286 6.39083 7.81286C5.60973 7.81286 4.97064 7.17378 4.97064 6.39268C4.97064 5.61159 5.60973 4.9725 6.39083 4.9725Z"
                            fill="#8FCDCC"/>
                    </svg>
                </div>
            </div>
            <div className={"filterCondition"}>
                <FilterElement filter={props.groupData} handleFilter={handleFilter}
                               value={props.variables.filterCondition.accessLevel}/>
                {/*<FilterElement filter={allConditionData.company} handleFilter={handleFilter}*/}
                {/*               value={props.variables.filterCondition.company}/>*/}
                {/*<FilterElement filter={allConditionData.accountStatus} handleFilter={handleFilter}*/}
                {/*               value={props.variables.filterCondition.accountStatus}/>*/}
                {/*<FilterElement filter={allConditionData.gender} handleFilter={handleFilter}*/}
                {/*               value={props.variables.filterCondition.gender}/>*/}
            </div>
        </div>
    )
}

function DownAccountStatistic(props) {
    const groupData = useAccountGroup(false)
    const token = useToken()
    const lang = useLanguage()
    const {border, size, labelWidth} = useChartSize()
    const reportAccountDownload = reportAccountGenerator(token, lang,
        props.variables.filterCondition)
    function convertChartData(chart) {
        const countData = []
        for(let i of chart.labels){
            countData.push(chart.data[i])
        }
        const labels = []
        if(!(groupData.data.length===0)) {
            for (let item of chart.labels) {
                labels.push(groupData.data[groupData.index[item]].name[lang])
            }
        }
        return {
            responsive: false,
            labels: labels,
            datasets: [
                {
                    data: countData,
                    backgroundColor: ["#7F7943", "#7F445A", "#7F6237", "#267377", "#1B648D", "#4C4697", "#661998"]
                }
            ],
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
    };
    return(
        <div className={"downAccountStatistic"}>
            <div className={"title"}>
                <div className={"text"}><FormattedMessage id={"report.account.title"}/></div>
                <div className={"div_button"}>
                    <PrintDownload download={reportAccountDownload}
                                   fileName={"account_report"}/>
                </div>
            </div>
            <div className={"accountChartsContainer"}>
                <div className={"accountChart"}>
                    <div>{props.statistic.chart1.title[lang]}</div>
                    <Doughnut type={"Doughnut"} options={options} data={convertChartData(props.statistic.chart1)}/>
                </div>
                {/*<div className={"accountChart"}>*/}
                {/*    <div>{props.statistic.chart2.title[lang]}</div>*/}
                {/*    <Doughnut type={"Doughnut"} options={options} data={convertChartData(props.statistic.chart2)}/>*/}
                {/*</div>*/}
                {/*<div className={"accountChart"}>*/}
                {/*    <div>{props.statistic.chart3.title[lang]}</div>*/}
                {/*    <Doughnut type={"Doughnut"} options={options} data={convertChartData(props.statistic.chart3)}/>*/}
                {/*</div>*/}
                {/*<div className={"accountChart last"}>*/}
                {/*    <div>{props.statistic.chart4.title[lang]}</div>*/}
                {/*    <Doughnut type={"Doughnut"} options={options} data={convertChartData(props.statistic.chart4)}/>*/}
                {/*</div>*/}
            </div>
        </div>
    )
}

function DownAccountTable(props) {
    return(
        <div className={"downAccountTable"}>
            <div className={"count"}>
                <FormattedMessage id={"report.account.match"}/> {props.data.length}
                <FormattedMessage id={"dot"}/>
            </div>
            <div className={"accountContainer"}>
                <div className={"sortTitle"}>
                    <div className={"title2"}>
                        <Sort data={sortConditionData["username"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                        <Sort data={sortConditionData["accessLevel"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                        <Sort data={sortConditionData["subCompany"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                        <Sort data={sortConditionData["name"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                        <Sort data={sortConditionData["loginTime"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
                    </div>
                </div>
                <ShowAccountTable dealData={props.data}/>
            </div>
        </div>
    )
}

function ShowAccountTable(props) {
    const groupData = useAccountGroup(false)
    return(
        <div className={"showAccountTable"}>
            <table>
                <tbody>
                {props.dealData.map((item, index) => (
                    <AccountElement key={index} data={item} groupData={groupData}/>))}
                </tbody>
            </table>
        </div>
    )
}

function AccountElement(props) {
    const lang = useLanguage()
    return(
        <tr>
            <td className={"td5"}>
                {props.data.username}
            </td>
            <td className={"td6"}>
                {props.groupData.data.length===0 ? "": props.groupData.data[props.groupData.index[props.data.accessLevel]].name[lang]}
            </td>
            <td className={"td7"}>
                {props.data.subCompany}
            </td>
            <td className={"td10"}>
                {props.data.name}
            </td>
            <td className={"td8"}>
                {convertTime(props.data.loginTime)}
            </td>
        </tr>
    )
}

export {ReportAccountReportArticle}
