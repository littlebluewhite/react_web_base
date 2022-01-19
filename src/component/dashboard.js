import React, {useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState} from "react";
import {Link, Route, Switch, useHistory, useLocation} from "react-router-dom";
import {HeaderTitle, Sort, SynAssignJob, UpContainerCommon} from "./common";
import {CONNECT_SERVER, DELAY, IS_RUNNING, SERVER} from "../setting";
import {FormattedMessage} from "react-intl";
import {
    checkFetchResult,
    useAsideHoverTitle, useChartSize,
    useInstantAlarm,
    useInterval,
    useLanguage,
    useModel, useTemplate,
    useToken
} from "../function/usePackage";
import ReactDOM from "react-dom";
import {AlarmMonitoringArticle, ShowEventTable} from "./alarmMonitoringArticle";
import {SystemArticle} from "./systemSetting";
import {ReportArticle} from "./report/report_index";
import {AlarmSettingArticle} from "./alarmSetting";
import {AccountSettingArticle} from "./accountSetting/accountSetting_index";
import {PAGE_ALARM_INITIAL_STATE, pageReducer} from "../reducer/pageReducer";
import {sortConditionData} from "../data/sortConditionData";
import {Bar, Chart} from "react-chartjs-2";
import {environmentAlarmData} from "../data/environmentAlarmData";
import {dashboardAccessData, dashboardAccessOptions} from "../data/dashboardAccessOptionData";
import {authContext, HeaderIcon, langContext} from "./mainIndex.js";
import '../SCSS/dashboard.css';
import '../SCSS/common.css'
import {equipmentName} from "../data/dashboardEquipment";
import {convertTime} from "../function/convertFunction";
import {dealIndexTableData} from "../function/dealDataFunction";

function Layout(){
    const [asideOpen, setAsideOpen] = useState(true)
    const [headerIconValue, setHeaderIconValue] = useState(false)

    return(
        <div>
            <Header headerIconValue={headerIconValue} setAsideOpen={setAsideOpen} asideOpen={asideOpen}/>
            <div className={"articleAsideContainer"}>
                <Aside asideOpen={asideOpen} setAsideOpen={setAsideOpen}/>
                <HeaderIcon.Provider value={{"setHeaderIconValue": setHeaderIconValue}}>
                    <Article/>
                </HeaderIcon.Provider>
            </div>
        </div>
    )
}

function Header(props){
    useEffect(()=>{
        window.scrollTo({top: 0, behavior: "smooth"})
    })


    return(
        <header>
            <ControlAside setAsideOpen={props.setAsideOpen} asideOpen={props.asideOpen}/>
            <IconContainer headerIconValue={props.headerIconValue}/>
            <HeaderTitle/>
            <Notification/>
            <UserName/>
            <UserIcon/>
        </header>
    )
}

function ControlAside(props) {
    function handleClick() {
        props.setAsideOpen(pre=>!pre)
    }

    return (
        <div className={"controlAside item"} onClick={handleClick}>
            {/*<Switch>*/}
            {/*    <Route exact path={"/"}>*/}
                {props.asideOpen ?
                    <svg width="2.125rem" height="1.875rem" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M30.5991 26.75C31.2895 26.75 31.8491 26.1904 31.8491 25.5C31.8491 24.8096 31.2895 24.25 30.5991 24.25L30.5991 26.75ZM12.4658 24.25C11.7754 24.25 11.2158 24.8096 11.2158 25.5C11.2158 26.1904 11.7754 26.75 12.4658 26.75L12.4658 24.25ZM30.5991 5.75C31.2895 5.75 31.8491 5.19035 31.8491 4.5C31.8491 3.80964 31.2895 3.25 30.5991 3.25L30.5991 5.75ZM12.4658 3.25C11.7754 3.25 11.2158 3.80964 11.2158 4.5C11.2158 5.19036 11.7754 5.75 12.4658 5.75L12.4658 3.25ZM30.5991 24.25L12.4658 24.25L12.4658 26.75L30.5991 26.75L30.5991 24.25ZM30.5991 3.25L12.4658 3.25L12.4658 5.75L30.5991 5.75L30.5991 3.25Z"
                            fill="#D1E8FD"/>
                        <path
                            d="M5.95857 18.7336C6.3637 19.1089 6.99641 19.0848 7.37175 18.6796C7.7471 18.2745 7.72295 17.6418 7.31781 17.2664L5.95857 18.7336ZM3.40009 15L2.72047 14.2664C2.5162 14.4557 2.40009 14.7215 2.40009 15C2.40009 15.2785 2.5162 15.5443 2.72047 15.7336L3.40009 15ZM7.31781 12.7336C7.72295 12.3582 7.7471 11.7255 7.37175 11.3204C6.99641 10.9152 6.3637 10.8911 5.95857 11.2664L7.31781 12.7336ZM30.6001 16C31.1524 16 31.6001 15.5523 31.6001 15C31.6001 14.4477 31.1524 14 30.6001 14L30.6001 16ZM4.69534 14C4.14305 14 3.69534 14.4477 3.69534 15C3.69534 15.5523 4.14305 16 4.69534 16L4.69534 14ZM7.31781 17.2664L4.07972 14.2664L2.72047 15.7336L5.95857 18.7336L7.31781 17.2664ZM4.07972 15.7336L7.31781 12.7336L5.95857 11.2664L2.72047 14.2664L4.07972 15.7336ZM30.6001 14L17.6477 14L17.6477 16L30.6001 16L30.6001 14ZM17.6477 14L4.69534 14L4.69534 16L17.6477 16L17.6477 14Z"
                            fill="#D1E8FD"/>
                    </svg> :

                    <svg width="2.125rem" height="1.875rem" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M3.40088 3.25C2.71053 3.25 2.15088 3.80964 2.15088 4.5C2.15088 5.19036 2.71053 5.75 3.40088 5.75V3.25ZM21.5342 5.75C22.2246 5.75 22.7842 5.19036 22.7842 4.5C22.7842 3.80964 22.2246 3.25 21.5342 3.25V5.75ZM3.40088 24.25C2.71052 24.25 2.15088 24.8096 2.15088 25.5C2.15088 26.1904 2.71052 26.75 3.40088 26.75V24.25ZM21.5342 26.75C22.2246 26.75 22.7842 26.1904 22.7842 25.5C22.7842 24.8096 22.2246 24.25 21.5342 24.25V26.75ZM3.40088 5.75H21.5342V3.25H3.40088V5.75ZM3.40088 26.75H21.5342V24.25H3.40088V26.75Z"
                            fill="#D1E8FD"/>
                        <path
                            d="M28.0414 11.2664C27.6363 10.8911 27.0036 10.9152 26.6282 11.3204C26.2529 11.7255 26.2771 12.3582 26.6822 12.7336L28.0414 11.2664ZM30.5999 15L31.2795 15.7336C31.4838 15.5443 31.5999 15.2785 31.5999 15C31.5999 14.7215 31.4838 14.4557 31.2795 14.2664L30.5999 15ZM26.6822 17.2664C26.2771 17.6418 26.2529 18.2745 26.6282 18.6796C27.0036 19.0848 27.6363 19.1089 28.0414 18.7336L26.6822 17.2664ZM3.3999 14C2.84762 14 2.3999 14.4477 2.3999 15C2.3999 15.5523 2.84762 16 3.3999 16V14ZM29.3047 16C29.8569 16 30.3047 15.5523 30.3047 15C30.3047 14.4477 29.8569 14 29.3047 14V16ZM26.6822 12.7336L29.9203 15.7336L31.2795 14.2664L28.0414 11.2664L26.6822 12.7336ZM29.9203 14.2664L26.6822 17.2664L28.0414 18.7336L31.2795 15.7336L29.9203 14.2664ZM3.3999 16H16.3523V14H3.3999V16ZM16.3523 16H29.3047V14H16.3523V16Z"
                            fill="#D1E8FD"/>
                    </svg>
                }
        </div>
    )
}

function IconContainer(){
    const [navigation, setNavigation] = useState(null)
    const controller = useRef(false)
    const fetchNavigation = useCallback(async ()=>{
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/systemSetting/logo/navigation", {
                method: "GET",
            })
            const image = await response.blob()
            const imageUrl = URL.createObjectURL(image)
            if(controller.current){
                setNavigation(imageUrl)
            }
        }catch (e) {
            console.log(e)
        }
    },[])

    useEffect(()=>{
        controller.current = true
        fetchNavigation()
        return()=>{
            controller.current = false
        }
    },[fetchNavigation])
    return(
        <div className="icon item">
            <Link to={"/"}>
                <div className="icon_svg">
                    <img src={navigation} alt="navigation"/>
                </div>
            </Link>
        </div>
    )
}

function Notification(){
    const token = useToken()
    const alarmCount = useInstantAlarm(token).alarmVariables.data.length
    return(
        <div className="alarm item">
            <AlarmNotification alarmCount={alarmCount}/>
            {/*<svg className="rectangle" width="3" height="37" viewBox="0 0 3 37" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
            {/*  <rect y="0.5" width="3" height="36" fill="#8FCDCC" fillOpacity="0.26"/>*/}
            {/*</svg>*/}
            {/*<svg className="icon_urgent" width="36" height="33" viewBox="0 0 36 33" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
            {/*  <path fillRule="evenodd" clipRule="evenodd" d="M32.4 32.5L3.6 32.5C1.6146 32.5 -1.3941e-07 30.9053 -3.10837e-07 28.9444L-9.3251e-07 21.8333C-1.10394e-06 19.8724 1.6146 18.2778 3.6 18.2778L32.4 18.2778C34.3854 18.2778 36 19.8724 36 21.8333L36 28.9444C36 30.9053 34.3854 32.5 32.4 32.5ZM33 29.5L33 21.5L3 21.5L3 29.5L33 29.5ZM32.4 14.7222L3.6 14.7222C1.6146 14.7222 -1.69359e-06 13.1276 -1.86502e-06 11.1667L-2.48669e-06 4.05556C-2.65812e-06 2.09467 1.6146 0.500003 3.6 0.500003L32.4 0.5C34.3854 0.5 36 2.09467 36 4.05556L36 11.1667C36 13.1276 34.3854 14.7222 32.4 14.7222ZM33 11.5L33 3.5L3 3.5L3 11.5L33 11.5ZM5 27.5L8.6 27.5L8.6 23.8333L5 23.8333L5 27.5ZM10.4 27.5L14 27.5L14 23.8333L10.4 23.8333L10.4 27.5ZM5 9.16667L8.6 9.16667L8.6 5.5L5 5.5L5 9.16667ZM10.4 9.16667L14 9.16667L14 5.5L10.4 5.5L10.4 9.16667Z" fill="#00EAFF"/>*/}
            {/*</svg>*/}
            {/*<div className={circle_class(props.urgent)}>*/}
            {/*    {props.urgent === 0 ? null : props.urgent}*/}
            {/*</div>*/}
        </div>
    )
}

function AlarmNotification(props){
    function circle_class(notification){
        if(notification === 0){
            return "circle headerUp"
        }else{
            return "circle circle_fill headerUp"
        }
    }
    return(
        <>
             <Link to={"/alarmMonitoring/event"}>
                <svg width="2.125rem" height="2.3125rem" viewBox="0 0 34 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.20453 32.9V22.1C2.20453 18.2809 3.76333 14.6182 6.53802 11.9177C9.31271 9.21714 13.076 7.7 17 7.7C20.924 7.7 24.6873 9.21714 27.462 11.9177C30.2367 14.6182 31.7955 18.2809 31.7955 22.1V32.9H33.6449V36.5H0.355091V32.9H2.20453ZM5.90339 32.9H28.0966V22.1C28.0966 19.2357 26.9275 16.4886 24.8465 14.4632C22.7655 12.4379 19.943 11.3 17 11.3C14.057 11.3 11.2345 12.4379 9.15352 14.4632C7.0725 16.4886 5.90339 19.2357 5.90339 22.1V32.9ZM15.1506 0.5H18.8494V5.9H15.1506V0.5ZM31.3849 5.5544L34 8.0996L30.0792 11.9174L27.4622 9.3722L31.3849 5.5544ZM0 8.0996L2.6151 5.5544L6.53775 9.3704L3.9245 11.9192L0 8.0996ZM7.75283 22.1C7.75283 19.7131 8.72708 17.4239 10.4613 15.736C12.1954 14.0482 14.5475 13.1 17 13.1V16.7C15.5285 16.7 14.1173 17.2689 13.0768 18.2816C12.0362 19.2943 11.4517 20.6678 11.4517 22.1H7.75283Z" fill="#00EAFF"/>
                </svg>
                <div className={circle_class(props.alarmCount)}>
                    {props.alarmCount === 0 ? null : props.alarmCount}
                </div>
            </Link>
        </>
    )
}

