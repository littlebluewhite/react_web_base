import {Link, Redirect, Route, Switch} from "react-router-dom";
import "../SCSS/alarmSetting.css"
import {ModelLoading, OptionAuto, Sort} from "./common";
import {sortConditionData} from "../data/sortConditionData";
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from "react";
import {
    arrayDataHardCopy, checkFetchResult, handleSettingDelete, placeholder, useCategoryColor, useLanguage,
    useModel, useTemplate, useToken
} from "../function/usePackage";
import ReactDOM from 'react-dom';
import {FormattedMessage} from "react-intl";
import {allConditionData} from "../data/allConditionData";
import {SERVER} from "../setting";
import {downloadUrlGenerator} from "../function/download";
import {categoryReducer, PAGE_ALARM_SETTING_CATEGORY_INITIAL_STATE} from "../reducer/alarmSetting/category/category";
import {PAGE_ALARM_SETTING_RULE_INITIAL_STATE, ruleReducer} from "../reducer/alarmSetting/rule/rule";
import {convertToText} from "../function/convertFunction";
import {dealAlarmSettingRuleData} from "../function/dealDataFunction";

function AlarmSettingArticle(){
    const template = useTemplate()
    return(
        <div className={"article_container1"}>
            <Switch>
                {!template.Alarm_CRUD.R &&
                    <Redirect to={"/"}/>}
                <Redirect exact from={"/alarmSetting"} to={{pathname:"/alarmSetting/category"}}/>
                <Route path={"/alarmSetting/category"}>
                    <AlarmSettingCategory/>
                </Route>
                <Route path={"/alarmSetting/rule"}>
                    <AlarmSettingRule/>
                </Route>
            </Switch>
        </div>
    )
}

function  AlarmSettingCategory() {
    const controller = useRef(false)
    const token = useToken()
    const lang = useLanguage()
    const [variables, dispatch] = useReducer(categoryReducer, PAGE_ALARM_SETTING_CATEGORY_INITIAL_STATE)
    const initialData = useRef([])
    const [data, setData] = useState([])

    const fetchCategory = useCallback(async (token, lang)=>{
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/alarmSetting/category",{
                headers: new Headers({
                    Authorization: "Bearer "+ token,
                })
            })
            const rawData = await response.json()
            if(controller.current){
                const langMapping = {"EN": 0, "CN": 1}
                const data = []
                for(let datum of rawData.slice(5, 8)){
                    let result = {}
                    result.id = datum.id
                    result.name = datum.Category[langMapping[lang]].CategoryNameScope
                    // result.colorCode = datum.Color.slice(1, -1).split(", ")
                    result.colorCode = datum.Color
                    result.notification = datum.Category[langMapping[lang]].CategoryDetail
                    data.push(result)
                }
                setData(data)
                initialData.current = arrayDataHardCopy(data)
            }
        }catch(e){
            console.log(e)
        }
    },[])

    useEffect(()=>{
        controller.current = true
        fetchCategory(token, lang)
        // const data2 = arrayDataHardCopy(categoryAlarmData)
        // setData(data2)
        return ()=>{
            controller.current = false
            setData(initialData.current)
        }
    }, [fetchCategory, token, lang])

    const dealData = useMemo(()=> {
        return dealAlarmSettingRuleData(data, variables, lang)},
        [data, variables, lang])

    return(
        <div className={"alarmSettingCategory"}>
            <SearchEditorContainer variables={variables} dispatch={dispatch}/>
            <SortContainer variables={variables} dispatch={dispatch}/>
            <CategoryContainer data={dealData} setData={setData} variables={variables}
                               initialData={initialData} dispatch={dispatch}
            />
        </div>
    )
}

function SearchEditorContainer(props) {
    const lang = useLanguage()
    function handleEditor() {
        props.dispatch({
            type: "SWITCH_ON_EDITOR"
        })
    }

    function handleSearch(event) {
        props.dispatch({
            type: "CHANGE_KEYWORD",
            payload: {keyword: event.target.value}
        })
    }

    return(
        <div className={"searchEditorContainer"}>
            <div className={"inputContainer"}>
                <input type="text" className={"search"} placeholder={placeholder(lang)} value={props.variables.search}
                       onChange={(event) => {handleSearch(event)}}/>
            </div>
            {!props.variables.isEditor &&
            <div className={"editor"} onClick={handleEditor}>
                <svg height="63.16%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M23.1822 5.04862L19.0573 0.923729C18.5189 0.418048 17.8135 0.127895 17.0751 0.108465C16.3368 0.0890345 15.6171 0.341683 15.0528 0.818349L1.50395 14.3672C1.01734 14.858 0.714355 15.5011 0.645851 16.1888L-0.00148524 22.4665C-0.021765 22.687 0.00684633 22.9092 0.082309 23.1174C0.157772 23.3256 0.278227 23.5145 0.43509 23.6708C0.575758 23.8103 0.742584 23.9207 0.926003 23.9957C1.10942 24.0706 1.30582 24.1085 1.50395 24.1074H1.63944L7.91709 23.5353C8.60477 23.4668 9.24795 23.1638 9.73867 22.6772L23.2876 9.12834C23.8134 8.57278 24.0976 7.83142 24.0779 7.0667C24.0581 6.30198 23.736 5.57628 23.1822 5.04862ZM7.64611 20.5245L3.12982 20.946L3.53628 16.4297L12.042 8.02937L16.1066 12.094L7.64611 20.5245ZM18.0637 10.0768L14.0292 6.0422L16.9647 3.03133L21.0746 7.14117L18.0637 10.0768Z"
                        fill="#00EAFF"/>
                </svg>
            </div>
            }
        </div>
    )
}

