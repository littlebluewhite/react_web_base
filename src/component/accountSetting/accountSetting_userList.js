import {Link, Redirect, Route, Switch} from "react-router-dom";
import {FilterElement, OptionAuto, Sort} from "../common";
import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from "react";
import {
    checkFetchResult,
    useAccountGroup,
    useLanguage,
    useModel, useToken
} from "../../function/usePackage";
import {sortConditionData} from "../../data/sortConditionData";
import "../../SCSS/accountSetting/accountSetting_userList.css"
import ReactDOM from "react-dom";
import {FormattedMessage} from "react-intl";
import {SERVER} from "../../setting";
import {allConditionData} from "../../data/allConditionData";
import {accountUrl} from "../../data/url";
import {AccountSettingTitle} from "./accountSetting_common";
import {ACCOUNT_SETTING_USER_LIST_INITIAL_STATE, userListReducer} from "../../reducer/accountSetting/userList/userList";
import {convertTime} from "../../function/convertFunction";
import {dealData} from "../../function/dealDataFunction";


function AccountSettingUserListIndex(){
    const editorData = useRef([])
    return(
        <Switch>
            <Route exact path={"/accountSetting/userList"}>
                <AccountSettingUserList editorData={editorData}/>
            </Route>
            <Route path={"/accountSetting/userList/editor"}>
                <AccountSettingUserListEditorIndex editorData={editorData}/>
            </Route>
            <Route path={"/accountSetting/userList/create"}>
                <AccountSettingUserListCreate/>
            </Route>
        </Switch>
    )
}

function AccountSettingUserList(props) {
    const controller = useRef(false)
    allConditionData["accessLevel"] = useAccountGroup(true)
    const token = useToken()
    const lang = useLanguage()
    const [variables, dispatch] = useReducer(userListReducer, ACCOUNT_SETTING_USER_LIST_INITIAL_STATE)
    const [rawData, setRawData] = useState([])
    const [check, setCheck] = useState({})
    props.editorData.current = Object.values(check)
    const {data} = useMemo(()=>(
        dealData(rawData, variables, lang)), [rawData, variables, lang]
    )

    const fetchAccount = useCallback(async ()=>{
        try{
            const response = await fetch(SERVER+"/api/IBMS/Web/V1/report/"+accountUrl,{
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
            const data = await response.json()
            if(controller.current){
                setRawData(data)
            }
            // console.log(data)
        }catch (e) {
            console.log(e)
        }
    },[token])

    useEffect(()=>{
        controller.current = true
        fetchAccount()
        return ()=>{
            controller.current = false
        }
    },[fetchAccount])

    return(
        <div className={"accountSettingUserList"}>
            <AccountSettingTitle dispatch={dispatch} variables={variables} check={check} data={data}
                                 setCheck={setCheck} setRawData={setRawData} type={"userList"}
            />
            <AccountFilter dispatch={dispatch} variables={variables}/>
            <div className={"scrollContainer"}>
                <AccountSettingUserListSort variables={variables} dispatch={dispatch}/>
                <AccountSettingUserListData data={data.dealData} check={check} setCheck={setCheck}/>
            </div>
        </div>
    )
}

function AccountFilter(props) {
    const groupData = useAccountGroup(true)
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
            type: "RESET_FILTER_ACCOUNT_SETTING_USER_LIST"
        })
    }

    return (
        <div className={"accountFilter"}>
            <FilterElement filter={groupData} handleFilter={handleFilter}
                           value={props.variables.filterCondition.accessLevel}/>
            <button className={"secondary_button reset"} onClick={handleReset}>
                <FormattedMessage id={"button.reset"}/>
            </button>
        </div>
    )
}

