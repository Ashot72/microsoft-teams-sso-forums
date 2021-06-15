/* eslint-disable */
import * as debug from "debug"
import { PreventIframe } from "express-msteams-host"
import { TurnContext, CardFactory, MessagingExtensionQuery, MessagingExtensionResult } from "botbuilder"
import { IMessagingExtensionMiddlewareProcessor } from "botbuilder-teams-messagingextensions"
const storage = require("localStorage")

import axiosInstance from "../axios"
import { teams_topics, teams_posts } from '../../lists'

// Initialize debug logging module
const log = debug("msteams")

@PreventIframe("/forumMessageExtension/config.html")
export default class ForumMessageExtension implements IMessagingExtensionMiddlewareProcessor {

    public async onQuery(context: TurnContext, query: MessagingExtensionQuery): Promise<MessagingExtensionResult> {

        try {
            const siteUrl = this.getStorageSiteUrl()
            const accessToken = this.getStorageToken()

            if (!siteUrl || !accessToken) {
                return this.sendErrorCard()
            } else {
                const searchQuery = (query as any).parameters[0].value
                const response: any = await axiosInstance(siteUrl, accessToken).get(`/_api/web/lists/GetByTitle('${teams_topics}')/items?$filter=substringof('${searchQuery}',Title)`)
                try {
                    const data = response.data.d.results
                    const herocards: any = []

                    data.forEach(topic => {
                        const card = CardFactory.heroCard(
                            topic.Title,
                            topic.Description,
                            [],
                            CardFactory.actions([
                                {
                                    type: "invoke",
                                    title: "Retrieve Posts",
                                    value: { "topicId": topic.Id }
                                }
                            ])
                        )
                        herocards.push(card)
                    })

                    return Promise.resolve({
                        type: "result",
                        attachmentLayout: "list",
                        attachments: [...herocards]
                    } as MessagingExtensionResult)
                }
                catch (err) {
                    console.log("getBotForums: ", err)
                    return this.sendErrorCard(err.message)
                }
            }
        } catch (err) {
            console.log("getAccessToken: ", err)
            return this.sendErrorCard(err.message)
        }
    }

    public async onCardButtonClicked(context: TurnContext, value: any): Promise<void> {
        const siteUrl = this.getStorageSiteUrl()
        const accessToken = this.getStorageToken()

        const response: any = await axiosInstance(siteUrl, accessToken).get(`/_api/web/lists/GetByTitle('${teams_posts}')/items?$filter=TopicId eq ${context["_activity"].value.topicId}`)

        const data = response.data.d.results
        const posts: string[] = data.map(post => post.Content.replace(/<[^>]+>/g, ''))
        await context.sendActivity(posts.join(" <b>|</b> "))

        return Promise.resolve();
    }

    private sendErrorCard = (err: string = ""): Promise<MessagingExtensionResult> => {
        const authMessage = `${err} Please go to Forum's tab first to authenticate.`

        const attachment = CardFactory.heroCard(authMessage)

        return Promise.resolve({
            type: "result",
            attachmentLayout: "list",
            attachments: [
                attachment
            ]
        } as MessagingExtensionResult)
    }

    private getStorageInfo = () => {
        const userId = storage.getItem("userId")
        return JSON.parse(storage.getItem(userId))
    }

    private getStorageToken = () => this.getStorageInfo().accessToken

    private getStorageSiteUrl = () => this.getStorageInfo().siteUrl
}
