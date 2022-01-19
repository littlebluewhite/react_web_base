const allConditionData={
    "building":{
        "id": "buildingFilter",
        "name": "building",
        "title": {"CN":"大楼名称","EN":"Building"},
        "index": {
            "1": 0
        },
        "data": [
            {"name": {"CN":"远企大楼","EN":"Far East Building"}, "value": "1"}
        ]
    },
    "floor": {
        "id": "floorFilter",
        "name": "floor",
        "title": {"CN":"楼层","EN":"Floor"},
        "index": {
            "": 0,
            "15": 1,
            "14": 2,
            "13": 3,
            "12": 4,
            "11": 5,
            "10": 6,
            "9": 7,
            "8": 8,
            "7": 9,
            "6": 10,
            "5": 11,
            "4": 12,
            "3": 13,
            "2": 14,
            '1': 15,
            "-1": 16,
            "-2": 17,
            "-3": 18,
        },
        "data":[
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
            {"name": {"CN":"RF","EN":"RF"}, "value": "15"},
            {"name": {"CN":"14F","EN":"14F"}, "value": "14"},
            {"name": {"CN":"13F","EN":"13F"}, "value": "13"},
            {"name": {"CN":"12F","EN":"12F"}, "value": "12"},
            {"name": {"CN":"11F","EN":"11F"}, "value": "11"},
            {"name": {"CN":"10F","EN":"10F"}, "value": "10"},
            {"name": {"CN":"9F","EN":"9F"}, "value": "9"},
            {"name": {"CN":"8F","EN":"8F"}, "value": "8"},
            {"name": {"CN":"7F","EN":"7F"}, "value": "7"},
            {"name": {"CN":"6F","EN":"6F"}, "value": "6"},
            {"name": {"CN":"5F","EN":"5F"}, "value": "5"},
            {"name": {"CN":"4F","EN":"4F"}, "value": '4'},
            {"name": {"CN":"3F","EN":"3F"}, "value": "3"},
            {"name": {"CN":"2F","EN":"2F"}, "value": "2"},
            {"name": {"CN":"1F","EN":"1F"}, "value": "1"},
            {"name": {"CN":"B1","EN":"B1"}, "value": "-1"},
            {"name": {"CN":"B2","EN":"B2"}, "value": "-2"},
            {"name": {"CN":"B3","EN":"B3"}, "value": "-3"},
        ],
    },
    "category": {
        "id": "categoryFilter",
        "name": "category",
        "title": {"CN":"警报类型","EN":"Alarm Category"},
        "index": {
            "": 0,
            "High": 1,
            "Medium": 2,
            "Low": 3
        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
            {"name": {"CN":"高級","EN":"High"}, "value": "High"},
            {"name": {"CN":"中級","EN":"Medium"}, "value": "Medium"},
            {"name": {"CN":"低級","EN":"Low"}, "value": "Low"}
        ]
    },
    "status": {
        "id": "statusFilter",
        "name": "status",
        "title": {"CN":"处理现况","EN":"Status"},
        "index": {
            "": 0,
            // "1": 1,
            // '2': 2,
            // '3': 3,
            // "4": 4,
            // "5": 5,
            "-1": 1,
            "1": 2,
            "2": 3,
            "-2": 4,
            "-3": 5,
            "-4": 6,
            "-5": 7,
            "-6": 8,
            "-11": 9,
            "0": 10,
        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
            {"name": {"CN":"僅需用Close核銷(API)","EN":"Alarm No Ack No Reset"}, "value": "-1"},
            {"name": {"CN":"需要一次簽核","EN":"Alarm Need Ack No Reset"}, "value": "1"},
            {"name": {"CN":"需要兩次簽核","EN":"Alarm Need Ack Need Reset"}, "value": "2"},
            {"name": {"CN":"僅需用Detection核銷(API)","EN":"Detection No Ack No Reset"}, "value": "-2"},
            {"name": {"CN":"派工且需兩次簽核","EN":"Dispatch Alarm Need Ack Need Reset"}, "value": "-3"},
            {"name": {"CN":"派工且需一次簽核","EN":"Dispatch Alarm Need Ack No Reset"}, "value": "-4"},
            {"name": {"CN":"派工進行中","EN":"Dispatch"}, "value": "-5"},
            {"name": {"CN":"自動核銷","EN":"Auto Confirm"}, "value": "-6"},
            {"name": {"CN":"派工 & 自動核銷","EN":"DispatchAutoConfirm"}, "value": "-11"},
            {"name": {"CN":"狀態解除，如還存留，僅需用Close核銷(API)","EN":"Close"}, "value": "0"},
        ]
    },
    "accessLevel": {
        "id": "accessLevelFilter",
        "name": "accessLevel",
        "title": {"CN":"帐号级别","EN":"Account Level"},
        "index": {
            "": 0,
            "0": 1,
            "1": 2,
            "2": 3,
            "3": 4,
            "4": 5,
            "5": 6,
            "6": 7,
            "7": 8,
            "8": 9,
            "9": 10,
            "10": 11,
            "11": 12,
            "12": 13,
        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
            {"name": {"CN":"NADI","EN":"NADI"}, "value": "0"},
            {"name": {"CN":"NADI_Agent","EN":"NADI_Agent"}, "value": "1"},
            {"name": {"CN":"Sptel_Manager","EN":"Sptel_Manager"}, "value": "2"},
            {"name": {"CN":"Sptel_Oprator","EN":"Sptel_Oprator"}, "value": "3"},
            {"name": {"CN":"Oprator","EN":"Oprator"}, "value": "4"},
            {"name": {"CN":"TestMerge01","EN":"TestMerge01"}, "value": "5"},
            {"name": {"CN":"TestMerge02","EN":"TestMerge02"}, "value": "6"},
            {"name": {"CN":"Sptel_AMS","EN":"Sptel_AMS"}, "value": "7"},
            {"name": {"CN":"AAAaAAAATaAAAa5","EN":"AAAaAAAATaAAAa5"}, "value": "8"},
            {"name": {"CN":"InsertAlarmTemplate","EN":"InsertAlarmTemplate"}, "value": "9"},
            {"name": {"CN":"AAAaAAAAAAAATaAAAa5","EN":"AAAaAAAAAAAATaAAAa5"}, "value": "10"},
            {"name": {"CN":"IBMS_Admin","EN":"IBMS_Admin"}, "value": "11"},
            {"name": {"CN":"IBMS_Property_Manager","EN":"IBMS_Property_Manager"}, "value": "12"},
        ]
    },
    "accountStatus": {
        "id": "accountStatusFilter",
        "name": "accountStatus",
        "title": {"CN":"帐号状态","EN":"Account Status"},
        "index": {
            "": 0,
            "1": 1,
            "2": 2,
            "3": 3,
            "4": 4
        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
            {"name": {"CN":"正常","EN":"Activate"}, "value": "1"},
            {"name": {"CN":"冻结","EN":"Frozen"}, "value": "2"},
            {"name": {"CN":"停用","EN":"Stop"}, "value": "3"},
            {"name": {"CN":"删除(不可复权)","EN":"Delete"}, "value": "4"},
        ]
    },
    "subCompany": {
        "id": "subCompanyFilter",
        "name": "subCompany",
        "title": {"CN":"所属公司","EN":"Corp. Name"},
        "index":{
            "": 0,
        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
        ]
    },
    "gender": {
        "id": "genderFilter",
        "name": "gender",
        "title": {"CN":"性别","EN":"Gender"},
        "index":{
            "": 0,
            "Male": 1,
            "Female": 2,
        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
            {"name": {"CN":"男性","EN":"Male"}, "value": "Male"},
            {"name": {"CN":"女性","EN":"Female"}, "value": "Female"},
        ]
    },
    "connectStatus": {
        "id": "connectStatusFilter",
        "name": "connectStatus",
        "title": {"CN":"设备状态","EN":"Equipment Status"},
        "index":{
            "": 0,
            "1": 1,
            "0": 2,
        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
            {"name": {"CN":"正常","EN":"Normal"}, "value": "1"},
            {"name": {"CN":"异常","EN":"Error"}, "value": "0"},
        ]
    },
    "IOresult": {
        "id": "IOresultFilter",
        "name": "IOresult",
        "title": {"CN":"I/O 出入结果","EN":"I/O Result"},
        "index":{
            "": 0,
            "in": 1,
            "out": 2,
            "other": 3,
        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
            {"name": {"CN":"进","EN":"In"}, "value": "in"},
            {"name": {"CN":"出","EN":"Out"}, "value": "out"},
            {"name": {"CN":"其他","EN":"Other"}, "value": "other"},
        ]
    },
    "cardId": {
        "id": "cardIdFilter",
        "name": "cardId",
        "title": {"CN":"卡片 ID","EN":"Card Id"},
        "index": {
            "": 0,
        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
        ]
    },
    "pluginsType":{
        "id": "pluginsTypeFilter",
        "name": "pluginsType",
        "title": {"CN":"档案类型","EN":"File Type"},
        "index": {
            "": 0,
            "0": 1,
            "1": 2
        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": ""},
            {"name": {"CN":"资料夹","EN":"Folder"}, "value": "0"},
            {"name": {"CN":"CSV","EN":"CSV"}, "value": "1"},
        ]
    },

    // select
    "alarmCategory":{
        "id": "alarmCategorySelect",
        "name": "alarmCategory",
        "title": {"CN":"警报类型","EN":"Alarm Category"},
        "index": {
            "": 0,
            "High": 1,
            "Medium": 2,
            "Low": 3,
        },
        "data": [
            {"name": {"CN":"----","EN":"----"}, "value": ""},
            {"name": {"CN":"高級","EN":"High"}, "value": "High"},
            {"name": {"CN":"中級","EN":"Medium"}, "value": "Medium"},
            {"name": {"CN":"低級","EN":"Low"}, "value": "Low"}
        ]
    },
    "alarmFunction":{
        "id": "alarmFunctionSelect",
        "name": "alarmFunction",
        "title": {"CN":"alarmFunction","EN":"alarmFunction"},
        "index": {
            "": 0,
            "-1": 1,
            "1": 2,
            "2": 3,
            "-2": 4,
            "-3": 5,
            "-4": 6,
            "-5": 7,
            "-6": 8,
            "0": 9,
        },
        "data": [
            {"name": {"CN":"----","EN":"----"}, "value": ""},
            {"name": {"CN":"僅需用Close核銷(API)","EN":"Alarm No Ack No Reset"}, "value": "-1"},
            {"name": {"CN":"需要一次簽核","EN":"Alarm Need Ack No Reset"}, "value": "1"},
            {"name": {"CN":"需要兩次簽核","EN":"Alarm Need Ack Need Reset"}, "value": "2"},
            {"name": {"CN":"僅需用Detection核銷(API)","EN":"Detection No Ack No Reset"}, "value": "-2"},
            {"name": {"CN":"派工且需兩次簽核","EN":"Dispatch Alarm Need Ack Need Reset"}, "value": "-3"},
            {"name": {"CN":"派工且需一次簽核","EN":"Dispatch Alarm Need Ack No Reset"}, "value": "-4"},
            {"name": {"CN":"派工進行中","EN":"Dispatch"}, "value": "-5"},
            {"name": {"CN":"自動核銷","EN":"Auto Confirm"}, "value": "-6"},
            {"name": {"CN":"狀態解除，如還存留，僅需用Close核銷(API)","EN":"Close"}, "value": "0"},
        ]
    },
    "accessLevelSelect": {
        "id": "accessLevelSelect",
        "name": "accessLevel",
        "title": {"CN":"帐号级别","EN":"Account Level"},
        "index": {
            "0": 0,
            "1": 1,
            "2": 2,
            "3": 3,
            "4": 4,
            "5": 5,
            "6": 6,
            "7": 7,
            "8": 8,
            "9": 9,
            "10": 10,
            "11": 11,
            "12": 12,
        },
        "data": [
            {"name": {"CN":"NADI","EN":"NADI"}, "value": "0"},
            {"name": {"CN":"NADI_Agent","EN":"NADI_Agent"}, "value": "1"},
            {"name": {"CN":"Sptel_Manager","EN":"Sptel_Manager"}, "value": "2"},
            {"name": {"CN":"Sptel_Oprator","EN":"Sptel_Oprator"}, "value": "3"},
            {"name": {"CN":"Oprator","EN":"Oprator"}, "value": "4"},
            {"name": {"CN":"TestMerge01","EN":"TestMerge01"}, "value": "5"},
            {"name": {"CN":"TestMerge02","EN":"TestMerge02"}, "value": "6"},
            {"name": {"CN":"Sptel_AMS","EN":"Sptel_AMS"}, "value": "7"},
            {"name": {"CN":"AAAaAAAATaAAAa5","EN":"AAAaAAAATaAAAa5"}, "value": "8"},
            {"name": {"CN":"InsertAlarmTemplate","EN":"InsertAlarmTemplate"}, "value": "9"},
            {"name": {"CN":"AAAaAAAAAAAATaAAAa5","EN":"AAAaAAAAAAAATaAAAa5"}, "value": "10"},
            {"name": {"CN":"IBMS_Admin","EN":"IBMS_Admin"}, "value": "11"},
            {"name": {"CN":"IBMS_Property_Manager","EN":"IBMS_Property_Manager"}, "value": "12"},
        ]
    },
    "accountStatus_select": {
        "id": "accountStatusSelect",
        "name": "accountStatus",
        "title": {"CN":"帐号状态","EN":"Account Status"},
        "index": {
            "1": 0,
            "2": 1,
            "3": 2,
            "4": 3
        },
        "data": [
            {"name": {"CN":"正常","EN":"Activate"}, "value": "1"},
            {"name": {"CN":"冻结","EN":"Frozen"}, "value": "2"},
            {"name": {"CN":"停用","EN":"Stop"}, "value": "3"},
            {"name": {"CN":"删除(不可复权)","EN":"Delete"}, "value": "4"},
        ]
    },
    "chargingStation":{
        "id": "chargingStationFilter",
        "name": "chargingStation",
        "title": {"CN":"充电站","EN":"Charging Station"},
        "index": {
            "1": 0
        },
        "data": [
            {"name": {"CN":"远企大楼","EN":"Far East Building"}, "value": "1"}
        ]
    },
    "charger":{
        "id": "chargerFilter",
        "name": "charger",
        "title": {"CN":"充电桩","EN":"charger"},
        "index": {
            "all": 0,
            "B1-1": 1,
            "B1-2": 2,
            "B1-3": 3,
            "B1-4": 4,
            "B2-1": 5,
            "B2-2": 6,
            "B2-3": 7,
            "B2-4": 8,
            "B2-5": 9,
            "B2-6": 10,
            "B2-7": 11,
            "B2-8": 12,
            "B2-9": 13,
            "B3-1": 14,
            "B3-2": 15,
            "B3-3": 16,
            "B3-4": 17,
            "B3-5": 18,
            "B3-6": 19,
            "B3-7": 20,
            "B3-8": 21,
            "B3-9": 22,
            "B3-10": 23,
            "B3-11": 24,

        },
        "data": [
            {"name": {"CN":"全部","EN":"All"}, "value": "all"},
            {"name": {"CN":"B1-1","EN":"B1-1"}, "value": "B1-1"},
            {"name": {"CN":"B1-2","EN":"B1-2"}, "value": "B1-2"},
            {"name": {"CN":"B1-3","EN":"B1-3"}, "value": "B1-3"},
            {"name": {"CN":"B1-4","EN":"B1-4"}, "value": "B1-4"},
            {"name": {"CN":"B2-1","EN":"B2-1"}, "value": "B2-1"},
            {"name": {"CN":"B2-2","EN":"B2-2"}, "value": "B2-2"},
            {"name": {"CN":"B2-3","EN":"B2-3"}, "value": "B2-3"},
            {"name": {"CN":"B2-4","EN":"B2-4"}, "value": "B2-4"},
            {"name": {"CN":"B2-5","EN":"B2-5"}, "value": "B2-5"},
            {"name": {"CN":"B2-6","EN":"B2-6"}, "value": "B2-6"},
            {"name": {"CN":"B2-7","EN":"B2-7"}, "value": "B2-7"},
            {"name": {"CN":"B2-8","EN":"B2-8"}, "value": "B2-8"},
            {"name": {"CN":"B2-9","EN":"B2-9"}, "value": "B2-9"},
            {"name": {"CN":"B3-1","EN":"B3-1"}, "value": "B3-1"},
            {"name": {"CN":"B3-2","EN":"B3-2"}, "value": "B3-2"},
            {"name": {"CN":"B3-3","EN":"B3-3"}, "value": "B3-3"},
            {"name": {"CN":"B3-4","EN":"B3-4"}, "value": "B3-4"},
            {"name": {"CN":"B3-5","EN":"B3-5"}, "value": "B3-5"},
            {"name": {"CN":"B3-6","EN":"B3-6"}, "value": "B3-6"},
            {"name": {"CN":"B3-7","EN":"B3-7"}, "value": "B3-7"},
            {"name": {"CN":"B3-8","EN":"B3-8"}, "value": "B3-8"},
            {"name": {"CN":"B3-9","EN":"B3-9"}, "value": "B3-9"},
            {"name": {"CN":"B3-10","EN":"B3-10"}, "value": "B3-10"},
            {"name": {"CN":"B3-11","EN":"B3-11"}, "value": "B3-11"},
        ]
    },
    "colorCode": {
        "id": "colorCodeSelect",
        "name": "colorCode",
        "title": {"CN": "颜色代号", "EN": "ColorCode"},
        "index": {
            '[#8000FF, #FF0000]': 0,
            '[#FF0000]': 1,
            '[#FF0000, #EC8E00]': 2,
            '[#EC8E00]': 3,
            '[#EC8E00, #FFF963]': 4,
            '[#FFF963]': 5,
            '[#FFF963, #FF63EF]': 6,
            '[#FF63EF]': 7,
            '[#FF63EF, #00E0FF]': 8,
            '[#00E0FF]': 9,
            '[#00E0FF, #98EDC3]': 10,
            '[#98EDC3]': 11,
        },
        "data": [
            {"name": {"CN": "purpleRed", "EN": "purpleRed"}, "value": '[#8000FF, #FF0000]'},
            {"name": {"CN": "red", "EN": "red"}, "value": '[#FF0000]'},
            {"name": {"CN": "redOrange", "EN": "redOrange"}, "value": '[#FF0000, #EC8E00]'},
            {"name": {"CN": "orange", "EN": "orange"}, "value": '[#EC8E00]'},
            {"name": {"CN": "orangeYellow", "EN": "orangeYellow"}, "value": '[#EC8E00, #FFF963]'},
            {"name": {"CN": "yellow", "EN": "yellow"}, "value": '[#FFF963]'},
            {"name": {"CN": "yellowMagenta", "EN": "yellowMagenta"}, "value": '[#FFF963, #FF63EF]'},
            {"name": {"CN": "magenta", "EN": "magenta"}, "value": '[#FF63EF]'},
            {"name": {"CN": "magentaCyne", "EN": "magentaCyne"}, "value": '[#FF63EF, #00E0FF]'},
            {"name": {"CN": "cyne", "EN": "cyne"}, "value": '[#00E0FF]'},
            {"name": {"CN": "cyneMint", "EN": "cyneMint"}, "value": '[#00E0FF, #98EDC3]'},
            {"name": {"CN": "mint", "EN": "mint"}, "value": '[#98EDC3]'},
        ]
    },
}

export {allConditionData}
