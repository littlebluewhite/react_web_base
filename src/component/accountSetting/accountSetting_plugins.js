import {Link, Redirect, Route, Switch, useLocation} from "react-router-dom";
import "../../SCSS/accountSetting/accountSetting_plugins.css"
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from "react";
import {AccountSettingTitle} from "./accountSetting_common";
import {arrayDataHardCopy, checkFetchResult, useLanguage, useModel, useToken} from "../../function/usePackage";
import {
    PAGE_ACCOUNT_SETTING_PLUGIN_INITIAL_STATE,
    pluginsReducer
} from "../../reducer/accountSetting/plugins/pluginsReducer";
import {FilterElement, Sort} from "../common";
import {allConditionData} from "../../data/allConditionData";
import {FormattedMessage} from "react-intl";
import {sortConditionData} from "../../data/sortConditionData";
import {convertToText} from "../../function/convertFunction";
import ReactDOM from "react-dom";
import {pluginsIndex, pluginsModuleData} from "../../data/accountSetting/plugins/moduleData";
import {SERVER} from "../../setting";
import {dealData} from "../../function/dealDataFunction";
import {fetchCreateFolder} from "../../function/accountSetting/plugins/pluginsFunction";


function AccountSettingPluginsIndex() {
    const editorData = useRef([])
    return (
        <Switch>
            <Route exact path={"/accountSetting/plugins"}>
                <AccountSettingPlugins editorData={editorData}/>
            </Route>
            <Route exact path={"/accountSetting/plugins/editor"}>
                <AccountSettingPluginsEditorIndex editorData={editorData}/>
            </Route>
            <Route exact path={"/accountSetting/plugins/create"}>
                <AccountSettingPluginsCreate editorData={editorData}/>
            </Route>
        </Switch>
    )
}

function AccountSettingPlugins(props) {
    const location = useLocation()
    const token = useToken()
    const controller = useRef(false)
    const [variables, dispatch] = useReducer(pluginsReducer, PAGE_ACCOUNT_SETTING_PLUGIN_INITIAL_STATE)
    const [rawData, setRawData] = useState({})
    const lang = useLanguage()
    const [check, setCheck] = useState({})
    props.editorData.current = {
        "data": Object.values(check),
        "layers": variables.layers
    }
    const {data} = useMemo(() => {
            const listData = []
            let targetDict = rawData
            for (let layer of variables.layers) {
                targetDict = targetDict[layer]
            }
            for (let pluginsSchemasName of Object.keys(targetDict)) {
                let pluginsType = 0
                if (pluginsSchemasName.slice(-3) === "csv") {
                    pluginsType = 1
                }
                listData.push({
                    "pluginsSchemasName": pluginsSchemasName,
                    "pluginsType": pluginsType,
                    "schemas": targetDict[pluginsSchemasName]
                })
            }

            return dealData(listData, variables, lang)
        }, [rawData, variables, lang]
    )

    const fetchPluginsSchemas = useCallback(async () => {
        const response = await fetch(SERVER.slice(0, -4) + "9322/api/account/function_plugins", {
                method: "GET",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
            }
        )
        const data = await response.json()
        if (controller.current) {
            setRawData(data)
        }
    }, [token])

    useEffect(() => {
        let {layers} = location.state || {"layers": []}
        const data = {}
        let target_data = data
        for (let layer of layers) {
            target_data[layer] = {}
            target_data = target_data[layer]
        }
        setRawData(data)
        dispatch({
            type: "CHANGE_LAYER",
            payload: {value: layers}
        })
    }, [location])

    useEffect(() => {
        controller.current = true
        fetchPluginsSchemas()
        return () => {
            controller.current = false
        }
        // setRawData(pluginsSchemas)
    }, [fetchPluginsSchemas, location, variables.reFetchData])
    return (
        <div className={"accountSettingPlugins"}>
            <AccountSettingTitle variables={variables} dispatch={dispatch} check={check} setCheck={setCheck}
                                 data={data} setRawData={setRawData} type={"plugins"}/>
            <PluginsFilter dispatch={dispatch} variables={variables}/>
            <PluginsLayers variables={variables} dispatch={dispatch}/>
            <div className={"scrollContainer"}>
                <PluginsSort variables={variables} dispatch={dispatch}/>
                {data.dealData.length === 0 ?
                    <div className={"noDataContainer"}>
                        <FormattedMessage id={"accountSetting.plugins.noData"}/>
                    </div>
                    : <PluginsData data={data.dealData} check={check} setCheck={setCheck} dispatch={dispatch}
                                   variables={variables}/>
                }
            </div>
        </div>
    )
}

