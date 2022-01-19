import {fastDataGetFormat} from "../function/fastDataFunction";

const visitorFastData = [
    {"name": {"CN":"以日为单位","EN":"Sort by Day"}, "value": "0", "type": "day", "start": 5, "end": 0},
    {"name": {"CN":"以周为单位","EN":"Sort by Week"}, "value": "1", "type": "week", "start": "lastYear", "end": 0},
    {"name": {"CN":"以月为单位","EN":"Sort by Month"}, "value": "2", "type": "month", "start": "lastYear", "end": 0},
    {"name": {"CN":fastDataGetFormat(1),"EN":fastDataGetFormat(1)}, "value": "3", "type": "day", "start": 6, "end": 1},
    {"name": {"CN":fastDataGetFormat(2),"EN":fastDataGetFormat(2)}, "value": "4", "type": "day", "start": 7, "end": 2},
    {"name": {"CN":fastDataGetFormat(3),"EN":fastDataGetFormat(3)}, "value": "5", "type": "day", "start": 8, "end": 3},
    {"name": {"CN":fastDataGetFormat(4),"EN":fastDataGetFormat(4)}, "value": "6", "type": "day", "start": 9, "end": 4},
]

export{visitorFastData}