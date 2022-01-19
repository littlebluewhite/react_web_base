import {ACCOUNT_DEFAULT_PAGINATION} from "../../pageReducer";
import {accountSettingReducer} from "../accountSettingReducer";

const ACCOUNT_SETTING_USER_LIST_INITIAL_STATE={
    search: "",
    filterCondition: {"accessLevel": ""},
    sortCondition: ["username", false],
    pagination: ACCOUNT_DEFAULT_PAGINATION,
}

function userListReducer(state, action){
    switch (action.type) {
        case "":
            return {
            }
        case "RESET_FILTER_ACCOUNT_SETTING_USER_LIST":
            return{
                ...state,
                filterCondition: {"accessLevel":""},
                search: "",
                pagination: {...state.pagination, current: 1}
            }
        default:
            return accountSettingReducer(state, action)
    }
}


export {ACCOUNT_SETTING_USER_LIST_INITIAL_STATE, userListReducer}