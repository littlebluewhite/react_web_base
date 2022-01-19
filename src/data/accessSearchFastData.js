import {fastDataGetFormat, fastDataGetTimeStamp} from "../function/fastDataFunction";


const accessSearchFastData = [
    {"name": {"CN":"现时报表","EN":"Latest Report"}, "type": "instant", "start": 0, "end": 0, "title": {"CN":"现时","EN":"Latest "}},
    {"name": {"CN":fastDataGetFormat(0),"EN":fastDataGetFormat(0)}, "type": "period", "start": fastDataGetTimeStamp(0), "end": new Date().getTime()/1000, "title": {"CN":fastDataGetFormat(0),"EN":fastDataGetFormat(0)}},
    {"name": {"CN":fastDataGetFormat(1),"EN":fastDataGetFormat(1)}, "type": "period", "start": fastDataGetTimeStamp(1), "end": fastDataGetTimeStamp(0)-1, "title": {"CN":fastDataGetFormat(1),"EN":fastDataGetFormat(1)}},
    {"name": {"CN":fastDataGetFormat(2),"EN":fastDataGetFormat(2)}, "type": "period", "start": fastDataGetTimeStamp(2), "end": fastDataGetTimeStamp(1)-1, "title": {"CN":fastDataGetFormat(2),"EN":fastDataGetFormat(2)}},
    {"name": {"CN":fastDataGetFormat(3),"EN":fastDataGetFormat(3)}, "type": "period", "start": fastDataGetTimeStamp(3), "end": fastDataGetTimeStamp(2)-1, "title": {"CN":fastDataGetFormat(3),"EN":fastDataGetFormat(3)}},
    {"name": {"CN":fastDataGetFormat(4),"EN":fastDataGetFormat(4)}, "type": "period", "start": fastDataGetTimeStamp(4), "end": fastDataGetTimeStamp(3)-1, "title": {"CN":fastDataGetFormat(4),"EN":fastDataGetFormat(4)}},
    {"name": {"CN":fastDataGetFormat(5),"EN":fastDataGetFormat(5)}, "type": "period", "start": fastDataGetTimeStamp(5), "end": fastDataGetTimeStamp(4)-1, "title": {"CN":fastDataGetFormat(5),"EN":fastDataGetFormat(5)}},
]

export {accessSearchFastData}
