import {alarmSettingReducer} from "../alarmSettingReducer";

const PAGE_ALARM_SETTING_CATEGORY_INITIAL_STATE = {
    search: "",
    sortCondition: ["id", false],
    isEditor: false
}

function categoryReducer(state, action){
    switch (action.type) {
        case "":
            return {
            }
        default:
            return alarmSettingReducer(state, action)
    }
}

export {PAGE_ALARM_SETTING_CATEGORY_INITIAL_STATE, categoryReducer};