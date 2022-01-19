import {Route, Switch} from "react-router-dom";
import "../../SCSS/accountSetting/accountSetting_group.css"
import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from "react";
import {groupReducer, PAGE_ACCOUNT_SETTING_GROUP_INITIAL_STATE} from "../../reducer/accountSetting/group/groupReducer";
import {checkFetchResult, placeholder, useFold, useLanguage, useModel, useToken} from "../../function/usePackage";
import {FormattedMessage} from "react-intl";
import {SaveModel, Sort} from "../common";
import {sortConditionData} from "../../data/sortConditionData";
import {SERVER} from "../../setting";
import ReactDOM from "react-dom";
import {
    handleMouse, hoverData,
    mergeClassName, mergeSelectData,
    rangeArrayClassName,
    rangeArrayValue,
    rangeClassName,
    setDataReturn, subHandleClick
} from "../../function/accountSetting/groups/groupsFunction";
import {ackSchemas} from "../../data/accountSetting/groups/schemas";
import {deepCopy} from "../../function/util";
import {fetchCreateGroup, fetchGroupsUpdate} from "../../function/accountSetting/groups/fetchData";
import {dealAccountGroupData} from "../../function/dealDataFunction";

function AccountSettingGroupIndex(){
    return (
        <Switch>
            <Route exact path={"/accountSetting/group"}>
                <AccountSettingGroup/>
            </Route>
        </Switch>
    )
}

