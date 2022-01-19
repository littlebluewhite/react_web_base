import {convertTime} from "./convertFunction";
import {comboChartFloor} from "../data/reportAccessComboChartFloor";
import {allConditionData} from "../data/allConditionData";

function dealChartData(data, filters) {
    const chartData = {}
    for (let item of filters) {
        chartData[item] = {}
    }
    for (let datum of data) {
        for (let item of filters) {
            if (chartData[item].hasOwnProperty(datum[item])) {
                chartData[item][datum[item]] += 1
            } else {
                chartData[item][datum[item]] = 1
            }
        }
    }
    return chartData
}

function eventFilter(data, filterCondition) {
    return data.filter((datum) => {
        for (let filter in filterCondition) {
            if (filterCondition.hasOwnProperty(filter)) {
                if (datum[filter].toString() !== filterCondition[filter].toString() && filterCondition[filter] !== "") {
                    return false
                }
            }
        }
        return true
    })
}

function eventSearch(data, search, lang) {
    return data.filter((datum) => {
        for (let attr in datum) {
            if (attr in allConditionData && datum.hasOwnProperty(attr)) {
                if (allConditionData[attr].data[allConditionData[attr].index[datum[attr]]].name[lang].indexOf(search.toString()) !== -1) {
                    return true
                }
            } else if ((attr === "loginTime" || attr === "time") &&
                typeof (datum[attr]) === 'number') {
                const stringTime = convertTime(datum[attr])
                if (stringTime.indexOf(search.toString()) !== -1) {
                    return true
                }
            } else {
                if (!datum[attr]) {
                    datum[attr] = ""
                }
                if (datum[attr].toString().indexOf(search.toString()) !== -1) {
                    return true
                }
            }
        }
        return false
    })
}

function eventSort(data, sortCondition) {
    const result = []
    for (let datum of data) {
        result.push(datum)
    }
    if (sortCondition[0] === "floor") {
        result.sort((a, b) => {
            return a.floor - b.floor
        })
    } else {
        result.sort((a, b) => {
            if (a[sortCondition[0]] < b[sortCondition[0]]) {
                return -1
            } else if (b[sortCondition[0]] > a[sortCondition[0]]) {
                return 1
            }
            return 0
        })
    }
    if (sortCondition[1] === true) {
        result.reverse()
    }
    return result
}

function dealData(data, params, lang) {
    const {filterCondition, pagination, sortCondition, search} = params
    const filteredData = eventFilter(data, filterCondition)
    const searchedData = eventSearch(filteredData, search, lang)
    const sortedData = eventSort(searchedData, sortCondition)
    const {upNumber, downNumber} = pageDownUp(pagination, sortedData.length)
    return {
        data: {
            dealData: sortedData.slice(downNumber - 1, upNumber),
            metadata: {
                totalCount: sortedData.length,
                maxPage: Math.ceil(sortedData.length / pagination.pageSize),
                downNumber: downNumber,
                upNumber: upNumber,
            }
        }
    }
}

function dealAlarmSettingRuleData(data, params, lang) {
    const {sortCondition, search} = params
    const searchedData = eventSearch(data, search, lang)
    return eventSort(searchedData, sortCondition)
}

function dealAccessInstantData(data, params, lang) {
    const {filterCondition, pagination, sortCondition, search} = params
    const filteredData = eventFilter(data, filterCondition)
    const searchedData = eventSearch(filteredData, search, lang)
    const sortedData = eventSort(searchedData, sortCondition)
    const chartData = dealChartData(sortedData, ["floor", "connectStatus"])
    const {upNumber, downNumber} = pageDownUp(pagination, searchedData.length)
    return {
        data: {
            dealData: sortedData.slice(downNumber - 1, upNumber),
            metadata: {
                totalCount: sortedData.length,
                maxPage: Math.ceil(sortedData.length / pagination.pageSize),
                downNumber: downNumber,
                upNumber: upNumber,
                chartData: chartData
            }
        }
    }
}

function dealAccessPeriodData(data, params, timeData, lang) {
    const {filterCondition, pagination, sortCondition, search} = params
    const filteredData = eventFilter(data, filterCondition)
    const searchedData = eventSearch(filteredData, search, lang)
    const sortedData = eventSort(searchedData, sortCondition)
    const chartData = dealChartData(sortedData, ["floor", "IOresult"])
    const comboData = comboChartData(sortedData, timeData)
    const {upNumber, downNumber} = pageDownUp(pagination, sortedData.length)
    return {
        data: {
            dealData: sortedData.slice(downNumber - 1, upNumber),
            metadata: {
                totalCount: sortedData.length,
                maxPage: Math.ceil(sortedData.length / pagination.pageSize),
                downNumber: downNumber,
                upNumber: upNumber,
                chartData: chartData,
                comboData: comboData
            }
        }
    }
}