function UserName(){
    const auth = useContext(authContext)
    const greeting = "Hi, "
    return(
        <div className="user item">
            {greeting + auth.user.AccountInfo.AccountId}<br/>
            {auth.user.AccountInfo.RoleGroup}
        </div>
    )
}

function UserIcon() {
    const isPhoto = null
    const [showModel, setShowModel] = useState(false)
    const [showSetting, setShowSetting] = useState(false)
    function handleShow(){
    setShowModel(true)
    }
    function handleHide(){
    setShowModel(false)
    }
    function handleSettingShow(){
        setShowModel(false)
        setShowSetting(true)
    }
    function handleSettingHide(){
        setShowSetting(false)
    }
    const model = showModel && (<UserSetSelect onHandleHide={handleHide} onHandleSettingShow={handleSettingShow}/>);
    const setting = showSetting && (<PersonalSetting onHandleSettingHide={handleSettingHide}/>)
    const photo = isPhoto ? ("123") : (<svg onClick={handleShow} width="3.5rem" height="3.5rem" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M28 0C12.544 0 0 12.544 0 28C0 43.456 12.544 56 28 56C43.456 56 56 43.456 56 28C56 12.544 43.456 0 28 0ZM14.196 45.584C15.4 43.064 22.736 40.6 28 40.6C33.264 40.6 40.628 43.064 41.804 45.584C37.996 48.608 33.208 50.4 28 50.4C22.792 50.4 18.004 48.608 14.196 45.584ZM45.808 41.524C41.804 36.652 32.088 35 28 35C23.912 35 14.196 36.652 10.192 41.524C7.21743 37.6427 5.60366 32.89 5.6 28C5.6 15.652 15.652 5.6 28 5.6C40.348 5.6 50.4 15.652 50.4 28C50.4 33.096 48.664 37.772 45.808 41.524ZM28 11.2C22.568 11.2 18.2 15.568 18.2 21C18.2 26.432 22.568 30.8 28 30.8C33.432 30.8 37.8 26.432 37.8 21C37.8 15.568 33.432 11.2 28 11.2ZM28 25.2C25.676 25.2 23.8 23.324 23.8 21C23.8 18.676 25.676 16.8 28 16.8C30.324 16.8 32.2 18.676 32.2 21C32.2 23.324 30.324 25.2 28 25.2Z" fill="white"/>
      </svg>)
    return (
        <div className="user_icon item">
            {photo}
            {model}
            {setting}
        </div>
    )
}

function UserSetSelect(props){
    const history = useHistory()
    const auth = useContext(authContext)
    const container = useModel()
    function userSetting(e){
        e.stopPropagation()
        props.onHandleSettingShow()
    }
    function logOut(e){
        e.stopPropagation()
        localStorage.removeItem("token")
        auth.signOut()
        history.push("/login")
    }
    return(
        ReactDOM.createPortal(
            <div className={"model"} onClick={props.onHandleHide}>
                <div className={"select"}>
                    <div className={"setting"} onClick={userSetting}>
                        <FormattedMessage id={"index.personalSetting"}/>
                    </div>
                    <div className={"log_out"} onClick={logOut}>
                        <FormattedMessage id={"index.logOut"}/>
                    </div>
                </div>
            </div>,
            container
        )
    )
}

function PersonalSetting(props) {
    const container = useModel()
    const [context, setContext] = useState("information")
    const [information, setInformation] = useState("content active")
    const [language, setLanguage] = useState("content")

    function changeContextToInformation() {
        setInformation("content active")
        setLanguage("content")
        setContext("information")
    }

    const changeContextToLanguage = useCallback(() =>{
        setInformation("content")
        setLanguage("content active")
        setContext("language")
    },[])

    useEffect(()=>{
        if(props.language){
            changeContextToLanguage()
        }
    },[props.language, changeContextToLanguage])

    return (
        ReactDOM.createPortal(
            <div className={"model2"}>
                <div className={"setting"}>
                    <BarTitle information={information} language={language}
                         onChangeContextToLanguage={changeContextToLanguage}
                         onChangeContextToInformation={changeContextToInformation}/>
                    <div className={"articleContainer"}>
                        {context === "information" && <Information/>}
                        {context === "language" && <SettingLanguage/>}
                    </div>
                    <div className={"close"} onClick={props.onHandleSettingHide}>
                        <svg width="2.125rem" height="2.125rem" viewBox="0 0 34 34" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M19.3568 17.0007L24.0718 12.2873C24.2267 12.1325 24.3495 11.9486 24.4333 11.7463C24.5171 11.544 24.5603 11.3271 24.5603 11.1082C24.5603 10.8892 24.5171 10.6723 24.4333 10.47C24.3495 10.2677 24.2267 10.0838 24.0718 9.92898C23.917 9.77413 23.7331 9.6513 23.5308 9.5675C23.3285 9.48369 23.1117 9.44056 22.8927 9.44056C22.6737 9.44056 22.4568 9.48369 22.2545 9.5675C22.0522 9.6513 21.8683 9.77413 21.7135 9.92898L17.0002 14.644L12.2868 9.92898C11.9741 9.61625 11.5499 9.44056 11.1077 9.44056C10.6654 9.44056 10.2412 9.61625 9.9285 9.92898C9.61576 10.2417 9.44007 10.6659 9.44007 11.1082C9.44007 11.3271 9.4832 11.544 9.56701 11.7463C9.65081 11.9486 9.77365 12.1325 9.9285 12.2873L14.6435 17.0007L9.9285 21.714C9.61576 22.0267 9.44007 22.4509 9.44007 22.8932C9.44007 23.3354 9.61576 23.7596 9.9285 24.0723C10.2412 24.3851 10.6654 24.5607 11.1077 24.5607C11.5499 24.5607 11.9741 24.3851 12.2868 24.0723L17.0002 19.3573L21.7135 24.0723C22.0262 24.3851 22.4504 24.5607 22.8927 24.5607C23.3349 24.5607 23.7591 24.3851 24.0718 24.0723C24.3846 23.7596 24.5603 23.3354 24.5603 22.8932C24.5603 22.4509 24.3846 22.0267 24.0718 21.714L19.3568 17.0007ZM17.0002 33.6673C7.79516 33.6673 0.333496 26.2057 0.333496 17.0007C0.333496 7.79565 7.79516 0.333984 17.0002 0.333984C26.2052 0.333984 33.6668 7.79565 33.6668 17.0007C33.6668 26.2057 26.2052 33.6673 17.0002 33.6673Z"
                                fill="#8FCDCC"/>
                        </svg>
                    </div>
                </div>
            </div>,
            container
        )
    )
}

function BarTitle(props){
    return(
        <div className={"bar"}>
            <div className={"bar_container"}>
                <div className={"title"}>
                    <FormattedMessage id={"index.accountSetting"}/>
                </div>
                <div className={props.information} onClick={props.onChangeContextToInformation}>
                    <FormattedMessage id={"index.profile"}/>
                </div>
                <div className={"title title2"}>
                    <FormattedMessage id={"index.app"}/>
                </div>
                <div className={props.language} onClick={props.onChangeContextToLanguage}>
                    <FormattedMessage id={"index.language"}/>
                </div>
            </div>
        </div>
    )
}

function Information(){
    const auth = useContext(authContext)
    return(
        <div className={"information"}>
            <div className={"container1"}>
                <div className={"title one"}><FormattedMessage id={"index.personal.profile"}/></div>
                <div className={"container2"}>
                    <div className={"left"}>
                        <table>
                            <tbody>
                                <tr>
                                    <td className={"td1"}><FormattedMessage id={"index.personal.username"}/></td>
                                    <td className={"td2"}>{auth.user.AccountInfo.AccountId}</td>
                                </tr>
                                <tr>
                                    <td className={"td1"}><FormattedMessage id={"index.personal.companyName"}/></td>
                                    <td className={"td2"}>{auth.user.AccountInfo.SubCompany}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className={"right"}>
                        <table>
                            <tbody>
                                <tr>
                                    <td className={"td1"}>
                                        <FormattedMessage id={"index.personal.level"}/>
                                    </td>
                                    <td className={"td2"}>
                                        {auth.user.AccountInfo.RoleGroup}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={"title"}><FormattedMessage id={"index.personal.information"}/></div>
                <div className={"container2"}>
                    <div className={"left"}>
                        <table>
                            <tbody>
                                <tr>
                                    <td className={"td1"}><FormattedMessage id={"index.personal.name"}/></td>
                                    <td className={"td2"}>{auth.user.AccountInfo.UserInfo[0].Value}</td>
                                </tr>
                                <tr>
                                    <td className={"td1"}><FormattedMessage id={"index.personal.phone"}/></td>
                                    <td className={"td2"}>{auth.user.AccountInfo.UserInfo[2].Value}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className={"right"}>
                        <table>
                            <tbody>
                                <tr>
                                    <td className={"td1"}><FormattedMessage id={"index.personal.email"}/></td>
                                    <td className={"td2"}>{auth.user.AccountInfo.UserInfo[3].Value}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={"container2 address"}>
                    <div className={"addressTitle"}>
                        <FormattedMessage id={"index.personal.address"}/>
                    </div>
                    <div className={"addressText"}>
                        {auth.user.AccountInfo.UserInfo[1].Value}
                    </div>
                </div>
            </div>
        </div>
    )
}

function SettingLanguage(){
    const language = useContext(langContext)

    function handleChange(event) {
        language.setLang(event.target.value)
    }

    return(
        <div className={"setting_language"}>
            <div className={"title"}>
                <FormattedMessage id={"index.selectLang"}/>
            </div>
            <label htmlFor="CN">
                <div className={"language"}>
                    <input type="radio" name={"language"} value={"CN"} checked={language.lang==="CN"}
                    onChange={event => handleChange(event)} id={"CN"}/>
                    <FormattedMessage id={"index.CN"}/>
                </div>
            </label>
            <label htmlFor="EN">
                <div className={"language"}>
                    <input type="radio" name={"language"} value={"EN"} checked={language.lang==="EN"}
                    onChange={event => handleChange(event)} id={"EN"}/>
                    <FormattedMessage id={"index.EN"}/>
                </div>
            </label>
        </div>
    )
}

function Article(){
    const [updateFlag, setUpdateFlag] = useState(false)
    // const situation = "article_item"
    return(
        <article>
            <Switch>
                <Route exact path={"/"}>
                    <div className={"articleContainer"}>
                        <UpdateTime updateFlag={updateFlag}/>
                        <div className={"cardContainer"}>
                            <BuildingInformation/>
                            {/*<Monitor status={situation}/>*/}
                            {/*<Account status={situation}/>*/}
                            {/*<AlarmSetting status={situation}/>*/}
                            {/*<SystemSetting status={situation}/>*/}
                            {/*<Report status={situation}/>*/}
                            <Table/>
                            <AccessStatistic/>
                            <Environment/>
                            <EquipmentStatus setUpdateFlag={setUpdateFlag}/>
                        </div>
                    </div>
                </Route>
                <Route path={"/alarmMonitoring"}>
                    <AlarmMonitoringArticle/>
                </Route>
                <Route path={"/systemSetting"}>
                    <SystemArticle/>
                </Route>
                <Route path={"/report"}>
                    <ReportArticle/>
                </Route>
                <Route path={"/alarmSetting"}>
                    <AlarmSettingArticle/>
                </Route>
                <Route path={"/accountSetting"}>
                    <AccountSettingArticle/>
                </Route>
            </Switch>
        </article>
    )
}

function UpdateTime(props) {
    const [datetime, setDatetime] = useState(new Date())
    const [isOpen, setIsOpen] = useState(false)
    // const [style, setStyle] = useState({})

    useEffect(()=>{
        setIsOpen(false)
        setDatetime(new Date())
        // setStyle({
        //     "animationDuration": DELAY.toString() + "ms",
        //     "animationPlayState": "running"
        // })
        const timer = setTimeout(() => {
            setIsOpen(true)
        }, 10);
        return () => clearTimeout(timer);
    },[props.updateFlag])
    // useInterval(()=>{
    //     setDatetime(new Date())
    // }, IS_RUNNING ? DELAY : null)

    const style = {
        "animationDuration": DELAY.toString() + "ms",
        "animationPlayState": (IS_RUNNING ? "running" : "paused")
    }
    return(
        <div className={"updateTime"}>
            <div className={"datetimeTitle"}><FormattedMessage id={"index.updateTime"}/></div>
            {isOpen ?
                <div className={"datetime"} style={style}>
                    {convertTime(datetime.getTime() / 1000)}
                </div>
                :
                <div className={"datetime2"}>
                    {convertTime(datetime.getTime() / 1000)}
                </div>
            }
        </div>
    )
}

