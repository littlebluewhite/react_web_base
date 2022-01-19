import {pageReducer} from "../pageReducer";

function alarmSettingReducer(state, action){
    switch (action.type) {
        case "":
            return {
            }
        default:
            return pageReducer(state, action)
    }
}

export {alarmSettingReducer}