function dealChargerInformation(data, params, lang) {
    const {sortCondition, search, filterCondition} = params
    const informationData = []
    for (let datum of data) {
        let element = {...datum}
        element.chargeTime = (new Date(datum.endTime) - new Date(datum.startTime)) / 1000
        informationData.push(element)
    }
    const filteredData = eventFilter(informationData, filterCondition)
    const searchedData = eventSearch(filteredData, search, lang)
    let totalCount = 0
    for (let datum of searchedData) {
        totalCount += datum.cost
    }
    return ([
        eventSort(searchedData, sortCondition),
        totalCount
    ])
}

function dealChargerUsage(data, params, chargers) {
    const {pagination, sortCondition} = params
    const usageData = []
    for (let datum of data) {
        let element = {...datum}
        element.charger = chargers
        usageData.push(element)
    }
    const sortedData = eventSort(usageData, sortCondition)
    const {upNumber, downNumber} = pageDownUp(pagination, sortedData.length)
    return {
        data: {
            dealData: sortedData.slice(downNumber - 1, upNumber),
            metadata: {
                totalCount: sortedData.length,
                maxPage: Math.ceil(sortedData.length / pagination.pageSize),
                downNumber: downNumber,
                upNumber: upNumber,
            }
        }
    }
}

function dealVisitorData(data, params, type) {
    const {pagination, sortCondition} = params
    const pageData = data[pagination.current]
    const chart1Data = {
        "chartTitle": [],
        "totalData": [],
        "presentData": [],
        "absentData": []
    }
    const chart2Data = {
        "business": 0,
        "document": 0,
        "training": 0,
        "meeting": 0,
        "other": 0
    }
    const title = {
        "title": pageData.title,
        "totalData": 0,
        "presentData": 0,
        "absentData": 0
    }
    for (let datum of pageData.data) {
        if (type === "day") {
            let result = []
            result.push(datum.timeText.slice(0, 4))
            result.push(datum.timeText.slice(5))
            chart1Data.chartTitle.push(result)
        } else if (type === "week") {
            let result = []
            result.push(datum.timeText.slice(0, 3))
            result.push(datum.timeText.slice(4))
            chart1Data.chartTitle.push(result)
        } else if (type === "month") {
            chart1Data.chartTitle.push(datum.timeText.slice(0, 3).toUpperCase())
        }
        chart1Data.totalData.push(parseInt(datum.total))
        title.totalData += parseInt(datum.total)
        chart1Data.presentData.push(parseInt(datum.present))
        title.presentData += parseInt(datum.present)
        chart1Data.absentData.push(parseInt(datum.absent))
        title.absentData += parseInt(datum.absent)
        chart2Data.business += parseInt(datum.business)
        chart2Data.document += parseInt(datum.document)
        chart2Data.training += parseInt(datum.training)
        chart2Data.meeting += parseInt(datum.meeting)
        chart2Data.other += parseInt(datum.other)
    }
    return {
        "dealData": eventSort(pageData.data, sortCondition),
        "chartData": {"chart1Data": chart1Data, "chart2Data": chart2Data},
        "title": title
    }
}

function dealAlarmHistorySearchData(data, params) {
    const {pagination, sortCondition} = params
    const sortedData = eventSort(data, sortCondition)
    const {upNumber, downNumber} = pageDownUp(pagination, data.length)
    return {
        data: {
            dealData: sortedData.slice(downNumber - 1, upNumber),
            metadata: {
                totalCount: data.length,
                maxPage: Math.ceil(data.length / pagination.pageSize),
                downNumber: downNumber,
                upNumber: upNumber
            }
        }
    }
}

function dealReportAlarmSelfData(events, params, selfSelect) {
    const statisticData = {}
    const labels = []
    const dealData = {"index": {}}
    const startDate = new Date(selfSelect.start)
    const periodDate = (new Date(selfSelect.end) - startDate) / 86400000 + 1
    const {filterCondition, pagination} = params

    function dateFormat(startDate, step) {
        let nextDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + step)
        return `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, "0")}-${(nextDate.getDate()).toString().padStart(2, "0")}`
    }

    let eventData = eventFilter(events, filterCondition)
    dealData.tableData = Array.from(Array(periodDate).keys(), x => ({
        "datetime": dateFormat(startDate, x),
        "data": []
    }))

    for (let i = 0; i < periodDate; i++) {
        let date = dateFormat(startDate, i)
        dealData.index[date] = i
    }
    for (let item of eventData) {
        let index = dealData.index[convertTime(item.time).slice(0, 10)]
        dealData.tableData[index].data.push(item)
        if (statisticData.hasOwnProperty(item.message)) {
            statisticData[item.message] += 1
        } else {
            statisticData[item.message] = 1
            labels.push(item.message)
        }
    }
    const {upNumber, downNumber} = pageDownUp(pagination, periodDate)

    return {
        data: {
            dealData: dealData,
            showData: dealData.tableData.slice(downNumber - 1, upNumber),
            metadata: {
                totalEvents: eventData.length,
                maxPage: Math.ceil(periodDate / pagination.pageSize),
                totalCount: periodDate,
                downNumber: downNumber,
                upNumber: upNumber,
                statisticData: statisticData,
                labels: labels
            }
        }
    }
}

