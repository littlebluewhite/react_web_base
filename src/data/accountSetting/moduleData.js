import {deleteAccount, deletePlugin, handlePluginsDelete} from "../../function/accountSetting/accountSettingFunction";
import {handleSettingDelete} from "../../function/usePackage";

const accountSettingIndex = {
    "userList": 0,
    "plugins": 1
}

const accountSettingModuleData = {
    "updateUrl": [
        "/accountSetting/userList/editor",
        "/accountSetting/plugins/editor"
    ],
    "createUrl": [
        "/accountSetting/userList/create",
        "/accountSetting/plugins/create"
    ],
    "deleteFetch": [
        deleteAccount,
        deletePlugin
    ],
    "handleDelete": [
        handleSettingDelete,
        handlePluginsDelete
    ],
    "deleteTitle": [
        "model.delete.title.accountSetting.userList",
        "model.delete.title.accountSetting.plugins"
    ],
    "deleteText": [
        "accountSetting.account",
        "accountSetting.plugins"
    ]
}

export {accountSettingIndex, accountSettingModuleData}