function PluginsFilter(props) {
    function handleFilter(event, filter) {
        props.dispatch({
            type: "CHANGE_FILTER_CONDITION",
            payload: {
                filter: filter,
                value: event.target.value
            }
        })
    }

    function handleReset() {
        props.dispatch({
            type: "RESET_FILTER_ACCOUNT_SETTING_PLUGINS"
        })
    }

    return (
        <div className={"pluginsFilter"}>
            <FilterElement filter={allConditionData["pluginsType"]} handleFilter={handleFilter}
                           value={props.variables.filterCondition.pluginsType}/>
            <button className={"secondary_button reset"} onClick={handleReset}>
                <FormattedMessage id={"button.reset"}/>
            </button>
        </div>
    )
}

function PluginsLayers(props) {
    const {dispatch, variables} = props
    const changeLayer = useCallback((layers, item = "") => {
        let newLayers = []
        if (layers.includes(item)) {
            newLayers = layers.slice(0, layers.indexOf(item) + 1)
        }
        dispatch({
            type: "CHANGE_LAYER",
            payload: {value: newLayers}
        })
        dispatch({
            type: "CREATE_FOLDER_MODE_CLOSE"
        })
    }, [dispatch])
    return (
        <div className={"pluginsLayers"}>
            <span className={"photoSpan"}>
                <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 8H20V18H4V8Z" fill="#8FCDCC" fillOpacity="0.3"/>
                    <path
                        d="M20 6H12L10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6ZM20 18H4V8H20V18Z"
                        fill="#8FCDCC" fillOpacity="0.6"/>
                </svg>
            </span>
            <span className={"slash"}>
                /
            </span>
            <span className={"link"} onClick={() => changeLayer(variables.layers)}>Function_Plugins</span>
            {props.variables.layers.map((item, index) => (
                <span key={index} className={"link"} onClick={() => changeLayer(variables.layers, item)}>
                    <span className={"slash"}>/</span>{item}
                </span>
            ))}
            <span className={"slash"}>
                /
            </span>
        </div>
    )
}

function PluginsSort(props) {
    return (
        <div className={"sortContainer"}>
            <Sort data={sortConditionData["pluginsSchemasName"]} sortCondition={props.variables.sortCondition}
                  dispatch={props.dispatch}/>
            <Sort data={sortConditionData["pluginsType"]} sortCondition={props.variables.sortCondition}
                  dispatch={props.dispatch}/>
        </div>
    )
}

function PluginsData(props) {
    const {setCheck, dispatch, variables} = props
    const handleClick = useCallback((item, check) => {
        if (check[item.pluginsSchemasName]) {
            setCheck({})
        } else {
            setCheck({[item.pluginsSchemasName]: item})
        }
    }, [setCheck])

    const changeLayer = useCallback((event, item) => {
        event.stopPropagation()
        let newLayers = [...variables.layers, item.pluginsSchemasName]
        dispatch({
            type: "CHANGE_LAYER",
            payload: {value: newLayers}
        })
        dispatch({
            type: "CREATE_FOLDER_MODE_CLOSE"
        })
        setCheck({})
    }, [dispatch, setCheck, variables])

    return (
        <div className={"pluginsData"}>
            {variables.folderCreate && <FolderCreate variables={variables} dispatch={dispatch}/>}
            <table className={"pluginsTable"}>
                <tbody>
                {props.data.map((item, index) => (
                    <PluginsElement item={item} key={index} check={props.check}
                                    handleClick={handleClick} changeLayer={changeLayer}/>
                ))}
                </tbody>
            </table>
        </div>
    )
}

