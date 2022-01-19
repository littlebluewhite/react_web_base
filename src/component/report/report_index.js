import {Redirect, Route, Switch} from "react-router-dom";
import {useTemplate,} from "../../function/usePackage";
import {ReportAlarmStatisticArticle} from "./report_alarm";
import {ReportAccountReportArticle} from "./report_account";
import {ReportAccessControlReportArticle} from "./report_access";
import {ReportChargerArticle} from "./report_charger";
import {ReportVisitorArticle} from "./report_visitor";

function ReportArticle(){
    const template = useTemplate()
    return(
        <div className={"article_container1"}>
            <Switch>
                {!template.Account_Plugin.IBMS_Reoprt_R && <Redirect to={"/"}/>}
                <Redirect exact from={"/report"} to={"/report/alarmStatistic"}/>
                <Route path={"/report/alarmStatistic"}>
                    <ReportAlarmStatisticArticle/>
                </Route>
                <Route path={"/report/accountReport"}>
                    <ReportAccountReportArticle/>
                </Route>
                <Route path={"/report/accessControlReport"}>
                    <ReportAccessControlReportArticle/>
                </Route>
                <Route path={"/report/chargerReport"}>
                    <ReportChargerArticle/>
                </Route>
                <Route path={"/report/VisitorReport"}>
                    <ReportVisitorArticle/>
                </Route>
            </Switch>
        </div>
    )
}

export {ReportArticle};
