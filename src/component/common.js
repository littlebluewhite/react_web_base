import {Link, Route, Switch, useParams} from "react-router-dom";
import React, { useEffect, useState} from "react";
import {mainTitleData} from "../data/subjectData/mainTitleData";
import {useLanguage, useModel, useTemplate, useToken, useUrl} from "../function/usePackage";
import {FormattedMessage} from "react-intl";
import {SERVER} from "../setting";
import ReactDOM from "react-dom";
import {downloadUrlGenerator} from "../function/download";
import {subTitleData} from "../data/subjectData/subTitleData";

function FilterElement(props){
    const lang = useLanguage()
    let slice
    if(props.slice){
        slice = props.slice
    }else{
        slice = 0
    }
    const data = props.filter.data.slice(slice)
    return(
         <div className={props.filter.name}>
            <label htmlFor={props.filter.id}>{props.filter.title[lang]}</label>
            <select id={props.filter.id} className={"selectFilter"}
                    onChange={(event) => {props.handleFilter(event, props.filter.name)}}
                    value={props.value}
            >
                <OptionAuto data={data}/>
            </select>
        </div>
    )
}

function OptionAuto(props){
    const lang = useLanguage()
    return(
        <>
            {props.data.map((item, index) => (
            <option value={item.value} key={index}>{item.name[lang]}</option>
            ))}
        </>
    )
}

function Sort(props) {
    const lang = useLanguage()
    let classNameUp = "triangle triangleUp"
    let classNameDown = "triangle triangleDown"
    if(props.data.name===props.sortCondition[0]){
        if(props.sortCondition[1]===false){
            classNameUp = "triangle triangleUp active"
        }else{
            classNameDown = "triangle triangleDown active"
        }
    }
    function changeSort() {
        if (props.sortCondition[0] === props.data.name) {
            props.dispatch({
                type: "CHANGE_SORT_WAY"
            })
        } else {
            props.dispatch({
                type: "CHANGE_SORT_CATEGORY",
                payload: {value: props.data.name}
            })
        }
    }
    return(
        <div className={props.data.className} onClick={changeSort}>
            <div>{props.data.detail[lang]}</div>
            <div className={"div_triangle"}>
                <div className={classNameUp}/>
                <div className={classNameDown}/>
            </div>
        </div>
    )
}

function HeaderTitle(){
    return(
        <Switch>
            <Route exact path={"/"}>
                <DashboardTitle/>
            </Route>
            <Route path={"/:mainPath/:subPath"}>
                <SecondTitle/>
            </Route>
        </Switch>
    )
}


function DashboardTitle(){
    return(
        <div className="title item"><FormattedMessage id={"index.title"}/></div>
    )
}

function SecondTitle(){
    const url = useUrl()
    const mainTitle = mainTitleData[url.mainPath]["id"]
    const text = '/'
    const index = mainTitleData[url.mainPath]["subData"]["index"][url.subPath]
    const subTitle = mainTitleData[url.mainPath]["subData"]["data"][index]["id"]
    return(
        <Switch>
            <Route exact path={"/:mainPath/:subPath"}>
                <div className="title item">
                    <FormattedMessage id={mainTitle}/>
                    &nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;
                    <FormattedMessage id={subTitle}/>
                </div>
            </Route>
            <Route path={"/:mainPath/:subPath/:thirdPath"}>
                <ThirdTitle mainTitle={mainTitle} subTitle={subTitle}/>
            </Route>
        </Switch>
    )
}

function ThirdTitle(props){
    const {mainPath, subPath, thirdPath} = useParams()
    const text = '/'
    const index = subTitleData[`${mainPath}/${subPath}`]['thirdData']["index"][thirdPath]
    const thirdTitleId = subTitleData[`${mainPath}/${subPath}`]['thirdData']["data"][index]["id"]
    return (
        <div className="title item">
            <FormattedMessage id={props.mainTitle}/>
            &nbsp;&nbsp;&nbsp;{text}
            &nbsp;&nbsp;&nbsp;
            <FormattedMessage id={props.subTitle}/>
            &nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;
            <FormattedMessage id={thirdTitleId}/>
        </div>
    )
}

