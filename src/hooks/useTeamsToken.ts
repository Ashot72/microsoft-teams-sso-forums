/* eslint-disable */
import { useEffect, useState } from "react"
import { useTeams } from "msteams-react-base-component"
import * as microsoftTeams from "@microsoft/teams-js"
import jwtDecode from "jwt-decode"

import strings from '../strings'

const useTeamsToken = () => {
    const [{ inTeams, theme, context }] = useTeams()
    const [teamsError, setTeamsError] = useState<string>()
    const [ssoToken, setSsoToken] = useState<string>("")
    const [userName, setUserName] = useState<string>("")
    const [email, setEmail] = useState<string>("")

    useEffect(() => {
        if (inTeams === true) {
            microsoftTeams.authentication.getAuthToken({
                successCallback: (token: string) => {
                    const decoded: { [key: string]: any } = jwtDecode(token) as { [key: string]: any }
                    setUserName(decoded.name)
                    setEmail(decoded.unique_name)
                    setSsoToken(token)
                    microsoftTeams.appInitialization.notifySuccess()
                },
                failureCallback: (message: string) => {
                    setTeamsError(message)
                    microsoftTeams.appInitialization.notifyFailure({
                        reason: microsoftTeams.appInitialization.FailedReason.AuthFailed,
                        message
                    })
                },
                resources: [`api://${process.env.HOSTNAME}/${process.env.GRAPH_APP_ID}`]
            })
        } else {
            console.log(strings.NotInTeams)
        }
    }, [inTeams])

    return { ssoToken, theme, context, teamsError, userName, email }
}

export default useTeamsToken