import {
    checkFetchResult,
    placeholder,
    useLanguage,
    useModel,
    useToken
} from "../../function/usePackage";
import React, {useCallback, useRef, useState} from "react";
import {Link} from "react-router-dom";
import {PageControl} from "../common";
import ReactDOM from "react-dom";
import "../../SCSS/accountSetting/accountSetting_common.css"
import {FormattedMessage} from "react-intl";
import {accountSettingIndex, accountSettingModuleData} from "../../data/accountSetting/moduleData";


function AccountSettingTitle(props) {
    const moduleIndex = accountSettingIndex[props.type]
    const lang = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const [createHover, setCreateHover] = useState(false)
    const [createFolderHover, setCreateFolderHover] = useState(false)

    function createFolder() {
        props.dispatch({
            type: "CREATE_FOLDER_MODE_OPEN"
        })
        setCreateFolderHover(false)
    }

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

    return (
        <div className={"accountSettingTitle"}>
            {model}
            <div className={"leftContainer"}>
                <div className={"searchDiv"}>
                    <input type="text" className={"search"} placeholder={placeholder(lang)}
                           value={props.variables.search}
                           onChange={(event) => {
                               handleSearch(event)
                           }}/>
                </div>
                {Object.keys(props.check).length !== 0 && !props.variables.folderCreate &&
                    <>
                        {!(Object.values(props.check)[0].pluginsType === 0) &&
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
                        }
                        <div className={"deleteDiv svgContainer"} onClick={() => handleDelete()}>
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
                {!props.variables.folderCreate &&
                    <>
                        <div className={"createUserButtonContainer"} onMouseEnter={() => setCreateHover(true)}
                             onMouseLeave={() => setCreateHover(false)}
                        >
                            {createHover &&
                                <div className={"hoverText"}>
                                    <FormattedMessage id={accountSettingModuleData["createHover"][moduleIndex]}/>
                                </div>
                            }
                            <Link to={{pathname: accountSettingModuleData["createUrl"][moduleIndex]}}>
                                <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M13.2 6H10.8V10.8H6V13.2H10.8V18H13.2V13.2H18V10.8H13.2V6ZM12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM12 21.6C6.708 21.6 2.4 17.292 2.4 12C2.4 6.708 6.708 2.4 12 2.4C17.292 2.4 21.6 6.708 21.6 12C21.6 17.292 17.292 21.6 12 21.6Z"
                                        fill="#00EAFF"/>
                                </svg>
                            </Link>
                        </div>
                        {moduleIndex === 1 &&
                            // <div className={"createFolderButtonContainer"} onClick={() => setFolderIsOpen(true)}>
                            <div className={"createFolderButtonContainer"} onClick={() => createFolder()}
                                 onMouseEnter={() => setCreateFolderHover(true)}
                                 onMouseLeave={() => setCreateFolderHover(false)}
                            >
                                {createFolderHover &&
                                    <div className={"hoverText"}>
                                        <FormattedMessage
                                            id={accountSettingModuleData["createFolderHover"][moduleIndex]}/>
                                    </div>
                                }
                                <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M21.6 2.46812H12L9.6 0.0681152H2.4C1.76556 0.0712875 1.15819 0.325544 0.710696 0.775288C0.263201 1.22503 0.0119921 1.83367 0.012 2.46812L0 21.6001C0.00184679 22.2361 0.255296 22.8454 0.704984 23.2951C1.15467 23.7448 1.76405 23.9983 2.4 24.0001H21.6C22.236 23.9983 22.8453 23.7448 23.295 23.2951C23.7447 22.8454 23.9982 22.2361 24 21.6001V4.86812C23.9982 4.23216 23.7447 3.62279 23.295 3.1731C22.8453 2.72341 22.236 2.46996 21.6 2.46812ZM21.6 21.6001H2.4V4.86812H21.6V21.6001Z"
                                        fill="#00EAFF"/>
                                    <path
                                        d="M13.749 13.7516H10V16.251H13.749V20H16.2497V16.251H20V13.7516H16.2497V10H13.749V13.7516Z"
                                        fill="#00EAFF"/>
                                </svg>
                            </div>
                        }
                    </>
                }
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
    const deleteValue = useRef(Object.values(props.check))
    // console.log(deleteArray.current[0])

    const handleDelete = useCallback(async () => {
        try {
            const response = await accountSettingModuleData.deleteFetch[moduleIndex](token,
                deleteArray, variables)
            const response2 = await checkFetchResult(response)
            console.log(response2)
            accountSettingModuleData.handleDelete[moduleIndex](
                setRawData, {"deleteArray": deleteArray, "property": "username", "variables": variables})
            setCheck({})
            setModelDelete(false)
        } catch (e) {
            console.log(e)
            alert(Object.values(await e.json())[0])
        }
    }, [setRawData, setCheck, token, moduleIndex, variables])

    function handleClose() {
        props.setIsOpen(false)
    }

    return (ReactDOM.createPortal(
            <div className={"model2"}>
                {modelDelete ?
                    <div className={"alarmSettingModel"}>
                        {deleteValue.current[0].pluginsType===0 ?
                            <div className={"title"}>
                                <FormattedMessage
                                    id={"model.delete.title.accountSetting.pluginsFolder"}/>?
                            </div> :
                            <div className={"title"}>
                                <FormattedMessage
                                    id={accountSettingModuleData["deleteTitle"][moduleIndex]}/> :{" " + deleteArray.current[0]} ?
                            </div>}
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
                            {deleteValue.current[0].pluginsType===0 ?
                                <div className={"text"}>
                                    <FormattedMessage id={"accountSetting.pluginsFolder"}/>
                                    :{deleteArray.current[0]}&nbsp;
                                    <FormattedMessage id={"model.delete.successful"}/>
                                </div>
                                :<div className={"text"}>
                                    <FormattedMessage id={accountSettingModuleData["deleteText"][moduleIndex]}/>
                                    :{deleteArray.current[0]}&nbsp;
                                    <FormattedMessage id={"model.delete.successful"}/>
                                </div>
                            }
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

export {AccountSettingTitle}