function Aside(props){

    const location = useLocation()
    const [openSubUrl, setOpenSubUrl] = useState(false)
    const asideClassName = () =>{
        if(props.asideOpen){
            return "aside_open"
        }else{
            return "aside_close"
        }
    }
    const dashboardAsideOpen = () =>{
        return !(location.pathname !== "/" || !props.asideOpen);
    }
    const asideUpDownClassName = () =>{
        if (location.pathname !== "/" && props.asideOpen){
            return "asideUpDownContainer close"
        }else{
            return "asideUpDownContainer"
        }
    }
    return(
        <aside className={asideClassName()}>
            <div className={asideUpDownClassName()}>
                <UpContainerDashboard asideOpen={dashboardAsideOpen()} setOpenSubUrl={setOpenSubUrl}/>
                <DownContainer asideOpen={dashboardAsideOpen()}/>
                {openSubUrl &&
                <IndexSubUrl setOpenSubUrl={setOpenSubUrl} asideOpen={dashboardAsideOpen()}/>
                }
            </div>
            <Switch>
                <Route path={"/:mainPath/:subPath"}>
                    <UpContainerCommon setAsideOpen={props.setAsideOpen} asideOpen={props.asideOpen}/>
                </Route>
            </Switch>
        </aside>
    )
}

function IndexSubUrl(props) {

    const token = useToken()
    const [urlData, setUrlData] = useState([])
    const controller = useRef(false)

    const fetchUrl = useCallback(async (token)=>{
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/systemSetting/url", {
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
            const data = await response.json()
            if (controller.current) {
                setUrlData(data)
            }
        }catch (e){
            console.log(e)
        }
    },[])

    useEffect(()=>{
        if(CONNECT_SERVER){
            controller.current = true
            fetchUrl(token)
            return ()=>{
                controller.current = false
            }
        }
    },[fetchUrl, token])

    function handleLeave() {
        props.setOpenSubUrl(false)
    }

    function handleOpen() {
        props.setOpenSubUrl(true)
    }

    let className
    if(props.asideOpen){
        className = "indexSubUrl"
    }else{
        className = "indexSubUrl close"
    }
    return(
        <div className={className} onMouseLeave={handleLeave} onMouseEnter={handleOpen}>
            {urlData.map((item, index)=>(
                <div className={"urlItemContainer"} key={index}>
                    <a href={item.url} target={"_blank"} rel={"noreferrer"}>
                        <div className={"background"}/>
                        <div className={"subUrl"}>{item.name}</div>
                    </a>
                </div>
            ))}
        </div>
    )
}

function UpContainerDashboard(props){
    const template = useTemplate()
    return(
        <div className={"aside_container asideUp"}>
            <FoldButton/>
            <DashBoard asideOpen={props.asideOpen}/>
            {(template.Account_Plugin.IBMS_Assign_Job===1) && <Monitor asideOpen={props.asideOpen}/>}
            {(template.Account_Plugin.IBMS_Reoprt_R===1) && <Report asideOpen={props.asideOpen}/>}
            <SubSystem asideOpen={props.asideOpen} setOpenSubUrl={props.setOpenSubUrl}/>
            {/*{(template.Account_Plugin.IBMS_3D_R===1) && <OCMS asideOpen={props.asideOpen}/>}*/}
            {(template.Account_Plugin.IBMS_System_Setting_URL_Setting_U===1) && <SystemSetting asideOpen={props.asideOpen}/>}
            {(template.Account_Plugin.IBMS_Account_R===1) && <Account asideOpen={props.asideOpen}/>}
            {(template.Alarm_CRUD.R===1) && <AlarmSetting asideOpen={props.asideOpen}/>}
        </div>
    )
}

function DownContainer(props){
    const [openLanguage, setOpenLanguage] = useState(false)
    const handleOpen = ()=>{
        setOpenLanguage(true)
    }
    const handleClose = () =>{
        setOpenLanguage(false)
    }
    const language = openLanguage && (<PersonalSetting onHandleSettingHide={handleClose} language={true}/>)
    return(
        <div className={"aside_container asideDown"}>
            <Language asideOpen={props.asideOpen} handleOpen={handleOpen}/>
            <Privacy asideOpen={props.asideOpen}/>
            <Terms asideOpen={props.asideOpen}/>
            <ContactItem asideOpen={props.asideOpen}/>
            {/*<Logo asideOpen={props.asideOpen}/>*/}
            {language}
        </div>
    )
}

function FoldButton(){
    return(
        <div className="aside_fold"/>
    )
}

function DashBoard(props) {
    const {contain, handleHoverTitle} = useAsideHoverTitle(props.asideOpen, {"CN": "战情室仪表板", "EN": "Dashboard"})
    return (
        <div className={"asideUpItem"} onMouseEnter={() => handleHoverTitle("in")}
             onMouseLeave={() => handleHoverTitle("out")}>
            <Link to={{pathname: "/"}}>
                <div className={"DashboardBackground"}>
                    <Switch>
                        <Route exact path={"/"}>
                            <div className={"background2"}/>
                        </Route>
                    </Switch>
                    <div className={"background"}/>
                    <div className={"picture"}>
                        <svg width="2.25rem" height="2rem" viewBox="0 0 36 32" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M32.7273 22.4V3.2H3.27273V22.4H32.7273ZM32.7273 0C33.5953 0 34.4277 0.337142 35.0414 0.937258C35.6552 1.53737 36 2.35131 36 3.2V22.4C36 23.2487 35.6552 24.0626 35.0414 24.6627C34.4277 25.2629 33.5953 25.6 32.7273 25.6H21.2727V28.8H24.5455V32H11.4545V28.8H14.7273V25.6H3.27273C2.40475 25.6 1.57232 25.2629 0.95856 24.6627C0.344804 24.0626 0 23.2487 0 22.4V3.2C0 1.424 1.45636 0 3.27273 0H32.7273ZM6.54545 6.4H21.2727V14.4H6.54545V6.4ZM22.9091 6.4H29.4545V9.6H22.9091V6.4ZM29.4545 11.2V19.2H22.9091V11.2H29.4545ZM6.54545 16H13.0909V19.2H6.54545V16ZM14.7273 16H21.2727V19.2H14.7273V16Z"
                                fill="#00EAFF"/>
                        </svg>
                    </div>
                    {props.asideOpen ? (<div className={"text"}>
                        <FormattedMessage id={"index.dashboard"}/></div>) : null}
                </div>
            </Link>
            {contain}
        </div>
    )
}

function Monitor(props) {
    const {contain, handleHoverTitle} = useAsideHoverTitle(props.asideOpen, {"CN": "警报监控", "EN": "Monitoring"})
    return (
        <div className={"asideUpItem"} onMouseEnter={() => handleHoverTitle("in")}
             onMouseLeave={() => handleHoverTitle("out")}>
            <Link to={{pathname: "/alarmMonitoring/event", state: {"aa": "aa", "bb": "bb"}}}>
                <div className={"monitor_background"}>
                    <Switch>
                        <Route path={"/alarmMonitoring"}>
                            <div className={"background2"}/>
                        </Route>
                    </Switch>
                    <div className={"background"}/>
                    <div className={"picture"}>
                        <svg width="2.25rem" height="2rem" viewBox="0 0 36 32" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M3.27273 3.2V22.4H32.7273V3.2H3.27273ZM3.27273 0H32.7273C33.5953 0 34.4277 0.337142 35.0414 0.937258C35.6552 1.53737 36 2.35131 36 3.2V22.4C36 23.248 35.6564 24.064 35.0345 24.656C34.4291 25.264 33.5945 25.6 32.7273 25.6H21.2727V28.8H24.5455V32H11.4545V28.8H14.7273V25.6H3.27273C2.40545 25.6 1.57091 25.264 0.965455 24.656C0.343636 24.064 0 23.248 0 22.4V3.2C0 1.424 1.45636 0 3.27273 0ZM16.1018 11.088C16.6091 10.608 17.2964 10.32 18 10.32C18.7036 10.336 19.3909 10.608 19.8982 11.104C20.3891 11.584 20.6836 12.256 20.6836 12.944C20.6836 13.648 20.3891 14.304 19.8982 14.8C19.3909 15.296 18.7036 15.568 18 15.568C17.2964 15.568 16.6091 15.28 16.1018 14.8C15.6109 14.304 15.3164 13.648 15.3164 12.944C15.3164 12.256 15.6109 11.584 16.1018 11.088ZM14.8418 16C15.2508 16.4154 15.7413 16.7458 16.284 16.9716C16.8266 17.1973 17.4103 17.3136 18 17.3136C18.5897 17.3136 19.1734 17.1973 19.716 16.9716C20.2587 16.7458 20.7492 16.4154 21.1582 16C21.9927 15.2 22.4673 14.096 22.4673 12.944C22.4673 11.792 21.9927 10.672 21.1582 9.856C20.3236 9.04 19.1782 8.576 18 8.576C16.8218 8.576 15.6764 9.04 14.8418 9.856C14.0073 10.672 13.5327 11.792 13.5327 12.944C13.5327 14.096 14.0073 15.2 14.8418 16ZM8.18182 12.944C8.95725 11.0155 10.3085 9.3599 12.0596 8.19273C13.8108 7.02556 15.8807 6.40088 18 6.4C22.4673 6.4 26.28 9.12 27.8182 12.944C27.0483 14.8762 25.6984 16.5354 23.946 17.7034C22.1936 18.8714 20.1208 19.4935 18 19.488C13.5327 19.488 9.72 16.8 8.18182 12.944Z"
                                fill="#00EAFF"/>
                        </svg>
                    </div>
                    {props.asideOpen ? (<div className={"text"}>
                        <FormattedMessage id={"index.monitoring"}/></div>) : null}
                </div>
            </Link>
            {contain}
        </div>
    )
}

function Account(props) {
    const {contain, handleHoverTitle} = useAsideHoverTitle(props.asideOpen, {"CN": "帐户管理", "EN": "Account"})
    return (
        <div className={"asideUpItem"} onMouseEnter={() => handleHoverTitle("in")}
             onMouseLeave={() => handleHoverTitle("out")}>
            <Link to={"/accountSetting/userList"}>
                <div className={"account_background"}>
                    <Switch>
                        <Route path={"/accountSetting"}>
                            <div className={"background2"}/>
                        </Route>
                    </Switch>
                    <div className={"background"}/>
                    <div className={"picture"}>
                        <svg width="2.25rem" height="1.75rem" viewBox="0 0 36 28" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M33 0.5H3C1.365 0.56 0.06 1.865 0 3.5V24.5C0.06 26.135 1.365 27.44 3 27.5H33C34.635 27.44 35.94 26.135 36 24.5V3.5C35.9724 2.71314 35.6475 1.96601 35.0907 1.40928C34.534 0.852541 33.7869 0.527608 33 0.5ZM33 24.5H3V3.5H33V24.5ZM21 21.5V19.625C21 17.135 15.99 15.875 13.5 15.875C11.01 15.875 6 17.135 6 19.625V21.5H21ZM13.5 6.5C12.5054 6.5 11.5516 6.89509 10.8483 7.59835C10.1451 8.30161 9.75 9.25544 9.75 10.25C9.75 10.7425 9.847 11.2301 10.0355 11.6851C10.2239 12.14 10.5001 12.5534 10.8483 12.9017C11.5516 13.6049 12.5054 14 13.5 14C13.9925 14 14.4801 13.903 14.9351 13.7145C15.39 13.5261 15.8034 13.2499 16.1516 12.9017C16.4999 12.5534 16.7761 12.14 16.9645 11.6851C17.153 11.2301 17.25 10.7425 17.25 10.25C17.25 9.75754 17.153 9.26991 16.9645 8.81494C16.7761 8.35997 16.4999 7.94657 16.1516 7.59835C15.8034 7.25013 15.39 6.97391 14.9351 6.78545C14.4801 6.597 13.9925 6.5 13.5 6.5ZM21 6.5V8H30V6.5H21ZM21 9.5V11H30V9.5H21ZM21 12.5V14H27V12.5H21Z"
                                fill="#00EAFF"/>
                        </svg>
                    </div>
                    {props.asideOpen ? (<div className={"text"}>
                        <FormattedMessage id={"index.account"}/></div>) : null}
                </div>
            </Link>
            {contain}
        </div>
    )
}

