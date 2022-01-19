import {alarmSettingReducer} from "../alarmSettingReducer";

const PAGE_ALARM_SETTING_RULE_INITIAL_STATE = {
    search: "",
    sortCondition: ["objectId", false]
}

function ruleReducer(state, action){
    switch (action.type) {
        case "":
            return {
            }
        default:
            return alarmSettingReducer(state, action)
    }
}

export {PAGE_ALARM_SETTING_RULE_INITIAL_STATE, ruleReducer};