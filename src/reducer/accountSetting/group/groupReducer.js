import {accountSettingReducer} from "../accountSettingReducer";

const PAGE_ACCOUNT_SETTING_GROUP_INITIAL_STATE={
    isEdit: false,
    isSaveActive: false,
    isCreate: false,
    search: "",
    sortCondition: ["groupName", false],
}

function groupReducer(state, action){
    switch (action.type) {
        case "IS_EDIT_TURN_ON":
            return{
                ...state,
                isEdit: true
            }
        case "IS_EDIT_TURN_OFF":
            return{
                ...state,
                isEdit: false,
                isSaveActive: false
            }
        case "IS_CREATE_TURN_ON":
            return{
                ...state,
                isCreate: true
            }
        case "IS_CREATE_TURN_OFF":
            return{
                ...state,
                isCreate: false,
            }
        case "SAVE_ACTIVE":
            return{
                ...state,
                isSaveActive: true
            }
        default:
            return accountSettingReducer(state, action)
    }
}

export {groupReducer, PAGE_ACCOUNT_SETTING_GROUP_INITIAL_STATE}