import {fetchCreatePlugins, fetchEditorPlugins} from "../../../function/accountSetting/plugins/pluginsFunction";

const pluginsIndex = {
    "editor": 0,
    "create": 1
}

const pluginsModuleData = {
    "saveTitle": [
        "model.save.editorPlugins.title",
        "model.save.createPlugins.title",
    ],
    "successfulTitle": [
        "model.save.editorPlugins.successful",
        "model.save.createPlugins.successful",
    ],
    "saveFunction": [
        fetchEditorPlugins,
        fetchCreatePlugins
    ]
}

export {pluginsModuleData, pluginsIndex}