function AccountSettingGroup(){
    const token = useToken()
    const [variables, dispatch] = useReducer(groupReducer, PAGE_ACCOUNT_SETTING_GROUP_INITIAL_STATE)
    const [rawData, setRawData] = useState([])
    const [cancelIsOpen, setCancelIsOpen] = useState(false)
    const [saveIsOpen, setSaveIsOpen] = useState(false)
    const controller = useRef(false)
    const data = useMemo(()=>{
        return dealAccountGroupData(rawData, variables)
    },[rawData, variables])

    const fetchAndSetData = useCallback(async (token)=>{
        const response = await fetch(SERVER.slice(0, -4)+"9322/api/account/get_template_list_table",{
            headers: new Headers({
                Authorization: "Bearer " + token
            })
        })
        const data = await response.json()
        const saveData = []
        for (let datum of Object.values(data)){
            let dataDict = {}
            dataDict.groupName = Object.keys(datum)[0]
            dataDict.groupData = Object.values(datum)[0]
            dataDict.updateTime = "2021-12-27 10:57:42"
            saveData.push(dataDict)
        }
        if(controller.current){
            setRawData(saveData)
        }
    },[])

    const handleUpdate = useCallback(async()=>{
        try{
            const jobs = data.map(async(item)=>{
                let response = await fetchGroupsUpdate(item, token)
                return await checkFetchResult(response)
            })
            const result = await Promise.all(jobs)
            console.log(result)
            setSaveIsOpen(true)
            dispatch({
                type: "IS_EDIT_TURN_OFF"
            })
        }catch (e) {
            console.log(e)
        }
    },[data, token])

    const downContainer = useMemo(()=>{
        if(data.length===0){
            let noDataText
            if(variables.search===""){
                noDataText = "accountSetting.group.noGroup"
            }else{
                noDataText = "accountSetting.group.noSearchData"
            }
            return(
                <div className={"noDataContainer"}>
                    <FormattedMessage id={noDataText}/>
                </div>
            )
        }else{
            return(
                <div className={"scrollContainer"}>
                    <GroupsSort dispatch={dispatch} variables={variables}/>
                    <GroupsData data={data} dispatch={dispatch} variables={variables}
                                fetchAndSetData={fetchAndSetData} rawData={rawData}
                    />
                </div>
            )
        }
    },[data, variables, fetchAndSetData, rawData])

    function handleCancel(){
        if(variables.isSaveActive){
            setCancelIsOpen(true)
        }else{
            dispatch({
                type: "IS_EDIT_TURN_OFF"
            })
            fetchAndSetData(token)
        }
    }

    useEffect(()=>{
        controller.current = true
        fetchAndSetData(token)
        return ()=>{
            controller.current = false
        }
    },[fetchAndSetData, token])

    return (
        <div className={"accountSettingGroup"}>
            {saveIsOpen &&
                <SaveModel setIsOpen={setSaveIsOpen} textId={"model.save.groups.text"}/>
            }
            {cancelIsOpen && <CancelModel dispatch={dispatch}
                                          setCancelIsOpen={setCancelIsOpen}
                                          fetchAndSetData={fetchAndSetData}/>}
            <AccountGroupTitle variables={variables} dispatch={dispatch}/>
            {downContainer}
            {variables.isEdit &&
                <div className={"groupsEdit"}>
                    <div className={"buttonContainer"}>
                        <button className={"secondary_button save"} disabled={!variables.isSaveActive}
                                onClick={()=>handleUpdate()}
                        >
                            <FormattedMessage id={"button.save"}/>
                        </button>
                        <button className={"secondary_button"} onClick={()=>handleCancel()}>
                            <FormattedMessage id={"button.cancel"}/>
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}

function CancelModel(props){
    const container = useModel()
    const token= useToken()

    function handleBack(){
        props.setCancelIsOpen(false)
    }

    function handleLeave(){
        props.dispatch({
            type: "IS_EDIT_TURN_OFF"
        })
        props.fetchAndSetData(token)
        props.setCancelIsOpen(false)
    }

    return(ReactDOM.createPortal(
        <div className={"model2"}>
            <div className={"alarmSettingModel"}>
                <div className={"title"}>
                    <FormattedMessage id={"model.cancel.title"}/>
                </div>
                <div className={"buttonContainer"}>
                    <button className={"modelButton"} onClick={()=>handleBack()}>
                        <FormattedMessage id={"button.back"}/>
                    </button>
                    <button className={"modelButton"} onClick={()=>handleLeave()}>
                        <FormattedMessage id={"button.leave"}/>
                    </button>
                </div>
            </div>
        </div>,
        container
        )
    )
}

function AccountGroupTitle(props) {
    const lang = useLanguage()

    function handleSearch(event) {
        props.dispatch({
            type: "CHANGE_KEYWORD",
            payload: {keyword: event.target.value}
        })
    }

    function turnOnEdit(){
        if(props.variables.isCreate){
            return null
        }
        props.dispatch({
            type: "IS_EDIT_TURN_ON"
        })
    }

    function turnOnCreate(){
        if(props.variables.isEdit){
            return null
        }
        props.dispatch({
            type: "IS_CREATE_TURN_ON"
        })
    }

    return (
        <div className={"accountGroupTitle"}>
            <div className={"leftContainer"}>
                <div className={"searchDiv"}>
                    <input type="text" className={"search"} placeholder={placeholder(lang)}
                           value={props.variables.search}
                           onChange={(event) => {
                               handleSearch(event)}}
                           disabled={props.variables.isEdit}
                    />
                </div>
                {!props.variables.isEdit && !props.variables.isCreate &&
                    <div className={"buttonContainer"} onClick={() => turnOnEdit()}>
                        <svg width="1.1875rem" height="1.5rem" viewBox="0 0 19 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M14.768 19.7031L12.0961 19.45L7.09098 14.3922L9.49691 11.9531L14.5283 16.9937L14.768 19.7031Z"
                                fill="#00EAFF"/>
                            <path d="M8.32023 10.7609L5.93441 13.1813L4.15161 11.4203L6.58382 8.95469L8.32023 10.7609Z"
                                  fill="#00EAFF"/>
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M19 7.2L11.875 0H2.375C1.65137 0 1.0035 0.332031 0.56901 0.852344C0.22111 1.27109 0.0123698 1.81172 0.0123698 2.4L0 21.6C0 22.1125 0.159261 22.5891 0.431396 22.9797C0.859701 23.5961 1.56478 24 2.36263 24H16.6559C17.9532 23.9836 19 22.9156 19 21.6V7.2ZM5.3453 7.68984L2.90535 10.1648C2.57756 10.4812 2.38737 10.9164 2.375 11.3758C2.36727 11.6961 2.44767 12.0094 2.60229 12.2828C2.66878 12.4008 2.74919 12.5117 2.84351 12.6125L10.8591 20.7422C11.1498 21.0336 11.5302 21.2156 11.9368 21.257L15.6509 21.6H15.7313C15.8472 21.6008 15.9648 21.5781 16.073 21.5328C16.1271 21.5102 16.1797 21.482 16.2292 21.4484C16.2771 21.4164 16.3219 21.3797 16.3637 21.3383C16.4565 21.2445 16.5276 21.1313 16.5724 21.0063C16.6157 20.8813 16.6327 20.7477 16.6219 20.6156L16.2384 16.8492C16.2122 16.5727 16.1225 16.3094 15.9802 16.0773C15.9106 15.9617 15.8271 15.8539 15.7313 15.7563L7.71566 7.62656C7.38167 7.34063 6.95492 7.18906 6.51888 7.20078C6.0813 7.2125 5.66382 7.38672 5.3453 7.68984Z"
                                  fill="#00EAFF"/>
                        </svg>
                    </div>
                }
            </div>
            <div className={"rightContainer"}>
                {!props.variables.isEdit && !props.variables.isCreate &&
                    <div className={"buttonContainer"} onClick={() => turnOnCreate()}>
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M13.2 6H10.8V10.8H6V13.2H10.8V18H13.2V13.2H18V10.8H13.2V6ZM12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM12 21.6C6.708 21.6 2.4 17.292 2.4 12C2.4 6.708 6.708 2.4 12 2.4C17.292 2.4 21.6 6.708 21.6 12C21.6 17.292 17.292 21.6 12 21.6Z"
                                fill="#00EAFF"/>
                        </svg>
                    </div>
                }
                <div className={"buttonContainer"}>
                    <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_5070_6503)">
                            <path
                                d="M10.43 7.31885L5.43 3.82885C5.37749 3.79615 5.31686 3.77881 5.255 3.77881C5.19314 3.77881 5.13251 3.79615 5.08 3.82885C5.02098 3.85595 4.97149 3.90021 4.938 3.95585C4.90475 4.01097 4.88808 4.07451 4.89 4.13885V5.76885H0.38C0.287679 5.76316 0.196709 5.79322 0.125958 5.8528C0.0552061 5.91238 0.0101021 5.99691 0 6.08885L0 9.08885C0.0122196 9.17908 0.0582666 9.26129 0.128819 9.31885C0.199371 9.3764 0.289157 9.405 0.38 9.39885H4.93V11.0689C4.9269 11.1286 4.94003 11.188 4.968 11.2409C4.9967 11.2935 5.03879 11.3377 5.09 11.3689C5.14002 11.4033 5.1993 11.4217 5.26 11.4217C5.32071 11.4217 5.37998 11.4033 5.43 11.3689L10.43 7.85885C10.4728 7.82863 10.5072 7.78803 10.53 7.74085C10.5523 7.69342 10.5626 7.64122 10.56 7.58885C10.5629 7.53511 10.5525 7.48148 10.5299 7.43266C10.5072 7.38384 10.4729 7.34133 10.43 7.30885V7.31885Z"
                                fill="#00EAFF"/>
                            <path
                                d="M8.14994 20.06C8.08816 20.059 8.02685 20.0709 7.96994 20.095C7.9131 20.119 7.86199 20.1548 7.81994 20.2C7.77547 20.2405 7.74002 20.29 7.7159 20.3451C7.69178 20.4002 7.67953 20.4598 7.67994 20.52V23.06C7.68039 23.1215 7.69299 23.1823 7.71702 23.2389C7.74104 23.2956 7.77602 23.3469 7.81994 23.39C7.9099 23.4729 8.02759 23.5193 8.14994 23.52H23.5299C23.6527 23.5202 23.7705 23.4721 23.8579 23.386C23.946 23.3 23.9969 23.183 23.9999 23.06V7.38998L16.9999 0.47998H8.14994C8.02759 0.480682 7.9099 0.527043 7.81994 0.60998C7.77602 0.653054 7.74104 0.704381 7.71702 0.761013C7.69299 0.817644 7.68039 0.878465 7.67994 0.93998V3.53998C7.68256 3.66289 7.73323 3.77988 7.82109 3.86587C7.90895 3.95187 8.027 4.00001 8.14994 3.99998H9.89994C10.0191 3.99805 10.1332 3.95168 10.2199 3.86998C10.2632 3.82853 10.2979 3.77891 10.3219 3.72398C10.346 3.66906 10.3589 3.60992 10.3599 3.54998V3.12998H16.0699V7.84998C16.0689 7.91172 16.0808 7.973 16.1049 8.02985C16.129 8.08669 16.1648 8.13784 16.2099 8.17998C16.2533 8.22329 16.305 8.25732 16.3619 8.27998C16.4186 8.30212 16.4791 8.31299 16.5399 8.31198H21.3199V20.87H10.3199V20.52C10.3189 20.46 10.306 20.4009 10.2819 20.346C10.2579 20.2911 10.2232 20.2414 10.1799 20.2C10.1394 20.1555 10.09 20.1201 10.0348 20.0959C9.9797 20.0718 9.92012 20.0596 9.85994 20.06H8.14994Z"
                                fill="#00EAFF"/>
                            <path
                                d="M11.4761 11.8877C9.73808 11.8877 8.61108 13.4237 8.61108 15.4797C8.61108 17.4327 9.63208 18.9667 11.3781 18.9667C13.0991 18.9667 14.2671 17.6057 14.2691 15.3557C14.2691 13.4647 13.2821 11.8877 11.4761 11.8877ZM11.4501 17.7337C10.5611 17.7337 10.0191 16.7887 10.0191 15.4457C10.0191 14.1027 10.5411 13.1167 11.4431 13.1167C12.3451 13.1167 12.8661 14.1777 12.8661 15.4047C12.8661 16.7377 12.3511 17.7337 11.4501 17.7337Z"
                                fill="#00EAFF"/>
                            <path
                                d="M18.786 12.0039V14.0039C18.786 15.0319 18.812 15.9569 18.899 16.8609H18.875C18.5994 16.0607 18.2778 15.2771 17.912 14.5139L16.689 12.0029H15.134V18.8559H16.357V16.7929C16.357 15.6729 16.34 14.7059 16.303 13.8019L16.331 13.7919C16.635 14.6179 16.9754 15.4239 17.352 16.2099L18.61 18.8549H20.01V12.0039H18.786Z"
                                fill="#00EAFF"/>
                            <path
                                d="M6.45807 14.7869C5.69607 14.4519 5.36507 14.2569 5.36507 13.8199C5.36507 13.4649 5.64507 13.1599 6.22107 13.1599C6.65236 13.1594 7.07632 13.2714 7.45107 13.4849L7.75107 12.2349C7.28728 11.9975 6.77202 11.8783 6.25107 11.8879C5.96566 11.8618 5.67795 11.896 5.40664 11.9884C5.13534 12.0807 4.88651 12.2292 4.67636 12.4241C4.46621 12.6189 4.29943 12.8559 4.18687 13.1195C4.07432 13.383 4.0185 13.6673 4.02307 13.9539C4.03912 14.4204 4.20495 14.8693 4.49599 15.2342C4.78704 15.5991 5.18784 15.8605 5.63907 15.9799C6.34507 16.2749 6.62207 16.5189 6.62207 16.9469C6.62207 17.3919 6.30207 17.6889 5.69107 17.6889C5.17026 17.6759 4.66172 17.5281 4.21507 17.2599L3.94507 18.5419C4.45532 18.8218 5.02912 18.9654 5.61107 18.9589C6.14145 19.0183 6.67485 18.877 7.10627 18.5628C7.53768 18.2487 7.83586 17.7844 7.94209 17.2614C8.04833 16.7383 7.95492 16.1945 7.68026 15.7369C7.4056 15.2793 6.96959 14.9411 6.45807 14.7889V14.7869Z"
                                fill="#00EAFF"/>
                            <path
                                d="M1.739 16.3159C1.739 17.3819 1.389 17.6769 0.832 17.6769C0.599111 17.6784 0.367935 17.637 0.15 17.5549L0 18.8049C0.312824 18.9122 0.641275 18.967 0.972 18.9669C2.261 18.9669 3.065 18.2859 3.065 16.3339V12.0039H1.739V16.3159Z"
                                fill="#00EAFF"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_5070_6503">
                                <rect width="24" height="23.04" fill="white" transform="translate(0 0.47998)"/>
                            </clipPath>
                        </defs>
                    </svg>
                </div>
                <div className={"buttonContainer"}>
                    <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_5070_6528)">
                            <path
                                d="M23.869 7.31978L18.869 3.82978C18.8145 3.79727 18.7524 3.77985 18.689 3.77931C18.6256 3.77877 18.5632 3.79512 18.5082 3.82669C18.4532 3.85826 18.4076 3.9039 18.3761 3.95892C18.3446 4.01395 18.3284 4.07637 18.329 4.13978V5.76978H13.829C13.7365 5.76358 13.6453 5.79346 13.5744 5.85314C13.5036 5.91281 13.4586 5.99764 13.449 6.08978V9.08978C13.4616 9.17981 13.5078 9.26174 13.5783 9.31921C13.6487 9.37668 13.7382 9.40545 13.829 9.39978H18.379V11.0688C18.3757 11.1289 18.3892 11.1888 18.418 11.2418C18.446 11.2946 18.4878 11.3388 18.539 11.3698C18.589 11.4042 18.6483 11.4226 18.709 11.4226C18.7697 11.4226 18.829 11.4042 18.879 11.3698L23.879 7.85978C23.9184 7.829 23.95 7.78923 23.971 7.74378C23.9924 7.69892 24.0024 7.64944 24 7.59978C24.0031 7.54577 23.9928 7.49182 23.97 7.44278C23.9468 7.3942 23.9121 7.35198 23.869 7.31978Z"
                                fill="#00EAFF"/>
                            <path
                                d="M15.85 20.06H14.1C14.0398 20.0601 13.9803 20.0726 13.9252 20.0969C13.8701 20.1212 13.8207 20.1566 13.78 20.201C13.7371 20.242 13.7031 20.2913 13.68 20.346C13.656 20.4013 13.6431 20.4607 13.642 20.521V20.871H2.642V8.30998H7.46C7.52081 8.31173 7.58136 8.30119 7.638 8.27898C7.69477 8.25601 7.74643 8.22202 7.79 8.17898C7.83344 8.13651 7.86751 8.08542 7.89 8.02898C7.91438 7.97213 7.92664 7.91083 7.926 7.84898V3.12998H13.636V3.54998C13.6371 3.61024 13.65 3.66971 13.674 3.72498C13.6971 3.77964 13.7311 3.82899 13.774 3.86998C13.8623 3.95308 13.9788 3.99955 14.1 3.99998H15.85C15.9714 4.00059 16.0883 3.95399 16.176 3.87003C16.2637 3.78606 16.3153 3.6713 16.32 3.54998V0.93998C16.3184 0.815873 16.2682 0.697352 16.18 0.60998C16.0899 0.527208 15.9723 0.480874 15.85 0.47998H7L0 7.38998V23.06C0.00261189 23.183 0.0532489 23.3001 0.141082 23.3862C0.228914 23.4724 0.34697 23.5207 0.47 23.521H15.85C15.9724 23.5197 16.09 23.473 16.18 23.39C16.2685 23.3029 16.3189 23.1842 16.32 23.06V20.521C16.3202 20.4608 16.308 20.4012 16.284 20.346C16.2299 20.2362 16.1404 20.1478 16.03 20.095C15.9731 20.0709 15.9118 20.059 15.85 20.06Z"
                                fill="#00EAFF"/>
                            <path
                                d="M15.4651 11.8882C13.7271 11.8882 12.6001 13.4242 12.6001 15.4812C12.6001 17.4342 13.6211 18.9682 15.3671 18.9682C17.0881 18.9682 18.2561 17.6062 18.2581 15.3572C18.2581 13.4652 17.2711 11.8882 15.4651 11.8882ZM15.4391 17.7352C14.5501 17.7352 14.0081 16.7902 14.0081 15.4462C14.0081 14.1022 14.5301 13.1182 15.4321 13.1182C16.3341 13.1182 16.8551 14.1792 16.8551 15.4062C16.8551 16.7392 16.3401 17.7352 15.4391 17.7352Z"
                                fill="#00EAFF"/>
                            <path
                                d="M22.775 12V14C22.775 15.028 22.801 15.952 22.888 16.857H22.864C22.5888 16.0567 22.2672 15.273 21.901 14.51L20.678 12H19.123V18.854H20.346V16.793C20.346 15.674 20.329 14.707 20.292 13.802L20.32 13.792C20.624 14.6187 20.9644 15.4247 21.341 16.21L22.6 18.856H24V12H22.775Z"
                                fill="#00EAFF"/>
                            <path
                                d="M10.4469 14.788C9.68493 14.453 9.35393 14.258 9.35393 13.821C9.35393 13.465 9.63493 13.16 10.2099 13.16C10.6412 13.1595 11.0652 13.2715 11.4399 13.485L11.7399 12.236C11.2762 11.9982 10.761 11.8786 10.2399 11.888C9.95431 11.8617 9.66636 11.8959 9.39481 11.9882C9.12327 12.0806 8.87421 12.2291 8.66385 12.4241C8.45349 12.619 8.28655 12.8561 8.17388 13.1199C8.06122 13.3837 8.00536 13.6682 8.00993 13.955C8.02669 14.4213 8.19305 14.8699 8.48443 15.2344C8.77581 15.5989 9.17673 15.86 9.62793 15.979C10.3339 16.273 10.6109 16.517 10.6109 16.946C10.6109 17.391 10.2909 17.688 9.67993 17.688C9.15784 17.6751 8.64796 17.5274 8.19993 17.259L7.92993 18.541C8.44052 18.8199 9.01415 18.9632 9.59593 18.957C10.1269 19.018 10.6614 18.8776 11.0939 18.5635C11.5263 18.2495 11.8253 17.7847 11.9317 17.261C12.0381 16.7373 11.9442 16.1927 11.6686 15.7348C11.3929 15.2769 10.9556 14.9391 10.4429 14.788H10.4469Z"
                                fill="#00EAFF"/>
                            <path
                                d="M5.72801 16.316C5.72801 17.383 5.37801 17.677 4.82101 17.677C4.58807 17.6791 4.35678 17.6377 4.13901 17.555L3.98901 18.805C4.30166 18.9131 4.63019 18.9682 4.96101 18.968C6.25001 18.968 7.05401 18.287 7.05401 16.334V12H5.72801V16.316Z"
                                fill="#00EAFF"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_5070_6528">
                                <rect width="24" height="23.04" fill="white" transform="translate(0 0.47998)"/>
                            </clipPath>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    )
}

