import {useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import {alarmReducer, MONITORING_INITIAL_STATE} from "../reducer/alarmReducer";
import {CONNECT_SERVER, IS_DEVELOP, SERVER} from "../setting";
import {authContext, langContext} from "../component/mainIndex";

const modelRoot = document.getElementById('model-root')

function useModel() {
    const [container] = useState(() => document.createElement('div'))
    useEffect(() => {
        modelRoot.appendChild(container)
        return function cleanup() {
            modelRoot.removeChild(container)
        }
    })
    return container
}

function useUrl() {
    const {mainPath} = useParams()
    const {subPath} = useParams()
    return {
        mainPath, subPath
    }
}

const useGetSizes = (myRef) => {
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    const controller = useRef(false)

    const handleResize = useCallback(()=>{
        setWidth(myRef.current.offsetWidth)
        setHeight(myRef.current.offsetHeight)
    },[myRef])

    useEffect(() => {
        controller.current = true
        if(controller.current){
            handleResize()
        }
        return () => {
            controller.current = false
        }
    }, [handleResize])

    return {width, height}
}

function useDateTimeLimit(){
    const [firstMaxDate, setFirstMaxDate] = useState(null)
    const [lastMinDate, setLastMinDate] = useState(null)
    const [firstMaxTime, setFirstMaxTime] = useState(null)
    const [lastMinTime, setLastMinTime] = useState(null)

    function changeFirstDate(event) {
        setLastMinDate(event.target.value)
    }
    function changeLastDate(event) {
        setFirstMaxDate(event.target.value)
    }
    function changeFirstTime(event){
        if(firstMaxDate === lastMinDate){
            setLastMinTime(event.target.value)
        }else{
            setLastMinTime(null)
            setFirstMaxTime(null)
        }
    }
    function changeLastTime(event){
        if(firstMaxDate === lastMinDate){
            setFirstMaxTime(event.target.value)
        }else{
            setLastMinTime(null)
            setFirstMaxTime(null)
        }
    }
    return {firstMaxDate, lastMinDate, firstMaxTime, lastMinTime, changeFirstDate, changeLastDate, changeFirstTime, changeLastTime}
}

function useFold(initial=true){
    const [isFold, setIsFold] = useState(initial)

    const foldClassName = useMemo(()=>{
        if(isFold){
            return "arrow right"
        }else{
            return "arrow down"
        }
    },[isFold])

    function changeFold(){
        setIsFold(pre=>!pre)
    }
    return {isFold, foldClassName, changeFold, setIsFold}
}

// function dealAccountUserData(data, params, lang){
//     const {pagination, sortCondition, search, filterCondition} = params
//     const filteredData = eventFilter(data, filterCondition)
//     const searchedData = eventSearch(filteredData, search, lang)
//     const sortedData = eventSort(searchedData, sortCondition)
//     const {upNumber, downNumber} = pageDownUp(pagination, sortedData.length)
//     return {
//         data:{
//             dealData: sortedData.slice(downNumber-1, upNumber),
//             metadata: {
//                 totalCount: sortedData.length,
//                 maxPage: Math.ceil(sortedData.length/ pagination.pageSize),
//                 downNumber: downNumber,
//                 upNumber: upNumber,
//             }
//         }
//     }
// }

function useInterval(callback, delay){
    const savedCallback = useRef()

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {
        let controller = true
        function tick(){
            savedCallback.current()
        }
        if(delay !== null && controller===true){
            let id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
        return () =>{
            controller = false
        }
    }, [delay])
}

function useInstantAlarm(token) {
    const controller = useRef(false)
    const history = useHistory()
    const [alarmVariables, alarmDispatch] = useReducer(alarmReducer, MONITORING_INITIAL_STATE)

    const fetchAlarmData = useCallback(async (alarmDispatch, token, history)=> {
        try {
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/getAlarmEventList", {
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
            const response2 = await checkFetchResult(response)
            const data = await response2.json()
            if(controller.current){
                alarmDispatch({
                    type: "UPDATE_DATA",
                    payload: {data: data}
                })
            }
        } catch (e) {
            if (typeof (e) === "object" && e.json) {
                console.log(e)
                const data = await e.json()
                history.push("/handleError/" + data.Message)
            }
            console.log(e)
        }
    }, [])

    useEffect(() => {
        controller.current = true
        if(CONNECT_SERVER){
            fetchAlarmData(alarmDispatch, token, history)
            return () => {
                controller.current = false
            }
        }
    }, [token, history, fetchAlarmData])
    useInterval(() => {
        fetchAlarmData(alarmDispatch, token, history)
    },alarmVariables.isRunning ? alarmVariables.delay : null)
    return {alarmVariables, alarmDispatch}
}

function useFastSelfSearch(search){
    let fastClassName
    let selfClassName
    if(search==="fast"){
        fastClassName = "item active fast"
    }else{
        fastClassName = "item"
    }

    if(search==="self"){
        selfClassName = "item active self"
    }else{
        selfClassName = "item"
    }
    return {fastClassName, selfClassName}
}

function useChartSize(){
    const width = document.documentElement.clientWidth
    let border
    let size
    let labelWidth
    let lineBorder
    let lineRadius
    if(width>=1920){
        border = 6
        size = 16
        labelWidth = 40
        lineBorder = 15
        lineRadius =10
    }else if(width>=1440){
        border = 4.5
        size = 12
        labelWidth = 30
        lineBorder = 11.25
        lineRadius = 7.5
    }else if (width>=1080){
        border = 3.375
        size = 9
        labelWidth = 22.5
        lineBorder = 8.4375
        lineRadius = 5.625
    }else{
        border = 1
        size = 8
        labelWidth = 20
        lineBorder = 8
        lineRadius = 5
    }
    return {border, size, labelWidth, lineBorder, lineRadius}
}

function arrayDataHardCopy(data){
    const data2 = []
    for(let item of data){
        let i = {}
        for(let property in item){
            if(item.hasOwnProperty(property)){
                i[property] = item[property]
            }
        }
        data2.push(i)
    }
    return data2
}

function handleSettingDelete(setData, data){
    setData(pre=>{
        let result = [...pre]
        let deleteIndex = []
        for (let index in pre){
            if (pre.hasOwnProperty(index) && data.deleteArray.current.includes(pre[index][data.property].toString())){
                deleteIndex.unshift(index)
            }
        }
        for (let index of deleteIndex){
            result.splice(index, 1)
        }
        return result
    })
}

function useAdmin(){
    const initial = IS_DEVELOP ? {
            "AccountInfo": {
                "29": "",
                "Password": "DG45nCFMdYlMAU14VIOBVt+lCpiSzH7+Hedn+qDOjzw=",
                "CompanyId": "CCAU",
                "ProductId": "NADI_3DOCMS",
                "ProjectId": "CCAU",
                "Description": "SuperUser",
                "Group": "NADI",
                "RoleGroup": "NADI",
                "LicenseId": "",
                "ExpiryDate": "",
                "belongs": "",
                "SiUsername": "",
                "UserInfo": [
                    {
                        "key": "Name",
                        "Value": "Wilson Lin",
                        "Language": "CN"
                    },
                    {
                        "key": "Address",
                        "Value": "10491台北市中山區松江路309號9F",
                        "Language": "CN"
                    },
                    {
                        "key": "PhoneNumber",
                        "Value": "02 2506 7700",
                        "Language": "CN"
                    },
                    {
                        "key": "e-mail",
                        "Value": "wilson.lin@nadisystem.com",
                        "Language": "CN"
                    }
                ],
                "AccountId": "NADI_Wilson",
                "token": "57at3klp0y192aecwc"
            },
            "Template": {
                "Template": {
                    "Data_CRUD": {
                        "ColdData_C": 1,
                        "ColdData_R": 1,
                        "ColdData_U": 1,
                        "ColdData_D": 1,
                        "HotData_C": 1,
                        "HotData_R": 1,
                        "HotData_U": 1,
                        "HotData_D": 1
                    },
                    "Alarm_Group": {
                        "Alarm": 1,
                        "SmartRack": {
                            "Emergency": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "LifeSafety": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Security": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Supervisory": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Trouble": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "High": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Medium": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Low": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Fault": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Status": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Info": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Log": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ]
                        },
                        "Other": {
                            "Emergency": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "LifeSafety": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Security": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Supervisory": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Trouble": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "High": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Medium": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Low": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Fault": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Status": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Info": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Log": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ]
                        },
                        "Security": {
                            "Emergency": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "LifeSafety": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Security": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Supervisory": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Trouble": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "High": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Medium": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Low": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Fault": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Status": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Info": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Log": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ]
                        },
                        "DCIM": {
                            "Emergency": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "LifeSafety": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Security": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Supervisory": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Trouble": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "High": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Medium": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Low": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Fault": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Status": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Info": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ],
                            "Log": [
                                "AlarmNeedAckNeedReset",
                                "AlarmNeedAckNoReset",
                                "AlarmNoAckNoReset",
                                "Close"
                            ]
                        }
                    },
                    "Alarm_CRUD": {
                        "C": 1,
                        "R": 1,
                        "U": 1,
                        "D": 1,
                        "E_C": 1,
                        "E_D": 1
                    },
                    "Account_Template_CRUD": {
                        "Is_Super": 1,
                        "C": 1,
                        "R": 1,
                        "U": 1,
                        "D": 1,
                        "T_C": 1,
                        "T_R": 1,
                        "T_U": 1,
                        "T_D": 1,
                        "Token_C": 1,
                        "Token_R": 1,
                        "Token_U": 1,
                        "Token_D": 1,
                        "System_U": 1,
                        "Send_Command": 1
                    },
                    "Account_Plugin": {
                        "IBMS_System_Setting_URL_Setting_U": 1,
                        "IBMS_System_Setting_Logo_U": 1,
                        "IBMS_Reoprt_R": 1,
                        "IBMS_Situation_Room_R": 1,
                        "IBMS_Account_R": 1,
                        "IBMS_3D_R": 1,
                        "IBMS_Assign_Job": 1
                    }
                }
            }
        }: null
    const [user, setUser] = useState(initial)
    const signIn = (data)=>{
        setUser(data)
    }
    const signOut = ()=>{
        setUser(null)
    }
    return {user, signIn, signOut}
}

