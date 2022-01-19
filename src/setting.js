const DELAY = 2000
const IS_RUNNING = false
const CONNECT_SERVER = false

const IS_PRODUCT = true
const IS_DEVELOP = false


// console.log(window.location.host)
// const SERVER = "http://"+ window.location.host+":9005"

// const SERVER = "http://127.0.0.1:9005"

// alpha
// const SERVER = "http://20.188.9.63:9005"

//dev
const SERVER = "http://20.48.113.161:9005"

// test
// const SERVER = "http://13.70.5.125:9005"

// const SERVER = "http://10.116.90.15:9005"

// Daniel
// const SERVER = "http://220.128.216.143:9322"
export {DELAY, IS_RUNNING, SERVER, CONNECT_SERVER, IS_PRODUCT, IS_DEVELOP}

// 57at3klp0y192aecwc


// alarm_function_mapping_dict = {
//     "AlarmNoAckNoReset": -1,  # 僅需用Close核銷(API)
//     "AlarmNeedAckNoReset": 1,  # 需要一次簽核
//     "AlarmNeedAckNeedReset": 2,  # 需要兩次簽核
//     "DetectionNoAckNoReset": -2,  # 僅需用Detection核銷(API)
//     "DispatchAlarmNeedAckNeedReset": -3,  # 派工且需兩次簽核
//     "DispatchAlarmNeedAckNoReset": -4,  # 派工且需一次簽核
//     "Dispatch": -5,  # 派工進行中
//     "AutoConfirm": -6,  # 自動核銷
//     "DispatchAutoConfirm": -11,  # 派工 & 自動核銷
//     "Close": 0  # 狀態解除，如還存留，僅需用Close核銷(API)
// }