function UpContainerCommon(props) {
    const [subOpen, setSubOpen] = useState(true)
    const {setAsideOpen, asideOpen} = props
    const mainPath = useParams().mainPath

    useEffect(() => {
        setAsideOpen(true)
    }, [setAsideOpen, mainPath])

    function handleSubOpen() {
        setSubOpen(!subOpen)
    }

    const containerClassName = () => {
        if(asideOpen) {
            return "asideUpContainerCommon"
        }else{
            return "asideUpContainerCommon inactive"
        }
    }

    return (
        <div className={containerClassName()}>
            {asideOpen &&
            <>
                <AsideTitle onHandleSubOpen={handleSubOpen} subOpen={subOpen}/>
                {subOpen && <AsideElement/>}
            </>
            }
        </div>
    )
}

function AsideTitle(props){
    const {mainPath} = useParams()
    const title = mainTitleData[mainPath]["id"]

    return(
        <div className={"title"}>
            <div className={"text"}>
                <FormattedMessage id={title}/>
            </div>
            <div className={"point"} onClick={props.onHandleSubOpen}
                >{props.subOpen ?
                    (<svg width="1rem" height="0.6875rem" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14 10.5L8 4.5L2 10.5L-1.74846e-07 8.5L8 0.500001L16 8.5L14 10.5Z" fill="#8D97AD"/>
                    </svg>)
                    :
                    <svg width="1rem" height="0.625rem" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M2 0L8 6L14 0L16 2L8 10L0 2L2 0Z" fill="#8D97AD"/>
                    </svg>}
            </div>
        </div>
    )
}

function AsideElement(){
    const url = useUrl()
    const items = mainTitleData[url.mainPath]["subData"]["data"]
    return(
        <>
            {items.map((item, index) => (
                <Element key={item.name} name={item.name}
                         id={item.id} index={index}
                />
            ))}
        </>
    )
}

function Element(props){
    const template = useTemplate()
    const url = useUrl()
    let className = "item"
    if (url.subPath===props.name){
        className += " active"
    }
    function blockClass() {
        if (props.index === 1 && !template.Account_Plugin.IBMS_Account_R && props.name==="accountReport") {

            return "elementContainer none"
        }else{
            return "elementContainer"
        }
    }
    return(
        <Link to={`/${url.mainPath}/${props.name}`}>
            <div className={blockClass()}>
                <div className={"background"}/>
                <div className={className}>
                    <FormattedMessage id={props.id}/>
                </div>
            </div>
        </Link>
    )
}

function PageControl(props){
    const page = props.variables.pagination.current
    let arrowLeftContainer
    let classNameArrowLeft
    if(page===1){
        classNameArrowLeft="arrowLeft"
        arrowLeftContainer="arrowContainer"
    }else{
        arrowLeftContainer="arrowContainer active"
        classNameArrowLeft="arrowLeft active"
    }

    let arrowRightContainer
    let classNameArrowRight
    if(page>=props.data.metadata.maxPage){
        classNameArrowRight="arrowRight"
        arrowRightContainer="arrowContainer"
    }else{
        classNameArrowRight="arrowRight active"
        arrowRightContainer="arrowContainer active"
    }
    function toPreviousPage() {
        if(page===1){
            return null
        }else{
            props.dispatch({
                type: "TO_PREVIOUS_PAGE"
            })
        }
    }
    function toNextPage() {
        if(page>=props.data.metadata.maxPage){
            return null
        }else{
            props.dispatch({
                type: "TO_NEXT_PAGE"
            })
        }
    }
    return(
        <div className={"title1End"}>
            <div className={"title1EndButton"}>
                <div className={arrowLeftContainer} onClick={toPreviousPage}>
                    <div className={classNameArrowLeft}/>
                </div>
                <div className={arrowRightContainer} onClick={toNextPage}>
                    <div className={classNameArrowRight}/>
                </div>
            </div>
            <div className={"title1EndText"}>{props.data.metadata.downNumber} — {props.data.metadata.upNumber} <FormattedMessage id={"page.row1"}/> {props.data.metadata.totalCount} <FormattedMessage id={"page.row2"}/></div>
        </div>
    )
}

