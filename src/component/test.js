import {useRef, useState} from "react";

function Test(){
    const valueRef = useRef("")
    const [value, setValue] = useState("")

    function handleChange(event){
        const rawValue = event.target.value
        const rawLength = rawValue.length
        if(rawLength>valueRef.current.length){
            valueRef.current = valueRef.current.slice(0, rawLength-1)+rawValue.slice(-1)
        }else{
            valueRef.current = valueRef.current.slice(0, rawLength)
        }
        let showValue = ""
        for(let i=0; i<rawLength-1; i++){
            showValue += "*"
        }
        showValue += rawValue.slice(-1)
        setValue(showValue)
    }

    console.log(valueRef)

    return(
        <div className={"test"} style={{background: "black"}}>
            <input type="text" className={"search"} value={value}
                   onChange={event=>handleChange(event)}/>
            <div>{valueRef.current}</div>
        </div>
    )
}

export {Test}