function AlarmSetting(props) {
    const {contain, handleHoverTitle} = useAsideHoverTitle(props.asideOpen, {"CN": "警报设定", "EN": "Alarm Setting"})
    return (
        <div className={"asideUpItem"} onMouseEnter={() => handleHoverTitle("in")}
             onMouseLeave={() => handleHoverTitle("out")}>
            <Link to={"/alarmSetting/category"}>
                <div className={"alarmSetting_background"}>
                    <Switch>
                        <Route path={"/alarmSetting"}>
                            <div className={"background2"}/>
                        </Route>
                    </Switch>
                    <div className={"background"}/>
                    <div className={"picture"}>
                        <svg width="2.25rem" height="2.25rem" viewBox="0 0 36 36" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M0.00276903 5.54041C0.00276903 4.07152 0.586284 2.66279 1.62495 1.62413C2.66361 0.585468 4.07234 0.00195313 5.54123 0.00195312H27.6951C29.164 0.00195313 30.5727 0.585468 31.6114 1.62413C32.65 2.66279 33.2335 4.07152 33.2335 5.54041V22.5158L30.4643 17.822V5.53765C30.4643 4.8032 30.1726 4.09883 29.6532 3.5795C29.1339 3.06017 28.4295 2.76841 27.6951 2.76841H5.53846C4.80402 2.76841 4.09965 3.06017 3.58032 3.5795C3.06099 4.09883 2.76923 4.8032 2.76923 5.53765V27.6915C2.76923 28.4259 3.06099 29.1303 3.58032 29.6496C4.09965 30.169 4.80402 30.4607 5.53846 30.4607H11.9271L11.8163 30.6463C11.3511 31.4327 11.0963 32.3189 11.0769 33.2272H5.53846C4.06957 33.2272 2.66084 32.6437 1.62218 31.605C0.583515 30.5663 0 29.1576 0 27.6887V5.54041H0.00276903Z"
                                fill="#00EAFF"/>
                            <path
                                d="M14.3777 26.3083L16.0116 23.5391H13.8543C13.4871 23.5391 13.1349 23.6849 12.8753 23.9446C12.6156 24.2043 12.4697 24.5565 12.4697 24.9237C12.4697 25.2909 12.6156 25.6431 12.8753 25.9028C13.1349 26.1624 13.4871 26.3083 13.8543 26.3083H14.3805H14.3777Z"
                                fill="#00EAFF"/>
                            <path
                                d="M19.2793 18.0008L20.1322 16.5553C20.4245 16.0598 20.7937 15.6139 21.226 15.2344H13.8543C13.4871 15.2344 13.1349 15.3803 12.8753 15.6399C12.6156 15.8996 12.4697 16.2518 12.4697 16.619C12.4697 16.9862 12.6156 17.3384 12.8753 17.5981C13.1349 17.8577 13.4871 18.0036 13.8543 18.0036H19.2793V18.0008Z"
                                fill="#00EAFF"/>
                            <path
                                d="M9.69242 8.30739C9.69242 8.85823 9.4736 9.3865 9.0841 9.776C8.69461 10.1655 8.16633 10.3843 7.6155 10.3843C7.06466 10.3843 6.53639 10.1655 6.14689 9.776C5.75739 9.3865 5.53857 8.85823 5.53857 8.30739C5.53857 7.75656 5.75739 7.22828 6.14689 6.83879C6.53639 6.44929 7.06466 6.23047 7.6155 6.23047C8.16633 6.23047 8.69461 6.44929 9.0841 6.83879C9.4736 7.22828 9.69242 7.75656 9.69242 8.30739Z"
                                fill="#00EAFF"/>
                            <path
                                d="M7.6155 18.6988C8.16633 18.6988 8.69461 18.48 9.0841 18.0905C9.4736 17.701 9.69242 17.1727 9.69242 16.6218C9.69242 16.071 9.4736 15.5427 9.0841 15.1532C8.69461 14.7637 8.16633 14.5449 7.6155 14.5449C7.06466 14.5449 6.53639 14.7637 6.14689 15.1532C5.75739 15.5427 5.53857 16.071 5.53857 16.6218C5.53857 17.1727 5.75739 17.701 6.14689 18.0905C6.53639 18.48 7.06466 18.6988 7.6155 18.6988Z"
                                fill="#00EAFF"/>
                            <path
                                d="M9.69242 24.9226C9.69242 25.4735 9.4736 26.0017 9.0841 26.3912C8.69461 26.7807 8.16633 26.9995 7.6155 26.9995C7.06466 26.9995 6.53639 26.7807 6.14689 26.3912C5.75739 26.0017 5.53857 25.4735 5.53857 24.9226C5.53857 24.3718 5.75739 23.8435 6.14689 23.454C6.53639 23.0645 7.06466 22.8457 7.6155 22.8457C8.16633 22.8457 8.69461 23.0645 9.0841 23.454C9.4736 23.8435 9.69242 24.3718 9.69242 24.9226Z"
                                fill="#00EAFF"/>
                            <path
                                d="M13.8543 6.92383C13.4871 6.92383 13.1349 7.06971 12.8753 7.32937C12.6156 7.58904 12.4697 7.94122 12.4697 8.30844C12.4697 8.67567 12.6156 9.02785 12.8753 9.28751C13.1349 9.54718 13.4871 9.69306 13.8543 9.69306H26.2439C26.6111 9.69306 26.9633 9.54718 27.223 9.28751C27.4826 9.02785 27.6285 8.67567 27.6285 8.30844C27.6285 7.94122 27.4826 7.58904 27.223 7.32937C26.9633 7.06971 26.6111 6.92383 26.2439 6.92383H13.8543Z"
                                fill="#00EAFF"/>
                            <path
                                d="M24.1895 16.7115C24.8818 16.5287 25.6433 16.6007 26.3107 16.9746C26.7399 17.2127 27.0889 17.5561 27.3298 17.9604L35.643 32.0558C36.0141 32.6872 36.0861 33.3933 35.9061 34.0386C35.8101 34.3774 35.6475 34.6938 35.4278 34.9691C35.2081 35.2444 34.9358 35.4731 34.6267 35.642C34.2058 35.8746 33.7267 36.002 33.2365 36.002H16.6101C15.8347 36.002 15.1396 35.6973 14.6412 35.21C14.2251 34.8094 13.9558 34.2806 13.8765 33.7086C13.7971 33.1366 13.9123 32.5545 14.2036 32.0558L22.5169 17.9604C22.8874 17.3394 23.4888 16.8904 24.1895 16.7115ZM26.3079 20.774C26.3079 20.4067 26.1621 20.0546 25.9024 19.7949C25.6427 19.5352 25.2905 19.3893 24.9233 19.3893C24.5561 19.3893 24.2039 19.5352 23.9442 19.7949C23.6846 20.0546 23.5387 20.4067 23.5387 20.774V26.3013C23.5387 26.6686 23.6846 27.0208 23.9442 27.2804C24.2039 27.5401 24.5561 27.686 24.9233 27.686C25.2905 27.686 25.6427 27.5401 25.9024 27.2804C26.1621 27.0208 26.3079 26.6686 26.3079 26.3013V20.774ZM24.9233 34.6146C25.4741 34.6146 26.0024 34.3958 26.3919 34.0063C26.7814 33.6168 27.0002 33.0885 27.0002 32.5377C27.0002 31.9868 26.7814 31.4585 26.3919 31.069C26.0024 30.6796 25.4741 30.4607 24.9233 30.4607C24.3725 30.4607 23.8442 30.6796 23.4547 31.069C23.0652 31.4585 22.8464 31.9868 22.8464 32.5377C22.8464 33.0885 23.0652 33.6168 23.4547 34.0063C23.8442 34.3958 24.3725 34.6146 24.9233 34.6146Z"
                                fill="#00EAFF"/>
                        </svg>
                    </div>
                    {props.asideOpen ? (<div className={"text"}>
                        <FormattedMessage id={"index.alarmSetting"}/></div>) : null}
                </div>
            </Link>
            {contain}
        </div>
    )
}

function SystemSetting(props) {
    const {contain, handleHoverTitle} = useAsideHoverTitle(props.asideOpen, {"CN": "系统设定", "EN": "System Setting"})
    return (
        <div className={"asideUpItem"} onMouseEnter={() => handleHoverTitle("in")}
             onMouseLeave={() => handleHoverTitle("out")}>
            <Link to={"/systemSetting/url"}>
                <div className={"systemSetting_background"}>
                    <Switch>
                        <Route path={"/systemSetting"}>
                            <div className={"background2"}/>
                        </Route>
                    </Switch>
                    <div className={"background"}/>
                    <div className={"picture"}>
                        <svg width="2.25rem" height="2.125rem" viewBox="0 0 36 34" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 29.7H7.7V33H11V29.7Z" fill="#00EAFF"/>
                            <path
                                d="M13.2 11.55H14.2L15.35 10.43C15.8375 9.94231 16.4682 9.62342 17.15 9.52C17.3232 9.5097 17.4968 9.5097 17.67 9.52C18.208 9.51849 18.7376 9.65262 19.21 9.91L19.89 10.27L20.11 9.54C20.2552 9.07547 20.501 8.64867 20.83 8.29H13.2V11.55Z"
                                fill="#00EAFF"/>
                            <path d="M4.4 29.7H1.1V33H4.4V29.7Z" fill="#00EAFF"/>
                            <path d="M9.9 8.25H6.6V11.55H9.9V8.25Z" fill="#00EAFF"/>
                            <path d="M9.9 14.85H6.6V18.15H9.9V14.85Z" fill="#00EAFF"/>
                            <path
                                d="M12.51 25.88C11.8391 25.6747 11.2508 25.2614 10.83 24.7C10.4771 24.2346 10.2591 23.6811 10.2 23.1H3.3V3.3H29.7V10L29.91 9.89C30.3897 9.6318 30.9252 9.4945 31.47 9.49C31.6432 9.48009 31.8168 9.48009 31.99 9.49C32.3396 9.54822 32.6774 9.66306 32.99 9.83V3.3C32.9874 2.42732 32.6402 1.59099 32.0241 0.97297C31.4079 0.354955 30.5727 0.00526907 29.7 0H3.3C2.4256 0.00263773 1.58776 0.351162 0.969462 0.969461C0.351162 1.58776 0.00263773 2.4256 0 3.3V23.1C0.00263773 23.9744 0.351162 24.8122 0.969462 25.4305C1.58776 26.0488 2.4256 26.3974 3.3 26.4H13.09L13.25 26.1L12.51 25.88Z"
                                fill="#00EAFF"/>
                            <path
                                d="M35.8 19.78L33.25 19C33.0684 18.3785 32.8203 17.7783 32.51 17.21L33.79 14.86C33.8362 14.7672 33.8536 14.6627 33.84 14.56C33.82 14.4614 33.7713 14.371 33.7 14.3L31.81 12.46C31.739 12.3887 31.6486 12.34 31.55 12.32C31.4473 12.3064 31.3428 12.3238 31.25 12.37L28.89 13.64C28.3147 13.3069 27.7043 13.0386 27.07 12.84L26.29 10.31C26.2611 10.2136 26.2014 10.1292 26.12 10.07C26.0352 10.0195 25.9387 9.99197 25.84 9.99H23.29C23.1894 9.98927 23.0913 10.0208 23.01 10.08C22.9286 10.1392 22.8689 10.2236 22.84 10.32L22.06 12.85C21.4222 13.0391 20.8081 13.3008 20.23 13.63L17.91 12.36C17.8129 12.3257 17.7071 12.3257 17.61 12.36C17.5114 12.38 17.421 12.4287 17.35 12.5L15.47 14.32C15.3984 14.3947 15.3498 14.4884 15.33 14.59C15.3215 14.6894 15.3387 14.7892 15.38 14.88L16.66 17.19C16.3316 17.7615 16.0699 18.3688 15.88 19L13.33 19.78C13.234 19.8041 13.1492 19.8606 13.09 19.94C13.0308 20.0213 12.9993 20.1194 13 20.22V22.75C12.9993 22.8506 13.0308 22.9487 13.09 23.03C13.1516 23.109 13.235 23.1681 13.33 23.2L15.88 23.97C16.0712 24.5943 16.3329 25.1949 16.66 25.76L15.38 28.16C15.3383 28.2542 15.3211 28.3574 15.33 28.46C15.35 28.5586 15.3987 28.649 15.47 28.72L17.27 30.62C17.3405 30.6973 17.4362 30.7469 17.54 30.76C17.6336 30.7944 17.7364 30.7944 17.83 30.76L20.21 29.49C20.7752 29.797 21.372 30.0418 21.99 30.22L22.76 32.75C22.7889 32.8464 22.8486 32.9308 22.93 32.99C23.0113 33.0492 23.1094 33.0807 23.21 33.08H25.76C25.8606 33.0807 25.9587 33.0492 26.04 32.99C26.1213 32.9327 26.1784 32.8471 26.2 32.75L27 30.14C27.6116 29.9617 28.2018 29.7169 28.76 29.41L31.17 30.68C31.2669 30.7151 31.3731 30.7151 31.47 30.68C31.5699 30.6639 31.6615 30.6146 31.73 30.54L33.58 28.7C33.6513 28.629 33.7 28.5386 33.72 28.44C33.7334 28.3405 33.716 28.2393 33.67 28.15L32.39 25.76C32.7036 25.2038 32.9519 24.6132 33.13 24L35.68 23.23C35.7764 23.2011 35.8608 23.1414 35.92 23.06C35.9791 22.9825 36.0107 22.8875 36.01 22.79V20.19C36.0224 20.1268 36.019 20.0615 36 20C35.9602 19.9061 35.8897 19.8286 35.8 19.78ZM24.54 25.78C23.6988 25.792 22.8733 25.5516 22.17 25.09C21.4649 24.638 20.9139 23.9824 20.59 23.21C20.2598 22.4378 20.1692 21.5843 20.33 20.76C20.4528 20.1453 20.71 19.5653 21.0832 19.0617C21.4565 18.5581 21.9365 18.1433 22.489 17.847C23.0414 17.5507 23.6525 17.3803 24.2785 17.348C24.9046 17.3156 25.53 17.4222 26.11 17.66C26.7547 17.9192 27.325 18.3342 27.7698 18.8679C28.2146 19.4017 28.5201 20.0374 28.6588 20.7182C28.7976 21.399 28.7652 22.1036 28.5647 22.7689C28.3642 23.4341 28.0018 24.0392 27.51 24.53C26.721 25.3158 25.6535 25.7579 24.54 25.76V25.78Z"
                                fill="#00EAFF"/>
                        </svg>
                    </div>
                    {props.asideOpen ? (<div className={"text"}>
                        <FormattedMessage id={"index.systemSetting"}/></div>) : null}
                </div>
            </Link>
            {contain}
        </div>
    )
}