function SynAssignJob() {
    const token = useToken()
    async function handleSyn() {
        try {
            const response = await fetch(SERVER.slice(0, -4) + "12111/IBMS/api/V1/manual_update_dispatch_status", {
                headers: new Headers({
                    Authorization: "Bearer " + token,
                    // Authorization: token,
                    // Authorization: "57at3klp0y192aecwc",
                })
            })
            const data = await response.json()
            console.log(data)
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <div className={"synButtonContainer"}>
            <div className={"secondary_button synButton"} onClick={handleSyn}>
                <div className={"svgContainer2"}>
                    <svg width="1.5625rem" height="1.5625rem" viewBox="0 0 25 25" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M19.85 6.44995L18.3 7.69995C19.4 9.04995 20 10.75 20 12.45C20 16.6 16.65 19.95 12.5 19.95C12.05 19.95 11.55 19.9 11.1 19.8L10.75 21.75C11.35 21.85 11.95 21.9 12.5 21.9C17.75 21.9 22 17.65 22 12.4C22 10.3 21.25 8.14995 19.85 6.44995Z"
                            fill="#8FCDCC"/>
                        <path d="M16 4.5L21.95 5.3L17.05 10.2L16 4.5Z" fill="#8FCDCC"/>
                        <path
                            d="M12.5 3C7.25 3 3 7.25 3 12.5C3 14.8 3.8 17 5.3 18.7L6.8 17.4C5.65 16.05 5 14.3 5 12.5C5 8.35 8.35 5 12.5 5C12.95 5 13.45 5.05 13.9 5.15L14.25 3.2C13.7 3.05 13.1 3 12.5 3Z"
                            fill="#8FCDCC"/>
                        <path d="M8.9998 20.5L3.0498 19.7L7.9498 14.8L8.9998 20.5Z" fill="#8FCDCC"/>
                    </svg>
                </div>
                <div className={"text"}>
                    <FormattedMessage id={"alarm.syn"}/>
                </div>
            </div>
        </div>
    )
}

function PrintDownload(props){
    const [openSelect, setOpenSelect] = useState(false)

    function handleOpen() {
        setOpenSelect(pre=>!pre)
    }

    function handleClose() {
        setOpenSelect(false)
    }

    async function download(fileType) {
        const data = await props.download(fileType)
        downloadUrlGenerator(data, props.fileName, fileType)
    }
    return(
        <div className={"printDownloadContainer"}>
            <div className={"buttonContainer none"} style={{marginRight: "1.2rem"}}>
                <button className={"secondary_button"}><FormattedMessage id={"button.print"}/></button>
            </div>
            <div className={"selectTitle"} onMouseLeave={handleClose} onClick={handleOpen}>
                <div className={"text center"}><FormattedMessage id={"button.download"}/></div>
                <div className={"arrowCondition"}><div className={"arrowDown"}/></div>
                {openSelect &&
                <div className={"selectContainer"}>
                    <div className={"selectItem"} onClick={()=>(download("csv"))}>
                        <div className={"background"}/>
                        <div className={"item"}>CSV</div>
                    </div>
                    <div className={"selectItem"} onClick={()=>(download("xls"))}>
                        <div className={"background"}/>
                        <div className={"item"}>XLS</div>
                    </div>
                </div>}
            </div>
        </div>
    )
}

function ModelLoading(){
    const container = useModel()
    return(
        ReactDOM.createPortal(
            <div className={"model2"}>
                <div className={"loadingModel"}>
                    <div className={"loadingContainer"}>
                        <div className="loader loader-1">
                            <div className="loader-outter"/>
                            <div className="loader-inner"/>
                        </div>
                    </div>
                    <div className={"text"}>
                        Please Waiting...
                    </div>
                </div>
            </div>,
            container
        )
    )
}

function SaveModel(props) {
    const container = useModel()
    function handleClose() {
        props.setIsOpen(false)
        if(props.dispatch){
            props.dispatch({
                type: "IS_CREATE_TURN_OFF"
            })
        }
    }

    return(
        ReactDOM.createPortal(
            <div className={"model2"}>
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
                            <FormattedMessage id={props.textId}/>
                        </div>
                        <div className={"button_div"}>
                            <div className={"modelButton"} onClick={handleClose}><FormattedMessage id={"button.continue"}/></div>
                        </div>
                    </div>
                </div>}
            </div>,
            container
        )
    )
}

export {
    HeaderTitle, UpContainerCommon, OptionAuto, FilterElement,
    PageControl, Sort, SynAssignJob, PrintDownload, ModelLoading,
    SaveModel
};