function FolderCreate(props) {
    const {dispatch, variables} = props
    const token = useToken()
    const inputRef = useRef()

    const handleSave = useCallback(async (event) => {
        event.preventDefault()
        try {
            const response = await fetchCreateFolder(inputRef.current.value, variables.layers, token)
            const response2 = await checkFetchResult(response)
            console.log(response2)
            dispatch({
                type: "RE_FETCH_DATA"
            })
            dispatch({
                type: "CREATE_FOLDER_MODE_CLOSE"
            })
        } catch (e) {
            console.log(e)
            alert(Object.values(await e.json())[0])
        }
    }, [dispatch, variables, token])

    const handleCancel = useCallback(() => {
        dispatch({
            type: "CREATE_FOLDER_MODE_CLOSE"
        })
    }, [dispatch])

    useEffect(() => {
        inputRef.current.focus()
    }, [])

    return (
        <div className={"folderCreate"}>
            <form onSubmit={(event) => handleSave(event)}>
                <div className={"firstLine"}>
                    <div className={"leftContainer"}>
                        <div className={"svgContainer"}>
                            <svg width="1.5rem" height="1.25rem" viewBox="0 0 24 20" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M23.4297 7.16C23.1242 6.76533 22.6882 6.49235 22.1997 6.39C22.1361 6.36285 22.0686 6.34597 21.9997 6.34V5C22.0232 4.36092 21.7921 3.73865 21.357 3.26988C20.922 2.80112 20.3187 2.52422 19.6797 2.5H10.7597C10.6527 2.49916 10.547 2.47656 10.449 2.43358C10.351 2.3906 10.2628 2.32814 10.1897 2.25L9.43968 1.44L8.33968 0.250001C8.26722 0.171052 8.17913 0.108053 8.08099 0.0650115C7.98286 0.0219704 7.87684 -0.000169545 7.76968 9.77577e-07H2.31968C1.68063 0.024216 1.07733 0.301122 0.642314 0.769885C0.207303 1.23865 -0.0238354 1.86092 -0.00031941 2.5V17.5C-0.0177765 18.084 0.174239 18.6551 0.541033 19.1099C0.907826 19.5647 1.4252 19.8733 1.99968 19.98C2.10968 19.99 2.20968 20 2.31968 20H20.2697C20.826 19.9809 21.3572 19.7639 21.7678 19.3881C22.1784 19.0124 22.4414 18.5024 22.5097 17.95L23.9497 9.24C24.0242 8.87648 24.0162 8.50088 23.9262 8.14088C23.8362 7.78088 23.6665 7.44568 23.4297 7.16ZM21.7097 8.32C21.7462 8.32701 21.7809 8.34124 21.8118 8.36185C21.8427 8.38245 21.8692 8.40902 21.8897 8.44C21.9428 8.50457 21.9788 8.58143 21.9946 8.66354C22.0103 8.74564 22.0052 8.83038 21.9797 8.91L20.5797 17.34C20.5497 17.5249 20.4546 17.693 20.3116 17.814C20.1685 17.935 19.987 18.001 19.7997 18H5.29968C5.18487 18.0001 5.07142 17.9752 4.96722 17.927C4.86302 17.8788 4.77058 17.8085 4.69633 17.7209C4.62209 17.6333 4.56782 17.5306 4.53731 17.4199C4.50681 17.3092 4.50079 17.1932 4.51968 17.08L5.92968 8.7L5.93968 8.66C5.94401 8.58237 5.97229 8.50798 6.02065 8.44709C6.069 8.3862 6.13504 8.3418 6.20968 8.32H21.7097ZM9.88968 4.5H19.6797C19.7697 4.5 19.9997 4.65 19.9997 5V6.32H6.20968C5.65413 6.33428 5.12199 6.54674 4.70937 6.91901C4.29675 7.29129 4.03084 7.79884 3.95968 8.35L2.33968 18H2.31968C2.22968 18 1.99968 17.85 1.99968 17.5V2.5C1.99968 2.15 2.22968 2 2.31968 2H6.88968C6.99684 1.99983 7.10286 2.02197 7.20099 2.06501C7.29913 2.10805 7.38722 2.17105 7.45968 2.25L9.31968 4.25C9.39214 4.32895 9.48024 4.39195 9.57837 4.43499C9.6765 4.47803 9.78252 4.50017 9.88968 4.5Z"
                                    fill="#8FCDCC" fillOpacity="0.6"/>
                            </svg>

                        </div>
                        <input className={"input"} type="text" ref={inputRef} required={true}/>
                    </div>
                    <div className={"rightContainer"}>
                        <button className={"secondary_button save"}>
                            <FormattedMessage id={"button.save"}/>
                        </button>
                        <button className={"secondary_button hasMargin"} onClick={() => handleCancel()}>
                            <FormattedMessage id={"button.cancel"}/>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

function PluginsElement(props) {
    const {item, check, handleClick, changeLayer} = props
    const lang = useLanguage()
    const [openHover, setOpenHover] = useState(false)

    let trStyle = null
    let isCheck = false
    let inputContainer = "inputContainer"
    let svgPhoto
    if (item.pluginsType === 1) {
        svgPhoto =
            <div className={"svgContainer csv"}/>
    } else {
        svgPhoto =
            <div className={"svgContainer pointer folder"} onClick={(event) => changeLayer(event, item)}
                 onMouseEnter={() => setOpenHover(true)} onMouseLeave={() => setOpenHover(false)}>
                {openHover &&
                    <div className={"hoverText"}>
                        <FormattedMessage id={"accountSetting.plugins.openFolder"}/>
                    </div>
                }
            </div>
    }
    if (item.pluginsSchemasName in check) {
        trStyle = "active"
        isCheck = true
    }

    return (
        <tr className={trStyle} onClick={() => handleClick(item, check)}>
            <td className={"td1"}>
                <div className={"td1Container"}>
                    <div className={inputContainer}>
                        <input type="radio" checked={isCheck} value={""} readOnly={true}/>
                    </div>
                    {svgPhoto}
                    <div className={"name"}>
                        {item.pluginsSchemasName}
                    </div>
                </div>
            </td>
            <td className={"td2"}>
                {convertToText(item, "pluginsType", lang)}
            </td>
        </tr>
    )
}

function AccountSettingPluginsEditorIndex(props) {
    return (
        <Switch>
            {props.editorData.current.data.length === 0 &&
                <Redirect from={"/accountSetting/plugins/editor"} to={{pathname: "/accountSetting/plugins"}}/>
            }
            <AccountSettingPluginsEditor editorData={props.editorData}/>
        </Switch>
    )
}

function AccountSettingPluginsEditor(props) {
    const {editorData} = props
    const [updateData, setUpdateData] = useState(arrayDataHardCopy(props.editorData.current.data[0].schemas))
    const [isOpen, setIsOpen] = useState(false)
    const model = isOpen && <SavePluginsModel setIsOpen={setIsOpen} type={"editor"}
                                              data={{
                                                  layers: props.editorData.current.layers,
                                                  updateData: updateData,
                                                  filename: props.editorData.current.data[0].pluginsSchemasName
                                              }}

    />

    function handleSubmit(event) {
        event.preventDefault()
        setIsOpen(true)
    }

    const handleReset = useCallback(() => {
        let resetData = [
            {"Name": "", "Condition": ""}
        ]
        if (editorData.current.data.hasOwnProperty(0)) {
            resetData = editorData.current.data[0].schemas
        }
        setUpdateData(arrayDataHardCopy(resetData))
    }, [editorData, setUpdateData])

    return (
        <div className={"accountSettingPluginsEditor"}>
            {model}
            <form onSubmit={(event) => handleSubmit(event)}>
                <div className={"pluginsSchemasName"}>
                    <div className={"title"}>
                        <FormattedMessage id={"accountSetting.plugins.editPlugins"}/>
                    </div>
                    <div className={"secondary_button"} onClick={handleReset}>
                        <FormattedMessage id={"button.reset"}/>
                    </div>
                </div>
                <div className={"pluginsNameContainer"}>
                    <div className={"pluginsName"}>
                        <FormattedMessage id={"accountSetting.plugins.pluginsName"}/>
                    </div>
                    <div className={"value"}>
                        {props.editorData.current.data[0].pluginsSchemasName}
                    </div>
                </div>
                <PluginsSchemas updateData={updateData} setUpdateData={setUpdateData}/>
                <PluginsButton editorData={props.editorData} setUpdateData={setUpdateData}/>
            </form>
        </div>
    )
}

function PluginsSchemas(props) {
    const {setUpdateData} = props

    const handleChange = useCallback((event, index, key) => {
        setUpdateData(pre => {
            let result = [...pre]
            result[index][key] = event.target.value
            return result
        })
    }, [setUpdateData])

    const handleAdd = useCallback(() => {
        setUpdateData(pre => ([...pre, {"Name": "", "Condition": ""}]))
    }, [setUpdateData])

    const handleDelete = useCallback((index) => {
        setUpdateData(pre => {
            let result = [...pre]
            result.splice(index, 1)
            return result
        })
    }, [setUpdateData])

    return (
        <div className={"pluginsSchemas"}>
            {props.updateData.map((item, index) => (
                <div key={index} className={"schemasRow"}>
                    <div className={"svgContainer"} onClick={() => handleDelete(index)}>
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 0C5.3715 0 0 5.373 0 12C0 18.627 5.3715 24 12 24C18.6285 24 24 18.627 24 12C24 5.373 18.6285 0 12 0ZM17.5605 15.4395C17.8418 15.7208 17.9998 16.1022 17.9998 16.5C17.9998 16.8978 17.8418 17.2792 17.5605 17.5605C17.2792 17.8418 16.8978 17.9998 16.5 17.9998C16.1022 17.9998 15.7208 17.8418 15.4395 17.5605L12 14.121L8.5605 17.5605C8.42152 17.7003 8.25628 17.8112 8.07428 17.8869C7.89228 17.9626 7.69711 18.0016 7.5 18.0016C7.30289 18.0016 7.10772 17.9626 6.92572 17.8869C6.74372 17.8112 6.57848 17.7003 6.4395 17.5605C6.30008 17.4213 6.18948 17.256 6.11401 17.074C6.03854 16.8921 5.9997 16.697 5.9997 16.5C5.9997 16.303 6.03854 16.1079 6.11401 15.926C6.18948 15.744 6.30008 15.5787 6.4395 15.4395L9.879 12L6.4395 8.5605C6.15824 8.27924 6.00023 7.89776 6.00023 7.5C6.00023 7.10224 6.15824 6.72076 6.4395 6.4395C6.72076 6.15824 7.10224 6.00023 7.5 6.00023C7.89776 6.00023 8.27924 6.15824 8.5605 6.4395L12 9.879L15.4395 6.4395C15.7208 6.15824 16.1022 6.00023 16.5 6.00023C16.8978 6.00023 17.2792 6.15824 17.5605 6.4395C17.8418 6.72076 17.9998 7.10224 17.9998 7.5C17.9998 7.89776 17.8418 8.27924 17.5605 8.5605L14.121 12L17.5605 15.4395Z"
                                fill="#EC0000"/>
                        </svg>
                    </div>
                    <div className={"column1"}>
                        <input type="text" value={item.Name} required={true}
                               placeholder={"Description of this plugin’s authority detail"}
                               onChange={(event) => handleChange(event, index, "Name")}/>
                    </div>
                    <div className={"column2"}>
                        <input type="text" value={item.Condition} required={true}
                               placeholder={"Condition"}
                               onChange={(event) => handleChange(event, index, "Condition")}/>
                    </div>
                </div>
            ))}
            <div className={"addButtonContainer"}>
                <div className={"addButton"} onClick={handleAdd}>
                    ✚
                </div>
            </div>
        </div>
    )
}

function PluginsButton(props) {
    const {editorData} = props

    return (
        <div className={"pluginsButton"}>
            <Link to={{pathname: "/accountSetting/plugins", state: {"layers": editorData.current.layers}}}>
                <div className={"secondary_button"}>
                    <FormattedMessage id={"button.cancel"}/>
                </div>
            </Link>
            <button className={"secondary_button save"}>
                <FormattedMessage id={"button.save"}/>
            </button>
        </div>
    )
}

function AccountSettingPluginsCreate(props) {
    const {editorData} = props
    const [updateData, setUpdateData] = useState([
        {"Name": "", "Condition": ""}
    ])
    const [filename, setFileName] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const schemasNameRef = useRef()
    const model = isOpen && <SavePluginsModel setIsOpen={setIsOpen} type={"create"}
                                              data={{
                                                  layers: props.editorData.current.layers,
                                                  updateData: updateData,
                                                  filename: filename
                                              }}/>

    const changeName = useCallback((event) => {
        setFileName(event.target.value)
    }, [])

    const handleReset = useCallback(() => {
        let resetData = [
            {"Name": "", "Condition": ""}
        ]
        if (editorData.current.data.hasOwnProperty(0)) {
            resetData = editorData.current.data[0].schemas
        }
        setUpdateData(arrayDataHardCopy(resetData))
    }, [editorData, setUpdateData])

    useEffect(() => {
        schemasNameRef.current.focus()
    }, [])

    function handleSubmit(event) {
        event.preventDefault()
        setIsOpen(true)
    }

    return (
        <div className={"accountSettingPluginsEditor"}>
            {model}
            <form onSubmit={(event) => handleSubmit(event)}>
                <div className={"pluginsSchemasName"}>
                    <div className={"title"}>
                        <FormattedMessage id={"accountSetting.plugins.createNewPlugins"}/>
                    </div>
                    <div className={"secondary_button"} onClick={handleReset}>
                        <FormattedMessage id={"button.reset"}/>
                    </div>
                </div>
                <div className={"pluginsNameContainer"}>
                    <div className={"pluginsName"}>
                        <FormattedMessage id={"accountSetting.plugins.pluginsName"}/>
                    </div>
                    <div className={"value"}>
                        <input type="text" value={filename} required={true} ref={schemasNameRef}
                               onChange={(event) => changeName(event)}/>
                    </div>
                </div>
                <PluginsSchemas updateData={updateData} setUpdateData={setUpdateData}/>
                <PluginsButton editorData={props.editorData} setUpdateData={setUpdateData}/>
            </form>
        </div>
    )
}

function SavePluginsModel(props) {
    const container = useModel()
    const token = useToken()
    const typeIndex = pluginsIndex[props.type]
    const [modelSaved, setModelSaved] = useState(true)

    function handleClose() {
        props.setIsOpen(false)
    }

    const handleSave = useCallback(async () => {
        // API
        try {
            const response = await pluginsModuleData.saveFunction[typeIndex](props.data, token)
            const response2 = await checkFetchResult(response)
            console.log(response2)
            setModelSaved(false)
        } catch (e) {
            const detail = await e.json()
            alert(detail.detail)
            console.log(e)
        }
    }, [typeIndex, props.data, token])

    return (
        ReactDOM.createPortal(
            <div className={"model2"}>
                {modelSaved ?
                    <div className={"alarmSettingModel"}>
                        <div className={"title"}>
                            <FormattedMessage id={pluginsModuleData.saveTitle[typeIndex]}/>
                        </div>
                        <div className={"buttonContainer"}>
                            <button className={"modelButton"} onClick={handleClose}><FormattedMessage
                                id={"button.cancel"}/></button>
                            <button className={"modelButton"} onClick={() => (handleSave(props.data))}>
                                <FormattedMessage id={"button.save"}/>
                            </button>
                        </div>
                    </div> :
                    <div className={"alarmSettingModel"}>
                        <div className={"title2"}>
                            <div className={"image"}>
                                <svg width="5.625rem" height="5rem" viewBox="0 0 90 80" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd"
                                          d="M44.9997 0.25C47.4389 0.25 49.4163 2.22741 49.4163 4.66667V13.5H75.9163C79.4305 13.5 82.8007 14.896 85.2855 17.3808C87.7704 19.8657 89.1664 23.2359 89.1664 26.75V66.5C89.1664 70.0141 87.7704 73.3843 85.2855 75.8692C82.8007 78.354 79.4305 79.75 75.9163 79.75H14.083C10.5689 79.75 7.1987 78.354 4.71384 75.8692C2.22899 73.3843 0.833008 70.0141 0.833008 66.5V26.75C0.833008 23.2359 2.22899 19.8657 4.71384 17.3808C7.1987 14.896 10.5689 13.5 14.083 13.5H40.583V4.66667C40.583 2.22741 42.5604 0.25 44.9997 0.25ZM40.583 22.3333H14.083C12.9116 22.3333 11.7882 22.7987 10.96 23.6269C10.1317 24.4552 9.66634 25.5786 9.66634 26.75V66.5C9.66634 67.6714 10.1317 68.7948 10.96 69.6231C11.7882 70.4513 12.9116 70.9167 14.083 70.9167H75.9163C77.0877 70.9167 78.2111 70.4513 79.0394 69.6231C79.8677 68.7948 80.333 67.6714 80.333 66.5V26.75C80.333 25.5786 79.8677 24.4552 79.0394 23.6269C78.2111 22.7987 77.0877 22.3333 75.9163 22.3333H49.4163V38.1706L55.1266 32.4603C56.8514 30.7355 59.6479 30.7355 61.3727 32.4603C63.0975 34.1851 63.0975 36.9816 61.3727 38.7064L48.1259 51.9532C48.1152 51.9639 48.1045 51.9745 48.0938 51.9851C47.2998 52.7646 46.2126 53.2465 45.0129 53.25C45.0085 53.25 45.0041 53.25 44.9997 53.25C44.9953 53.25 44.9908 53.25 44.9864 53.25C44.3924 53.2482 43.826 53.1292 43.309 52.9149C42.8 52.7042 42.3223 52.3943 41.9056 51.9851C41.8948 51.9745 41.8841 51.9639 41.8735 51.9532L28.6266 38.7064C26.9018 36.9816 26.9018 34.1851 28.6266 32.4603C30.3514 30.7355 33.1479 30.7355 34.8727 32.4603L40.583 38.1706V22.3333Z"
                                          fill="white"/>
                                </svg>
                            </div>
                            <div className={"text"}>
                                <FormattedMessage id={"model.save.success"}/>
                            </div>
                        </div>
                        <div className={"buttonContainer2"}>
                            <div className={"text"}>
                                <FormattedMessage id={pluginsModuleData.successfulTitle[typeIndex]}/>
                            </div>
                            <div className={"button_div"}>
                                <Link to={{
                                    pathname: "/accountSetting/plugins",
                                    state: {"layers": props.data.layers}
                                }}>
                                    <div className={"modelButton"}><FormattedMessage id={"button.continue"}/></div>
                                </Link>
                            </div>
                        </div>
                    </div>}
            </div>,
            container
        )
    )
}

export {AccountSettingPluginsIndex}
