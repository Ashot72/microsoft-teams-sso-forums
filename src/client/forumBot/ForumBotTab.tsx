/* eslint-disable */
import * as React from "react"
import { Provider, Flex, Text, Header } from "@fluentui/react-northstar"
import { useTeams } from "msteams-react-base-component"
import { useState, useEffect } from "react"
import * as microsoftTeams from "@microsoft/teams-js"

/**
 * Implementation of the forumBot content page
 */
export const ForumBotTab = () => {
    const [{ inTeams, theme }] = useTeams()

    useEffect(() => {
        if (inTeams === true) {
            microsoftTeams.appInitialization.notifySuccess()
        }
    }, [inTeams])

    return (
        <Provider theme={theme}>
            <Flex fill={true} column styles={{
                padding: ".8rem 0 .8rem .5rem"
            }}>
                <Flex.Item>
                    <Header content="Welcome to the Forum Bot bot page" />
                </Flex.Item>
                <Flex.Item>
                    <div>
                        <Text content="TODO: Add you content here" />
                    </div>
                </Flex.Item>
                <Flex.Item styles={{
                    padding: ".8rem 0 .8rem .5rem"
                }}>
                    <Text size="smaller" content="(C) Copyright LT" />
                </Flex.Item>
            </Flex>
        </Provider>
    )
}