function GroupsSort(props) {
    return(
        <div className={"sortContainer"}>
            <Sort data={sortConditionData["groupName"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
            <Sort data={sortConditionData["updateTime"]} sortCondition={props.variables.sortCondition} dispatch={props.dispatch}/>
        </div>
    )
}

function GroupsData(props) {
    const [check, setCheck] = useState("")

    const handleDelete = useCallback((groupName)=>{
        setCheck(groupName)
    },[])

    const model = check &&
        <DeleteGroupData setCheck={setCheck} check={check}
                         fetchAndSetData={props.fetchAndSetData}/>

    return (
        <div className={"groupsData"}>
            {props.variables.isCreate && <GroupCreate variables={props.variables} dispatch={props.dispatch}
                                                      rawData={props.rawData} fetchAndSetData={props.fetchAndSetData}
            />}
            {props.data.map((item, index)=>(
                <GroupElementContainer data={item} variables={props.variables}
                                       dispatch={props.dispatch} key={index}
                                       index={index} handleDelete={handleDelete}
                />
            ))}
            <div className={"buttonBlock"}/>
            {model}
        </div>
    )
}

function GroupCreate(props) {
    const {fetchAndSetData, dispatch} = props
    const token = useToken()
    const [isOpen, setIsOpen] = useState(false)
    const [saveIsOpen, setSaveIsOpen] = useState(false)
    const {isFold, foldClassName, changeFold} = useFold()
    const [createData, setCreateData] = useState({})
    const [mergeSelect, setMergeSelect] = useState({})
    const defaultDataRef = useRef({})
    const controller = useRef(false)
    const inputRef = useRef()

    const fetchDefaultData = useCallback(async (token)=> {
            const response = await fetch(SERVER.slice(0, -4) + "9322/api/account/default_template", {
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
            const data = await response.json()
            if (controller.current) {
                defaultDataRef.current = deepCopy(data)
                setCreateData(data)
            }
        },[]
    )

    const handleSubmit = useCallback(async(event)=>{
        event.preventDefault()
        try{
            const response = await fetchCreateGroup(token, createData, inputRef.current.value)
            const response2 = await checkFetchResult(response)
            console.log(response2)
            setSaveIsOpen(true)
            fetchAndSetData(token)
        }catch (e) {
            console.log(e)
        }
    },[token, createData, setSaveIsOpen, fetchAndSetData])

    function handleCancel() {
        dispatch({
            type: "IS_CREATE_TURN_OFF"
        })
    }

    function openMerge(){
        setIsOpen(true)
    }

    useEffect(()=>{
        controller.current = true
        fetchDefaultData(token)
    },[fetchDefaultData, token])

    useEffect(()=>{
        fetchAndSetData(token)
    },[fetchAndSetData, token])

    useEffect(()=>{
        inputRef.current.focus()
    },[])

    return (
        <div className={"groupCreate"}>
            {isOpen &&
                <MergeGroups setIsOpen={setIsOpen} rawData={props.rawData}
                             mergeSelect={mergeSelect} setCreateData={setCreateData}
                             setMergeSelect={setMergeSelect} defaultDataRef={defaultDataRef}
                />}
            {saveIsOpen &&
                <SaveModel setIsOpen={setSaveIsOpen} textId={"model.save.group.text"} dispatch={dispatch}
                           commond={"IS_CREATE_TURN_OFF"}/>
            }
            <form onSubmit={event=>handleSubmit(event)}>
                <div className={"firstLine"}>
                    <div className={"leftContainer"}>
                        <input type="text" ref={inputRef} required={true}/>
                        <div className={"buttonContainer"} onClick={()=>openMerge()}>
                            <svg width="2.125rem" height="1.25rem" viewBox="0 0 34 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M34 10.0024L24.3165 4.00066V8.00221H22.5095C21.497 7.99078 20.8024 7.7279 19.9207 7.15298C18.6135 6.30147 17.2371 4.6613 15.3711 3.07485C13.5257 1.49755 10.8664 -0.0226049 7.28956 0.000254601H0V4.00066H7.28956C10.1475 4.01209 11.6982 5.35394 13.7871 7.353C14.6804 8.21366 15.6172 9.1589 16.7655 10.0081C14.9764 11.3397 13.6743 12.8838 12.3005 14.0085C10.7844 15.2452 9.47848 15.979 7.287 15.9996H0.00128148V20H7.32801C12.1339 20 15.061 17.3483 17.091 15.3527C18.138 14.3297 19.0608 13.421 19.9233 12.8496C20.8011 12.2746 21.4996 12.0118 22.5069 12.0003H24.3165V15.9996L34 10.0001V10.0024Z"
                                    fill="#00EAFF"/>
                            </svg>
                        </div>
                        <div className={"foldButtonContainer"} onClick={() => changeFold()}>
                            <div className={foldClassName}/>
                        </div>
                    </div>
                    <div className={"rightContainer"}>
                        <button className={"secondary_button save"}>
                            <FormattedMessage id={"button.save"}/>
                        </button>
                        <button className={"secondary_button hasMargin"} onClick={()=>handleCancel()}>
                            <FormattedMessage id={"button.cancel"}/>
                        </button>
                    </div>
                </div>
            </form>
            <div className={"groupFieldContainer"}>
                {!isFold && <HandleCreateGroupData data={createData}
                                                   layer={0}/>}
            </div>
        </div>
    )
}

function MergeGroups(props){
    const container = useModel()
    const {setMergeSelect, setCreateData, setIsOpen,
        mergeSelect, rawData, defaultDataRef
    } = props
    const mergeData = useMemo(()=>{
        const result = deepCopy(defaultDataRef.current)
        return mergeSelectData(result, mergeSelect)
    },[defaultDataRef, mergeSelect])

    const handleSelect = useCallback((item)=>{
        if(mergeSelect[item.groupName]){
            setMergeSelect(pre=>{
                let result = {...pre}
                delete result[item.groupName]
                return result
            })
        }else{
            setMergeSelect(pre=>(
                {...pre, [item.groupName]: item.groupData}
            ))
        }
    },[mergeSelect, setMergeSelect])

    const handleClose = useCallback(()=>{
        setIsOpen(false)
    },[setIsOpen])

    const handleMerge = useCallback(()=>{
        setCreateData(mergeData)
        setIsOpen(false)
    },[setCreateData, setIsOpen, mergeData])

    return(ReactDOM.createPortal(
        <div className={"model2"}>
            <div className={"setting"}>
                <div className={"bar bar2"}>
                    <div className={"title"}>
                        <FormattedMessage id={"accountSetting.group.bar.title"}/>
                    </div>
                    <div className={"information"}>
                        <FormattedMessage id={"accountSetting.group.bar.information"}/>
                    </div>
                    <div className={"groupsContainer"}>
                        {rawData.map((item, index)=>(
                            <MergeGroupSelect item={item} index={index}
                                              mergeSelect={mergeSelect} setMergeSelect={setMergeSelect}
                                              handleSelect={handleSelect} key={index}
                            />
                        ))}
                    </div>
                </div>
                <div className={"articleContainer"}>
                    <div className={"mergeResult"}>
                        <div className={"title"}>
                            <FormattedMessage id={"accountSetting.group.article.title"}/>
                        </div>
                        <div className={"subjectContainer"}>
                            <div className={"block"}/>
                            <div className={"subject s1"}>
                                <FormattedMessage id={"off"}/>
                            </div>
                            <div className={"subject s2"}>
                                <FormattedMessage id={"on"}/>
                            </div>
                            <div className={"subject s3"}>
                                <FormattedMessage id={"accountSetting.group.article.subject"}/>
                            </div>
                        </div>
                        <MergeData mergeSelect={mergeSelect}
                                   mergeData={mergeData}/>
                    </div>
                    <div className={"groupsEdit"}>
                        <div className={"buttonContainer"}>
                            <button className={"secondary_button merge"}
                                    disabled={Object.keys(mergeSelect).length===0}
                                    onClick={()=>handleMerge()}>
                                <FormattedMessage id={"button.merge"}/>
                            </button>
                            <button className={"secondary_button"} onClick={()=>handleClose()}>
                                <FormattedMessage id={"button.cancel"}/>
                            </button>
                        </div>
                    </div>
                </div>
                <div className={"close"} onClick={()=>handleClose()}>
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

function HandleCreateGroupData(props){
    let type
    if(Array.isArray(props.data)){
        type = "array"
    }else{
        type = typeof(props.data)
    }

    return(
        <>
            {type==="object" && <HandleCreateObject data={props.data} layer={props.layer}/>}
            {type==="array" && <HandleCreateAlarmAck data={props.data} layer={props.layer}/>}
        </>
    )
}

function HandleCreateObject(props){
    const [data, setData] = useState(props.data)
    const subData = []
    for (let field in data){
        let isNumber = false
        if(typeof(data[field])==="number"){
            isNumber = true
        }
        subData.push({
            "field": field,
            "isNumber": isNumber
        })
    }

    function handleClick(field){
        setData(pre=>{
            return setDataReturn(pre, field, props.data)
        })
    }

    useEffect(()=>{
        setData(props.data)
    },[props.data])

    return(
        <>
            {subData.map((item, index)=>
                item.isNumber? (
                    <div className={"groupField"} key={index}>
                        <div className={"block"}/>
                        <div className={"fieldName"} style={{"marginLeft": props.layer*2+"rem"}}>
                            {item.field}
                        </div>
                        <div className={"rangeContainer"} onClick={()=>handleClick(item.field)}>
                            <input type="range" value={data[item.field]} min={0}
                                   max={1} className={rangeClassName(data[item.field])}
                                   readOnly={true}
                            />
                        </div>
                    </div>
                ):(
                    <CreateGroupField field={item.field} data={props.data[item.field]}
                            key={index} layer={props.layer}
                    />
                )
            )}
        </>
    )
}

function HandleCreateAlarmAck(props){
    const [data, setData] = useState(props.data)

    useEffect(()=>{
        setData(props.data)
    },[props.data])

    return (
        <>
            {ackSchemas.map((field, index)=>(
                <div className={"groupField"} key={index}>
                    <div className={"block"}/>
                    <div className={"fieldName"} style={{"marginLeft": props.layer*2+"rem"}}>
                        {field}
                    </div>
                    <div className={"rangeContainer"}
                         onClick={()=>subHandleClick(field, setData, props.data, data)}>
                        <input type="range" value={rangeArrayValue(field, data)} min={0}
                               max={1} className={rangeArrayClassName(field, data)}
                               readOnly={true}
                        />
                    </div>
                </div>
            ))}
        </>
    )
}

function CreateGroupField(props){
    const {isFold, foldClassName, changeFold} = useFold()
    return(
        <>
            <div className={"groupField"}>
                <div className={"block"}/>
                <div className={"fieldName"} style={{"marginLeft": props.layer*2+"rem"}}>
                    {props.field}
                </div>
                <div className={"foldButtonContainer"} onClick={()=>changeFold()}>
                    <div className={foldClassName}/>
                </div>
            </div>
            {!isFold && <HandleCreateGroupData data={props.data} layer={props.layer+1}/>}
        </>
    )
}

function MergeGroupSelect(props){
    let isCheck = !!props.mergeSelect[props.item.groupName]
    return(
        <div className={"mergeGroupSelect"} onClick={()=>props.handleSelect(props.item)}>
            <div className={isCheck?"background2": "background"}/>
            <input type="checkbox" checked={isCheck}
                   readOnly={true}
            />
            <div className={"groupName"}>
                {props.item.groupName}
            </div>
        </div>
    )
}

function MergeData(props){
    return(
        <div className={"mergeData"}>
            <HandleMergeData mergeSelect={props.mergeSelect} layer={[]}
                             mergeData={props.mergeData}/>
            <div className={"block"}/>
        </div>
    )
}

function HandleMergeData(props){
    let target = props.mergeData
    for(let i of props.layer){
        target = target[i]
    }
    let type
    if(Array.isArray(target)){
        type = "array"
    }else{
        type = typeof(target)
    }
    return(
        <>
            {type==="object" && <HandleMergeObject mergeSelect={props.mergeSelect} layer={props.layer}
                             mergeData={props.mergeData}/>}
            {type==="array" && <HandleMergeAlarmAck mergeSelect={props.mergeSelect} layer={props.layer}
                             mergeData={props.mergeData}/>}
        </>
    )
}

function HandleMergeObject(props) {
    const [isHover, setIsHover] = useState({
        "on": {},
        "off": {}
    })

    const {subData, targetDict, hoverList} = useMemo(()=> {
        let targetDict = deepCopy(props.mergeData)
        for (let j of props.layer) {
            targetDict = targetDict[j]
        }
        let selectDict = {}
        for (let i in props.mergeSelect) {
            let subTargetDict = props.mergeSelect[i]
            for (let j of props.layer) {
                if (subTargetDict.hasOwnProperty(j)) {
                    subTargetDict = subTargetDict[j]
                    selectDict[i] = subTargetDict
                } else {
                    selectDict[i] = {}
                    break
                }
            }
        }
        const subData = []
        const hoverList = {"on": {}, "off": {}}
        for (let field in targetDict) {
            let isNumber = false
            hoverList.on[field] = []
            hoverList.off[field] = []
            if (typeof (targetDict[field]) === "number") {
                isNumber = true
                for(let key in selectDict){
                    if (selectDict[key][field]>0){
                        hoverList.on[field].push(key)
                        // targetDict[field] = 1.0
                    }else{
                        hoverList.off[field].push(key)
                    }
                }
            }
            subData.push({
                "field": field,
                "isNumber": isNumber
            })
        }
        return {subData, targetDict, hoverList}
    },[props])

    useEffect(()=>{
        let result = {}
        for (let datum of subData){
            if(datum.isNumber){
                result[datum.field] = false
            }
        }
        setIsHover({
            "on": deepCopy(result),
            "off": deepCopy(result)
        })
    },[subData])

    return(
        <>
            {subData.map((item, index)=>
                item.isNumber? (
                    <div className={"groupField"} key={index}>
                        <div className={"block2"}/>
                        <div className={"hoverContainer off"}>
                            <div className={mergeClassName("off", hoverList, item.field)}
                                 onMouseEnter={()=>handleMouse(true, "off", item.field, setIsHover)}
                                 onMouseLeave={()=>handleMouse(false, "off", item.field, setIsHover)}/>
                            {hoverData("off", item.field, isHover, hoverList)}
                        </div>
                        <div className={"hoverContainer on"}>
                            <div className={mergeClassName("on", hoverList, item.field)}
                                 onMouseEnter={()=>handleMouse(true, "on", item.field, setIsHover)}
                                 onMouseLeave={()=>handleMouse(false, "on", item.field, setIsHover)}/>
                            {hoverData("on", item.field, isHover, hoverList)}
                        </div>
                        <div className={"fieldName"} style={{"marginLeft": props.layer.length*2+"rem"}}>
                            {item.field}
                        </div>
                        <div className={"rangeContainer"}>
                            <input type="range" value={targetDict[item.field]} min={0}
                                   max={1} className={rangeClassName(targetDict[item.field])}
                                   readOnly={true} disabled={true}
                            />
                        </div>
                    </div>
                ):(
                    <MergeGroupField mergeData={props.mergeData}
                                     mergeSelect={props.mergeSelect}
                                     key={index} layer={[...props.layer, item.field]}
                    />
                )
            )}
        </>
    )
}


function MergeGroupField(props){
    const {isFold, foldClassName, changeFold} = useFold(false)

    return(
        <>
            <div className={"groupField"}>
                <div className={"block"}/>
                <div className={"fieldName"} style={{"marginLeft": (props.layer.length-1)*2+"rem"}}>
                    {props.layer[props.layer.length-1]}
                </div>
                <div className={"foldButtonContainer"} onClick={()=>changeFold()}>
                    <div className={foldClassName}/>
                </div>
            </div>
            {!isFold && <HandleMergeData mergeData={props.mergeData} layer={props.layer}
                                         mergeSelect={props.mergeSelect}
            />}
        </>
    )
}

function HandleMergeAlarmAck(props) {
    const [isHover, setIsHover] = useState({
        "on": {},
        "off": {}
    })

    const {targetList, hoverList} = useMemo(()=> {
        let targetList = deepCopy(props.mergeData)
        for (let j of props.layer) {
            targetList = targetList[j]
        }
        let selectDict = {}
        for (let i in props.mergeSelect) {
            let subTargetList = props.mergeSelect[i]
            for (let j of props.layer) {
                if (subTargetList.hasOwnProperty(j)) {
                    subTargetList = subTargetList[j]
                    selectDict[i] = subTargetList
                } else {
                    selectDict[i] = []
                    break
                }
            }
        }
        const hoverList = {"on": {}, "off": {}}
        for (let field of ackSchemas) {
            hoverList.on[field] = []
            hoverList.off[field] = []
            for (let key of Object.keys(selectDict)) {
                if (selectDict[key].includes(field)) {
                    hoverList.on[field].push(key)
                    // if(!targetList.includes(field)){
                    //     targetList.push(field)
                    // }
                } else {
                    hoverList.off[field].push(key)
                }
            }
        }
        return {targetList, hoverList}
    },[props])

    useEffect(()=>{
        let result = {}
        for (let datum of ackSchemas){
            result[datum] = false
        }
        setIsHover({
            "on": deepCopy(result),
            "off": deepCopy(result)
        })
    },[])

    return (
        <>
            {ackSchemas.map((field, index)=>(
                <div className={"groupField"} key={index}>
                    <div className={"block2"}/>
                    <div className={"hoverContainer off"}>
                        <div className={mergeClassName("off", hoverList, field)}
                             onMouseEnter={()=>handleMouse(true, "off", field, setIsHover)}
                             onMouseLeave={()=>handleMouse(false, "off", field, setIsHover)}/>
                        {hoverData("off", field, isHover, hoverList)}
                    </div>
                    <div className={"hoverContainer on"}>
                        <div className={mergeClassName("on", hoverList, field)}
                             onMouseEnter={()=>handleMouse(true, "on", field, setIsHover)}
                             onMouseLeave={()=>handleMouse(false, "on", field, setIsHover)}/>
                        {hoverData("on", field, isHover, hoverList)}
                    </div>
                    <div className={"fieldName"} style={{"marginLeft": props.layer.length*2+"rem"}}>
                        {field}
                    </div>
                    <div className={"rangeContainer"}>
                        <input type="range" value={rangeArrayValue(field, targetList)} min={0}
                               max={1} className={rangeArrayClassName(field, targetList)}
                               readOnly={true} disabled={true}
                        />
                    </div>
                </div>
            ))}
        </>
    )
}

function GroupElementContainer(props) {
    const {isFold, foldClassName, changeFold} = useFold()

    return (
        <div className={"groupElementContainer"}>
            <div className={"groupElement"}>
                {props.variables.isEdit &&
                    <div className={"deleteButtonContainer"}
                         onClick={()=>props.handleDelete(props.data.groupName)}>
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 0C5.3715 0 0 5.373 0 12C0 18.627 5.3715 24 12 24C18.6285 24 24 18.627 24 12C24 5.373 18.6285 0 12 0ZM17.5605 15.4395C17.8418 15.7208 17.9998 16.1022 17.9998 16.5C17.9998 16.8978 17.8418 17.2792 17.5605 17.5605C17.2792 17.8418 16.8978 17.9998 16.5 17.9998C16.1022 17.9998 15.7208 17.8418 15.4395 17.5605L12 14.121L8.5605 17.5605C8.42152 17.7003 8.25628 17.8112 8.07428 17.8869C7.89228 17.9626 7.69711 18.0016 7.5 18.0016C7.30289 18.0016 7.10772 17.9626 6.92572 17.8869C6.74372 17.8112 6.57848 17.7003 6.4395 17.5605C6.30008 17.4213 6.18948 17.256 6.11401 17.074C6.03854 16.8921 5.9997 16.697 5.9997 16.5C5.9997 16.303 6.03854 16.1079 6.11401 15.926C6.18948 15.744 6.30008 15.5787 6.4395 15.4395L9.879 12L6.4395 8.5605C6.15824 8.27924 6.00023 7.89776 6.00023 7.5C6.00023 7.10224 6.15824 6.72076 6.4395 6.4395C6.72076 6.15824 7.10224 6.00023 7.5 6.00023C7.89776 6.00023 8.27924 6.15824 8.5605 6.4395L12 9.879L15.4395 6.4395C15.7208 6.15824 16.1022 6.00023 16.5 6.00023C16.8978 6.00023 17.2792 6.15824 17.5605 6.4395C17.8418 6.72076 17.9998 7.10224 17.9998 7.5C17.9998 7.89776 17.8418 8.27924 17.5605 8.5605L14.121 12L17.5605 15.4395Z"
                                fill="#EC0000"/>
                        </svg>
                    </div>
                }
                <div className={"groupName"}>{props.data.groupName}</div>
                <div className={"foldButtonContainer"} onClick={() => changeFold()}>
                    <div className={foldClassName}/>
                </div>
                <div className={"updateTime"}>{props.data.updateTime}</div>
            </div>
            <div className={"groupFieldContainer"}>
                {!isFold && <HandleGroupData data={props.data.groupData} layer={0}
                                             variables={props.variables}
                                             dispatch={props.dispatch}/>}
            </div>
        </div>
    )
}

function HandleGroupData(props){
    let type
    if(Array.isArray(props.data)){
        type = "array"
    }else{
        type = typeof(props.data)
    }

    return(
        <>
            {type==="object" && <HandleObject data={props.data} layer={props.layer}
                                              variables={props.variables} dispatch={props.dispatch}/>}
            {type==="array" && <HandleAlarmAck data={props.data} layer={props.layer}
                                               variables={props.variables} dispatch={props.dispatch}/>}
        </>
    )
}

function HandleObject(props){
    const [data, setData] = useState(props.data)
    const subData = []
    for (let field in data){
        let isNumber = false
        if(typeof(data[field])==="number"){
            isNumber = true
        }
        subData.push({
            "field": field,
            "isNumber": isNumber
        })
    }

    useEffect(()=>{
        setData(props.data)
    },[props.data])

    function handleClick(field){
        if(!props.variables.isEdit){
            return
        }
        setData(pre=>{
            return setDataReturn(pre, field, props.data)
        })
        props.dispatch({
            type: "SAVE_ACTIVE"
        })
    }

    return(
        <>
            {subData.map((item, index)=>
                item.isNumber? (
                    <div className={"groupField"} key={index}>
                        <div className={"block"}/>
                        <div className={"fieldName"} style={{"marginLeft": props.layer*2+"rem"}}>
                            {item.field}
                        </div>
                        <div className={"rangeContainer"} onClick={()=>handleClick(item.field)}>
                            <input type="range" value={data[item.field]} min={0}
                                   max={1} className={rangeClassName(data[item.field])}
                                   readOnly={true} disabled={!props.variables.isEdit}
                            />
                        </div>
                    </div>
                ):(
                    <GroupField field={item.field} data={props.data[item.field]}
                            key={index} layer={props.layer} variables={props.variables}
                                dispatch={props.dispatch}
                    />
                )
            )}
        </>
    )
}

function GroupField(props){
    const {isFold, foldClassName, changeFold} = useFold()
    return(
        <>
            <div className={"groupField"}>
                <div className={"block"}/>
                <div className={"fieldName"} style={{"marginLeft": props.layer*2+"rem"}}>
                    {props.field}
                </div>
                <div className={"foldButtonContainer"} onClick={()=>changeFold()}>
                    <div className={foldClassName}/>
                </div>
            </div>
            {!isFold && <HandleGroupData data={props.data} layer={props.layer+1}
                                         variables={props.variables} dispatch={props.dispatch}/>}
        </>
    )
}

function HandleAlarmAck(props){
    const [data, setData] = useState(props.data)

    function handleClick(field, setData, preData, data){
        if(!props.variables.isEdit){
            return
        }
        subHandleClick(field, setData, preData, data)
        props.dispatch({
            type: "SAVE_ACTIVE"
        })
    }

    useEffect(()=>{
        setData(props.data)
    },[props.data])

    return (
        <>
            {ackSchemas.map((field, index)=>(
                <div className={"groupField"} key={index}>
                    <div className={"block"}/>
                    <div className={"fieldName"} style={{"marginLeft": props.layer*2+"rem"}}>
                        {field}
                    </div>
                    <div className={"rangeContainer"}
                         onClick={()=>handleClick(field, setData, props.data, data)}>
                        <input type="range" value={rangeArrayValue(field, data)} min={0}
                               max={1} className={rangeArrayClassName(field, data)}
                               readOnly={true} disabled={!props.variables.isEdit}
                        />
                    </div>
                </div>
            ))}
        </>
    )
}

function DeleteGroupData(props){
    const {check, setCheck, fetchAndSetData} = props
    const [status, setStatus] = useState("1")
    const container = useModel()
    const token = useToken()

    const handleClose = useCallback(()=>{
        setCheck("")
    },[setCheck])

    const handleDelete = useCallback(async (token)=>{
        try{
            const response = await fetch(SERVER.slice(0, -4) + "9322/api/account/delete_template", {
                method: "POST",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify({
                    "DeleteTemplateName": check
                })

            })
            const response2 = await checkFetchResult(response)
            console.log(response2)
            fetchAndSetData(token)
            setStatus("2")
        }catch (e){
            alert(e)
            console.log(e)
        }
    },[check, fetchAndSetData])

    const context = useMemo(()=>{
        switch(status){
            case "1":
                return(
                    <div className={"alarmSettingModel"}>
                        <div className={"title"}>
                            <FormattedMessage id={"model.delete.title.accountSetting.group1"}/>
                            <FormattedMessage id={"model.delete.title.accountSetting.group2"}/>
                        </div>
                        <div className={"buttonContainer"}>
                            <button className={"modelButton"} onClick={()=>handleClose()}>
                                <FormattedMessage id={"no"}/>
                            </button>
                            <button className={"modelButton"} onClick={()=>handleDelete(token)}>
                                <FormattedMessage id={"yes"}/>
                            </button>
                        </div>
                    </div>
                )
            case "2":
                return(
                    <div className={"alarmSettingModel"}>
                        <div className={"title2"}>
                            <div className={"image"}>
                                <svg width="5.625rem" height="5.625rem" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M67.083 18.5007H89.1664V27.334H80.333V84.7507C80.333 85.922 79.8677 87.0454 79.0394 87.8737C78.2111 88.702 77.0877 89.1673 75.9163 89.1673H14.083C12.9116 89.1673 11.7882 88.702 10.96 87.8737C10.1317 87.0454 9.66634 85.922 9.66634 84.7507V27.334H0.833008V18.5007H22.9163V5.25065C22.9163 4.07928 23.3817 2.95588 24.21 2.1276C25.0382 1.29931 26.1616 0.833984 27.333 0.833984H62.6663C63.8377 0.833984 64.9611 1.29931 65.7894 2.1276C66.6177 2.95588 67.083 4.07928 67.083 5.25065V18.5007ZM71.4997 27.334H18.4997V80.334H71.4997V27.334ZM51.2448 53.834L59.0535 61.6427L52.8083 67.8878L44.9997 60.0792L37.191 67.8878L30.9458 61.6427L38.7545 53.834L30.9458 46.0253L37.191 39.7802L44.9997 47.5888L52.8083 39.7802L59.0535 46.0253L51.2448 53.834ZM31.7497 9.66732V18.5007H58.2497V9.66732H31.7497Z" fill="white"/>
                                </svg>
                            </div>
                            <div className={"text"}>
                                <FormattedMessage id={"model.delete.successful"}/>
                            </div>
                        </div>
                        <div className={"buttonContainer2"}>
                            <div className={"text"}>
                                <FormattedMessage id={"model.delete.text.accountSetting.group1"}/>
                                <br/>
                                <FormattedMessage id={"model.delete.text.accountSetting.group2"}/>
                            </div>
                            <div className={"button_div"}>
                                <button className={"modelButton"} onClick={handleClose}>
                                    <FormattedMessage id={"button.continue"}/>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    },[status, token, handleClose, handleDelete])

    return(ReactDOM.createPortal(
        <div className={"model2"}>
            {context}
        </div>,
            container
        )
    )
}

export {AccountSettingGroupIndex}