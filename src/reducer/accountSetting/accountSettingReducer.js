import {pageReducer} from "../pageReducer";

function accountSettingReducer(state, action){
    switch (action.type) {
        case "":
            return {
            }
        default:
            return pageReducer(state, action)
    }
}

export {accountSettingReducer}