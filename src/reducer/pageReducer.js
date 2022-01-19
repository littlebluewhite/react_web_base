const DEFAULT_PAGINATION = {
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    pageSizeOptions: [20, 50],
    pageMax: 1
};

const ACCOUNT_DEFAULT_PAGINATION = {
    current: 1,
    pageSize: 50,
    showSizeChanger: true,
    pageSizeOptions: [20, 50],
    pageMax: 1
};

const REPORT_CHARGER_DEFAULT_PAGINATION = {
    current: 1,
    pageSize: 40,
    showSizeChanger: true,
    pageSizeOptions: [20, 50],
}

const REPORT_VISITOR_DEFAULT_PAGINATION = (pageMax) => {
    return{
        current: pageMax,
        pageMax: pageMax
    }
}

const PAGE_ALARM_INITIAL_STATE = {
    filterCondition: {"floor":"", "category":"", "status": ""},
    datetime: {firstDate: "", firstTime: "00:00", lastDate: "", lastTime: "00:00"},
    search: "",
    pagination: DEFAULT_PAGINATION,
    sortCondition: ["time", false]
};

const PAGE_ACCESS_INSTANT_INITIAL_STATE = {
    filterCondition: {"floor":"", "connectStatus": ""},
    search: "",
    pagination: DEFAULT_PAGINATION,
    sortCondition: ["floor", false]
};

const PAGE_ACCESS_PERIOD_INITIAL_STATE = {
    filterCondition: {"floor":"", "IOresult": ""},
    search: "",
    pagination: DEFAULT_PAGINATION,
    sortCondition: ["time", false]
};

const PAGE_REPORT_ACCOUNT_INITIAL_STATE = {
    filterCondition: {
        "accessLevel": "",
        "subCompany": ""
    },
    search: "",
    sortCondition: ["username", false]
}


const PAGE_REPORT_CHARGER_INITIAL_STATE={
    sortCondition: ["chargerId", false],
    search: "",
    filterCondition: {"cardId":""}
}

const PAGE_REPORT_CHARGER_USAGE_INITIAL_STATE={
    sortCondition: ["date", false],
    pagination: REPORT_CHARGER_DEFAULT_PAGINATION
}

const PAGE_REPORT_VISITOR_INITIAL_STATE = (pageMax) => {
    return {
        sortCondition: ["timeText", false],
        pagination: REPORT_VISITOR_DEFAULT_PAGINATION(pageMax)
    }
}

// class PageReducerBase{
//     constructor(state, action) {
//         this.state = state
//         this.action = action
//     }
//     pageReducer() {
//         switch (this.action.type) {
//             case "CHANGE_FILTER_CONDITION":
//                 return {
//                     ...this.state,
//                     filterCondition: {...this.state.filterCondition, [this.action.payload.filter]: this.action.payload.value},
//                     pagination: {...this.state.pagination, current: 1}
//                 }
//             case "CHANGE_FILTER_CONDITION(NO_CHANGE_PAGE)":
//                 return {
//                     ...this.state,
//                     filterCondition: {...this.state.filterCondition, [this.action.payload.filter]: this.action.payload.value},
//                 }
//             case "CHANGE_KEYWORD":
//                 return {
//                     ...this.state,
//                     search: this.action.payload.keyword,
//                     pagination: {...this.state.pagination, current: 1}
//                 }
//             case "RESET_FILTER":
//                 return {
//                     ...this.state,
//                     filterCondition: {"floor": "", "category": "", "status": ""},
//                     search: ""
//                 }
//             case "RESET_ALARM_HISTORY_SEARCH":
//                 return {
//                     ...this.state,
//                     filterCondition: {"floor": "", "category": "", "status": ""},
//                     datetime: {firstDate: "", firstTime: "", lastDate: "", lastTime: ""},
//                 }
//             case "RESET_FILTER_ACCOUNT":
//                 return {
//                     ...this.state,
//                     filterCondition: {"accessLevel": ""},
//                     search: ""
//                 }
//             case "RESET_FILTER_ACCOUNT_SETTING":
//                 return {
//                     ...this.state,
//                     filterCondition: {"accessLevel": ""},
//                     search: "",
//                     pagination: {...this.state.pagination, current: 1}
//                 }
//             case "CHANGE_DATETIME":
//                 return {
//                     ...this.state,
//                     datetime: {...this.state.datetime, [this.action.payload.dateType]: this.action.payload.value}
//                 }
//
//             case "TO_NEXT_PAGE":
//                 return {
//                     ...this.state,
//                     pagination: {...this.state.pagination, current: this.state.pagination.current + 1}
//                 }
//             case "TO_PREVIOUS_PAGE":
//                 return {
//                     ...this.state,
//                     pagination: {...this.state.pagination, current: this.state.pagination.current - 1}
//                 }
//             case "CHANGE_PAGESIZE":
//                 return {
//                     ...this.state,
//                     pagination: {
//                         ...this.state.pagination,
//                         pageSize: this.action.payload.value,
//                         current: 1
//                     }
//                 }
//             case "CHANGE_PAGE_MAX":
//                 return {
//                     ...this.state,
//                     pagination: {
//                         ...this.state.pagination,
//                         current: this.action.payload.value,
//                         pageMax: this.action.payload.value,
//                     }
//                 }
//             case "CHANGE_SORT_CATEGORY":
//                 return {
//                     ...this.state,
//                     sortCondition: [this.action.payload.value, false]
//                 }
//             case "CHANGE_SORT_WAY":
//                 return {
//                     ...this.state,
//                     sortCondition: [this.state.sortCondition[0], !this.state.sortCondition[1]]
//                 }
//             case "SWITCH_ON_EDITOR":
//                 return {
//                     ...this.state,
//                     isEditor: true
//                 }
//             case "SWITCH_OFF_EDITOR":
//                 return {
//                     ...this.state,
//                     isEditor: false
//                 }
//             default:
//                 throw new Error(`error action type: ${this.action.type}`)
//         }
//     }
// }