function useGetIndexPicture(controller){
    const [indexImage, setIndexImage] = useState(null)
    function fetchIndexImage(){
        return fetch(SERVER + "/api/IBMS/Web/V1/systemSetting/logo/index", {
            method: "GET",
        }).then(res => {
            if (!res.ok) {
                throw res.statusText;
            }
            return res.blob()
        })
            .then(images=>{
                return URL.createObjectURL(images)
            })
            .catch(err => console.log('err', err))
    }
    useEffect(()=>{
        async function initial(){
            const [image] = await Promise.all([
                fetchIndexImage()
            ])
            if(controller.current){
                setIndexImage(image)
            }
        }
        initial()
    },[controller])
    return indexImage
}

function useLanguage(){
    return useContext(langContext).lang
}

function placeholder(lang){
    if (lang==="CN"){
        return "搜寻"
    }else if (lang==="EN"){
        return "search"
    }
}

function useToken(){
    const auth = useContext(authContext)
    return auth.user.AccountInfo.token
}

function useTemplate(){
    const auth = useContext(authContext)
    return auth.user.Template.Template
}

function useAsideHoverTitle(asideOpen, text){
    const lang = useLanguage()
    const [hoverTitle, setHoverTitle] = useState(false)

    function handleHoverTitle(type){
        if(type==="in"){
            setHoverTitle(true)
        }else if(type==="out"){
            setHoverTitle(false)
        }
    }

    let contain = null
    if(!asideOpen && hoverTitle) {
        contain = (
            <div className={"hoverText"}>
                {text[lang]}
            </div>
        )
    }
    return {contain, handleHoverTitle}
}

