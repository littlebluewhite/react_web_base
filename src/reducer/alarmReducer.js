import {DELAY, IS_RUNNING} from "../setting";


const MONITORING_INITIAL_STATE ={
    delay: DELAY,
    isRunning: IS_RUNNING,
    data: [],
    date:　new Date()
}

function alarmReducer(state, action){
    switch(action.type){
        case "CHANGE_DELAY":
            return{
                ...state,
                delay: action.payload.value
            }
        case "UPDATE_DATA":
            return{
                ...state,
                data: action.payload.data,
                date: new Date()
            }
        default:
            throw new Error(`error action type: ${action.type}`)
    }
}

export {MONITORING_INITIAL_STATE, alarmReducer}