function Report(props) {
    const {contain, handleHoverTitle} = useAsideHoverTitle(props.asideOpen, {"CN": "报表", "EN": "Report"})
    return (
        <div className={"asideUpItem"} onMouseEnter={() => handleHoverTitle("in")}
             onMouseLeave={() => handleHoverTitle("out")}>
            <Link to={"/report/alarmStatistic"}>
                <div className={"report_background"}>
                    <Switch>
                        <Route path={"/report"}>
                            <div className={"background2"}/>
                        </Route>
                    </Switch>
                    <div className={"background"}/>
                    <div className={"picture"}>
                        <svg width="2.25rem" height="2.0625rem" viewBox="0 0 36 33" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M27.81 21.9238L36 7.75777V32.3998H0V-0.000234425H3.6V22.5718L13.5 5.39977L25.2 12.2038L32.832 -0.990234L35.946 0.809766L26.532 17.0998L14.814 10.3498L4.158 28.7998H8.226L16.128 15.1918L27.81 21.9238Z"
                                fill="#00EAFF"/>
                        </svg>
                    </div>
                    {props.asideOpen ? (<div className={"text"}>
                        <FormattedMessage id={"index.report"}/></div>) : null}
                </div>
            </Link>
            {contain}
        </div>
    )
}

function Table() {
    const template = useTemplate()
    const token = useToken()
    const {alarmVariables} = useInstantAlarm(token)
    const [variables, dispatch] = useReducer(pageReducer, PAGE_ALARM_INITIAL_STATE)
    const {data} = dealIndexTableData(alarmVariables.data, variables)
    // const {data} = useDealIndexTableData(eventRowData, variables)
    // const style = {
    //     "animationDuration": alarmVariables.delay.toString() + "ms",
    //     "animationPlayState": (ALARM_IS_RUNNING ? "running" : "paused")
    // }

    return (
        <div id="articleTable" className="articleTable">
            <div className="tableTitle">
                <div className={"alarmNotification"}>
                    <AlarmNotification alarmCount={alarmVariables.data.length}/>
                </div>
                <div className={"alarmNotificationText"}><FormattedMessage id={"index.alarmWarning"}/></div>
                <div className={"svgContainer"}>
                    <Link to={{pathname: "/alarmMonitoring/event"}}>
                        <svg width="2.83rem" height="1.75rem" viewBox="0 0 34 21" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M10 2.5H24C28.4183 2.5 32 6.08172 32 10.5C32 14.9183 28.4183 18.5 24 18.5H10C5.58172 18.5 2 14.9183 2 10.5C2 6.08172 5.58172 2.5 10 2.5ZM0 10.5C0 4.97715 4.47715 0.5 10 0.5H24C29.5228 0.5 34 4.97715 34 10.5C34 16.0228 29.5228 20.5 24 20.5H10C4.47715 20.5 0 16.0228 0 10.5ZM21.6891 6.76644C21.284 6.39109 20.6513 6.41524 20.276 6.82038C19.9006 7.22551 19.9248 7.85822 20.3299 8.23356L21.6969 9.5H10C9.44771 9.5 9 9.94772 9 10.5C9 11.0523 9.44771 11.5 10 11.5H21.6969L20.3299 12.7664C19.9248 13.1418 19.9006 13.7745 20.276 14.1796C20.6513 14.5848 21.284 14.6089 21.6891 14.2336L24.9272 11.2336C25.1315 11.0443 25.2476 10.7785 25.2476 10.5C25.2476 10.2215 25.1315 9.95569 24.9272 9.76644L21.6891 6.76644Z"
                                  fill="#8FCDCC" fillOpacity="0.8"/>
                        </svg>
                    </Link>
                </div>
                <SynAssignJob/>
                {/*<div className={"datetimeTitle"}><FormattedMessage id={"index.updateTime"}/></div>*/}
                {/*<div className={"datetime"} style={style}>*/}
                {/*    {alarmVariables.date.getFullYear()}-{(alarmVariables.date.getMonth() + 1).toString().padStart(2, "0")}-{alarmVariables.date.getDate().toString().padStart(2, "0")}*/}
                {/*    &nbsp;*/}
                {/*    {alarmVariables.date.getHours().toString().padStart(2, "0")}:{alarmVariables.date.getMinutes().toString().padStart(2, "0")}:{alarmVariables.date.getSeconds().toString().padStart(2, "0")}*/}
                {/*</div>*/}
            </div>
            {data.dealData.length === 0 ?
                <div className={"noDataContainer"}>
                    {template.Alarm_Group ?
                    <FormattedMessage id={"index.noAlarm"}/>
                        : <FormattedMessage id={"index.noAuthority"}/>}
                </div> :
                <div className={"alarmTable"}>
                    <div className={"alarmTableSort"}>
                        <Sort data={sortConditionData["time"]} sortCondition={variables.sortCondition}
                              dispatch={dispatch}/>
                        <Sort data={sortConditionData["floor"]} sortCondition={variables.sortCondition}
                              dispatch={dispatch}/>
                        <Sort data={sortConditionData["message"]} sortCondition={variables.sortCondition}
                              dispatch={dispatch}/>
                        <Sort data={sortConditionData["status"]} sortCondition={variables.sortCondition}
                              dispatch={dispatch}/>
                    </div>
                    <div className={"alarmTableEvents"}>
                        <ShowEventTable dealData={data.dealData} assignJob={true}/>
                    </div>
                </div>
            }
        </div>
    )
}

// function OCMS(props) {
//     const token = useToken()
//     const {contain, handleHoverTitle} = useAsideHoverTitle(props.asideOpen, {"CN": "3D OCMS", "EN": "3D OCMS"})
//     return (
//         <a href={"/ocms3d/?="+token} target="_blank" rel="noreferrer">
//             <div className={"asideUpItem"} id="OCMS" onMouseEnter={()=>handleHoverTitle("in")}
//                  onMouseLeave={()=>handleHoverTitle("out")}>
//                 <div>
//                     <div className={"background"}/>
//                     <svg width="1.75rem" height="2.1875rem" viewBox="0 0 28 35" fill="none" xmlns="http://www.w3.org/2000/svg"
//                          xmlnsXlink="http://www.w3.org/1999/xlink">
//                         <rect width="28" height="35" fill="url(#pattern0)"/>
//                         <defs>
//                             <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
//                                 <use xlinkHref="#image0"
//                                      transform="translate(0 -0.00344828) scale(0.00862069 0.00689655)"/>
//                             </pattern>
//                             <image id="image0" width="116" height="146"
//                                    xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAACSCAYAAACUh+64AAAACXBIWXMAAAsTAAALEwEAmpwYAAAJhWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDggNzkuMTY0MDM2LCAyMDE5LzA4LzEzLTAxOjA2OjU3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAxNy0xMS0yMFQxMTowODoxNSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0wMS0yMlQxNzo0MDoxOSswODowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjEtMDEtMjJUMTc6NDA6MTkrMDg6MDAiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmY3ODFlYjViLWIzNTEtNDM0NS05Njg3LWVjN2Y5MGYyZWMwYiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjlmMDk3YWIwLTlhODctODg0Yy1iODQ5LWE2NzJiYWE4ODJhYSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjU0NzZiNDE1LTE0ZTItMTQ0NS05ZTEzLTZiYjViMjNhNTdiOCI+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo1YzBiNzUwMi1jZDlmLTExZTctYjQ1NS05ZDkwNmZiYzFjZjU8L3JkZjpsaT4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6NjcwZGFjNzUtZmRkZC0zMDQzLTkxNGEtNjBjYTJmNTM2MTFmPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTQ3NmI0MTUtMTRlMi0xNDQ1LTllMTMtNmJiNWIyM2E1N2I4IiBzdEV2dDp3aGVuPSIyMDE3LTExLTIwVDExOjA4OjE1KzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjIyNGQ5NTE1LTBlOGQtMjY0NS05MWMzLTJlNjRlMWJkNTY4NyIgc3RFdnQ6d2hlbj0iMjAyMS0wMS0yMlQxNzo0MDoxOSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImRlcml2ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImNvbnZlcnRlZCBmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmNzgxZWI1Yi1iMzUxLTQzNDUtOTY4Ny1lYzdmOTBmMmVjMGIiIHN0RXZ0OndoZW49IjIwMjEtMDEtMjJUMTc6NDA6MTkrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4wIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MjI0ZDk1MTUtMGU4ZC0yNjQ1LTkxYzMtMmU2NGUxYmQ1Njg3IiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZWRmOGZlYTgtY2Q5Zi0xMWU3LWE4MjEtZDE3NjJhN2IwZGQwIiBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NTQ3NmI0MTUtMTRlMi0xNDQ1LTllMTMtNmJiNWIyM2E1N2I4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+bzROEgAAEshJREFUeJztnXuM49dVx899/OxZz2PnYXuzbDIPeyZEhSTbJJsZJATlkSA1KFVJSqGKUAG1UoqQQGoRRKg0QkJKgiCVaEEqoKKKCrUVFS1/VEQVSFQwu5sQ0kY0zfgxj93sjO2Z8bxt/+6DP3Y88eP+7J/tcz272d/nL/v6N/fc9Xfv8b3nnnsv0VpDwHsHXn1B8p394T1vrHy6Egk/gd2gOxWn7F699pP3/EGv9fD2j3g0oOR+eef86HO78bNjvTbi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"/>
//                         </defs>
//                     </svg>
//                 </div>
//                 {props.asideOpen ? (<div className={"DText"}>3D OCMS</div>) : null}
//                 {contain}
//             </div>
//         </a>
//     )
// }