function checkFetchResult(response){
    return new Promise(function(resolve, reject){
        if(response.ok){
            resolve(response)
        }else{
            reject(response)
        }
    })
}

function checkDataResult(data){
    return new Promise(function(resolve, reject){
        if (data["Code"]===200){
            resolve(data)
        }else{
            reject(data)
        }
    })
}

function checkTime(start, end) {
    return new Promise(function (resolve, reject) {
        if (start<end) {
            resolve()
        } else {
            reject("date and time error")
        }
    })
}

function useAccountGroup(filter=false){
    const controller = useRef(false)
    const [groupData, setGroupData] = useState({
        "id": "accessLevelSelect",
        "name": "accessLevel",
        "title": {"CN":"帐号级别","EN":"Account Level"},
        "index": {
        },
        "data": [
        ]
    })
    const token = useToken()
    const fetchGroup = useCallback(async (token, filter)=>{
        try{
            const response = await fetch(SERVER.slice(0, -4) + "9322/api/account/get_template_list", {
                method: "GET",
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
            const data = await response.json()
            if(controller.current){
                const dealData = {"value": Object.keys(data), "name": Object.values(data)}
                const dataIndex = {}
                const subData = []
                if(filter===true){
                    dealData.value.unshift("")
                    dealData.name.unshift("All")
                }
                // console.log(dealData)
                dealData.value.map((item, index)=>(
                    dataIndex[item.toString()] = index
                ))
                dealData.name.map((item, index)=> {
                    if (item==="All"){
                        subData.push({
                            "name": {"CN":"全部","EN":"All"}, "value": ""
                        })
                    }else {
                        subData.push({
                            "name": {"CN": item[0], "EN": item[0]}, "value": dealData.value[index]
                        })
                    }
                    return null
                })
                setGroupData({
                    "id": "accessLevelSelect",
                    "name": "accessLevel",
                    "title": {"CN":"帐号级别","EN":"Account Level"},
                    "index": dataIndex,
                    "data": subData
                })
            }
        }catch (e){
            console.log(e)
        }
    },[])
    useEffect(()=>{
        controller.current = true
        fetchGroup(token, filter)
        return ()=>{
            controller.current = false
        }
    },[token, fetchGroup, filter])
    return groupData
}

function useCategoryColor(token){
    const controller = useRef(false)
    const [color, setColor] = useState({
        "High": [],
        "Medium": [],
        "Low": []
    })
    const fetchColor = useCallback(async (token, setColor)=>{
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/alarmSetting/category",{
                headers: new Headers({
                    Authorization: "Bearer "+ token,
                })
            })
            const data = await response.json()
            setColor({
                "High": data[5].Color.slice(1, -1).split(", "),
                "Medium": data[6].Color.slice(1, -1).split(", "),
                "Low": data[7].Color.slice(1, -1).split(", ")
            })
        }catch (e) {
            console.log(e)
        }
    },[])
    useEffect(()=>{
        controller.current = true
        fetchColor(token, setColor)
        return ()=>{
            controller.current = false
        }
    }, [fetchColor, token])
    return color
}

export {useModel, useUrl, useGetSizes, useDateTimeLimit, useFold, useInterval, useInstantAlarm, placeholder, useFastSelfSearch, useChartSize, handleSettingDelete, useLanguage, arrayDataHardCopy, useAdmin, useGetIndexPicture,
    useToken, useAsideHoverTitle, checkFetchResult,
    checkTime, useTemplate, useAccountGroup, checkDataResult, useCategoryColor
};