function SortContainer(props) {
    return(
        <div className={"sortContainer"}>
            <div className={"switchTitle"}/>
            <Sort data={sortConditionData["id"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["colorCode"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["notification"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
        </div>
    )
}

function CategoryContainer(props) {
    const {setData} = props
    const handleSwitch = useCallback((event, index)=>{
        let value
        event.target.value==="1"? value=true: value=false
        setData(pre=>{
            let a = [...pre]
            a[index].openStatus = value
            return a
        })}, [setData])
    const handleColor = useCallback((event, index) => {
        setData(pre => {
            let a = [...pre]
            a[index].colorCode = event.target.value
            return a
        })
    }, [setData]);
    const handleNotify = useCallback((event, index) => {
        setData(pre => {
            let a = [...pre]
            a[index].notification = event.target.value
            return a
        })
    },[setData])
    return(
        <div className={"categoryContainer"}>
            <table className={"alarmSettingTable"}>
                <tbody>
                {props.data.map((item, index) => (<CategoryElement item={item} key={index} index={index}
                                                            setData={props.setData}
                                                            handleColor={handleColor}
                                                            variables={props.variables}
                                                            handleNotify={handleNotify}
                                                            handleSwitch={handleSwitch}
                />))}
                </tbody>
            </table>
            {props.variables.isEditor &&
            <ButtonContainer initialData={props.initialData} data={props.data} setData={props.setData}
                             dispatch={props.dispatch}/>
            }
        </div>
    )
}

function CategoryElement(props) {
    const lang = useLanguage()
    const switchValue = () => {if(props.item.openStatus){
        return 1
    }else{
        return 0
    }}

    const backgroundArray = props.item.colorCode.slice(1, -1).split(", ")

    let colorCode
    let notification
    let colorStyle = "colorContainer"
    if (props.variables.isEditor){
        colorStyle += " editor"
        colorCode =
            <select onChange={(event) => {props.handleColor(event, props.index)}}
                    value={props.item.colorCode} className={"colorCode"}
            >
                <OptionAuto data={allConditionData.colorCode.data}/>
            </select>
        notification =
            <input type={"text"}
                   onChange={(event) => {props.handleNotify(event, props.index)}}
                   value={props.item.notification}
            />
    }else{
        colorCode = <div>{allConditionData.colorCode.data[allConditionData.colorCode.index[props.item.colorCode]].name[lang]}</div>
        notification = props.item.notification
    }
    return(
        <tr>
            <td className={"td1"}>
                <input type="range" min={0} max={1} step={1} value={switchValue()}
                       // disabled={!props.variables.isEditor}
                       disabled={true}
                       onChange={(event) => {props.handleSwitch(event, props.index)}}
                       className={"style"+switchValue().toString()+" none"}/>
            </td>
            <td className={"td2"}>
                {props.item.name}
            </td>
            <td className={"td3"}>
                <div className={colorStyle}>
                    <div className={"colorDiv"}>
                        <div className={"halfCircle up"} style={{backgroundColor: backgroundArray[0]}}/>
                        <div className={"halfCircle down"} style={{backgroundColor: backgroundArray[backgroundArray.length-1]}}/>
                    </div>
                    {colorCode}
                </div>
            </td>
            <td className={"td4"}>
                <div className={"notificationContainer"}>
                    {notification}
                </div>
            </td>
        </tr>
    )
}

function ButtonContainer(props) {
    const [isOpen, setIsOpen] = useState(false)
    const {setData, initialData, dispatch} = props
    const handleReset = useCallback(() => {
        setData(arrayDataHardCopy(initialData.current))
        dispatch({
            type: "SWITCH_OFF_EDITOR"
        })
    },
    [initialData, dispatch, setData])

    function openModel() {
        setIsOpen(true)
    }

    const model = isOpen && <SaveData setIsOpen={setIsOpen} data={props.data} initialData={initialData} dispatch={dispatch}/>

    return(
        <div className={"buttonContainer"}>
            <button className={'button'} onClick={handleReset}><FormattedMessage id={"button.reset"}/></button>
            <button className={"button save"} onClick={openModel}><FormattedMessage id={"button.save"}/></button>
            {model}
        </div>
    )
}

function SaveData(props) {
    const token = useToken()
    const lang = useLanguage()
    const container = useModel()
    const [modelSaved, setModelSaved] = useState(true)

    function handleClose() {
        props.setIsOpen(false)
    }

    const handleSave = useCallback(async (initialData, data, token, lang) => {
        const updateData = []
        for(let datum of data){
            updateData.push({
                "id": datum.id,
                "colorCode": datum.colorCode,
                "notification": {
                    [lang]: datum.notification
                }
            })
        }
        const ac = new AbortController()
        try{
            const response = await fetch(SERVER+ "/api/IBMS/Web/V1/alarmSetting/category",{
                method: "PUT",
                headers: new Headers({
                    Authorization: "Bearer "+ token,
                    signal: ac.signal,
                }),
                body: JSON.stringify(updateData
                )
            })
            const response2 = await checkFetchResult(response)
            console.log(response2)
            initialData.current = arrayDataHardCopy(data)
            setModelSaved(false)
        }catch (e) {
            if(e.json){
                const msg = await e.json()
                alert(Object.values(msg)[0])
            }
            console.log(e)
        }
    },[])

    function handleContinue() {
        if(props.dispatch){
            props.dispatch({
                type: "SWITCH_OFF_EDITOR"
            })
        }else{
            // window.location="/alarmSetting/rule"
        }
    }

    return(
        ReactDOM.createPortal(
            <div className={"model2"}>
                {modelSaved ?
                <div className={"alarmSettingModel"}>
                    <div className={"title"}>
                        <FormattedMessage id={"model.save.title"}/>
                    </div>
                    <div className={"buttonContainer"}>
                        <button className={"modelButton"} onClick={handleClose}><FormattedMessage id={"button.cancel"}/></button>
                        <button className={"modelButton"} onClick={()=>handleSave(props.initialData, props.data, token, lang)}><FormattedMessage id={"button.save"}/></button>
                    </div>
                </div> :
                <div className={"alarmSettingModel"}>
                    <div className={"title2"}>
                        <div className={"image"}>
                            <svg width="5.625rem" height="5rem" viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M44.9997 0.25C47.4389 0.25 49.4163 2.22741 49.4163 4.66667V13.5H75.9163C79.4305 13.5 82.8007 14.896 85.2855 17.3808C87.7704 19.8657 89.1664 23.2359 89.1664 26.75V66.5C89.1664 70.0141 87.7704 73.3843 85.2855 75.8692C82.8007 78.354 79.4305 79.75 75.9163 79.75H14.083C10.5689 79.75 7.1987 78.354 4.71384 75.8692C2.22899 73.3843 0.833008 70.0141 0.833008 66.5V26.75C0.833008 23.2359 2.22899 19.8657 4.71384 17.3808C7.1987 14.896 10.5689 13.5 14.083 13.5H40.583V4.66667C40.583 2.22741 42.5604 0.25 44.9997 0.25ZM40.583 22.3333H14.083C12.9116 22.3333 11.7882 22.7987 10.96 23.6269C10.1317 24.4552 9.66634 25.5786 9.66634 26.75V66.5C9.66634 67.6714 10.1317 68.7948 10.96 69.6231C11.7882 70.4513 12.9116 70.9167 14.083 70.9167H75.9163C77.0877 70.9167 78.2111 70.4513 79.0394 69.6231C79.8677 68.7948 80.333 67.6714 80.333 66.5V26.75C80.333 25.5786 79.8677 24.4552 79.0394 23.6269C78.2111 22.7987 77.0877 22.3333 75.9163 22.3333H49.4163V38.1706L55.1266 32.4603C56.8514 30.7355 59.6479 30.7355 61.3727 32.4603C63.0975 34.1851 63.0975 36.9816 61.3727 38.7064L48.1259 51.9532C48.1152 51.9639 48.1045 51.9745 48.0938 51.9851C47.2998 52.7646 46.2126 53.2465 45.0129 53.25C45.0085 53.25 45.0041 53.25 44.9997 53.25C44.9953 53.25 44.9908 53.25 44.9864 53.25C44.3924 53.2482 43.826 53.1292 43.309 52.9149C42.8 52.7042 42.3223 52.3943 41.9056 51.9851C41.8948 51.9745 41.8841 51.9639 41.8735 51.9532L28.6266 38.7064C26.9018 36.9816 26.9018 34.1851 28.6266 32.4603C30.3514 30.7355 33.1479 30.7355 34.8727 32.4603L40.583 38.1706V22.3333Z" fill="white"/>
                            </svg>
                        </div>
                        <div className={"text"}>
                            <FormattedMessage id={"model.save.success"}/>
                        </div>
                    </div>
                    <div className={"buttonContainer2"}>
                        <div className={"text"}>
                            <FormattedMessage id={"model.save.alarmCategory.text"}/>
                        </div>
                        <div className={"button_div"}>
                            <button className={"modelButton"} onClick={handleContinue}>
                                <FormattedMessage id={"button.continue"}/>
                            </button>
                        </div>
                    </div>
                </div>}
            </div>,
            container
        )
    )
}

function AlarmSettingRule() {
    const updateData = useRef([])
    return (
        <>
            <Switch>
                <Route exact path={"/alarmSetting/rule"}>
                    <AlarmSettingRuleIndex updateData={updateData}/>
                </Route>
                <Route path={"/alarmSetting/rule/update"}>
                    <AlarmSettingRuleEditor updateData={updateData}/>
                </Route>
                <Route path={"/alarmSetting/rule/add"}>
                    <AlarmSettingAdd/>
                </Route>
            </Switch>
        </>
    )
}

function AlarmSettingRuleIndex(props) {
    const controller = useRef(false)
    const token = useToken()
    const color = useCategoryColor(token)
    const lang = useLanguage()
    const [variables, dispatch] = useReducer(ruleReducer, PAGE_ALARM_SETTING_RULE_INITIAL_STATE)
    const [data, setData] = useState([])
    const [check, setCheck] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    const fetchRule = useCallback(async ()=>{
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/alarmSetting/rule",{
                method: "GET",
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
            const data = await response.json()
            if(controller.current){
                setData(data)
            }
        }catch (err){
            console.log(err)
        }
        setIsLoading(false)
    },[token])

    useEffect(()=>{
        // initialData.current = ruleAlarmData
        // setData(arrayDataHardCopy(ruleAlarmData))
        controller.current = true
        const response = fetchRule()
        console.log(response)
        return ()=>{
            controller.current = false
        }
    }, [fetchRule])

    const dealData = useMemo(()=>{
        return dealAlarmSettingRuleData(data, variables, lang)},
        [data, variables, lang])

    return (
        <div className={"alarmSettingRuleIndex"}>
            <SearchEditorDownloadContainer variables={variables} dispatch={dispatch} setCheck={setCheck}
                                           check={check} setData={setData} updateData={props.updateData}/>
            {isLoading ?
                <div className={"loadingContainer"}>
                    <div className="loader loader-1">
                        <div className="loader-outter"/>
                        <div className="loader-inner"/>
                    </div>
                </div> :
                <div className={"scrollContainer"}>
                    <SortRuleContainer variables={variables} dispatch={dispatch}/>
                    <RuleContainer data={dealData} check={check} setCheck={setCheck} color={color}/>
                </div>
            }
        </div>
    )
}

function SearchEditorDownloadContainer(props) {
    const [loading, setLoading] = useState(false)
    const token = useToken()
    const lang = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const csvRef = useRef()
    const xlsRef = useRef()
    function handleSearch(event) {
        props.setCheck({})
        props.dispatch({
            type: "CHANGE_KEYWORD",
            payload: {keyword: event.target.value}
        })
    }
    props.updateData.current = Object.values(props.check)

    function handleDelete() {
        setIsOpen(true)
    }

    const model = isOpen && <DeleteRuleData check={props.check} setCheck={props.setCheck}
                                            setData={props.setData} setIsOpen={setIsOpen}/>

    async function downloadCSV() {
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/alarmSetting/alarmRule/csv", {
                method: "GET",
                headers: new Headers({
                    'Content-Type': 'application/csv',
                    Authorization: "Bearer " + token
                })
            })
            const data = await response.blob()
            downloadUrlGenerator(data, "alarm_rule", "csv")
        }catch (e) {
            console.log(e)
        }
    }

    async function downloadXLS() {
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/alarmSetting/alarmRule/xls", {
                method: "GET",
                headers: new Headers({
                    'Content-Type': 'application/csv',
                    Authorization: "Bearer " + token
                })
            })
            const data = await response.blob()
            const url = window.URL.createObjectURL(
                new Blob([data])
            )
            const link = document.createElement("a")
            link.href = url
            link.setAttribute(
                "download",
                "alarm_rule.xls"
            )
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
        }catch (e) {
            console.log(e)
        }
    }

    async function UploadCSV(event) {
        event.preventDefault()
        let file = event.target.files[0]
        if (file){
            setLoading(true)
            const formData = new FormData()
            formData.append("file", file)

            for (let value of formData.values()){
                console.log(value)
            }

            try{
                const response = await fetch(SERVER + "/api/IBMS/Web/V1/alarmSetting/alarmRule/csv", {
                    method: "POST",
                    headers: new Headers({
                        Authorization: "Bearer " + token,
                    }),
                    body: formData
                })
                const response2 = await checkFetchResult(response)
                console.log(response2)
                alert("Upload Successful")
            }catch (e) {
                console.log(e)
                alert("Upload Failed")
            }
            setLoading(false)
        }
    }

    async function UploadXLS(event) {
        event.preventDefault()
        let file = event.target.files[0]
        if (file){
            setLoading(true)
            const formData = new FormData()
            formData.append("file", file)

            for (let value of formData.values()){
                console.log(value)
            }

            try{
                const response = await fetch(SERVER + "/api/IBMS/Web/V1/alarmSetting/alarmRule/xls", {
                    method: "POST",
                    headers: new Headers({
                        Authorization: "Bearer " + token,
                    }),
                    body: formData
                })
                const response2 = await checkFetchResult(response)
                console.log(response2)
                setLoading(false)
            }catch (e) {
                console.log(e)
                setLoading(false)
            }
            alert("Upload Failed")
        }
    }

    return(
        <div className={"searchEditorDownloadContainer"}>
            {model}
            {loading && <ModelLoading/>}
            <div className={"leftContainer"}>
                <div className={"inputContainer"}>
                    <input type="text" className={"search"} placeholder={placeholder(lang)} value={props.variables.search}
                           onChange={(event) => {handleSearch(event)}}/>
                </div>
                {Object.keys(props.check).length !== 0 &&
                <>
                    <Link to={"/alarmSetting/rule/update"}>
                        <div className={"svgContainer editor"}>
                            <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M23.1822 5.04862L19.0573 0.923729C18.5189 0.418048 17.8135 0.127895 17.0751 0.108465C16.3368 0.0890345 15.6171 0.341683 15.0528 0.818349L1.50395 14.3672C1.01734 14.858 0.714355 15.5011 0.645851 16.1888L-0.00148524 22.4665C-0.021765 22.687 0.00684633 22.9092 0.082309 23.1174C0.157772 23.3256 0.278227 23.5145 0.43509 23.6708C0.575758 23.8103 0.742584 23.9207 0.926003 23.9957C1.10942 24.0706 1.30582 24.1085 1.50395 24.1074H1.63944L7.91709 23.5353C8.60477 23.4668 9.24795 23.1638 9.73867 22.6772L23.2876 9.12834C23.8134 8.57278 24.0976 7.83142 24.0779 7.0667C24.0581 6.30198 23.736 5.57628 23.1822 5.04862ZM7.64611 20.5245L3.12982 20.946L3.53628 16.4297L12.042 8.02937L16.1066 12.094L7.64611 20.5245ZM18.0637 10.0768L14.0292 6.0422L16.9647 3.03133L21.0746 7.14117L18.0637 10.0768Z"
                                    fill="#00EAFF"/>
                            </svg>
                        </div>
                    </Link>
                    <div className={"svgContainer cancel"} onClick={handleDelete}>
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 0C5.3715 0 0 5.373 0 12C0 18.627 5.3715 24 12 24C18.6285 24 24 18.627 24 12C24 5.373 18.6285 0 12 0ZM17.5605 15.4395C17.8418 15.7208 17.9998 16.1022 17.9998 16.5C17.9998 16.8978 17.8418 17.2792 17.5605 17.5605C17.2792 17.8418 16.8978 17.9998 16.5 17.9998C16.1022 17.9998 15.7208 17.8418 15.4395 17.5605L12 14.121L8.5605 17.5605C8.42152 17.7003 8.25628 17.8112 8.07428 17.8869C7.89228 17.9626 7.69711 18.0016 7.5 18.0016C7.30289 18.0016 7.10772 17.9626 6.92572 17.8869C6.74372 17.8112 6.57848 17.7003 6.4395 17.5605C6.30008 17.4213 6.18948 17.256 6.11401 17.074C6.03854 16.8921 5.9997 16.697 5.9997 16.5C5.9997 16.303 6.03854 16.1079 6.11401 15.926C6.18948 15.744 6.30008 15.5787 6.4395 15.4395L9.879 12L6.4395 8.5605C6.15824 8.27924 6.00023 7.89776 6.00023 7.5C6.00023 7.10224 6.15824 6.72076 6.4395 6.4395C6.72076 6.15824 7.10224 6.00023 7.5 6.00023C7.89776 6.00023 8.27924 6.15824 8.5605 6.4395L12 9.879L15.4395 6.4395C15.7208 6.15824 16.1022 6.00023 16.5 6.00023C16.8978 6.00023 17.2792 6.15824 17.5605 6.4395C17.8418 6.72076 17.9998 7.10224 17.9998 7.5C17.9998 7.89776 17.8418 8.27924 17.5605 8.5605L14.121 12L17.5605 15.4395Z"
                                fill="#EC0000"/>
                        </svg>
                    </div>
                </>
                }
            </div>
            <div className={"rightContainer"}>
                <Link to={"/alarmSetting/rule/add"}>
                    <div className={"svgContainer addNew"}>
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.2 6H10.8V10.8H6V13.2H10.8V18H13.2V13.2H18V10.8H13.2V6ZM12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM12 21.6C6.708 21.6 2.4 17.292 2.4 12C2.4 6.708 6.708 2.4 12 2.4C17.292 2.4 21.6 6.708 21.6 12C21.6 17.292 17.292 21.6 12 21.6Z" fill="#00EAFF"/>
                        </svg>
                    </div>
                </Link>
                <div className={"svgContainer inCSV"} onClick={()=>{csvRef.current.click()}}>
                    <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.43 7.33905L5.43 3.84905C5.37753 3.81623 5.31689 3.79883 5.255 3.79883C5.19311 3.79883 5.13247 3.81623 5.08 3.84905C5.02145 3.87644 4.97223 3.92041 4.93846 3.97552C4.90468 4.03063 4.88783 4.09445 4.89 4.15905V5.78905H0.38C0.287679 5.78336 0.196709 5.81342 0.125958 5.873C0.0552061 5.93258 0.0101021 6.01711 0 6.10905V9.10905C0.0124443 9.19918 0.0585523 9.28125 0.129051 9.33876C0.19955 9.39628 0.28921 9.42496 0.38 9.41905H4.93V11.0891C4.92693 11.1489 4.9402 11.2084 4.96839 11.2612C4.99658 11.3141 5.03862 11.3583 5.09 11.3891C5.14002 11.4235 5.1993 11.4419 5.26 11.4419C5.32071 11.4419 5.37998 11.4235 5.43 11.3891L10.43 7.87905C10.4727 7.8487 10.5071 7.80802 10.5298 7.7608C10.5525 7.71359 10.5629 7.66138 10.56 7.60905C10.5628 7.55532 10.5524 7.50172 10.5298 7.45291C10.5071 7.40411 10.4729 7.36159 10.43 7.32905V7.33905Z" fill="#00EAFF"/>
                        <path d="M8.14969 20.08C8.08794 20.0789 8.02665 20.0907 7.96979 20.1149C7.91294 20.139 7.86179 20.1748 7.8197 20.22C7.77527 20.2606 7.73986 20.31 7.71574 20.3651C7.69162 20.4203 7.67934 20.4798 7.67969 20.54V22.43V23.08C7.68093 23.2042 7.73127 23.3228 7.8197 23.41C7.9096 23.493 8.02732 23.5394 8.14969 23.54H23.5297C23.6526 23.54 23.7707 23.4919 23.8585 23.4059C23.9464 23.3199 23.9971 23.2029 23.9997 23.08V7.41L16.9997 0.5H8.14969C8.02732 0.500605 7.9096 0.546979 7.8197 0.63C7.73127 0.717185 7.68093 0.835824 7.67969 0.96V2.02V3.56C7.68231 3.68291 7.73298 3.7999 7.82084 3.88589C7.9087 3.97189 8.02676 4.02003 8.14969 4.02H9.89969C10.0188 4.01787 10.1329 3.97154 10.2197 3.89C10.2632 3.84868 10.298 3.79909 10.322 3.74414C10.3461 3.68918 10.3589 3.62998 10.3597 3.57V3.15H16.0697V7.87C16.0692 7.93166 16.0813 7.99277 16.1054 8.04954C16.1295 8.10631 16.165 8.15752 16.2097 8.2C16.2534 8.24243 16.305 8.27577 16.3617 8.29808C16.4183 8.3204 16.4788 8.33125 16.5397 8.33H21.3197V20.89H10.3197V20.54C10.3189 20.48 10.3061 20.4208 10.282 20.3659C10.258 20.3109 10.2232 20.2613 10.1797 20.22C10.1391 20.1756 10.0897 20.1402 10.0345 20.116C9.97943 20.0919 9.91986 20.0796 9.85969 20.08H8.14969Z" fill="#00EAFF"/>
                        <path d="M3.83043 13.8298C4.13066 13.8386 4.421 13.9391 4.66236 14.1179C4.90372 14.2967 5.08452 14.5451 5.18043 14.8298L7.00043 14.0198C6.74199 13.4008 6.29891 12.8766 5.7316 12.5186C5.16429 12.1607 4.50038 11.9865 3.83043 12.0198C3.34856 11.9833 2.86435 12.0468 2.40813 12.2061C1.95192 12.3655 1.53352 12.6173 1.17916 12.9459C0.8248 13.2745 0.542103 13.6727 0.348777 14.1156C0.155452 14.5585 0.0556641 15.0365 0.0556641 15.5198C0.0556641 16.003 0.155452 16.4811 0.348777 16.924C0.542103 17.3668 0.8248 17.765 1.17916 18.0936C1.53352 18.4222 1.95192 18.674 2.40813 18.8334C2.86435 18.9928 3.34856 19.0562 3.83043 19.0198C4.49931 19.0473 5.16075 18.8707 5.72694 18.5135C6.29312 18.1563 6.73727 17.6353 7.00043 17.0198L5.18043 16.2098C5.08452 16.4944 4.90372 16.7428 4.66236 16.9216C4.421 17.1004 4.13066 17.201 3.83043 17.2098C3.38221 17.2098 2.95235 17.0317 2.63542 16.7148C2.31848 16.3978 2.14043 15.968 2.14043 15.5198C2.14043 15.0715 2.31848 14.6417 2.63542 14.3248C2.95235 14.0078 3.38221 13.8298 3.83043 13.8298Z" fill="#00EAFF"/>
                        <path d="M9.68 17.2895C9.33483 17.2838 8.99504 17.2029 8.68422 17.0527C8.3734 16.9025 8.09898 16.6864 7.88 16.4195L7 17.9395C7.32582 18.2988 7.72682 18.5819 8.17449 18.7686C8.62215 18.9552 9.10545 19.0409 9.59 19.0195C9.91039 19.053 10.2342 19.0154 10.5384 18.9094C10.8426 18.8033 11.1196 18.6315 11.3498 18.4061C11.58 18.1807 11.7576 17.9073 11.87 17.6054C11.9823 17.3035 12.0268 16.9806 12 16.6595C12 14.1395 8.9 14.6595 8.9 14.0495C8.9 13.8795 8.99 13.7495 9.32 13.7495C9.94438 13.7534 10.5443 13.9927 11 14.4195L11.91 12.9595C11.5927 12.6481 11.2155 12.4043 10.8013 12.2427C10.387 12.0812 9.94438 12.0053 9.5 12.0195C9.19654 12.0014 8.89261 12.0466 8.60758 12.1523C8.32254 12.258 8.06263 12.4219 7.8444 12.6335C7.62617 12.8452 7.45439 13.0999 7.34001 13.3816C7.22562 13.6633 7.17113 13.9657 7.18 14.2695C7.18 16.9395 10.29 16.2695 10.29 16.9295C10.29 17.1895 9.99 17.2895 9.68 17.2895Z" fill="#00EAFF"/>
                        <path d="M14.46 12.0195H12L14.64 19.0195H17.36L20 12.0195H17.54L16 16.7295L14.46 12.0195Z" fill="#00EAFF"/>
                    </svg>
                </div>
                <input type="file" name={"file"} onChange={event=>UploadCSV(event)} ref={csvRef} className={"none"}
                       accept={".csv"}
                />
                <div className={"svgContainer inXLS"} onClick={()=>{xlsRef.current.click()}}>
                    <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.43 7.31952L5.43 3.82952C5.37753 3.7967 5.31689 3.7793 5.255 3.7793C5.19311 3.7793 5.13247 3.7967 5.08 3.82952C5.02145 3.85691 4.97223 3.90088 4.93846 3.95599C4.90468 4.0111 4.88783 4.07492 4.89 4.13952V5.76952H0.38C0.287679 5.76383 0.196709 5.79389 0.125958 5.85347C0.0552061 5.91305 0.0101021 5.99758 0 6.08952V9.08952C0.0124443 9.17965 0.0585523 9.26172 0.129051 9.31923C0.19955 9.37674 0.28921 9.40543 0.38 9.39952H4.93V11.0695C4.92693 11.1293 4.9402 11.1889 4.96839 11.2417C4.99658 11.2946 5.03862 11.3387 5.09 11.3695C5.14002 11.4039 5.1993 11.4223 5.26 11.4223C5.32071 11.4223 5.37998 11.4039 5.43 11.3695L10.43 7.85952C10.4727 7.82917 10.5071 7.78849 10.5298 7.74127C10.5525 7.69405 10.5629 7.64184 10.56 7.58952C10.5628 7.53579 10.5524 7.48218 10.5298 7.43338C10.5071 7.38458 10.4729 7.34206 10.43 7.30952V7.31952Z" fill="#00EAFF"/>
                        <path d="M8.14969 20.0605C8.08794 20.0593 8.02665 20.0712 7.96979 20.0953C7.91294 20.1195 7.86179 20.1553 7.8197 20.2005C7.77527 20.241 7.73986 20.2905 7.71574 20.3456C7.69162 20.4007 7.67934 20.4603 7.67969 20.5205V22.4105V23.0605C7.68093 23.1846 7.73127 23.3033 7.8197 23.3905C7.9096 23.4735 8.02732 23.5199 8.14969 23.5205H23.5297C23.6526 23.5205 23.7707 23.4724 23.8585 23.3864C23.9464 23.3004 23.9971 23.1834 23.9997 23.0605V7.39047L16.9997 0.480469H8.14969C8.02732 0.481074 7.9096 0.527448 7.8197 0.610469C7.73127 0.697654 7.68093 0.816293 7.67969 0.940469V2.00047V3.54047C7.68231 3.66338 7.73298 3.78037 7.82084 3.86636C7.9087 3.95235 8.02676 4.0005 8.14969 4.00047H9.89969C10.0188 3.99834 10.1329 3.95201 10.2197 3.87047C10.2632 3.82915 10.298 3.77956 10.322 3.72461C10.3461 3.66965 10.3589 3.61045 10.3597 3.55047V3.13047H16.0697V7.85047C16.0692 7.91213 16.0813 7.97324 16.1054 8.03001C16.1295 8.08678 16.165 8.13799 16.2097 8.18047C16.2534 8.2229 16.305 8.25624 16.3617 8.27855C16.4183 8.30087 16.4788 8.31172 16.5397 8.31047H21.3197V20.8705H10.3197V20.5205C10.3189 20.4605 10.3061 20.4013 10.282 20.3463C10.258 20.2914 10.2232 20.2418 10.1797 20.2005C10.1391 20.156 10.0897 20.1206 10.0345 20.0965C9.97943 20.0724 9.91986 20.0601 9.85969 20.0605H8.14969Z" fill="#00EAFF"/>
                        <path d="M7.13 12.0996L5 15.2596L7.47 18.8996H4.83L3.46 16.7596L2.08 18.8996H0L2.39 15.3796L0.1 12.0996H2.74L3.9 13.9296L5.09 12.0996H7.13Z" fill="#00EAFF"/>
                        <path d="M13.16 17.2296V18.8996H8V12.0996H10.28V17.2296H13.16Z" fill="#00EAFF"/>
                        <path d="M13.1904 16.9297L15.3004 16.5797C15.3973 16.8547 15.5873 17.0872 15.8374 17.2369C16.0876 17.3867 16.3823 17.4443 16.6704 17.3997C17.2404 17.3997 17.5204 17.2597 17.5204 16.9897C17.5238 16.9197 17.5067 16.8503 17.4711 16.7899C17.4356 16.7295 17.3832 16.6808 17.3204 16.6497C17.1036 16.5316 16.8658 16.4569 16.6204 16.4297C15.7212 16.3607 14.8573 16.0497 14.1204 15.5297C13.9431 15.3628 13.802 15.1614 13.7057 14.9378C13.6093 14.7142 13.5599 14.4732 13.5604 14.2297C13.5608 13.9217 13.6323 13.618 13.7693 13.3422C13.9064 13.0664 14.1052 12.826 14.3504 12.6397C15.0189 12.1724 15.8266 11.9467 16.6404 11.9997C17.2528 11.9255 17.8729 12.0472 18.4118 12.3472C18.9508 12.6472 19.3809 13.1102 19.6404 13.6697L17.7604 14.1897C17.66 13.9647 17.4906 13.7774 17.2766 13.6552C17.0626 13.5329 16.8153 13.482 16.5704 13.5097C16.0804 13.5097 15.8304 13.6497 15.8304 13.9297C15.8291 13.9891 15.8443 14.0476 15.8743 14.0988C15.9043 14.15 15.948 14.1919 16.0004 14.2197C16.2046 14.3218 16.4242 14.3893 16.6504 14.4197C17.2885 14.5378 17.9195 14.6914 18.5404 14.8797C18.9104 15.0103 19.2338 15.2467 19.4704 15.5597C19.7196 15.8828 19.8503 16.2818 19.8404 16.6897C19.8449 17.0228 19.7635 17.3514 19.6041 17.6439C19.4447 17.9364 19.2127 18.1829 18.9304 18.3597C18.2214 18.8203 17.3847 19.0443 16.5404 18.9997C14.7204 18.9997 13.6104 18.3097 13.1904 16.9297Z" fill="#00EAFF"/>
                    </svg>
                </div>
                <input type="file" name={"file"} onChange={event=>UploadXLS(event)} ref={xlsRef} className={"none"}
                       accept={".xls, .xlsx"}
                />
                <div className={"svgContainer outCSV"} onClick={downloadCSV}>
                    <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.8702 7.31952L18.8702 3.82952C18.8177 3.7967 18.7571 3.7793 18.6952 3.7793C18.6333 3.7793 18.5727 3.7967 18.5202 3.82952C18.4616 3.85691 18.4124 3.90088 18.3787 3.95599C18.3449 4.0111 18.328 4.07492 18.3302 4.13952V5.76952H13.8302C13.7379 5.76383 13.6469 5.79389 13.5762 5.85347C13.5054 5.91305 13.4603 5.99758 13.4502 6.08952V9.08952C13.4626 9.17965 13.5087 9.26172 13.5792 9.31923C13.6497 9.37674 13.7394 9.40543 13.8302 9.39952H18.3802V11.0695C18.3771 11.1293 18.3904 11.1889 18.4186 11.2417C18.4468 11.2946 18.4888 11.3387 18.5402 11.3695C18.5902 11.4039 18.6495 11.4223 18.7102 11.4223C18.7709 11.4223 18.8302 11.4039 18.8802 11.3695L23.8802 7.85952C23.9196 7.82902 23.9511 7.78947 23.972 7.74421C23.9929 7.69894 24.0026 7.64931 24.0002 7.59952C24.003 7.54579 23.9926 7.49218 23.97 7.44338C23.9473 7.39458 23.913 7.35206 23.8702 7.31952Z" fill="#00EAFF"/>
                        <path d="M15.85 20.0605H14.1C14.0398 20.0601 13.9803 20.0724 13.9251 20.0965C13.87 20.1206 13.8206 20.156 13.78 20.2005C13.7365 20.2418 13.7017 20.2914 13.6777 20.3463C13.6536 20.4013 13.6408 20.4605 13.64 20.5205V20.8705H2.64V8.31047H7.46C7.52087 8.31172 7.58139 8.30087 7.63803 8.27855C7.69468 8.25624 7.74633 8.2229 7.79 8.18047C7.8347 8.13799 7.87019 8.08678 7.89428 8.03001C7.91836 7.97324 7.93052 7.91213 7.93 7.85047V3.13047H13.64V3.55047C13.6408 3.61045 13.6536 3.66965 13.6777 3.72461C13.7017 3.77956 13.7365 3.82915 13.78 3.87047C13.8668 3.95201 13.9809 3.99834 14.1 4.00047H15.85C15.9713 4.00058 16.0879 3.95382 16.1755 3.86995C16.2631 3.78609 16.3148 3.67162 16.32 3.55047V2.00047V0.940469C16.3188 0.816293 16.2684 0.697654 16.18 0.610469C16.0901 0.527448 15.9724 0.481074 15.85 0.480469H7L0 7.39047V23.0605C0.00261571 23.1834 0.0532858 23.3004 0.141146 23.3864C0.229006 23.4724 0.347062 23.5205 0.47 23.5205H15.85C15.9724 23.5199 16.0901 23.4735 16.18 23.3905C16.2684 23.3033 16.3188 23.1846 16.32 23.0605V22.4105V20.5205C16.3204 20.4603 16.3081 20.4007 16.284 20.3456C16.2598 20.2905 16.2244 20.241 16.18 20.2005C16.1379 20.1553 16.0868 20.1195 16.0299 20.0953C15.973 20.0712 15.9118 20.0593 15.85 20.0605Z" fill="#00EAFF"/>
                        <path d="M7.83043 13.8102C8.13066 13.819 8.421 13.9196 8.66236 14.0984C8.90372 14.2772 9.08452 14.5256 9.18043 14.8102L11.0004 14.0002C10.742 13.3812 10.2989 12.857 9.7316 12.4991C9.16429 12.1412 8.50038 11.967 7.83043 12.0002C7.34856 11.9638 6.86435 12.0272 6.40813 12.1866C5.95192 12.346 5.53352 12.5978 5.17916 12.9264C4.8248 13.255 4.5421 13.6532 4.34878 14.096C4.15545 14.5389 4.05566 15.017 4.05566 15.5002C4.05566 15.9835 4.15545 16.4615 4.34878 16.9044C4.5421 17.3473 4.8248 17.7455 5.17916 18.0741C5.53352 18.4027 5.95192 18.6545 6.40813 18.8139C6.86435 18.9732 7.34856 19.0367 7.83043 19.0002C8.49931 19.0278 9.16075 18.8512 9.72694 18.494C10.2931 18.1368 10.7373 17.6158 11.0004 17.0002L9.18043 16.1902C9.08452 16.4749 8.90372 16.7233 8.66236 16.9021C8.421 17.0809 8.13066 17.1814 7.83043 17.1902C7.38221 17.1902 6.95235 17.0122 6.63542 16.6952C6.31848 16.3783 6.14043 15.9485 6.14043 15.5002C6.14043 15.052 6.31848 14.6222 6.63542 14.3052C6.95235 13.9883 7.38221 13.8102 7.83043 13.8102Z" fill="#00EAFF"/>
                        <path d="M13.68 17.27C13.3348 17.2642 12.995 17.1834 12.6842 17.0332C12.3734 16.8829 12.099 16.6669 11.88 16.4L11 17.92C11.3258 18.2793 11.7268 18.5624 12.1745 18.749C12.6221 18.9357 13.1055 19.0214 13.59 19C13.9104 19.0335 14.2342 18.9959 14.5384 18.8898C14.8426 18.7838 15.1196 18.612 15.3498 18.3866C15.58 18.1612 15.7576 17.8878 15.87 17.5859C15.9823 17.284 16.0268 16.961 16 16.64C16 14.12 12.9 14.64 12.9 14.03C12.9 13.86 12.99 13.73 13.32 13.73C13.9444 13.7339 14.5443 13.9732 15 14.4L15.91 12.94C15.5927 12.6286 15.2155 12.3848 14.8013 12.2232C14.387 12.0616 13.9444 11.9857 13.5 12C13.1965 11.9818 12.8926 12.027 12.6076 12.1327C12.3225 12.2385 12.0626 12.4023 11.8444 12.614C11.6262 12.8256 11.4544 13.0804 11.34 13.3621C11.2256 13.6437 11.1711 13.9461 11.18 14.25C11.18 16.92 14.29 16.25 14.29 16.91C14.29 17.17 13.99 17.27 13.68 17.27Z" fill="#00EAFF"/>
                        <path d="M18.46 12H16L18.64 19H21.36L24 12H21.54L20 16.71L18.46 12Z" fill="#00EAFF"/>
                    </svg>
                </div>
                <div className={"svgContainer outXLS"} onClick={downloadXLS}>
                    <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.8702 7.31952L18.8702 3.82952C18.8177 3.7967 18.7571 3.7793 18.6952 3.7793C18.6333 3.7793 18.5727 3.7967 18.5202 3.82952C18.4616 3.85691 18.4124 3.90088 18.3787 3.95599C18.3449 4.0111 18.328 4.07492 18.3302 4.13952V5.76952H13.8302C13.7379 5.76383 13.6469 5.79389 13.5762 5.85347C13.5054 5.91305 13.4603 5.99758 13.4502 6.08952V9.08952C13.4626 9.17965 13.5087 9.26172 13.5792 9.31923C13.6497 9.37674 13.7394 9.40543 13.8302 9.39952H18.3802V11.0695C18.3771 11.1293 18.3904 11.1889 18.4186 11.2417C18.4468 11.2946 18.4888 11.3387 18.5402 11.3695C18.5902 11.4039 18.6495 11.4223 18.7102 11.4223C18.7709 11.4223 18.8302 11.4039 18.8802 11.3695L23.8802 7.85952C23.9196 7.82902 23.9511 7.78947 23.972 7.74421C23.9929 7.69894 24.0026 7.64931 24.0002 7.59952C24.003 7.54579 23.9926 7.49218 23.97 7.44338C23.9473 7.39458 23.913 7.35206 23.8702 7.31952Z" fill="#00EAFF"/>
                        <path d="M15.85 20.0605H14.1C14.0398 20.0601 13.9803 20.0724 13.9251 20.0965C13.87 20.1206 13.8206 20.156 13.78 20.2005C13.7365 20.2418 13.7017 20.2914 13.6777 20.3463C13.6536 20.4013 13.6408 20.4605 13.64 20.5205V20.8705H2.64V8.31047H7.46C7.52087 8.31172 7.58139 8.30087 7.63803 8.27855C7.69468 8.25624 7.74633 8.2229 7.79 8.18047C7.8347 8.13799 7.87019 8.08678 7.89428 8.03001C7.91836 7.97324 7.93052 7.91213 7.93 7.85047V3.13047H13.64V3.55047C13.6408 3.61045 13.6536 3.66965 13.6777 3.72461C13.7017 3.77956 13.7365 3.82915 13.78 3.87047C13.8668 3.95201 13.9809 3.99834 14.1 4.00047H15.85C15.9713 4.00058 16.0879 3.95382 16.1755 3.86995C16.2631 3.78609 16.3148 3.67162 16.32 3.55047V2.00047V0.940469C16.3188 0.816293 16.2684 0.697654 16.18 0.610469C16.0901 0.527448 15.9724 0.481074 15.85 0.480469H7L0 7.39047V23.0605C0.00261571 23.1834 0.0532858 23.3004 0.141146 23.3864C0.229006 23.4724 0.347062 23.5205 0.47 23.5205H15.85C15.9724 23.5199 16.0901 23.4735 16.18 23.3905C16.2684 23.3033 16.3188 23.1846 16.32 23.0605V22.4105V20.5205C16.3204 20.4603 16.3081 20.4007 16.284 20.3456C16.2598 20.2905 16.2244 20.241 16.18 20.2005C16.1379 20.1553 16.0868 20.1195 16.0299 20.0953C15.973 20.0712 15.9118 20.0593 15.85 20.0605Z" fill="#00EAFF"/>
                        <path d="M11.13 12.0996L9 15.2596L11.49 18.8996H8.83L7.46 16.7596L6.08 18.8996H4L6.39 15.3796L4.1 12.0996H6.74L7.9 13.9296L9.09 12.0996H11.13Z" fill="#00EAFF"/>
                        <path d="M17.16 17.2296V18.8996H12V12.0996H14.28V17.2296H17.16Z" fill="#00EAFF"/>
                        <path d="M17.1904 16.9297L19.3004 16.5797C19.3973 16.8547 19.5873 17.0872 19.8374 17.2369C20.0876 17.3867 20.3823 17.4443 20.6704 17.3997C21.2404 17.3997 21.5204 17.2597 21.5204 16.9897C21.5238 16.9197 21.5067 16.8503 21.4711 16.7899C21.4356 16.7295 21.3832 16.6808 21.3204 16.6497C21.1036 16.5316 20.8658 16.4569 20.6204 16.4297C19.7212 16.3607 18.8573 16.0497 18.1204 15.5297C17.9431 15.3628 17.802 15.1614 17.7057 14.9378C17.6093 14.7142 17.5599 14.4732 17.5604 14.2297C17.5608 13.9217 17.6323 13.618 17.7693 13.3422C17.9064 13.0664 18.1052 12.826 18.3504 12.6397C19.0189 12.1724 19.8266 11.9467 20.6404 11.9997C21.2528 11.9255 21.8729 12.0472 22.4118 12.3472C22.9508 12.6472 23.3809 13.1102 23.6404 13.6697L21.7604 14.1897C21.66 13.9647 21.4906 13.7774 21.2766 13.6552C21.0626 13.5329 20.8153 13.482 20.5704 13.5097C20.0804 13.5097 19.8304 13.6497 19.8304 13.9297C19.8291 13.9891 19.8443 14.0476 19.8743 14.0988C19.9043 14.15 19.948 14.1919 20.0004 14.2197C20.2046 14.3218 20.4242 14.3893 20.6504 14.4197C21.2885 14.5378 21.9195 14.6914 22.5404 14.8797C22.9104 15.0103 23.2338 15.2467 23.4704 15.5597C23.7196 15.8828 23.8503 16.2818 23.8404 16.6897C23.8449 17.0228 23.7635 17.3514 23.6041 17.6439C23.4447 17.9364 23.2127 18.1829 22.9304 18.3597C22.2214 18.8203 21.3847 19.0443 20.5404 18.9997C18.7204 18.9997 17.6104 18.3097 17.1904 16.9297Z" fill="#00EAFF"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}