function SubSystem(props){
    function handleClick() {
        props.setOpenSubUrl(pre=>!pre)
    }

    return(
        <div className={"asideUpItem"} onMouseEnter={handleClick} onMouseLeave={handleClick}>
            <div >
                <div className={"background"}/>
                <svg width="2.25rem" height="2.3125rem" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M32 0.400391H4C2.93913 0.400391 1.92172 0.821818 1.17157 1.57196C0.421427 2.32211 0 3.33952 0 4.40039V32.4004C0 33.4613 0.421427 34.4787 1.17157 35.2288C1.92172 35.979 2.93913 36.4004 4 36.4004H32C33.0609 36.4004 34.0783 35.979 34.8284 35.2288C35.5786 34.4787 36 33.4613 36 32.4004V4.40039C36 3.33952 35.5786 2.32211 34.8284 1.57196C34.0783 0.821818 33.0609 0.400391 32 0.400391ZM32 32.4004H4V4.40039H32V32.4004ZM21.88 14.5204C23.14 15.8004 23.84 17.4804 23.84 19.2804C23.84 21.0804 23.14 22.7604 21.88 24.0204L17.46 28.4004C16.16 29.7404 14.44 30.4004 12.72 30.4004C11 30.4004 9.28 29.7404 8 28.4004C5.34 25.8204 5.34 21.5604 8 18.9204L10.7 16.2004L10.68 17.4004C10.66 18.4004 10.82 19.4004 11.14 20.2804L11.24 20.5804L10.44 21.4004C10.1369 21.6977 9.89616 22.0525 9.7318 22.444C9.56744 22.8355 9.48279 23.2558 9.48279 23.6804C9.48279 24.105 9.56744 24.5253 9.7318 24.9168C9.89616 25.3083 10.1369 25.663 10.44 25.9604C11.66 27.2004 13.78 27.2004 15 25.9604L19.4 21.5804C20 20.9604 20.36 20.1404 20.36 19.2804C20.36 18.4004 20 17.6204 19.4 17.0004C19.2355 16.8385 19.1049 16.6455 19.0157 16.4326C18.9266 16.2197 18.8807 15.9912 18.8807 15.7604C18.8807 15.5296 18.9266 15.3011 19.0157 15.0882C19.1049 14.8753 19.2355 14.6823 19.4 14.5204C20.06 13.8604 21.22 13.8804 21.88 14.5204ZM30 13.1204C30 14.9204 29.3 16.6004 28 17.8804L25.32 20.6004V19.4004C25.34 18.4004 25.18 17.4004 24.86 16.5204L24.76 16.2404L25.56 15.4004C25.8631 15.1031 26.1038 14.7483 26.2682 14.3568C26.4326 13.9653 26.5172 13.545 26.5172 13.1204C26.5172 12.6958 26.4326 12.2755 26.2682 11.884C26.1038 11.4925 25.8631 11.1377 25.56 10.8404C24.34 9.60039 22.2 9.62039 21 10.8404L16.6 15.2404C16 15.8404 15.64 16.6604 15.64 17.5204C15.64 18.4004 16 19.1804 16.6 19.8004C16.94 20.1204 17.12 20.5604 17.12 21.0404C17.12 21.5204 16.94 21.9604 16.6 22.2804C16.4372 22.4423 16.2435 22.5699 16.0306 22.6558C15.8176 22.7417 15.5896 22.784 15.36 22.7804C14.92 22.7804 14.46 22.6204 14.12 22.2804C12.8618 21.0198 12.1552 19.3115 12.1552 17.5304C12.1552 15.7493 12.8618 14.041 14.12 12.7804L18.54 8.40039C19.1566 7.77111 19.8925 7.27119 20.7047 6.9299C21.5169 6.58862 22.389 6.41283 23.27 6.41283C24.151 6.41283 25.0231 6.58862 25.8353 6.9299C26.6475 7.27119 27.3834 7.77111 28 8.40039C29.3 9.64039 30 11.3204 30 13.1204Z"
                        fill="#00EAFF"/>
                </svg>
            </div>
            {props.asideOpen ? (<div className={"text"}>
                <FormattedMessage id={"index.url"}/></div>) : null}
            <div className="div_triangle">
                <div className="triangle"/>
            </div>
        </div>
    )
}

function Language(props){
    return(
        <div className={"aside_down pointer"} onClick={props.handleOpen}>
            <div>
                <svg width="1.125rem" height="1.125rem" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M15.3418 2.65819C14.5105 1.81863 13.5215 1.15161 12.4316 0.695436C11.3417 0.239264 10.1724 0.00293516 8.99086 2.71677e-05C7.80935 -0.00288082 6.63891 0.227689 5.54678 0.67849C4.45465 1.12929 3.46235 1.79144 2.6269 2.6269C1.79144 3.46235 1.12929 4.45465 0.67849 5.54678C0.227689 6.63891 -0.00288082 7.80935 2.71677e-05 8.99086C0.00293516 10.1724 0.239264 11.3417 0.695436 12.4316C1.15161 13.5215 1.81863 14.5105 2.65819 15.3418C3.48952 16.1814 4.47855 16.8484 5.56845 17.3046C6.65834 17.7607 7.82764 17.9971 9.00914 18C10.1907 18.0029 11.3611 17.7723 12.4532 17.3215C13.5454 16.8707 14.5377 16.2086 15.3731 15.3731C16.2086 14.5377 16.8707 13.5454 17.3215 12.4532C17.7723 11.3611 18.0029 10.1907 18 9.00914C17.9971 7.82764 17.7607 6.65834 17.3046 5.56845C16.8484 4.47855 16.1814 3.48952 15.3418 2.65819ZM1.31247 9C1.31218 8.31962 1.4024 7.64222 1.58073 6.98563C1.87462 7.61825 2.30144 8.16478 2.59172 8.81382C2.96689 9.64823 3.97428 9.41681 4.41911 10.1479C4.8139 10.797 4.39229 11.6178 4.68778 12.2968C4.90239 12.7897 5.40848 12.8974 5.75763 13.2578C6.11437 13.6213 6.10677 14.1194 6.16122 14.5935C6.22267 15.1505 6.32233 15.7026 6.45951 16.2459C6.45951 16.2499 6.45951 16.2543 6.46272 16.2583C3.46658 15.2061 1.31247 12.3501 1.31247 9ZM9 16.6875C8.57068 16.6874 8.14211 16.6515 7.71875 16.5802C7.72315 16.4717 7.72515 16.3704 7.73596 16.2999C7.83326 15.6633 8.15197 15.0407 8.58199 14.5642C9.00681 14.0942 9.58898 13.7763 9.94773 13.243C10.2993 12.7224 10.4046 12.0218 10.2596 11.4136C10.0462 10.5151 8.82543 10.2152 8.16718 9.72791C7.78881 9.44764 7.45208 9.01441 6.9552 8.97918C6.72617 8.96316 6.53439 9.01241 6.30736 8.95395C6.09916 8.8999 5.9358 8.78779 5.71398 8.81702C5.29958 8.87147 5.03812 9.31431 4.59288 9.25425C4.17047 9.19779 3.73524 8.70331 3.63915 8.30092C3.51583 7.78361 3.92503 7.61584 4.36346 7.5698C4.54644 7.55058 4.75184 7.52976 4.92761 7.59703C5.15904 7.68271 5.26835 7.90933 5.47615 8.02384C5.86573 8.23765 5.94461 7.89612 5.88495 7.55018C5.79566 7.03207 5.69156 6.82107 6.15361 6.46432C6.47393 6.21848 6.74779 6.0407 6.69654 5.59907C6.66611 5.33962 6.52398 5.2223 6.65651 4.96405C6.757 4.76746 7.03287 4.59008 7.21265 4.47277C7.6767 4.17007 9.2006 4.19249 8.57799 3.34526C8.39501 3.09662 8.05748 2.65218 7.73716 2.59132C7.33677 2.51565 7.159 2.96249 6.87992 3.15948C6.59164 3.36328 6.03029 3.59471 5.74161 3.2796C5.35323 2.85558 5.99906 2.71665 6.142 2.42036C6.20807 2.28222 6.142 2.09043 6.03069 1.90986C6.1751 1.849 6.32191 1.79254 6.47112 1.74049C6.56464 1.80956 6.67557 1.85116 6.79144 1.86061C7.0593 1.87823 7.31195 1.73328 7.54578 1.91586C7.80523 2.11606 7.99221 2.36911 8.33655 2.43157C8.66968 2.49203 9.02242 2.29784 9.1049 1.9567C9.15495 1.7493 9.1049 1.53029 9.05686 1.31608C10.5543 1.32469 12.0163 1.77316 13.261 2.60574C13.1809 2.57531 13.0852 2.57891 12.9671 2.63377C12.724 2.74668 12.3797 3.03416 12.3513 3.31924C12.3189 3.64275 12.7961 3.6884 13.0227 3.6884C13.3631 3.6884 13.7078 3.53625 13.5981 3.14306C13.5505 2.9725 13.4856 2.79512 13.3811 2.68782C13.6323 2.86213 13.873 3.05118 14.1018 3.25397C14.0982 3.25758 14.0946 3.26078 14.091 3.26478C13.8604 3.50502 13.5925 3.69521 13.4347 3.98749C13.3234 4.19329 13.1981 4.29099 12.9727 4.34424C12.8486 4.37347 12.7068 4.38428 12.6027 4.46756C12.3128 4.69579 12.4778 5.24432 12.7525 5.40888C13.0996 5.61669 13.6145 5.51899 13.8764 5.2223C14.081 4.99007 14.2015 4.58688 14.5695 4.58728C14.7315 4.58694 14.8871 4.65037 15.0027 4.76385C15.1548 4.92161 15.1248 5.06895 15.1572 5.26594C15.2145 5.61589 15.5232 5.4261 15.711 5.24953C15.8479 5.49313 15.9714 5.74402 16.0809 6.00106C15.8743 6.29855 15.7102 6.62287 15.2133 6.27613C14.9158 6.06833 14.7328 5.76683 14.3592 5.67314C14.0329 5.59306 13.6986 5.67635 13.3763 5.732C13.0099 5.79566 12.5755 5.82369 12.2976 6.10116C12.029 6.36862 11.8868 6.72657 11.6009 6.99524C11.048 7.51575 10.8146 8.0839 11.1725 8.81982C11.5169 9.52732 12.2372 9.91129 13.0143 9.86084C13.7779 9.80999 14.5711 9.36716 14.549 10.4766C14.541 10.8694 14.6231 11.1413 14.7436 11.5061C14.8553 11.8424 14.8477 12.1683 14.8734 12.5154C14.8977 12.9219 14.9613 13.3251 15.0631 13.7194C14.3455 14.6434 13.4261 15.3912 12.3753 15.9056C11.3245 16.42 10.17 16.6875 9 16.6875Z"
                        fill="#00EAFF"/>
                </svg>
            </div>
            {props.asideOpen ? (<div className={"asideDownText"}>
                <FormattedMessage id={"index.lang"}/></div>) : null}
        </div>
    )
}

function Privacy(props){
    return(
        <div className={"aside_down"}>
            <div>
                <svg width="1.125rem" height="1.375rem" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M9 2.19L16 5.3V10C16 14.52 13.02 18.69 9 19.93C4.98 18.69 2 14.52 2 10V5.3L9 2.19ZM9 0L0 4V10C0 15.55 3.84 20.74 9 22C14.16 20.74 18 15.55 18 10V4L9 0ZM8 6H10V8H8V6ZM8 10H10V16H8V10Z"
                        fill="#00EAFF"/>
                </svg>
            </div>
            {props.asideOpen ? (<div className={"asideDownText"}>
                <FormattedMessage id={"index.privacy"}/></div>) : null}
        </div>
    )
}

function Terms(props){
    return(
        <div className={"aside_down"}>
            <div>
                <svg width="1rem" height="1.25rem" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0 2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0H10C10.2652 5.66374e-05 10.5195 0.105451 10.707 0.293L15.707 5.293C15.8946 5.48049 15.9999 5.73481 16 6V18C16 18.5304 15.7893 19.0391 15.4142 19.4142C15.0391 19.7893 14.5304 20 14 20H2C1.46957 20 0.960859 19.7893 0.585786 19.4142C0.210714 19.0391 0 18.5304 0 18V2ZM13.586 6L10 2.414V6H13.586ZM8 2H2V18H14V8H9C8.73478 8 8.48043 7.89464 8.29289 7.70711C8.10536 7.51957 8 7.26522 8 7V2ZM4 11C4 10.7348 4.10536 10.4804 4.29289 10.2929C4.48043 10.1054 4.73478 10 5 10H11C11.2652 10 11.5196 10.1054 11.7071 10.2929C11.8946 10.4804 12 10.7348 12 11C12 11.2652 11.8946 11.5196 11.7071 11.7071C11.5196 11.8946 11.2652 12 11 12H5C4.73478 12 4.48043 11.8946 4.29289 11.7071C4.10536 11.5196 4 11.2652 4 11ZM4 15C4 14.7348 4.10536 14.4804 4.29289 14.2929C4.48043 14.1054 4.73478 14 5 14H11C11.2652 14 11.5196 14.1054 11.7071 14.2929C11.8946 14.4804 12 14.7348 12 15C12 15.2652 11.8946 15.5196 11.7071 15.7071C11.5196 15.8946 11.2652 16 11 16H5C4.73478 16 4.48043 15.8946 4.29289 15.7071C4.10536 15.5196 4 15.2652 4 15Z"
                        fill="#00EAFF"/>
                </svg>
            </div>
            {props.asideOpen ? (<div className={"asideDownText"}>
                <FormattedMessage id={"index.terms"}/></div>) : null}
        </div>
    )
}

