import React, {useCallback, useContext, useEffect, useRef, useState} from "react";
import '../SCSS/systemSetting.css';
import {Redirect, Route, Switch} from "react-router-dom";
import {SERVER} from "../setting";
import {PictureData} from "../data/systemSettingPictureData";
// import {systemSettingURLData} from "./data/mockData/systemSettingURLData";
import {arrayDataHardCopy, useLanguage, useModel, useTemplate, useToken} from "../function/usePackage";
import ReactDOM from "react-dom";
import { HeaderIcon} from "./mainIndex.js";
import {FormattedMessage} from "react-intl";
import {SaveModel} from "./common";

function SystemArticle(){
    const template = useTemplate()
    return(
        <div className={"article_container1"}>
            <Switch>
                {!template.Account_Plugin.IBMS_System_Setting_URL_Setting_U &&
                    <Redirect to={"/"}/>}
                <Redirect exact from={"/systemSetting"} to={"/systemSetting/url"}/>
                <Route path={"/systemSetting/url"}>
                    <ArticleSystemSettingUrl/>
                </Route>
                <Route path={"/systemSetting/logo"}>
                    <ArticleSystemSettingLogo/>
                </Route>
            </Switch>
        </div>
    )
}

function ArticleSystemSettingUrl(){
    const token = useToken()
    const [data, setData] = useState([])
    const [isEditor, setIsEditor] = useState(false)
    const initialData = useRef([])
    const [addData, setAddData] = useState({"name":"", "url":""})
    const [modelOpen, setModelOpen] = useState(false)
    const controller = useRef(false)

    const addButtonStyle = ()=>{
        if(addData.name.replace(/^\s*|\s*$/g,"")){
            return "addButton"
        }else{
            return "addButton inactive"
        }
    }

    const fetchUrl = useCallback(async(token)=>{
        try{
            const response =  await fetch(SERVER + "/api/IBMS/Web/V1/systemSetting/url", {
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
            const data = await response.json()
            initialData.current = data
            setData(arrayDataHardCopy(data))
        }catch (e) {
            console.log(e)
        }
    },[])
    useEffect(()=>{
        controller.current = true
        fetchUrl(token)
        return ()=>{
            controller.current = false
        }
    },[fetchUrl, token])

    function handleEditor() {
        setIsEditor(true)
    }

    async function handleSave(event) {
        event.preventDefault()
        try{
            const saveData = arrayDataHardCopy(data)
            if(addData.name.replace(/^\s*|\s*$/g,"")){
                saveData.push(addData)
            }
            // const response = await Promise.all([
            //     fetchSaveData(saveData)
            // ])
            const response = await fetch(SERVER + "/api/IBMS/Web/V1/systemSetting/url", {
                method: "PUT",
                headers: new Headers({
                    Authorization: "Bearer " + token
                }),
                body: JSON.stringify(saveData)
            })
            console.log(response)

            if(addData.name.replace(/^\s*|\s*$/g,"")){
                setData(pre=>{
                    let result = [...pre]
                    result.push(addData)
                    return result
                })
            }
            setAddData({"name":"","url":""})
            initialData.current = arrayDataHardCopy(saveData)
            setIsEditor(false)
            setModelOpen(true)
        }catch (e) {
            console.log(e)
        }
    }

    function handleReset() {
        setData(arrayDataHardCopy(initialData.current))
        setAddData({"name":"","url":""})
        setIsEditor(false)
    }


    const handleChangeUrl = useCallback((event, index) => {
        setData(pre=>{
            let result = [...pre]
            result[index].url = event.target.value
            return result
        })
    },[setData])

    const handleDelete = useCallback((index) => {
        setData(pre=>{
            let result = [...pre]
            result.splice(index, 1)
            return result
        })
    },[setData])

    const handleUp = useCallback(index => {
        if(index!==0){
            setData(pre=>{
                let result = [...pre]
                const data = result.splice(index, 1)
                result.splice(index-1, 0, data[0])
                return result
            })
        }
    },[setData])

    const handleDown = useCallback(index => {
        if (data.length !== index) {
            setData(pre=>{
                let result = [...pre]
                const data = result.splice(index, 1)
                result.splice(index+1, 0, data[0])
                return result
            })
        }
    },[setData, data.length])

    function handleAdd() {
        if(addData.name.replace(/^\s*|\s*$/g,"")) {
            setData(pre => {
                let result = [...pre]
                result.push(addData)
                return result
            })
            setAddData({"name": "", "url": ""})
        }
    }

    return(
        <div className={"articleSystemSettingUrl"}>
            {modelOpen && <SaveModel setIsOpen={setModelOpen} textId={"model.save.url.text"}/>}
            <div className={"titleContainer"}>
                <div className={"title"}>
                    <FormattedMessage id={"systemSetting.url.title"}/>
                </div>
                {!isEditor &&
                <div className={"svgContainer"} onClick={handleEditor}>
                    <svg width="1.8125rem" height="1.625rem" viewBox="0 0 29 36" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M22.5406 29.5547L18.4625 29.175L10.8231 21.5883L14.4953 17.9297L22.1748 25.4906L22.5406 29.5547Z"
                            fill="#00EAFF"/>
                        <path d="M12.6993 16.1414L9.05778 19.7719L6.33667 17.1305L10.049 13.432L12.6993 16.1414Z"
                              fill="#00EAFF"/>
                        <path fillRule="evenodd" clipRule="evenodd"
                              d="M29 10.8L18.125 0H3.625C2.52051 0 1.53166 0.498047 0.86849 1.27852C0.337484 1.90664 0.0188802 2.71758 0.0188802 3.6L0 32.4C0 33.1688 0.243083 33.8836 0.658447 34.4695C1.31217 35.3941 2.38835 36 3.60612 36H25.4222C27.4023 35.9754 29 34.3734 29 32.4V10.8ZM8.15861 11.5348L4.43449 15.2473C3.93416 15.7219 3.64388 16.3746 3.625 17.0637C3.6132 17.5441 3.73592 18.0141 3.97192 18.4242C4.07341 18.6012 4.19613 18.7676 4.34009 18.9188L16.5745 31.1133C17.0181 31.5504 17.5987 31.8234 18.2194 31.8855L23.8882 32.4H24.0109C24.1879 32.4012 24.3673 32.3672 24.5325 32.2992C24.6151 32.2652 24.6953 32.223 24.7708 32.1727C24.844 32.1246 24.9124 32.0695 24.9762 32.0074C25.1178 31.8668 25.2263 31.6969 25.2948 31.5094C25.3608 31.3219 25.3868 31.1215 25.3703 30.9234L24.785 25.2738C24.7449 24.859 24.608 24.4641 24.3909 24.116C24.2847 23.9426 24.1572 23.7809 24.0109 23.6344L11.7765 11.4398C11.2668 11.0109 10.6154 10.7836 9.94987 10.8012C9.28198 10.8188 8.64478 11.0801 8.15861 11.5348Z"
                              fill="#00EAFF"/>
                    </svg>
                </div>
                }
            </div>
            <form onSubmit={(event)=>handleSave(event)}>
                <div className={"urlDataContainer"}>
                    {data.map((item, index) =>(<UrlElement item={item} key={index} index={index}
                                                           isEditor={isEditor} setData={setData}
                                                           handleChangeUrl={handleChangeUrl} handleDelete={handleDelete}
                                                           handleUp={handleUp} handleDown={handleDown}
                                                           modelOpen={modelOpen}
                    />))}
                </div>
                {isEditor &&
                <>
                <AddElement setData={setData} addData={addData} setAddData={setAddData}/>

                <div className={"addButtonContainer"}>
                    <div className={addButtonStyle()} onClick={handleAdd}>
                        ✚
                    </div>
                </div>
                <div className={"createButtonContainer"}>
                    <div className={"button"} onClick={handleReset}><FormattedMessage id={"button.reset"}/></div>
                    <button className={"button"}><FormattedMessage id={"button.save"}/></button>
                </div>
                </>
                }
            </form>
        </div>
    )
}

function UrlElement(props) {
    const [deleteModel, setDeleteModel] = useState(false)
    const {handleChangeUrl, handleUp, handleDown, index} = props

    function handleDeleteModel() {
        setDeleteModel(true)
    }

    return (

        <div className={"urlElement"}>
            {deleteModel && <DeleteModel handleDelete={props.handleDelete} index={index} setDeleteModel={setDeleteModel}/>}
            {props.isEditor &&
            <div className={"controlContainer"}>
                <div className={"deleteContainer"} onClick={handleDeleteModel}>
                    <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 0C5.3715 0 0 5.373 0 12C0 18.627 5.3715 24 12 24C18.6285 24 24 18.627 24 12C24 5.373 18.6285 0 12 0ZM17.5605 15.4395C17.8418 15.7208 17.9998 16.1022 17.9998 16.5C17.9998 16.8978 17.8418 17.2792 17.5605 17.5605C17.2792 17.8418 16.8978 17.9998 16.5 17.9998C16.1022 17.9998 15.7208 17.8418 15.4395 17.5605L12 14.121L8.5605 17.5605C8.42152 17.7003 8.25628 17.8112 8.07428 17.8869C7.89228 17.9626 7.69711 18.0016 7.5 18.0016C7.30289 18.0016 7.10772 17.9626 6.92572 17.8869C6.74372 17.8112 6.57848 17.7003 6.4395 17.5605C6.30008 17.4213 6.18948 17.256 6.11401 17.074C6.03854 16.8921 5.9997 16.697 5.9997 16.5C5.9997 16.303 6.03854 16.1079 6.11401 15.926C6.18948 15.744 6.30008 15.5787 6.4395 15.4395L9.879 12L6.4395 8.5605C6.15824 8.27924 6.00023 7.89776 6.00023 7.5C6.00023 7.10224 6.15824 6.72076 6.4395 6.4395C6.72076 6.15824 7.10224 6.00023 7.5 6.00023C7.89776 6.00023 8.27924 6.15824 8.5605 6.4395L12 9.879L15.4395 6.4395C15.7208 6.15824 16.1022 6.00023 16.5 6.00023C16.8978 6.00023 17.2792 6.15824 17.5605 6.4395C17.8418 6.72076 17.9998 7.10224 17.9998 7.5C17.9998 7.89776 17.8418 8.27924 17.5605 8.5605L14.121 12L17.5605 15.4395Z"
                            fill="#EC0000"/>
                    </svg>
                </div>
            </div>
            }
            <div className={"name"}>{props.item.name}</div>
            <div className={"url"}>
                {props.isEditor?
                    <input type="text" value={props.item.url}
                           onChange={(event)=>{handleChangeUrl(event,index)}}/>
                    : props.item.url}
            </div>
            {props.isEditor &&
            <div className={"upDownButtonContainer"}>
                <div className={"upButton"} onClick={()=>{handleUp(index)}}>
                    <svg width="0.75rem" height="1.0625rem" viewBox="0 0 12 17" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M11.9007 7.89165L6.41305 0.22136C6.36406 0.152949 6.29947 0.0971905 6.22465 0.0586973C6.14982 0.020204 6.06691 8.33198e-05 5.98276 0H5.9815C5.89704 0.000176441 5.81384 0.0205059 5.73882 0.059299C5.6638 0.0980922 5.59912 0.154229 5.55015 0.223045L0.0978773 7.89334C0.0415121 7.97264 0.00809402 8.06594 0.00129443 8.16299C-0.00550515 8.26004 0.0145771 8.35709 0.0593345 8.44347C0.103844 8.52997 0.171366 8.6025 0.254461 8.65308C0.337556 8.70366 0.432999 8.73032 0.530277 8.73012H3.09624L3.09603 15.6192C3.096 15.6888 3.10969 15.7577 3.13631 15.822C3.16294 15.8863 3.20197 15.9447 3.25119 15.9939C3.3004 16.0431 3.35883 16.0821 3.42314 16.1087C3.48744 16.1353 3.55636 16.149 3.62594 16.1489L8.37349 16.1487C8.4431 16.1488 8.51204 16.1351 8.57636 16.1084C8.64068 16.0818 8.69912 16.0427 8.74833 15.9935C8.79755 15.9443 8.83657 15.8858 8.86318 15.8215C8.88979 15.7572 8.90346 15.6882 8.9034 15.6186V8.73033H11.4702C11.6682 8.73033 11.85 8.61871 11.9414 8.44242C11.9859 8.35577 12.0057 8.25849 11.9986 8.16131C11.9914 8.06413 11.9575 7.97082 11.9007 7.89165V7.89165Z"
                            fill="#8FCDCC"/>
                    </svg>
                </div>
                <div className={"downButton"} onClick={()=>{handleDown(props.index)}}>
                    <svg width="0.75rem" height="1.0625rem" viewBox="0 0 12 17" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0.0992893 9.10835L5.58695 16.7786C5.63594 16.8471 5.70053 16.9028 5.77535 16.9413C5.85018 16.9798 5.93309 16.9999 6.01724 17H6.0185C6.10296 16.9998 6.18616 16.9795 6.26118 16.9407C6.3362 16.9019 6.40088 16.8458 6.44985 16.777L11.9021 9.10666C11.9585 9.02736 11.9919 8.93406 11.9987 8.83701C12.0055 8.73996 11.9854 8.64291 11.9407 8.55653C11.8962 8.47003 11.8286 8.3975 11.7455 8.34692C11.6624 8.29634 11.567 8.26968 11.4697 8.26988H8.90376L8.90397 1.38077C8.904 1.31118 8.89031 1.24227 8.86369 1.17797C8.83706 1.11368 8.79803 1.05527 8.74881 1.00607C8.6996 0.956875 8.64117 0.917863 8.57686 0.891266C8.51256 0.864668 8.44364 0.851006 8.37406 0.851061L3.62651 0.851272C3.5569 0.851244 3.48796 0.864938 3.42364 0.891572C3.35932 0.918207 3.30088 0.957257 3.25167 1.00649C3.20245 1.05573 3.16343 1.11418 3.13682 1.17851C3.11021 1.24284 3.09654 1.31178 3.0966 1.3814V8.26967H0.529793C0.331811 8.26967 0.150048 8.38129 0.0586398 8.55758C0.0140585 8.64423 -0.00573632 8.74151 0.00143613 8.83869C0.00860858 8.93587 0.04247 9.02918 0.0992893 9.10835V9.10835Z"
                            fill="#8FCDCC"/>
                    </svg>
                </div>
            </div>
            }
        </div>
    )
}

function DeleteModel(props) {
    const container = useModel()

    const [modelState, setModelState] = useState(true)

    function handleDelete() {
        setModelState(false)
        props.handleDelete(props.index)
    }

    function handleClose() {
        props.setDeleteModel(false)
    }

    return (ReactDOM.createPortal(
            <div className={"model2"}>
                {modelState ?
                    <div className={"alarmSettingModel"}>
                        <div className={"title"}>
                            <FormattedMessage id={"model.delete.url.title"}/>
                        </div>
                        <div className={"buttonContainer"}>
                            <button className={"modelButton"} onClick={handleClose}><FormattedMessage id={"no"}/></button>
                            <button className={"modelButton"} onClick={handleDelete}><FormattedMessage id={"yes"}/></button>
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
                                <FormattedMessage id={"model.delete.url.text"}/>
                            </div>
                            <div className={"button_div"}>
                                <button className={"modelButton"} onClick={handleClose}><FormattedMessage id={"button.continue"}/></button>
                            </div>
                        </div>
                    </div>}
            </div>,
            container
        )
    )
}

function AddElement(props) {
    const {addData, setAddData} = props

    const handleChange = useCallback((event, property)=>{
        setAddData(pre=>({...pre, [property]: event.target.value}))
    },[setAddData])

    return(
        <div className={"urlDataContainer add"}>
            <div className={"urlElement"}>
                <div className={"controlContainer"}>
                    <div className={"block"}/>
                </div>
                <div className={"name"}>
                    <input type="text" value={addData.name} onChange={event => {handleChange(event, "name")}}/>
                </div>
                <div className={"url"}>
                    <input type="text" value={addData.url} onChange={event => {handleChange(event, "url")}}/>
                </div>
                <div className={"BlockContainer"}/>
            </div>
        </div>
    )
}

function ArticleSystemSettingLogo(){
    const token = useToken()
    const [firstLogo, setFirstLogo] = useState(null)
    const [headerLogo, setHeaderLogo] = useState(null)
    const [imageUrl1, setImageUrl1] = useState(null)
    const [imageUrl2, setImageUrl2] = useState(null)
    const [openModel, setOpenModel] = useState("")

    const saveDisable = () =>{
        return (!imageUrl1 && !imageUrl2)
    }

    function changeFirstLogo(event){
        setFirstLogo(event.target.files[0])
        if (!event.target.files[0]){
            setFirstLogo(null)
            setImageUrl1(null)
            return
        }

        let reader = new FileReader()
        reader.readAsDataURL(event.target.files[0])
        reader.onload = () => {
            setImageUrl1(reader.result)
        }
    }
    function changeHeaderLogo(event){
        setHeaderLogo(event.target.files[0])
        // console.log(event.target.files[0])
        if (!event.target.files[0]){
            setHeaderLogo(null)
            setImageUrl2(null)
            return
        }

        let reader = new FileReader()
        reader.readAsDataURL(event.target.files[0])
        reader.onload = () => {
            setImageUrl2(reader.result)
            // console.log(reader.result)
        }
    }
    function cleanLogo(){
        setFirstLogo(null)
        setHeaderLogo(null)
        setImageUrl1(null)
        setImageUrl2(null)
    }

    const fetchSaveImage = useCallback(async(group, imgUrl)=>{
        if (imgUrl) {
            const base64 = imgUrl.slice(22)
            try{
                const response = fetch(SERVER + "/api/IBMS/Web/V1/systemSetting/logo/" + group, {
                    method: "PUT",
                    headers: new Headers({
                        Authorization: "Bearer " + token
                    }),
                    body: JSON.stringify({
                        "img": base64
                    })
                })
                console.log(response)
            }catch (e){
                console.log(e)
            }
        }else{
            return 1
        }
    },[token])

    async function submit(event) {
        event.preventDefault()
        // import requests
        //
        // files = {'image': ('iris.png', open('iris.png', 'rb'))}
        //
        // # response = requests.post('http://" + SERVER + "/image', files=files)
        // response = requests.post('http://127.0.0.1:9005/image', files=files)
        // print(response.status_code, response.json())
        //
        // print(response.request.url)
        // print(response.request.body)
        // print(response.request.headers)


        // import requests
        // import base64
        // url = 'http://" + SERVER + "/IBMS/test/api/upload_logo/'
        // with open("00.png", 'rb') as f:
        //     encoded_string = base64.b64encode(f.read())
        //     raw = str(encoded_string, encoding='utf-8')
        // payload = {"img":raw}
        // requests.post(url, data=json.dumps(payload))
        try{
            const response = await Promise.all([
                fetchSaveImage("index", imageUrl1),
                fetchSaveImage("navigation", imageUrl2)
            ])
            console.log(response)
            setImageUrl1(null)
            setImageUrl2(null)
            event.target.reset()
            setOpenModel("save")
        }catch (err){
            console.log(err)
        }
    }

    async function recoverLogo() {
        const fetchRecoverLogo = async(group) =>{
            return await fetch(SERVER + "/api/IBMS/Web/V1/systemSetting/logo/"+group, {
                method: "OPTIONS",
                headers: new Headers({
                    Authorization: "Bearer " + token
                })
            })
        }
        try{
            const response = await Promise.all([
                fetchRecoverLogo("index"),
                fetchRecoverLogo("navigation")
            ])
            console.log(response)
            setOpenModel("save")
        }catch(err){
            console.log(err)
        }
    }

    return(
        <div className={"system_article_container2"}>
            {openModel==="save" && <SaveLogoModel setopenModel={setOpenModel}/>}
            {openModel==="recover" && <RecoverLogoModel setopenModel={setOpenModel} recoverLogo={recoverLogo}/>}
            <form onSubmit={(event) => (submit(event))} action={"."}>
                <div className={"title"}><FormattedMessage id={"systemSetting.logo.title"}/></div>
                <div className={"explain"}>
                    <UpdatePicture id={"first_page_logo"} logo={firstLogo} imageUrl={imageUrl1} onChangeLogo={changeFirstLogo}
                                   pictureData={PictureData["firstLogo"]}/>
                    <div className={"hrContainer"}>
                        <hr/>
                    </div>
                    <UpdatePicture id={"header_logo"} logo={headerLogo} imageUrl={imageUrl2} onChangeLogo={changeHeaderLogo}
                                   pictureData={PictureData["headerLogo"]}/>
                </div>
                <div className={"div_button"}>
                    <div className={"button originalReset"} onClick={()=>{setOpenModel("recover")}}><FormattedMessage id={"button.recover"}/></div>
                    <button type="reset" onClick={cleanLogo} className={"button"}><FormattedMessage id={"button.reset"}/></button>
                    <button type={"submit"} className={"button save"} disabled={saveDisable()}><FormattedMessage id={"button.save"}/></button>
                </div>
            </form>
            {/*<Test/>*/}
        </div>
    )
}

function SaveLogoModel(props) {
    // const history = useHistory()
    const {setHeaderIconValue} = useContext(HeaderIcon)
    const container = useModel()

    function handleClose() {
        props.setopenModel("")
        setHeaderIconValue(pre=>!pre)
        // window.location.href = "http://"+ window.location.host
        // history.push("/")
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
                            <FormattedMessage id={"model.save.logo.text"}/>
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

function RecoverLogoModel(props) {
    const container = useModel()

    function handleClose() {
        props.setopenModel("")
    }

    function handleSave() {
        // API
        props.recoverLogo()
    }

    return(
        ReactDOM.createPortal(
            <div className={"model2"}>
                <div className={"alarmSettingModel"}>
                    <div className={"title"}>
                        <FormattedMessage id={"model.recover.title"}/>
                    </div>
                    <div className={"buttonContainer"}>
                        <button className={"modelButton"} onClick={handleClose}><FormattedMessage id={"no"}/></button>
                        <button className={"modelButton"} onClick={handleSave}><FormattedMessage id={"yes"}/></button>
                    </div>
                </div>
            </div>,
            container
        )
    )
}

function UpdatePicture(props) {
    const lang = useLanguage()
    return (
        <div className={"div_update_picture"}>
            <div>
                <span className={"item1"}><FormattedMessage id={"systemSetting.logo.upload"}/>{props.pictureData.name[lang]}<FormattedMessage id={"systemSetting.logo.logo"}/></span>
                <span className={"item2"}><FormattedMessage id={"systemSetting.logo.note1"}/><span
                    className={"item3"}><FormattedMessage id={"systemSetting.logo.note2"}/></span>
                    <FormattedMessage id={"systemSetting.logo.note3"}/></span>
            </div>
            {props.logo && props.imageUrl && (
                <div className={"picture"}>
                    <img src={props.imageUrl} alt=""/>
                    <span>{props.logo.name}</span>
                </div>)}
            <div>
                <label htmlFor={props.id}>
                    <div className={"button"}><FormattedMessage id={"button.select"}/></div>
                </label>
                <input type="file" id={props.id} onChange={props.onChangeLogo}
                       accept="image/*"/>
            </div>
        </div>
    )
}

// function Test() {
//     const token = useToken()
//     async function handleAPI(){
//         try{
//             const response = await fetch("http://220.128.216.143:9322/api/account/register", {
//                 method: "POST",
//                 headers: new Headers({
//                     Authorization: "Bearer " + token,
//                     // Authorization: "Bearer 57at3klp0y192aecwc",
//                     body: JSON.stringify({
//     "Account": "IBMS_123",
//     "Password": "123456",
//     "CompanyId": "",
//     "ProductId": "",
//     "ProjectId": "",
//     "Description": "",
//     "Group": "NADI",
//     "RoleGroup": "NADI",
//     "Language": "CN",
//     "Address": "tttttt",
//     "PhoneNumber": "tttttttttt",
//     "Email": "123456"
// })
//                 })
//             })
//             const data = await response.json()
//             console.log(data)
//         }catch (e) {
//             console.log(e)
//         }
//     }
//
//     return (
//         <div>
//             <button onClick={handleAPI}>test</button>
//         </div>
//     )
// }


export {SystemArticle};