function DeleteRuleData(props) {
    const token = useToken()
    const container = useModel()
    const [modelDelete, setModelDelete] = useState(true)
    const deleteArray = useRef(Object.keys(props.check))

    function handleClose() {
        props.setIsOpen(false)
    }

    const handleDelete = useCallback(async (setData, setCheck, deleteArray, setModelDelete, property) => {
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/alarmSetting/rule",{
                method: "DELETE",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "id": deleteArray.current
                })
            })
            console.log(response)
            handleSettingDelete(setData, {"deleteArray": deleteArray, "property": property})
            setCheck({})
            setModelDelete(false)
        }catch (e) {
            console.log(e)
        }
    },[token])

    return (ReactDOM.createPortal(
            <div className={"model2"}>
                {modelDelete ?
                    <div className={"alarmSettingModel"}>
                        <div className={"title"}>
                            <FormattedMessage id={"model.delete.title1"}/>{deleteArray.current.length}<FormattedMessage
                            id={"model.delete.title2.alarmRule"}/>
                        </div>
                        <div className={"buttonContainer"}>
                            <button className={"modelButton"} onClick={handleClose}><FormattedMessage id={"no"}/>
                            </button>
                            <button className={"modelButton"} onClick={()=>(
                                handleDelete(props.setData, props.setCheck, deleteArray, setModelDelete, "id"))}>
                                <FormattedMessage id={"yes"}/>
                            </button>
                        </div>
                    </div> :
                    <div className={"alarmSettingModel"}>
                        <div className={"title2"}>
                            <div className={"image"}>
                                <svg width="5.625rem" height="5.625rem" viewBox="0 0 90 90" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M67.083 18.5007H89.1664V27.334H80.333V84.7507C80.333 85.922 79.8677 87.0454 79.0394 87.8737C78.2111 88.702 77.0877 89.1673 75.9163 89.1673H14.083C12.9116 89.1673 11.7882 88.702 10.96 87.8737C10.1317 87.0454 9.66634 85.922 9.66634 84.7507V27.334H0.833008V18.5007H22.9163V5.25065C22.9163 4.07928 23.3817 2.95588 24.21 2.1276C25.0382 1.29931 26.1616 0.833984 27.333 0.833984H62.6663C63.8377 0.833984 64.9611 1.29931 65.7894 2.1276C66.6177 2.95588 67.083 4.07928 67.083 5.25065V18.5007ZM71.4997 27.334H18.4997V80.334H71.4997V27.334ZM51.2448 53.834L59.0535 61.6427L52.8083 67.8878L44.9997 60.0792L37.191 67.8878L30.9458 61.6427L38.7545 53.834L30.9458 46.0253L37.191 39.7802L44.9997 47.5888L52.8083 39.7802L59.0535 46.0253L51.2448 53.834ZM31.7497 9.66732V18.5007H58.2497V9.66732H31.7497Z"
                                        fill="white"/>
                                </svg>
                            </div>
                            <div className={"text"}>
                                <FormattedMessage id={"model.delete.successful"}/>
                            </div>
                        </div>
                        <div className={"buttonContainer2"}>
                            <div className={"text"}>
                                {deleteArray.current.length}<FormattedMessage id={"model.delete.text.alarmRule"}/>
                            </div>
                            <div className={"button_div"}>
                                <button className={"modelButton"} onClick={handleClose}><FormattedMessage
                                    id={"button.continue"}/></button>
                            </div>
                        </div>
                    </div>}
            </div>,
            container
        )
    )
}