function ContactItem(props){
    return(
        <Link to={{pathname: "/contact"}}>
            <div className={"aside_down"}>
                <div>
                    <svg width="1.125rem" height="1.125rem" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 9H14C14 6.24 11.76 4 9 4V6C10.66 6 12 7.34 12 9ZM16 9H18C18 6.61305 17.0518 4.32387 15.364 2.63604C13.6761 0.948211 11.3869 0 9 0V2C12.87 2 16 5.13 16 9ZM17 12.5C15.75 12.5 14.55 12.3 13.43 11.93C13.33 11.9 13.22 11.88 13.12 11.88C12.86 11.88 12.61 11.98 12.41 12.17L10.21 14.37C7.37119 12.9262 5.06378 10.6188 3.62 7.78L5.82 5.57C5.95245 5.44434 6.04632 5.28352 6.0906 5.1064C6.13488 4.92928 6.12773 4.7432 6.07 4.57C5.69065 3.41806 5.49821 2.2128 5.5 1C5.5 0.45 5.05 0 4.5 0H1C0.45 0 0 0.45 0 1C0 10.39 7.61 18 17 18C17.55 18 18 17.55 18 17V13.5C18 12.95 17.55 12.5 17 12.5ZM2.03 2H3.53C3.6 2.88 3.75 3.75 3.98 4.58L2.78 5.79C2.38 4.58 2.12 3.32 2.03 2ZM16 15.97C14.68 15.88 13.4 15.62 12.2 15.21L13.4 14.01C14.25 14.25 15.12 14.4 16 14.46V15.97Z"
                            fill="#00EAFF"/>
                    </svg>
                </div>
                {props.asideOpen ? (<div className={"asideDownText"}>
                    <FormattedMessage id={"index.contact"}/></div>) : null}
            </div>
        </Link>
    )
}

// function Logo(props){
//     return(
//         <div className={"aside_down"}>
//             <div>
//                 <svg width="1.125rem" height="0.9375rem" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path
//                         d="M9.02195 0L0 15H18L9.02195 0ZM10.7428 13.2537C10.3409 13.2533 9.94756 13.1359 9.60973 12.9157L9.58565 12.9343C8.5659 13.6506 7.45267 14.1104 6.42301 14.1133C6.36777 14.1133 6.31395 14.1133 6.26013 14.1133C5.93771 14.1086 5.61951 14.0385 5.32439 13.9071C5.02928 13.7757 4.76326 13.5857 4.54214 13.3483C4.20733 12.9772 4.00968 12.5005 3.98269 11.9989C3.98269 11.9645 3.98269 11.9287 3.98269 11.8914C3.99685 10.6093 4.86222 9.22405 6.04768 8.09665C7.23314 6.96925 8.77127 6.12549 10.2782 6.10973H10.3009C10.6128 6.09853 10.9238 6.15041 11.2156 6.26233C11.5075 6.37426 11.7743 6.54397 12.0005 6.76153C12.203 6.97641 12.3616 7.22966 12.4671 7.50672C12.5726 7.78378 12.6229 8.0792 12.6152 8.37599C12.6105 8.83716 12.5142 9.29267 12.3319 9.71541C12.6 10.0234 12.7746 10.4032 12.8347 10.809C12.8949 11.2149 12.8379 11.6297 12.6708 12.0037C12.5036 12.3777 12.2333 12.6949 11.8924 12.9174C11.5514 13.1399 11.1542 13.2582 10.7484 13.258L10.7428 13.2537ZM11.441 7.31592C11.1946 7.06666 10.8278 6.90192 10.2938 6.89906H10.2782C9.07577 6.89906 7.65945 7.64684 6.57597 8.67396C5.49249 9.70108 4.7475 10.9961 4.76166 11.8885C4.76166 11.91 4.76166 11.9344 4.76166 11.9616C4.78174 12.2773 4.90706 12.5768 5.11716 12.8111C5.35652 13.0747 5.71201 13.2867 6.2927 13.3182H6.41734C7.17649 13.3182 8.12967 12.9615 9.02195 12.3527C8.74742 11.9655 8.60897 11.4965 8.62868 11.0204C8.64838 10.5443 8.82511 10.0887 9.13068 9.72603C9.43625 9.3634 9.85306 9.11468 10.3147 9.01955C10.7763 8.92441 11.2561 8.98834 11.6775 9.20113C11.7732 8.93314 11.824 8.65086 11.8277 8.36596C11.8347 8.17381 11.8042 7.98215 11.7378 7.80197C11.6715 7.62178 11.5706 7.45661 11.441 7.31592Z"
//                         fill="#00EAFF"/>
//                 </svg>
//             </div>
//             {props.asideOpen ? (<div className={"asideDownText"}>
//                 <FormattedMessage id={"index.company"}/></div>) : null}
//         </div>
//     )
// }

function BuildingInformation() {
    const controller = useRef(false)
    const history = useHistory()
    const token = useToken()
    const [data, setData] = useState({
        "totalCompany": 0,
        "totalEmployee": 0,
        "onSiteStaff": 0,
        "arrivedVisitors": 0,
        "reservationVisitors": 0,
        "onSiteVisitors": 0
    })

    const fetchBuilding = useCallback(async ()=>{
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/building",{
                headers: new Headers({
                    Authorization: "Bearer " + token
                })})
            const response2 = await checkFetchResult(response)
            const data = await response2.json()
            if(controller.current){
                setData(data)
            }
        }catch (e){
            if (typeof(e)==="object" && e.json) {
                const data = await e.json()
                history.push("/handleError/" + data.Message)
            }
            console.log(e)
        }
    },[token, history])

    useEffect(()=>{
        controller.current = true
        if(CONNECT_SERVER){
            fetchBuilding()
            return ()=>{
                controller.current = false
            }
        }
    },[fetchBuilding])

    useInterval(()=>{
        fetchBuilding()
    }, IS_RUNNING ? DELAY : null)

    return (
        <div className={"buildingInformation articleItem"}>
            <IndexItemTitleContainer id={"index.building.title"}/>
            <div className={"buildingDownContainer"}>
                <BuildingItem number={data.totalCompany} id={"index.building.totalCompany"} denominator={data.totalCompany}/>
                <BuildingItem number={data.totalEmployee} id={"index.building.totalEmployee"} denominator={data.totalEmployee}/>
                <BuildingItem number={data.onSiteStaff} id={"index.building.onSite"} denominator={data.totalEmployee}/>
                <BuildingItem number={data.arrivedVisitors} id={"index.building.arrivedVisitors"} denominator={data.reservationVisitors}/>
                <BuildingItem number={data.reservationVisitors} id={"index.building.reservationVisitors"} denominator={data.reservationVisitors}/>
                <BuildingItem number={data.onSiteVisitors} id={"index.building.onSiteVisitors"} denominator={data.reservationVisitors}/>
            </div>
        </div>
    )
}

function BuildingItem(props){

    const deg1 = parseInt(props.number)>=parseInt(props.denominator) ? 359.9: (props.number/props.denominator*360)
    const cx1 = 50*Math.cos((deg1+90)*Math.PI/180)
    const cy1 = 50*Math.sin((deg1-90)*Math.PI/180)
    const bigArc = () => {
        if(deg1>180){
            return 1
        }else{
            return 0
        }
    }
    const circle = `M50 0,A50 50 0 ${bigArc()} 0 ${50+cx1}, ${50 + cy1}`

    return(
        <div className={"buildingItem"}>
            <div className={"title"}>
                <FormattedMessage id={props.id}/>
            </div>
            <div className={"svgContainer"}>
                <svg width={"6.25rem"} height={"6.25rem"} viewBox={"-5 -5 110 110"} xmlns="http://www.w3.org/2000/svg">
                    <g>
                        <circle stroke={"rgba(143, 205, 204, 0.1)"} strokeWidth={"5"} fill={"none"} cx={"50"} cy={"50"} r={"50"}/>
                        <path d={circle} stroke={"rgba(143, 205, 204, 0.3)"} strokeWidth={"5"} fill={"none"}/>
                        <text x={50-(props.number.toString().length)/2*17.5} y={"62"}
                              textLength={props.number.toString().length*17.5} fill={"#8FCDCC"}
                              style={{"fontSize":"32px", "fontFamily": "Noto Sans SC"}}>
                            {props.number}
                        </text>
                    </g>
                </svg>
            </div>
            {/*<div className={"circleContainer"}>*/}
            {/*    {props.number}*/}
            {/*</div>*/}
        </div>
    )
}

function EquipmentStatus(props) {
    const controller = useRef(false)
    const history = useHistory()
    const {setUpdateFlag} = {...props}

    const token = useToken()
    const lang = useLanguage()
    const {size} = useChartSize()
    const [data, setData] = useState({})

    const chartData = useCallback(() => {
        const labels = []
        const normalData = []
        const errorData = []
        const errorValue = (value) => {
            if(value){
                return -value
            }else{
                return 0
            }
        }
        for (let datum in data){
            labels.push(equipmentName[datum][lang])
            normalData.push(parseInt(data[datum].normal))
            errorData.push(errorValue(parseInt(data[datum].error)))
        }
        return {
            labels: labels,
            datasets: [
                {
                    label: {"EN": "normal", "CN": "正常"}[lang],
                    // data: [50, 20, 21, 78, 35, 61, 42],
                    data: normalData,
                    backgroundColor: "#4D7B92",
                    barPercentage: 0.35,
                    // barThickness: size,
                    borderColor: "rgba(190,237,255, 0.0)",
                },
                {
                    label: {"EN": "error", "CN": "异常"}[lang],
                    // data: [-12, -5, -31, -22, -18, -6, -23],
                    data: errorData,
                    backgroundColor: "#804459",
                    barPercentage: 0.35,
                    // barThickness: size,
                    borderColor: "rgba(190,237,255, 0.0)",
                }
            ]
        }
    },[data, lang])

    const options = useMemo(()=>{
        return {
        maintainAspectRatio: false,
        animation:{
            duration: 0
        },
        plugins: {
            legend: {
                reverse: false,
                fullSize: false,
                display: true,
                position: "top",
                align: "start",
                labels: {
                    boxWidth: size*1.8,
                    boxHeight: size*0.5,
                    color: "#8FCDCC",
                    font: {
                        size: size,
                        family: "Noto Sans SC",

                    }
                },
            },
            tooltip: true,
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
                offset: true,
                grid: {
                    borderWidth: 3,
                    borderColor: "#84E2F7",
                    display: false
                },
                ticks: {
                    font: {
                        size: size,
                    },
                    color: "#84E2F7"
                }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                grid: {
                    borderWidth: 3,
                    borderColor: "#84E2F7",
                    display: true,
                    color: "rgba(143, 205, 204, 0.15",
                    drawTicks: false
                },
                ticks: {
                    font: {
                        size: size,
                    },
                    crossAlign: "center",
                    color: "#84E2F7",
                    padding: 7
                }
            }
        }
    }},[size])

    const fetchEquipment = useCallback(async ()=>{
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/equipment",{
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
            const response2 = await checkFetchResult(response)
            const data =  await response2.json()
            if(controller.current){
                setData(data)
                setUpdateFlag(pre=>!pre)
            }
        }catch (e) {
            if (typeof(e)==="object" && e.json) {
                const data = await e.json()
                history.push("/handleError/" + data.Message)
            }
            console.log(e)
        }
    },[token, history, setUpdateFlag])

    useEffect(()=>{
        controller.current = true
        if(CONNECT_SERVER){
            fetchEquipment()
            return ()=>{
                controller.current = false
            }
        }
    },[fetchEquipment])

    useInterval(()=>{
        fetchEquipment()
    }, IS_RUNNING ? DELAY : null)

    const chart = useMemo(() => {
        return <Bar data={chartData()} options={options} type={"Bar"}/>
    }, [chartData, options])

    return (
        <div className={"equipmentStatus articleItem"}>
            <IndexItemTitleContainer id={"index.equipment.title"}/>
            <div className={"equipmentDownContainer"}>
                <div className={"equipmentChart"}>
                    {chart}
                </div>
            </div>
        </div>
    )
}

