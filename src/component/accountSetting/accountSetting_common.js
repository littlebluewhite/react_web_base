import {
    checkFetchResult,
    placeholder,
    useLanguage,
    useModel,
    useToken
} from "../../function/usePackage";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import {PageControl} from "../common";
import ReactDOM from "react-dom";
import "../../SCSS/accountSetting/accountSetting_common.css"
import {FormattedMessage} from "react-intl";
import {accountSettingIndex, accountSettingModuleData} from "../../data/accountSetting/moduleData";
import {fetchCreateFolder} from "../../function/accountSetting/plugins/pluginsFunction";


function AccountSettingTitle(props) {
    const moduleIndex = accountSettingIndex[props.type]
    const lang = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const [folderIsOpen, setFolderIsOpen] = useState(false)

    function handleSearch(event) {
        props.setCheck({})
        props.dispatch({
            type: "CHANGE_KEYWORD",
            payload: {keyword: event.target.value}
        })
    }

    function handleDelete() {
        setIsOpen(true)
    }

    const model = isOpen && <DeleteAccountData check={props.check} setCheck={props.setCheck}
                                               setRawData={props.setRawData} setIsOpen={setIsOpen}
                                               type={props.type} variables={props.variables}
    />

    const model2 = folderIsOpen && <CreatePluginsFolder variables={props.variables}
                                                        setFolderIsOpen={setFolderIsOpen}
                                                        dispatch={props.dispatch}
    />

    return (
        <div className={"accountSettingTitle"}>
            {model}
            {model2}
            <div className={"leftContainer"}>
                <div className={"searchDiv"}>
                    <input type="text" className={"search"} placeholder={placeholder(lang)}
                           value={props.variables.search}
                           onChange={(event) => {
                               handleSearch(event)
                           }}/>
                </div>
                {Object.keys(props.check).length !== 0 &&
                    <>
                        <Link to={accountSettingModuleData.updateUrl[moduleIndex]}>
                            <div className={"editorDiv svgContainer"}>
                                <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M23.1822 5.04862L19.0573 0.923729C18.5189 0.418048 17.8135 0.127895 17.0751 0.108465C16.3368 0.0890345 15.6171 0.341683 15.0528 0.818349L1.50395 14.3672C1.01734 14.858 0.714355 15.5011 0.645851 16.1888L-0.00148524 22.4665C-0.021765 22.687 0.00684633 22.9092 0.082309 23.1174C0.157772 23.3256 0.278227 23.5145 0.43509 23.6708C0.575758 23.8103 0.742584 23.9207 0.926003 23.9957C1.10942 24.0706 1.30582 24.1085 1.50395 24.1074H1.63944L7.91709 23.5353C8.60477 23.4668 9.24795 23.1638 9.73867 22.6772L23.2876 9.12834C23.8134 8.57278 24.0976 7.83142 24.0779 7.0667C24.0581 6.30198 23.736 5.57628 23.1822 5.04862ZM7.64611 20.5245L3.12982 20.946L3.53628 16.4297L12.042 8.02937L16.1066 12.094L7.64611 20.5245ZM18.0637 10.0768L14.0292 6.0422L16.9647 3.03133L21.0746 7.14117L18.0637 10.0768Z"
                                        fill="#00EAFF"/>
                                </svg>
                            </div>
                        </Link>
                        <div className={"deleteDiv svgContainer"} onClick={handleDelete}>
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
                {props.type === "plugins" &&
                    <div className={"createFolderButtonContainer"} onClick={()=>setFolderIsOpen(true)}>
                        <svg width="1.75rem" height="1.5rem" viewBox="0 0 28 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_4928_3656)">
                                <path
                                    d="M27.3353 8.592C26.9211 8.05771 26.3245 7.70584 25.667 7.608V6C25.6935 5.23336 25.4235 4.48717 24.9162 3.92487C24.4089 3.36257 23.7056 3.03 22.9603 3H12.157L9.46198 0H2.70698C1.96174 0.0299972 1.25844 0.362569 0.751115 0.924871C0.243794 1.48717 -0.0261839 2.23336 0.000317079 3V21C-0.0183738 21.7004 0.206261 22.3848 0.633901 22.9302C1.06154 23.4756 1.66418 23.8464 2.33365 23.976C2.46198 23.988 2.57865 24 2.70698 24H23.6487C24.2981 23.9785 24.9186 23.7186 25.3979 23.2674C25.8772 22.8162 26.1837 22.2035 26.262 21.54L27.942 11.088C28.0296 10.6518 28.0206 10.2009 27.9156 9.7688C27.8105 9.33669 27.6122 8.93446 27.3353 8.592ZM2.73032 21.6H2.70698C2.60198 21.6 2.33365 21.42 2.33365 21V3C2.33365 2.58 2.60198 2.4 2.70698 2.4H8.43532L11.142 5.4H22.9603C23.0653 5.4 23.3337 5.58 23.3337 6V7.584H7.24532C6.59803 7.60403 5.97871 7.85998 5.4979 8.30617C5.01708 8.75237 4.70606 9.35978 4.62032 10.02L2.73032 21.6ZM23.8528 21.4464C23.8118 21.5089 23.7543 21.558 23.6871 21.588C22.7339 22.3601 21.5564 22.7809 20.3432 22.7831C19.1299 22.7852 17.951 22.3687 16.9952 21.6H5.09865L6.91865 10.44L6.93032 10.392C6.9338 10.2984 6.96622 10.2083 7.02287 10.135C7.07952 10.0616 7.15744 10.0087 7.24532 9.984H25.3286C25.4144 10.0015 25.49 10.0533 25.5386 10.128C25.5991 10.2063 25.6403 10.2985 25.6586 10.3967C25.6768 10.4949 25.6717 10.5963 25.6437 10.692L25.0731 14.2296C25.7513 15.3813 26.0013 16.7465 25.777 18.0731C25.5527 19.3996 24.8692 20.5978 23.8528 21.4464Z"
                                    fill="#00EAFF"/>
                                <path
                                    d="M19.3772 16.1197H16.5095V18.0853H19.3772V21.0349H21.2894V18.0853H24.157V16.1197H21.2894V13.1689H19.3772V16.1197Z"
                                    fill="#00EAFF"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_4928_3656">
                                    <rect width="28" height="24" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                }
                <div className={"createUserButtonContainer"}>
                    <Link to={{pathname: accountSettingModuleData["createUrl"][moduleIndex]}}>
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M13.2 6H10.8V10.8H6V13.2H10.8V18H13.2V13.2H18V10.8H13.2V6ZM12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM12 21.6C6.708 21.6 2.4 17.292 2.4 12C2.4 6.708 6.708 2.4 12 2.4C17.292 2.4 21.6 6.708 21.6 12C21.6 17.292 17.292 21.6 12 21.6Z"
                                fill="#00EAFF"/>
                        </svg>
                    </Link>
                </div>
                <PageControl dispatch={props.dispatch} variables={props.variables} data={props.data}/>
            </div>
        </div>
    )
}

function DeleteAccountData(props) {
    const {setRawData, setCheck, variables} = props
    const moduleIndex = accountSettingIndex[props.type]
    const token = useToken()
    const container = useModel()
    const [modelDelete, setModelDelete] = useState(true)
    const deleteArray = useRef(Object.keys(props.check))
    // console.log(deleteArray.current[0])

    const handleDelete = useCallback(async () => {
        try{
            const response = await accountSettingModuleData.deleteFetch[moduleIndex](token,
                deleteArray, variables)
            const response2 = await checkFetchResult(response)
            console.log(response2)
            accountSettingModuleData.handleDelete[moduleIndex](
                setRawData, {"deleteArray": deleteArray, "property": "username", "variables": variables})
            setCheck({})
            setModelDelete(false)
        }catch (e) {
            console.log(e)
            alert(Object.values(await e.json())[0])
        }
    },[setRawData, setCheck, token, moduleIndex, variables])

    function handleClose() {
        props.setIsOpen(false)
    }

    return (ReactDOM.createPortal(
            <div className={"model2"}>
                {modelDelete ?
                    <div className={"alarmSettingModel"}>
                        <div className={"title"}>
                            <FormattedMessage id={accountSettingModuleData["deleteTitle"][moduleIndex]}/>:
                            {" "+deleteArray.current[0]}?
                        </div>
                        <div className={"buttonContainer"}>
                            <button className={"modelButton"} onClick={handleClose}>
                                <FormattedMessage id={"no"}/>
                            </button>
                            <button className={"modelButton"} onClick={handleDelete}>
                                <FormattedMessage id={"yes"}/>
                            </button>
                        </div>
                    </div> :
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
                                <FormattedMessage id={accountSettingModuleData["deleteText"][moduleIndex]}/>
                                :{deleteArray.current[0]}&nbsp;
                                <FormattedMessage id={"model.delete.successful"}/>
                            </div>
                            <div className={"button_div"}>
                                <button className={"modelButton"} onClick={handleClose}>
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

function CreatePluginsFolder(props){
    const {variables, setFolderIsOpen, dispatch} = props
    const token = useToken()
    const container = useModel()
    const inputRef = useRef()
    const handleSubmit = useCallback(async (event)=>{
        event.preventDefault()
        try{
            const response = await fetchCreateFolder(inputRef.current.value, variables.layers, token)
            const response2 = await checkFetchResult(response)
            console.log(response2)
            setFolderIsOpen(false)
            dispatch({
                type: "RE_FETCH_DATA"
            })
        }catch (e){
            console.log(e)
            alert(Object.values(await e.json())[0])
        }
    },[variables, setFolderIsOpen, dispatch, token])

    useEffect(()=>{
        inputRef.current.focus()
    },[])

    return(ReactDOM.createPortal(
        <div className={"model2"}>
            <div className={"pluginsFolderModel"}>
                <form onSubmit={(event)=>(handleSubmit(event))}>
                    <div className={"title"}>
                        <FormattedMessage id={"model.folderName.input"}/>:&nbsp;
                        <input type="text" required={true} ref={inputRef}/>
                    </div>
                    <div className={"buttonContainer"}>
                        <div className={"modelButton"} onClick={()=>setFolderIsOpen(false)}>
                            <FormattedMessage id={"no"}/>
                        </div>
                        <button className={"modelButton"}>
                            <FormattedMessage id={"yes"}/>
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        container
    ))
}

export {AccountSettingTitle}