function pageReducer(state, action){
    switch (action.type){
        case "CHANGE_FILTER_CONDITION":
            return{
                ...state,
                filterCondition: { ...state.filterCondition, [action.payload.filter]: action.payload.value},
                pagination: {...state.pagination, current: 1}
            }
        case "CHANGE_FILTER_CONDITION(NO_CHANGE_PAGE)":
            return{
                ...state,
                filterCondition: { ...state.filterCondition, [action.payload.filter]: action.payload.value},
            }
        case "CHANGE_KEYWORD":
            return{
                ...state,
                search: action.payload.keyword,
                pagination: {...state.pagination, current: 1}
            }
        case "RESET_FILTER":
            return{
                ...state,
                filterCondition: {"floor": "", "category": "", "status": ""},
                search: ""
            }
        case "RESET_ALARM_HISTORY_SEARCH":
            return{
                ...state,
                filterCondition: {"floor": "", "category": "", "status": ""},
                datetime: {firstDate: "", firstTime: "", lastDate: "", lastTime: ""},
            }
        case "RESET_FILTER_ACCOUNT":
            return{
                ...state,
                filterCondition: {"accessLevel":""},
                search: ""
            }
        case "CHANGE_DATETIME":
            return{
                ...state,
                datetime: {...state.datetime, [action.payload.dateType]: action.payload.value}
            }

        case "TO_NEXT_PAGE":
            return{
                ...state,
                pagination: {...state.pagination, current: state.pagination.current+1}
            }
        case "TO_PREVIOUS_PAGE":
            return{
                ...state,
                pagination: {...state.pagination, current: state.pagination.current-1}
            }
        case "CHANGE_PAGESIZE":
            return{
                ...state,
                pagination: {
                    ...state.pagination,
                    pageSize: action.payload.value,
                    current: 1
                }
            }
        case "CHANGE_PAGE_MAX":
            return{
                ...state,
                pagination: {
                    ...state.pagination,
                    current: action.payload.value,
                    pageMax: action.payload.value,
                }
            }
        case "CHANGE_SORT_CATEGORY":
            return{
                ...state,
                sortCondition: [action.payload.value, false]
            }
        case "CHANGE_SORT_WAY":
            return{
                ...state,
                sortCondition: [state.sortCondition[0], !state.sortCondition[1]]
            }
        case "SWITCH_ON_EDITOR":
            return{
                ...state,
                isEditor: true
            }
        case "SWITCH_OFF_EDITOR":
            return{
                ...state,
                isEditor: false
            }
        default:
            throw new Error(`error action type: ${action.type}`)
    }
}

export {PAGE_REPORT_ACCOUNT_INITIAL_STATE, PAGE_ALARM_INITIAL_STATE, PAGE_ACCESS_INSTANT_INITIAL_STATE,
    PAGE_ACCESS_PERIOD_INITIAL_STATE, ACCOUNT_DEFAULT_PAGINATION,
    PAGE_REPORT_CHARGER_INITIAL_STATE, PAGE_REPORT_CHARGER_USAGE_INITIAL_STATE, PAGE_REPORT_VISITOR_INITIAL_STATE,
    pageReducer,
    // PageReducerBase,
}