function Environment() {
    const lang = useLanguage()
    const history = useHistory()
    const token = useToken()
    const controller = useRef()
    const initial = useMemo(()=>{
        return [{
            "floor": "0F",
            "hcho": "0",
            "co2": "0",
            'pm10': "0",
            "pm2.5": "0",
            "temperature": "0",
            "humidity": "0"
        }]},[])
    const [data, setData] = useState(initial)
    const [nowIndex, setNowIndex] = useState(0)
    const [control, setControl] = useState(false)

    const fetchEnvironment = useCallback(async () => {
        try {
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/environment", {
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
            const response2 = await checkFetchResult(response)
            let data = await response2.json()
            if(controller.current){
                if(data.length===0){
                    data=initial
                    setNowIndex(0)
                }
                setData(data)
            }
        } catch (e) {
            if (typeof (e) === "object" && e.json) {
                const data = await e.json()
                history.push("/handleError/" + data.Message)
            }
            console.log(e)
        }
    }, [token, history, initial])

    const controlPage = useCallback((nowIndex, data) => {
        if (nowIndex === data.length-1) {
            setNowIndex(0)
        } else {
            setNowIndex(pre => pre + 1)
        }
    }, [])

    useEffect(() => {
        controller.current = true
        if (CONNECT_SERVER) {
            fetchEnvironment()
            setControl(true)
            return () => {
                controller.current = false
            }
        }
    }, [fetchEnvironment])

    useInterval(() => {
        fetchEnvironment()
    }, IS_RUNNING ? DELAY : null)

    useInterval(() => {
        controlPage(nowIndex, data)
    }, control ? 4000 : null)

    const handleChange = useCallback((index) => {
        setNowIndex(index)
    }, [])

    const handleCircleStyle = useCallback((index, nowIndex, oneFloorData) => {
        let result = "circle"
        let status = ""
        for (let item in oneFloorData) {
            if (oneFloorData.hasOwnProperty(item) && item !== "floor") {
                if (parseFloat(oneFloorData[item]) >= environmentAlarmData[item].danger) {
                    status = " danger"
                    break
                } else if (parseFloat(oneFloorData[item]) > environmentAlarmData[item].warning) {
                    status = " warning"
                }
            }
        }
        if (nowIndex === index) {
            result += " active"
        }
        return (result + status)
    }, [])

    const handleItemStyle = useCallback((value, item) => {
        let result = "valueContainer"
        if (parseFloat(value) >= environmentAlarmData[item].danger) {
            result += " danger"
        } else if (parseFloat(value) > environmentAlarmData[item].warning) {
            result += " warning"
        }
        return result
    }, [])

    // let classNameArrowLeft = "pageChangeButton active"
    // if (nowIndex === 0) {
    //     classNameArrowLeft = "pageChangeButton"
    // }
    // let classNameArrowRight = "pageChangeButton active"
    // if (nowIndex === data.length - 1) {
    //     classNameArrowRight = "pageChangeButton"
    // }

    function pagePre() {
        if (nowIndex !== 0) {
            setNowIndex(pre => pre - 1)
        }else{
            setNowIndex(data.length-1)
        }
    }

    function pageNext() {
        if (nowIndex !== data.length - 1) {
            setNowIndex(pre => pre + 1)
        }else{
            setNowIndex(0)
        }
    }

    function startAuto() {
        setControl(false)
    }

    function endAuto() {
        setControl(true)
    }

    return (
        <div className={"environment articleItem"} onMouseEnter={startAuto} onMouseLeave={endAuto}>
            <IndexItemTitleContainer id={"index.environment.title"} floor={data.length && data[nowIndex].floor}/>
            <div className={"environmentDownContainer"}>
                <div className={"changePageInformationContainer"}>
                    <div className={"pageChangeButton active"} onClick={pagePre}>
                        <div className={"arrowLeft"}/>
                    </div>
                    <div className={"environmentInformationContainer"}>
                        <div className={"airItem"}>
                            <div className={"titleName"}>CO<span className={"small"}>2</span></div>
                            <div className={data.length && handleItemStyle(data[nowIndex].co2, "co2")}>
                                <div className={"value"}>{data.length && data[nowIndex].co2}</div>
                                <div className={"unit"}>ppm</div>
                            </div>
                        </div>
                        {/*<div className={"airItem even"}>*/}
                        {/*    <div className={"titleName"}>CO<span className={"small"}/></div>*/}
                        {/*    <div className={data.length && handleItemStyle(data[nowIndex].co, "co")}>*/}
                        {/*        <div className={"value"}>{data.length && data[nowIndex].co}</div>*/}
                        {/*        <div className={"unit"}>ppm</div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                        <div className={"airItem even"}>
                            <div className={"titleName"}>HCHO<span className={"small"}/></div>
                            <div className={data.length && handleItemStyle(data[nowIndex].hcho, "hcho")}>
                                <div className={"value"}>{data.length && data[nowIndex].hcho}</div>
                                <div className={"unit"}>ppm</div>
                            </div>
                        </div>
                        {/*<div className={"airItem even"}>*/}
                        {/*    <div className={"titleName"}>TVOC<span className={"small"}/></div>*/}
                        {/*    <div className={data.length && handleItemStyle(data[nowIndex].tvoc, "tvoc")}>*/}
                        {/*        <div className={"value"}>{data.length && data[nowIndex].tvoc}</div>*/}
                        {/*        <div className={"unit"}>ppm</div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                        {/*<div className={"airItem"}>*/}
                        {/*    <div className={"titleName"}>O<span className={"small"}>3</span></div>*/}
                        {/*    <div className={data.length && handleItemStyle(data[nowIndex].o3, "o3")}>*/}
                        {/*        <div className={"value"}>{data.length && data[nowIndex].o3}</div>*/}
                        {/*        <div className={"unit"}>ppm</div>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                        <div className={"airItem"}>
                            <div className={"titleName"}>PM10<span className={"small"}/></div>
                            <div className={data.length && handleItemStyle(data[nowIndex].pm10, "pm10")}>
                                <div className={"value"}>{data.length && data[nowIndex].pm10}</div>
                                <div className={"unit"}>μg/m3</div>
                            </div>
                        </div>
                        <div className={"airItem even"}>
                            <div className={"titleName"}>PM2.5<span className={"small"}/></div>
                            <div className={data.length && handleItemStyle(data[nowIndex]["pm2.5"], "pm2.5")}>
                                <div className={"value"}>{data.length && data[nowIndex]["pm2.5"]}</div>
                                <div className={"unit"}>μg/m3</div>
                            </div>
                        </div>
                        <div className={"airItem"}>
                            <div className={"titleName"}>{{"CN": "温度", "EN": "Temperature"}[lang]}
                                <span className={"small"}/>
                            </div>
                            <div className={data.length && handleItemStyle(data[nowIndex].temperature, "temperature")}>
                                <div className={"value"}>{data.length && data[nowIndex].temperature}</div>
                                <div className={"unit"}>°C</div>
                            </div>
                        </div>
                        <div className={"airItem even"}>
                            <div className={"titleName"}>{{"CN": "湿度", "EN": "Humidity"}[lang]}
                                <span className={"small"}/>
                            </div>
                            <div className={data.length && handleItemStyle(data[nowIndex].humidity, "humidity")}>
                                <div className={"value"}>{data.length && data[nowIndex].humidity}</div>
                                <div className={"unit"}>%</div>
                            </div>
                        </div>
                    </div>
                    <div className={"pageChangeButton active"} onClick={pageNext}>
                        <div className={"arrowRight"}/>
                    </div>
                </div>
                <div className={"floorContainer"}>
                    {data.map((item, index) => (
                        <div onClick={() => (handleChange(index))}
                             className={handleCircleStyle(index, nowIndex, data[index])}
                             key={index}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

function AccessStatistic() {
    const controller = useRef(false)
    const history = useHistory()
    const token = useToken()
    const lang = useLanguage()
    const chartDom = useRef()
    const [chartData, setChartData] = useState({
        "labels": [],
        "data": [
            {
                "label": "out",
                "data": [1]
            },
            {
                "label": "in",
                "data": [1]
            },
        ]
    })
    const {labelWidth, size, lineRadius} = useChartSize()
    const showHover = useRef({
        "labels": [],
        "data": [
            {
                "label": "out",
                "data": []
            },
            {
                "label": "in",
                "data": []
            },
        ]
    })
    const [chartHoverData, setChartHoverData] = useState({
        "isOpen": false,
        "index": null,
        "datasetIndex": null
    })
    const backgroundColor = ["#4D7B92", "#806B78", "#80522D"]

    const fetchData = useCallback(async ()=>{
        try{
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/accessStatistic",{
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
            const response2 = await checkFetchResult(response)
            const rawData = await response2.json()
            if(controller.current){
                const data = {
                    "labels": [],
                    "data": [
                        {
                            "label": "out",
                            "data": []
                        },
                        {
                            "label": "in",
                            "data": []
                        },
                    ]
                }
                for (let rawDatum of rawData){
                    data.labels.push(rawDatum.name)
                    data.data[0].data.push(rawDatum.out)
                    data.data[1].data.push(rawDatum.in)
                }
                setChartData(data)
                showHover.current = data
            }
        }catch (e) {
            if (typeof(e)==="object" && e.json) {
                const data = await e.json()
                history.push("/handleError/" + data.Message)
            }
            console.log(e)
            // return accessStatistic
        }
    },[token, history])

    const createChart = useCallback( (data) => {
        let maxY2 = 1
        const data3 = []
        // const n = data.data[0].data.length
        // for (let i = 0; i < n; i++) {
        //     let difference = data.data[1].data[i] - data.data[0].data[i]
        //     if (Math.abs(difference) > maxY2) {
        //         maxY2 = Math.abs(difference)
        //     }
        //     data3.push(difference)
        // }
        // const setHover = () => {
        //     let result = {...showHover.current}
        //     result.data.push({
        //         "label": "difference",
        //         "data": data3
        //     })
        //     return result
        // }
        // showHover.current = setHover()
        const chartCanvas = ReactDOM.findDOMNode(chartDom.current)
        return new Chart(chartCanvas, {
            type: "line",
            options: dashboardAccessOptions(labelWidth, size, setChartHoverData, Math.ceil(maxY2*1.25)),
            data: dashboardAccessData(lineRadius * 0.8, data, lang, size, data3)
        })
    },[labelWidth, lineRadius, lang, size])


    useEffect(()=>{
        controller.current = true
        if(CONNECT_SERVER){
            fetchData()
            return ()=>{
                controller.current = false
            }
        }
    },[fetchData])

    useEffect(()=>{
        const chart = createChart(chartData)
        return()=>{
            chart.destroy()
        }
    },[chartData, createChart])

    useInterval(()=>{
        fetchData()
    }, IS_RUNNING ? DELAY : null)

    return (
        <div className={"accessStatistic articleItem"}>
            <IndexItemTitleContainer id={"index.access.title"}/>
            <div className={"accessDownContainer"}>
                <div className={"chartContainer"}>
                    {/*<div className={"differenceTitle"}>*/}
                        {/*(<FormattedMessage id={"index.access.difference"}/>)*/}
                    {/*</div>*/}
                    <canvas ref={chartDom}/>
                </div>
                <div className={"hoverData"}>
                    {chartHoverData.isOpen &&
                    <div className={"chartData"}>
                        <div className={"color"}
                             style={{backgroundColor: backgroundColor[chartHoverData.datasetIndex]}}/>
                        <div className={"text"}>
                            {showHover.current.labels[chartHoverData.index]},&nbsp;
                            <FormattedMessage id={"index.access."+showHover.current.data[chartHoverData.datasetIndex].label}/>
                            ,&nbsp;
                            <span className={"numberWord"}>
                                {showHover.current.data[chartHoverData.datasetIndex].data[chartHoverData.index]}
                            </span>
                            &nbsp;
                            {chartHoverData.datasetIndex !== 2 &&
                            <FormattedMessage id={"index.access.times"}/>
                            }
                        </div>
                    </div>
                    }
                </div>
            </div>
        </div>
    )
}

function IndexItemTitleContainer(props) {
    return (
        <div className={"indexItemTitleContainer"}>
            <div className={"indexItemTitle"}><FormattedMessage id={props.id}/></div>
            <div className={"svgContainer"}>
                {/*<svg width="2.83rem" height="1.75rem" viewBox="0 0 34 21" fill="none"*/}
                {/*     xmlns="http://www.w3.org/2000/svg">*/}
                {/*    <path fillRule="evenodd" clipRule="evenodd"*/}
                {/*          d="M10 2.5H24C28.4183 2.5 32 6.08172 32 10.5C32 14.9183 28.4183 18.5 24 18.5H10C5.58172 18.5 2 14.9183 2 10.5C2 6.08172 5.58172 2.5 10 2.5ZM0 10.5C0 4.97715 4.47715 0.5 10 0.5H24C29.5228 0.5 34 4.97715 34 10.5C34 16.0228 29.5228 20.5 24 20.5H10C4.47715 20.5 0 16.0228 0 10.5ZM21.6891 6.76644C21.284 6.39109 20.6513 6.41524 20.276 6.82038C19.9006 7.22551 19.9248 7.85822 20.3299 8.23356L21.6969 9.5H10C9.44771 9.5 9 9.94772 9 10.5C9 11.0523 9.44771 11.5 10 11.5H21.6969L20.3299 12.7664C19.9248 13.1418 19.9006 13.7745 20.276 14.1796C20.6513 14.5848 21.284 14.6089 21.6891 14.2336L24.9272 11.2336C25.1315 11.0443 25.2476 10.7785 25.2476 10.5C25.2476 10.2215 25.1315 9.95569 24.9272 9.76644L21.6891 6.76644Z"*/}
                {/*          fill="#8FCDCC" fillOpacity="0.8"/>*/}
                {/*</svg>*/}
            </div>
            {props.floor &&
            <div className={"nowFloor"}>
                {props.floor}
            </div>
            }
        </div>
    )
}

export {Layout, Header, Article, Aside}
