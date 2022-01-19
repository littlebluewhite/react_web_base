import {accountSettingReducer} from "../accountSettingReducer";

const ACCOUNT_PLUGIN_DEFAULT_PAGINATION = {
    current: 1,
    pageSize: 50,
    showSizeChanger: true,
    pageSizeOptions: [20, 50],
    pageMax: 1
};

const PAGE_ACCOUNT_SETTING_PLUGIN_INITIAL_STATE={
    layers: [],
    reFetchData: true,
    search: "",
    filterCondition: {
        "pluginsType": "",
    },
    sortCondition: ["pluginsSchemasName", false],
    pagination: ACCOUNT_PLUGIN_DEFAULT_PAGINATION,
}

function pluginsReducer(state, action){
    switch (action.type) {
        case "RESET_FILTER_ACCOUNT_SETTING_PLUGINS":
            return{
                ...state,
                filterCondition: {"pluginsType":""},
                search: "",
                pagination: {...state.pagination, current: 1}
            }
        case "CHANGE_LAYER":
            return {
                ...state,
                layers: action.payload.value
            }
        case "RE_FETCH_DATA":
            return {
                ...state,
                reFetchData: !state.reFetchData
            }
        default:
            return accountSettingReducer(state, action)
    }
}

// class PluginsReducer extends PageReducerBase {
//     constructor(state, action) {
//         super(state, action);
//     }
//     accountSettingReducer(){
        // ParentClass.prototype.classMethod.call(this)
    // }
// }

export {pluginsReducer, PAGE_ACCOUNT_SETTING_PLUGIN_INITIAL_STATE}