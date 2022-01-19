const now = new Date()
const filter1 = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, -1)
const filter2 = new Date(now.getFullYear(), now.getMonth()-1, 1, 0, 0, -1)
const filter3 = new Date(now.getFullYear(), now.getMonth()-2, 1, 0, 0, -1)
const filter4 = new Date(now.getFullYear(), now.getMonth()-3, 1, 0, 0, -1)
function getFormat(date){
    return (date.getFullYear() + "/" + (date.getMonth()+1).toString().padStart(2, "0"))
}
function getStartValue(date, type){
    if(type==="year"){
        return new Date(date.getFullYear()-1, 0)
    }else if(type==="month"){
        return new Date(date.getFullYear(), date.getMonth()-5)
    }
}

const alarmSearchFastData = [
    {"name": {"CN":"以日为单位","EN":"Sort by Day"}, "type": "month", "type2":"daily", "value": "now",
        "startValue": getStartValue(new Date(), "month"),
        "title": {"CN":"日报表","EN":"Daily Report"}, "text": {"CN":"整月","EN":" "}, "slice": 16, "isNew": true},
    {"name": {"CN":"以周为单位","EN":"Sort by Week"}, "type": "year", "type2":"weekly", "value": "now",
        "startValue": getStartValue(new Date(), "year"),
        "title": {"CN":"周报表","EN":"Weekly Report"}, "text": {"CN":"整年","EN":" "}, "slice": 27},
    {"name": {"CN":"以月为单位","EN":"Sort by Month"}, "type": "year", "type2":"monthly", "value": "now",
        "startValue": getStartValue(new Date(), "year"),
        "title": {"CN":"月报表","EN":"Monthly Report"}, "text": {"CN":"整年","EN":" "}, "slice": 6},
    {"name": {"CN":getFormat(filter1),"EN":getFormat(filter1)}, "type": "month", "type2":"daily", "value": filter1,
        "startValue": getStartValue(filter1, "month"),
        "title": {"CN":"日报表","EN":"Daily Report"}, "text": {"CN":"整月","EN":" "}, "slice": 16, "isNew": false},
    {"name": {"CN":getFormat(filter2),"EN":getFormat(filter2)}, "type": "month", "type2":"daily", "value": filter2,
        "startValue": getStartValue(filter2, "month"),
        "title": {"CN":"日报表","EN":"Daily Report"}, "text": {"CN":"整月","EN":" "}, "slice": 16, "isNew": false},
    {"name": {"CN":getFormat(filter3),"EN":getFormat(filter3)}, "type": "month", "type2":"daily", "value": filter3,
        "startValue": getStartValue(filter3, "month"),
        "title": {"CN":"日报表","EN":"Daily Report"}, "text": {"CN":"整月","EN":" "}, "slice": 16, "isNew": false},
    {"name": {"CN":getFormat(filter4),"EN":getFormat(filter4)}, "type": "month", "type2":"daily", "value": filter4,
        "startValue": getStartValue(filter4, "month"),
        "title": {"CN":"日报表","EN":"Daily Report"}, "text": {"CN":"整月","EN":" "}, "slice": 16, "isNew": false},
]

const MonthSearchData = {
    0: ["JAN", "January"],
    1: ["FEB", "February"],
    2: ["MAR", "March"],
    3: ["APR", "April"],
    4: ["MAY", "May"],
    5: ["JUN", "June"],
    6: ["JUL", "July"],
    7: ["AUG", "August"],
    8: ["SEP", "September"],
    9: ["OCT", "October"],
    10:["NOV", "November"],
    11:["DEC", "December"],
}

export {alarmSearchFastData, MonthSearchData}
