/* eslint-disable */
import * as React from "react";
import { useState, useEffect } from "react"
import { FormInput } from "@fluentui/react-northstar"
import * as microsoftTeams from "@microsoft/teams-js"

import strings from '../../strings'

export const Config = () => {
    const [name, setName] = useState<string>(strings.Forum)

    useEffect(() => {
        microsoftTeams.initialize()
        microsoftTeams.settings.setValidityState(true)
    }, [])

    useEffect(() => {
        microsoftTeams.settings.registerOnSaveHandler((saveEvent: any) => {
            microsoftTeams.settings.setSettings({
                contentUrl: `https://${process.env.HOSTNAME}/forumTab`,
                entityId: "basicForumTab",
                suggestedDisplayName: name
            })

            saveEvent.notifySuccess()
        })
    }, [name])

    return (
        <div>
            <h1 style={{ color: "#6264a7" }}>{strings.DefaultTabDisplayName}</h1>
            <div style={{ textAlign: "center" }}>
                <FormInput
                    label={strings.TabDisplayName}
                    value={name}
                    onChange={(e: any) => setName(e.target.value)}
                />
            </div>
        </div>
    )
}