function SortRuleContainer(props) {
    return(
        <div className={"sortContainer"}>
            <div className={"block"}/>
            <Sort data={sortConditionData["objectId"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["originObjectId"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["sensorName"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["displayObjectId"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["alarmLogic"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["alarmCategory"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["triggerValue"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["alarmFunction"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["objectName"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["alarmMessage"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
        </div>
    )
}

function RuleContainer(props) {
    const {check, setCheck} = props
    const handleCheck = useCallback((item)=>{
        if (check[item.id]){
            setCheck(pre=>{
                let result = {...pre}
                delete result[item.id]
                return result
            })
        }else{
            setCheck(pre=>({...pre, [item.id]: item}))
        }
    },[setCheck, check])

    return(
        <div className={"ruleContainer"}>
            <table className={"alarmSettingRuleTable"}>
                <tbody>
                {props.data.map((item, index) => (<RuleElement item={item} key={index} {...props}
                                                               handleCheck={handleCheck} color={props.color}
                />))}
                </tbody>
            </table>
        </div>
    )
}

function RuleElement(props) {
    const lang = useLanguage()
    const {check, item, handleCheck} = props
    let trStyle = null
    let isCheck = false

    if(item.id in check){
        isCheck = true
        trStyle = "active"
    }

    const colorDiv = useMemo(()=>{
        return(
            <div className={"colorDiv"}>
                <div className={"halfCircle up"} style={{backgroundColor: props.color[item.alarmCategory][0]}}/>
                <div className={"halfCircle down"} style={{backgroundColor: props.color[item.alarmCategory][props.color[item.alarmCategory].length-1]}}/>
            </div>
        )
    },[props.color, item.alarmCategory])

    return(
        <tr className={trStyle} onClick={()=>(handleCheck(item))}>
            <td className={"td0"}>
                <input type="checkbox" checked={isCheck}
                       onChange={()=>(handleCheck(item))}
                       value={item.objectId}/>
            </td>
            <td className={"td1"}>
                {item.objectId}
            </td>
            <td className={"td2"}>
                {item.originObjectId}
            </td>
            <td className={"td3"}>
                {item.sensorName}
            </td>
            <td className={"td4"}>
                {item.displayObjectId}
            </td>
            <td className={"td5"}>
                {item.alarmLogic}
            </td>
            <td className={"td6"}>
                <div className={"colorContainer"}>
                    {colorDiv}
                    <div className={"block"}/>
                    {convertToText(item, "alarmCategory", lang)}
                </div>
            </td>
            <td className={"td7"}>
                {item.triggerValue}
            </td>
            <td className={"td8"}>
                {convertToText(item, "alarmFunction", lang)}
            </td>
            <td className={"td9"}>
                {item.objectName}
            </td>
            <td className={"td10"}>
                {item.alarmMessage}
            </td>
        </tr>
    )
}

function AlarmSettingRuleEditor(props) {
    return (
        <Switch>
            {props.updateData.current.length === 0 &&
            <Redirect from={"/alarmSetting/rule/update"} to={{pathname: "/alarmSetting/rule"}}/>
            }
            <AlarmSettingUpdate updateData={props.updateData}/>
        </Switch>
    )
}

function AlarmSettingUpdate(props) {
    const [isOpen, setIsOpen] = useState(false)
    const token = useToken()
    const color = useCategoryColor(token)
    // console.log(props.updateData.current)
    function handleSave(event){
        event.preventDefault()
        setIsOpen(true)
    }

    const model = isOpen && <SaveRuleDataModel setIsOpen={setIsOpen} data={props.updateData.current} method={"PATCH"}/>
    return (
        <div className={"alarmSettingUpdate"}>
            {model}
            <div className={"editorTitle"}><FormattedMessage id={"alarmSetting.editor.title"}/></div>
            <form onSubmit={(event)=>{handleSave(event)}}>
                <div className={"ruleItemContainer"}>
                    {props.updateData.current.map((item, index)=>(<AlarmSettingRuleItem key={index} index={index}
                                                                                        updateData={props.updateData}
                                                                                        color={color}
                    />))}
                </div>
                <UpdateButtonContainer/>
            </form>
        </div>
    )
}

function AlarmSettingRuleItem(props) {
    const [data, setData] = useState(props.updateData.current[props.index])
    const initialData = useRef({})

    useEffect(()=>{
        initialData.current = {...props.updateData.current[props.index]}
        setData({...props.updateData.current[props.index]})
    }, [setData, props.updateData, props.index])

    const handleChange = useCallback((event, selection)=>{
        setData(pre=>({...pre, [selection]: event.target.value}))
        props.updateData.current[props.index][selection] = event.target.value
    },
    [setData, props.updateData, props.index])

    function handleReset() {
        setData({...initialData.current})
        props.updateData.current[props.index] = {...initialData.current}
    }

    return(
        <div className={"alarmSettingRuleItem"}>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor={"objectId"}>objectId</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"objectId"} value={data.objectId} required={true} disabled={true}
                           onChange={(event)=>{handleChange(event, "objectId")}}
                    />
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor={"originObjectId"}>originObjectId</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"originObjectId"} value={data.originObjectId} required={true} disabled={true}
                           onChange={(event)=>{handleChange(event, "originObjectId")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="sensorName">sensorName</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"sensorName"} value={data.sensorName} required={true} disabled={true}
                           onChange={(event)=>{handleChange(event, "sensorName")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="displayObjectId">displayObjectId</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"displayObjectId"} value={data.displayObjectId} required={true} disabled={true}
                           onChange={(event)=>{handleChange(event, "displayObjectId")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="alarmLogic">alarmLogic</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"alarmLogic"} value={data.alarmLogic} required={true} disabled={true}
                           onChange={(event)=>{handleChange(event, "alarmLogic")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="alarmCategory">alarmCategory</label>
                </div>
                <div className={"context colorContainer"}>
                    <div className={"colorDiv"}>
                        <div className={"halfCircle up"} style={{backgroundColor: props.color[data.alarmCategory][0]}}/>
                        <div className={"halfCircle down"} style={{backgroundColor: props.color[data.alarmCategory][props.color[data.alarmCategory].length-1]}}/>
                    </div>
                    <select name="alarmCategory" id="alarmCategory" className={"colorCode"} disabled={true}
                            value={data.alarmCategory} required={true}
                            onChange={(event)=>{handleChange(event, "alarmCategory")}}>
                        <OptionAuto data={allConditionData.alarmCategory.data}/>
                    </select>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="triggerValue">triggerValue</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"triggerValue"} value={data.triggerValue} required={true}
                           onChange={(event)=>{handleChange(event, "triggerValue")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="alarmFunction">alarmFunction</label>
                </div>
                <div className={"context"}>
                    <select name="alarmFunction" id="alarmFunction" className={"colorCode"}
                            value={data.alarmFunction} required={true}
                            onChange={(event)=>{handleChange(event, "alarmFunction")}}>
                        <OptionAuto data={allConditionData.alarmFunction.data}/>
                    </select>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="objectName">objectName</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"objectName"} value={data.objectName} required={true}
                           onChange={(event)=>{handleChange(event, "objectName")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="alarmMessage ">alarmMessage</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"alarmMessage"} value={data.alarmMessage} required={true}
                           onChange={(event)=>{handleChange(event, "alarmMessage")}}/>
                </div>
            </div>
            <div className={"buttonContainer"}>
                <div className={"button"} onClick={handleReset}><FormattedMessage id={"button.reset"}/></div>
            </div>
        </div>
    )
}

function UpdateButtonContainer() {
    return(
        <div className={"updateButtonContainer"}>
            <Link to={"/alarmSetting/rule"}>
                <div className={"button"}><FormattedMessage id={"button.cancel"}/></div>
            </Link>
            <button className={"button save"}><FormattedMessage id={"button.save"}/></button>
        </div>
    )
}

function AlarmSettingAdd() {
    const token = useToken()
    const color = useCategoryColor(token)
    const [addData, setAddData] = useState({
        "objectId": "",
        "originObjectId": "",
        "sensorName": "",
        "displayObjectId": "",
        "alarmLogic": "",
        "alarmCategory": "",
        "triggerValue": "",
        "alarmFunction": "",
        "objectName": "",
        "alarmMessage": ""}
    )
    const [isOpen, setIsOpen] = useState(false)

    function handleSubmit(event) {
        event.preventDefault()
        setIsOpen(true)
    }

    const model = isOpen && <SaveRuleDataModel setIsOpen={setIsOpen} data={addData} method={"POST"}/>
    return(
        <div className={"alarmSettingAdd"}>
            <div className={"title"}><FormattedMessage id={"alarmSetting.add.title"}/></div>
            <form onSubmit={(event)=>{handleSubmit(event)}}>
                <ForUpdateData addData={addData} setAddData={setAddData} color={color}/>
                <UpdateButton/>
            </form>
            {model}
        </div>
    )
}

function SaveRuleDataModel(props) {
    const token = useToken()
    const container = useModel()
    const [modelSaved, setModelSaved] = useState(true)

    function handleClose() {
        props.setIsOpen(false)
    }

    const handleSave = useCallback(async (data, method) => {
        // API
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/alarmSetting/rule", {
                method: method,
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify(
                    data
                )
            })
            const response2 = await checkFetchResult(response)
            console.log(response2)
            setModelSaved(false)
        }catch (e) {
            if (e.json) {
                const data = await e.json()
                alert(data)
            }
            console.log(e)
        }
    }, [token])

    return (
        ReactDOM.createPortal(
            <div className={"model2"}>
                {modelSaved ?
                    <div className={"alarmSettingModel"}>
                        <div className={"title"}>
                            <FormattedMessage id={"model.save.title"}/>
                        </div>
                        <div className={"buttonContainer"}>
                            <button className={"modelButton"} onClick={handleClose}><FormattedMessage
                                id={"button.cancel"}/></button>
                            <button className={"modelButton"} onClick={()=>(handleSave(props.data, props.method))}>
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
                                <FormattedMessage id={"model.save.alarmCategory.text"}/>
                            </div>
                            <div className={"button_div"}>
                                <Link to={"/alarmSetting/rule"}>
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

function ForUpdateData(props) {
    const {addData, setAddData} = props
    const handleChange = useCallback((event, selection)=>{
        setAddData(pre=>({...pre, [selection]: event.target.value}))
    },
    [setAddData])

    const backgroundUp = ()=>{
        if(addData.alarmCategory){
            return props.color[addData.alarmCategory][0]
        }else{
            return "rgba(0,0,0,0)"
        }
    }
    const backgroundDown = () =>{
        if(addData.alarmCategory){
            return props.color[addData.alarmCategory][props.color[addData.alarmCategory].length-1]
        }else{
            return "rgba(0,0,0,0)"
        }
    }
    return(
        <div className={"forUpdateData"}>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor={"objectId"}>objectId</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"objectId"} value={addData.objectId} required={true}
                           onChange={(event)=>{handleChange(event, "objectId")}}
                    />
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor={"originObjectId"}>originObjectId</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"originObjectId"} value={addData.originObjectId} required={true}
                           onChange={(event)=>{handleChange(event, "originObjectId")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="sensorName">sensorName</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"sensorName"} value={addData.sensorName} required={true}
                           onChange={(event)=>{handleChange(event, "sensorName")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="displayObjectId">displayObjectId</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"displayObjectId"} value={addData.displayObjectId} required={true}
                           onChange={(event)=>{handleChange(event, "displayObjectId")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="alarmLogic">alarmLogic</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"alarmLogic"} value={addData.alarmLogic} required={true}
                           onChange={(event)=>{handleChange(event, "alarmLogic")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="alarmCategory">alarmCategory</label>
                </div>
                <div className={"context colorContainer"}>
                    <div className={"colorDiv"}>
                        <div className={"halfCircle up"} style={{backgroundColor: backgroundUp()}}/>
                        <div className={"halfCircle down"} style={{backgroundColor: backgroundDown()}}/>
                    </div>
                    <select name="alarmCategory" id="alarmCategory" className={"colorCode"}
                            value={addData.alarmCategory} required={true}
                            onChange={(event)=>{handleChange(event, "alarmCategory")}}>
                        <OptionAuto data={allConditionData.alarmCategory.data}/>
                    </select>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="triggerValue">triggerValue</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"triggerValue"} value={addData.triggerValue} required={true}
                           onChange={(event)=>{handleChange(event, "triggerValue")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="alarmFunction">alarmFunction</label>
                </div>
                <div className={"context"}>
                    <select name="alarmFunction" id="alarmFunction" className={"colorCode"}
                            value={addData.alarmFunction} required={true}
                            onChange={(event)=>{handleChange(event, "alarmFunction")}}>
                        <OptionAuto data={allConditionData.alarmFunction.data}/>
                    </select>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="objectName">objectName</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"objectName"} value={addData.objectName} required={true}
                           onChange={(event)=>{handleChange(event, "objectName")}}/>
                </div>
            </div>
            <div className={"item"}>
                <div className={"title"}>
                    <label htmlFor="alarmMessage ">alarmMessage</label>
                </div>
                <div className={"context"}>
                    <input type="text" id={"alarmMessage"} value={addData.alarmMessage} required={true}
                           onChange={(event)=>{handleChange(event, "alarmMessage")}}/>
                </div>
            </div>
        </div>
    )
}

function UpdateButton() {

    return(
        <div className={"updateButton"}>
            <Link to={"/alarmSetting/rule"}>
                <div className={"button"}><FormattedMessage id={"button.cancel"}/></div>
            </Link>
            <button className={"button save"}><FormattedMessage id={"button.save"}/></button>
        </div>
    )
}

export {AlarmSettingArticle};
