import {useTemplate} from "../../function/usePackage";
import {Redirect, Route, Switch} from "react-router-dom";
import {AccountSettingUserListIndex} from "./accountSetting_userList";
import {AccountSettingPluginsIndex} from "./accountSetting_plugins";
import {AccountSettingGroupIndex} from "./accountSetting_group";

function AccountSettingArticle(){
    const template = useTemplate()
    return(
        <div className={"article_container1"}>
            <Switch>
                {!template.Account_Plugin.IBMS_Account_R &&
                <Redirect to={"/"}/>}
                <Redirect exact from={"/accountSetting"} to={{pathname: "/accountSetting/userList"}}/>
                <Route path={"/accountSetting/userList"}>
                    <AccountSettingUserListIndex/>
                </Route>
                <Route path={"/accountSetting/plugins"}>
                    <AccountSettingPluginsIndex/>
                </Route>
                <Route path={"/accountSetting/group"}>
                    <AccountSettingGroupIndex/>
                </Route>
            </Switch>
        </div>
    )
}

export {AccountSettingArticle}