function AccountSettingUserListSort(props) {
    // console.log(props.variables)
    return(
        <div className={"sortContainer"}>
            <Sort data={sortConditionData["username"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["accessLevel"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["subCompany"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["name"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["loginTime"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
        </div>
    )
}

function  AccountSettingUserListData(props) {
    return(
        <div className={"accountSettingUserListData"}>
            <table className={"accountSettingTable"}>
                <tbody>
                {props.data.map((item, index) => (<AccountSettingElement item={item} key={index}
                                                                         check={props.check} setCheck={props.setCheck}
                />))}
                </tbody>
            </table>
        </div>
    )
}

function AccountSettingElement(props) {
    const lang = useLanguage()
    const {item, check, setCheck} = props
    let trStyle = null
    let isCheck = false

    if(item.username in check){
        trStyle = "active"
        isCheck = true
    }

    const handleCheck = useCallback(()=>{
        if (check[item.username]){
            setCheck({})
        }else{
            setCheck({[item.username]: item})
        }
    },[setCheck, item, check])

    return(
        <tr className={trStyle} onClick={handleCheck}>
            <td className={"td5"}>
                <div className={"td5Container"}>
                    <div className={"inputContainer"}>
                        <input type="radio" checked={isCheck} value={""}
                               onChange={()=>(handleCheck())}/>
                    </div>
                    <div className={"name"}>
                        {item.username}
                    </div>
                </div>
            </td>
            <td className={"td6"}>
                { allConditionData["accessLevel"].data.length===0 ? "":  allConditionData["accessLevel"].data[ allConditionData["accessLevel"].index[item.accessLevel]].name[lang]}
            </td>
            <td className={"td7"}>
                {item.subCompany}
            </td>
            <td className={"td10"}>
                {item.name}
            </td>
            <td className={"td8"}>
                {convertTime(item.loginTime)}
            </td>
        </tr>
    )
}

function AccountSettingUserListEditorIndex(props) {
    return (
        <Switch>
            {props.editorData.current.length === 0 &&
            <Redirect form={"/accountSetting/userList/editor"} to={{pathname: "/accountSetting/userList"}}/>
            }
            <AccountSettingUserListEditor editorData={props.editorData}/>
        </Switch>
    )
}

function AccountSettingUserListEditor(props) {
    const groupData = useAccountGroup(false)
    const [information, setInformation] = useState({...props.editorData.current[0]})
    const [isOpen, setIsOpen] = useState(false)

    const model = isOpen && <SaveAccountUpdateModel groupData={groupData}
                                                    setIsOpen={setIsOpen}
                                                    information={information}/>

    const handleChange = useCallback((event, title) => {
        setInformation(pre => ({...pre, [title]: event.target.value}))
    }, [])

    function handleReset() {
        setInformation({...props.editorData.current[0]})
    }

    function handleSubmit(event) {
        event.preventDefault()
        setIsOpen(true)
    }

    return (
        <div className={"accountSettingUserListEditor"}>
            {model}
            <form onSubmit={(event)=>(handleSubmit(event))}>
                <div className={"upContainer"}>
                    <div className={"title"}>
                        <FormattedMessage id={"index.personal.profile"}/>
                    </div>
                    <div className={"informationContainer"}>
                        <div className={"leftContainer"}>
                            <div className={"item"}>
                                <div className={"name user"}>
                                    <FormattedMessage id={"index.personal.username"}/>
                                </div>
                                <div className={"value user"}>
                                    {information.username}
                                </div>
                            </div>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.companyName"}/>*
                                </div>
                                <div className={"value"}>
                                    <input required={true} type="text" value={information.subCompany}
                                           onChange={(event) => (handleChange(event, "subCompany"))}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={"title"}>
                        <FormattedMessage id={"index.personal.information"}/>
                    </div>
                    <div className={"informationContainer"}>
                        <div className={"leftContainer"}>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.name"}/>*
                                </div>
                                <div className={"value"}>
                                    <input required={true} type="text" value={information.name}
                                           onChange={(event) => (handleChange(event, "name"))}/>
                                </div>
                            </div>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.phone"}/>*
                                </div>
                                <div className={"value"}>
                                    <input required={true} type="text" value={information.phone}
                                           onChange={(event) => (handleChange(event, "phone"))}/>
                                </div>
                            </div>
                        </div>
                        <div className={"rightContainer"}>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.email"}/>*
                                </div>
                                <div className={"value"}>
                                    <input required={true} type="text" value={information.email}
                                           onChange={(event) => (handleChange(event, "email"))}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={"informationContainer"}>
                        <div className={"leftContainer address"}>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.address"}/>
                                </div>
                                <div className={"value"}>
                                    <input type="text" value={information.address}
                                           onChange={(event) => (handleChange(event, "address"))}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={"title"}>
                        <FormattedMessage id={"index.personal.mainAuthorization"}/>*
                    </div>
                    <div className={"informationContainer"}>
                        <div className={"leftContainer"}>
                            <div className={"item"}>
                                <div className={"name accountLevel"}>
                                    <div className={"svgContainer"}>
                                        <svg width="1.3125rem" height="1.375rem" viewBox="0 0 21 22" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M8.07692 0.5C4.92692 0.5 2.42308 2.91111 2.42308 5.94444C2.41756 6.83645 2.64103 7.71595 3.07363 8.50473C3.50623 9.29351 4.13454 9.96712 4.90269 10.4657C2.02731 11.658 0 14.416 0 17.6111H1.61538C1.61538 14.1889 4.52308 11.3889 8.07692 11.3889C11.2269 11.3889 13.7308 8.97778 13.7308 5.94444C13.7308 2.91111 11.2269 0.5 8.07692 0.5ZM8.07692 2.05556C10.3385 2.05556 12.1154 3.76667 12.1154 5.94444C12.1154 8.12222 10.3385 9.83333 8.07692 9.83333C5.81538 9.83333 4.03846 8.12222 4.03846 5.94444C4.03846 3.76667 5.81538 2.05556 8.07692 2.05556ZM12.1154 11.3889C11.2269 11.3889 10.5 12.0889 10.5 12.9444V16.3667L15.3462 21.0333C15.6692 21.3444 16.0731 21.5 16.4769 21.5C16.8808 21.5 17.2846 21.3444 17.6077 21.0333L20.5154 18.2333C20.8385 17.9222 21 17.5333 21 17.1444C21 16.7556 20.8385 16.3667 20.5154 16.0556L15.6692 11.3889H12.1154ZM12.1154 12.9444H15.0231L19.3846 17.1444L16.4769 19.9444L12.1154 15.7444V12.9444ZM13.7308 13.7222C13.5166 13.7222 13.3111 13.8042 13.1596 13.95C13.0082 14.0959 12.9231 14.2937 12.9231 14.5C12.9231 14.7063 13.0082 14.9041 13.1596 15.05C13.3111 15.1958 13.5166 15.2778 13.7308 15.2778C13.945 15.2778 14.1504 15.1958 14.3019 15.05C14.4534 14.9041 14.5385 14.7063 14.5385 14.5C14.5385 14.2937 14.4534 14.0959 14.3019 13.95C14.1504 13.8042 13.945 13.7222 13.7308 13.7222Z"
                                                fill="white"/>
                                        </svg>
                                    </div>
                                    <div className={"text"}>
                                        <FormattedMessage id={"index.personal.selectLevel"}/>*
                                    </div>
                                </div>
                                <div className={"value"}>
                                    <select id="" value={information.accessLevel}
                                            onChange={(event) => (handleChange(event, "accessLevel"))}>
                                        <OptionAuto data={groupData.data}/>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"downContainer"}>
                    <div className={"buttonContainer"}>
                        <Link to={"/accountSetting/userList"}>
                            <div className={"button"}>
                                <FormattedMessage id={"button.cancel"}/>
                            </div>
                        </Link>
                        <div className={"button"} onClick={handleReset}>
                            <FormattedMessage id={"button.reset"}/>
                        </div>
                        <button className={"button save"}>
                            <FormattedMessage id={"button.save"}/>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

function SaveAccountUpdateModel(props) {
    const token = useToken()
    const container = useModel()
    const [modelSaved, setModelSaved] = useState(true)
    const {information} = {...props}
    const group = props.groupData.data[props.groupData.index[information.accessLevel]].name["EN"]

    function handleClose() {
        props.setIsOpen(false)
    }

    const handleSave = useCallback(async (data) => {
        // API
        try{
            const response = await fetch(SERVER.slice(0, -4) + "9322/api/account/update",{
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "Account": data.username,
                    "Name": data.name,
                    "SubCompany": data.subCompany,
                    "CompanyId": "CCAU",
                    "ProductId": "CCAU",
                    "ProjectId": "",
                    "Description": "",
                    "Group": group,
                    "RoleGroup": group,
                    "Language": "CN",
                    "Address": data.address,
                    "PhoneNumber": data.phone,
                    "Email": data.email
                })
            })
            const response2 = await checkFetchResult(response)
            console.log(response2)
            setModelSaved(false)
        }catch (e) {
            if (typeof(e)==="object" && e.json) {
                const data = await e.json()
                alert(data)
            }
            console.log(e)
        }
    }, [group, token])

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
                            <button className={"modelButton"} onClick={()=>(handleSave(props.information))}>
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
                                <FormattedMessage id={"model.save.accountUpdate.text"}/>
                            </div>
                            <div className={"button_div"}>
                                <Link to={"/accountSetting/userList"}>
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

function AccountSettingUserListCreate(){
    const groupData = useAccountGroup(false)
    const lang = useLanguage()
    const checkPasswordRef = useRef(null)
    const usernameRef = useRef(null)
    const informationInitial = {
        "username": "",
        "accessLevel": 0,
        "password": "",
        "checkPassword": "",
        "subCompany": "",
        "phone": "",
        "email": "",
        "address": "",
        "name": ""
    }
    const [information, setInformation] = useState(informationInitial)
    const [isOpen, setIsOpen] = useState(false)

    const usernameMessage = () =>{
        if (information.username && information.username.length<6){
            return {"CN": "帐户至少6个字", "EN": "Username at least 6 characters"}[lang]
        }
    }

    const passwordMessage = ()=>{
        if(information.password && information.password.length<6){
            return {"CN": "密码至少6个字", "EN": "Password at least 6 characters"}[lang]
        }
        return null
    }

    const passwordCheckMessage = ()=>{
        if(information.checkPassword && (information.password !== information.checkPassword)){
            return {"CN": "密码不一致", "EN": "Inconsistent passwords"}[lang]}
        return null
    }

    const model = isOpen && <SaveAccountCreateModel groupData={groupData}
                                                    setIsOpen={setIsOpen}
                                                    information={information}/>

    const handleChange = useCallback((event, title) => {
        setInformation(pre => ({...pre, [title]: event.target.value}))
    }, [])

    function handleSubmit(event) {
        event.preventDefault()
        if(passwordMessage() || passwordCheckMessage()){
            checkPasswordRef.current.focus()
        }else if(usernameMessage()){
            usernameRef.current.focus()
        }else{
            setIsOpen(true)
        }
    }

    return (
        <div className={"accountSettingUserListCreate"}>
            {model}
            <form onSubmit={(event)=>(handleSubmit(event))}>
                <div className={"upContainer"}>
                    <div className={"title"}>
                        <FormattedMessage id={"index.personal.profile"}/>
                    </div>
                    <div className={"informationContainer"}>
                        <div className={"leftContainer"}>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.username"}/>*
                                </div>
                                <div className={"value checkPassword"}>
                                    <input required={true} type="text" value={information.username}
                                           onChange={(event) => (handleChange(event, "username"))}
                                           ref={usernameRef}
                                           placeholder={"Must between 6 to 40 characters long."}
                                    />
                                    {information.username && information.username.length>=6 &&
                                        <div className={"correctContainer"}>
                                            <svg width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM9.003 14L16.073 6.929L14.659 5.515L9.003 11.172L6.174 8.343L4.76 9.757L9.003 14Z" fill="#00FF94"/>
                                            </svg>
                                        </div>
                                    }
                                    <div className={"message"}>
                                        {usernameMessage()}
                                    </div>
                                </div>
                            </div>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.password"}/>*
                                </div>
                                <div className={"value checkPassword"}>
                                    <input required={true} type="password" value={information.password} ref={checkPasswordRef}
                                           onChange={(event) => (handleChange(event, "password"))}
                                           placeholder={"Must include at least 6 letters."}
                                    />
                                    {information.password && information.password.length>=6 &&
                                        <div className={"correctContainer"}>
                                            <svg width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM9.003 14L16.073 6.929L14.659 5.515L9.003 11.172L6.174 8.343L4.76 9.757L9.003 14Z" fill="#00FF94"/>
                                            </svg>
                                        </div>
                                    }
                                    <div className={"message"}>
                                        {passwordMessage()}
                                    </div>
                                </div>
                            </div>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.checkPassword"}/>*
                                </div>
                                <div className={"value checkPassword"}>
                                    <input required={true} type="password" value={information.checkPassword}
                                           onChange={(event) => (handleChange(event, "checkPassword"))}
                                           placeholder={"Confirm password."}
                                    />
                                    {information.checkPassword && (information.password === information.checkPassword) &&
                                        <div className={"correctContainer"}>
                                            <svg width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM9.003 14L16.073 6.929L14.659 5.515L9.003 11.172L6.174 8.343L4.76 9.757L9.003 14Z" fill="#00FF94"/>
                                            </svg>
                                        </div>
                                    }
                                    <div className={"message"}>
                                        {passwordCheckMessage()}
                                    </div>
                                </div>
                            </div>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.companyName"}/>*
                                </div>
                                <div className={"value"}>
                                    <input required={true} type="text" value={information.subCompany}
                                           onChange={(event) => (handleChange(event, "subCompany"))}/>
                                </div>
                            </div>
                        </div>
                        <div className={"rightContainer"}>
                        </div>
                    </div>
                    <div className={"title"}>
                        <FormattedMessage id={"index.personal.information"}/>
                    </div>
                    <div className={"informationContainer"}>
                        <div className={"leftContainer"}>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.name"}/>*
                                </div>
                                <div className={"value"}>
                                    <input required={true} type="text" value={information.name}
                                           onChange={(event) => (handleChange(event, "name"))}/>
                                </div>
                            </div>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.phone"}/>*
                                </div>
                                <div className={"value"}>
                                    <input required={true} type="text" value={information.phone}
                                           onChange={(event) => (handleChange(event, "phone"))}/>
                                </div>
                            </div>
                        </div>
                        <div className={"rightContainer"}>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.email"}/>*
                                </div>
                                <div className={"value"}>
                                    <input required={true} type="text" value={information.email}
                                           onChange={(event) => (handleChange(event, "email"))}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={"informationContainer"}>
                        <div className={"leftContainer address"}>
                            <div className={"item"}>
                                <div className={"name"}>
                                    <FormattedMessage id={"index.personal.address"}/>
                                </div>
                                <div className={"value"}>
                                    <input type="text" value={information.address}
                                           onChange={(event) => (handleChange(event, "address"))}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={"title"}>
                        <FormattedMessage id={"index.personal.mainAuthorization"}/>*
                    </div>
                    <div className={"informationContainer"}>
                        <div className={"leftContainer"}>
                            <div className={"item"}>
                                <div className={"name accountLevel"}>
                                    <div className={"svgContainer"}>
                                        <svg width="1.3125rem" height="1.375rem" viewBox="0 0 21 22" fill="none"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M8.07692 0.5C4.92692 0.5 2.42308 2.91111 2.42308 5.94444C2.41756 6.83645 2.64103 7.71595 3.07363 8.50473C3.50623 9.29351 4.13454 9.96712 4.90269 10.4657C2.02731 11.658 0 14.416 0 17.6111H1.61538C1.61538 14.1889 4.52308 11.3889 8.07692 11.3889C11.2269 11.3889 13.7308 8.97778 13.7308 5.94444C13.7308 2.91111 11.2269 0.5 8.07692 0.5ZM8.07692 2.05556C10.3385 2.05556 12.1154 3.76667 12.1154 5.94444C12.1154 8.12222 10.3385 9.83333 8.07692 9.83333C5.81538 9.83333 4.03846 8.12222 4.03846 5.94444C4.03846 3.76667 5.81538 2.05556 8.07692 2.05556ZM12.1154 11.3889C11.2269 11.3889 10.5 12.0889 10.5 12.9444V16.3667L15.3462 21.0333C15.6692 21.3444 16.0731 21.5 16.4769 21.5C16.8808 21.5 17.2846 21.3444 17.6077 21.0333L20.5154 18.2333C20.8385 17.9222 21 17.5333 21 17.1444C21 16.7556 20.8385 16.3667 20.5154 16.0556L15.6692 11.3889H12.1154ZM12.1154 12.9444H15.0231L19.3846 17.1444L16.4769 19.9444L12.1154 15.7444V12.9444ZM13.7308 13.7222C13.5166 13.7222 13.3111 13.8042 13.1596 13.95C13.0082 14.0959 12.9231 14.2937 12.9231 14.5C12.9231 14.7063 13.0082 14.9041 13.1596 15.05C13.3111 15.1958 13.5166 15.2778 13.7308 15.2778C13.945 15.2778 14.1504 15.1958 14.3019 15.05C14.4534 14.9041 14.5385 14.7063 14.5385 14.5C14.5385 14.2937 14.4534 14.0959 14.3019 13.95C14.1504 13.8042 13.945 13.7222 13.7308 13.7222Z"
                                                fill="white"/>
                                        </svg>
                                    </div>
                                    <div className={"text"}>
                                        <FormattedMessage id={"index.personal.selectLevel"}/>*
                                    </div>
                                </div>
                                <div className={"value"}>
                                    <select id="" value={information.accessLevel}
                                            onChange={(event) => (handleChange(event, "accessLevel"))}>
                                        <OptionAuto data={groupData.data}/>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={"downContainer"}>
                    <div className={"buttonContainer"}>
                        <Link to={{pathname: "/accountSetting/userList"}}>
                            <div className={"button"}>
                                <FormattedMessage id={"button.cancel"}/>
                            </div>
                        </Link>
                        <button className={"button save"}>
                            <FormattedMessage id={"button.save"}/>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

function SaveAccountCreateModel(props) {
    const token = useToken()
    const container = useModel()
    const [modelSaved, setModelSaved] = useState(true)
    // console.log(props.groupData.data[props.groupData.index[props.information.accessLevel]])
    const group = props.groupData.data[props.groupData.index[props.information.accessLevel]].name["EN"]

    function handleClose() {
        props.setIsOpen(false)
    }

    const handleSave = useCallback(async (data) => {
        // API
        try{
            const response = await fetch(SERVER.slice(0, -4) + "9322/api/account/register",{
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token,
                }),
                body: JSON.stringify({
                    "Account": data.username,
                    "Password": data.password,
                    "Name": data.name,
                    "SubCompany": data.subCompany,
                    "CompanyId": "CCAU",
                    "ProductId": "CCAU",
                    "ProjectId": "",
                    "Description": "",
                    "Group": group,
                    "RoleGroup": group,
                    "Language": "CN",
                    "Address": data.address,
                    "PhoneNumber": data.phone,
                    "Email": data.email
                })
            })
            const response2 = await checkFetchResult(response)
            console.log(response2)
            setModelSaved(false)
        }catch (e) {
            if (typeof(e)==="object" && e.json) {
                const data = await e.json()
                alert(data.Message)
            }
            console.log(e)
        }
    }, [token, group])

    return (
        ReactDOM.createPortal(
            <div className={"model2"}>
                {modelSaved ?
                    <div className={"alarmSettingModel"}>
                        <div className={"title"}>
                            <FormattedMessage id={"model.save.createAccount.title"}/>
                        </div>
                        <div className={"buttonContainer"}>
                            <button className={"modelButton"} onClick={handleClose}><FormattedMessage
                                id={"button.cancel"}/></button>
                            <button className={"modelButton"} onClick={()=>(handleSave(props.information))}>
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
                                <FormattedMessage id={"model.save.accountCreate.text"}/>
                            </div>
                            <div className={"button_div"}>
                                <Link to={"/accountSetting/userList"}>
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

export {AccountSettingUserListIndex}