function dealIndexTableData(data, params) {
    const {sortCondition} = params
    const sortedData = eventSort(data, sortCondition)
    return {
        data: {
            dealData: sortedData
        }
    }
}

function dealAccountData(data, params, lang) {
    const {filterCondition, sortCondition, search} = params
    const filteredData = eventFilter(data, filterCondition)
    const searchedData = eventSearch(filteredData, search, lang)
    const dealEvents = eventSort(searchedData, sortCondition)
    const AccountStatistic = {
        "chart1": {"title": {"CN": "帐号级别", "EN": "Access Level"}, "property": "accessLevel", "labels": [], "data": {}},
        "chart2": {"title": {"CN": "所属公司", "EN": "Company"}, "property": "company", "labels": [], "data": {}},
        "chart3": {
            "title": {"CN": "帐号状态", "EN": "Account Status"},
            "property": "accountStatus",
            "labels": [],
            "data": {}
        },
        "chart4": {"title": {"CN": "性别", "EN": "Gender"}, "property": "gender", "labels": [], "data": {}}
    }
    for (let item of searchedData) {
        chartCount(AccountStatistic.chart1, item.accessLevel)
        chartCount(AccountStatistic.chart2, item.company)
        chartCount(AccountStatistic.chart3, item.accountStatus)
        chartCount(AccountStatistic.chart4, item.gender)
    }
    return {
        "account": dealEvents,
        "statistic": AccountStatistic,
    }
}

function dealReportAlarmFastData(data, params) {
    const dealData = {}
    dealData.title = data[params.pagination.current - 1].title
    dealData.data = eventFilter(data[params.pagination.current - 1].data, params.filterCondition)
    dealData.timestamp = data[params.pagination.current - 1].timestamp
    return dealData
}

function pageDownUp(pagination, dataLength) {
    const downNumber = (pagination.current - 1) * pagination.pageSize + 1
    let upNumber = (pagination.current - 1) * pagination.pageSize
    dataLength - downNumber < pagination.pageSize ? upNumber += (dataLength - downNumber + 1) :
        upNumber += pagination.pageSize
    return {downNumber, upNumber}
}

function comboChartData(data, timeData) {
    const periodDatetime = Math.ceil((timeData.end - timeData.start) / 3600) + 1
    const startDate = new Date(timeData.start * 1000)
    // console.log(timeData)
    const comboData = {}

    function datetimeFormat(startDate, step) {
        let nextDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours() + step)
        return `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, "0")}-${(nextDate.getDate()).toString().padStart(2, "0")}-${(nextDate.getHours().toString().padStart(2, "0"))}:00`
    }

    for (let i of Array(periodDatetime).keys()) {
        let data = datetimeFormat(startDate, i)
        comboData[data.slice(0, 10)] = {
            ...comboData[data.slice(0, 10)],
            [parseInt(data.slice(11, 13))]: {
                "datetime": [data.slice(0, 4), data.slice(5, 10), data.slice(11, 16), data.slice(11, 14) + "59"],
                "data": {...comboChartFloor}
            }
        }
    }
    // console.log(comboData)
    for (let datum of data) {
        comboData[datum.time.slice(0, 10)][parseInt(datum.time.slice(11, 13))].data[datum.floor]++
        comboData[datum.time.slice(0, 10)][parseInt(datum.time.slice(11, 13))].data.total++
    }
    // console.log(comboData)
    return comboData
}

function chartCount(chart, value) {
    if (chart.data.hasOwnProperty(value)) {
        chart.data[value] += 1
    } else {
        chart.data[value] = 1
        chart.labels.push(value)
    }
}

function dealAccountGroupData(data, params){
    const {search, sortCondition} = params
    const searchedData = eventSearch(data, search)
    return eventSort(searchedData, sortCondition)
}

export {dealReportAlarmFastData, dealAccountData, dealIndexTableData,
    dealReportAlarmSelfData, dealAlarmHistorySearchData, dealVisitorData,
    dealChargerUsage, dealChargerInformation, dealAccessPeriodData,
    dealAccessInstantData, dealAlarmSettingRuleData, dealData, eventSort,
    dealAccountGroupData
}