/* eslint-disable */
import { BotDeclaration, PreventIframe, MessageExtensionDeclaration } from "express-msteams-host"
import {
    CardFactory,
    TurnContext,
    MemoryStorage,
    ConversationState,
    TeamsActivityHandler,
    MessageFactory,
    TeamsInfo
} from "botbuilder"
import { InvokeResponse } from "botbuilder"
const storage = require("localStorage")

import {
    CategoriesCard,
    EmailCard,
    YammerCard,
    PopularForumsCard
} from "./dialogs"
import { path } from "./helper/imagePath"
import ForumMessageExtension from "../forumMessageExtension/ForumMessageExtension"
import axiosInstance from "../axios"
import { teams_forums } from '../../lists'

@BotDeclaration(
    "/api/messages",
    new MemoryStorage(),
    process.env.MICROSOFT_APP_ID,
    process.env.MICROSOFT_APP_PASSWORD)
@PreventIframe("/forumBot/forumBot.html")
export class ForumBot extends TeamsActivityHandler {
    private readonly conversationState: ConversationState
    /** Local property for ForumMessageExtension */
    @MessageExtensionDeclaration("forumMessageExtension")
    private _forumMessageExtension: ForumMessageExtension


    public constructor(conversationState: ConversationState) {
        super()
        // Message extension ForumMessageExtension
        this._forumMessageExtension = new ForumMessageExtension()
        this.conversationState = conversationState

        this.onMessageActivity = (async (context: TurnContext): Promise<void> => {

            if (context.activity.value) {
                const { value, from } = context.activity

                const mention = {
                    mentioned: from,
                    text: `<at>${from.name}</at>`,
                    type: "mention"
                }

                const member = await TeamsInfo.getMember(context, context.activity.from.id)

                switch (value.category) {
                    case "about":
                        await context.sendActivity("This is a Basic Forums Microsoft Teams App using SharePoint Lists as backend.")
                        await context.sendActivity("You can buy Social Squared from Lightning Tools as a full featured Microsoft Teams discussion board app.")

                        const topics = CardFactory.heroCard('Social Squared Disucssion Board', [path("socialsquared.png")],
                            [
                                {
                                    type: "invoke",
                                    title: "Watch Social Squared Disucssion Board Video",
                                    value: { type: "task/fetch", videoId: "nWFxJGi5_Xw", action: "watchYoutube" }
                                }
                            ]
                        )
                        await context.sendActivity({ attachments: [topics] })
                        break
                    case "titles":
                        const authMessage = "Please go to Forum's tab first to authenticate."
                        try {
                            const siteUrl = this.getStorageSiteUrl()
                            const accessToken = this.getStorageToken()

                            if (!siteUrl || !accessToken) {
                                await context.sendActivity(authMessage)
                            } else {
                                const response: any = await axiosInstance(siteUrl, accessToken).get(`/_api/web/lists/GetByTitle('${teams_forums}')/items`)
                                try {
                                    const data = response.data.d.results
                                    const forums: string = data.map(forum => `<b><i>${forum.Title}</i></b>`).join(" | ")
                                    await context.sendActivity(forums)
                                }
                                catch (err) {
                                    console.log("getBotForums: ", err)
                                    await context.sendActivity(`${err.message}. authMessage`)
                                }
                            }
                        } catch (err) {
                            console.log("getAccessToken: ", err)
                            await context.sendActivity(`${err.message}. authMessage`)
                        }
                        break
                    case "notifications":
                        await context.sendActivity("We will email you when new features are available.")

                        const mailCard = CardFactory.adaptiveCard(EmailCard(member.email))
                        await context.sendActivity({ attachments: [mailCard] })
                        break

                    case "yammer":
                        const yammerCard = CardFactory.adaptiveCard(YammerCard)
                        await context.sendActivity({ attachments: [yammerCard] })
                        break

                    case "popularForums":
                        const popularForumsCard = CardFactory.adaptiveCard(PopularForumsCard())
                        await context.sendActivity({ attachments: [popularForumsCard] })
                        break

                    default:
                        if (value.email) {
                            const replyActivity = MessageFactory.text(`Thank You ${mention.text}! We will notify you ${value.email}`)
                            replyActivity.entities = [mention]
                            await context.sendActivity(replyActivity)
                        }
                        else if (value.PopularForums) {
                            const { PopularForums } = value
                            const replyActivity = MessageFactory.text(`Thank You ${mention.text}! You selected ${PopularForums} '${value[PopularForums]}'. We will notify you ${member.email}`)
                            replyActivity.entities = [mention]
                            await context.sendActivity(replyActivity)
                        }
                        else {
                            await context.sendActivity("I'm terribccly sorry, but my developer hasn't trained me to do anything yet...")
                        }
                        break
                }
            }
            else {
                if (context.activity.text) {
                    await context.sendActivity("I'm here to help you.")
                    const categoriesCard = CardFactory.adaptiveCard(CategoriesCard)
                    await context.sendActivity({ attachments: [categoriesCard] })
                }
            }

            return this.conversationState.saveChanges(context)
        })

        this.onInvokeActivity = async (context: TurnContext): Promise<InvokeResponse> => {
            let responseBody: any

            const watchYoutubeResponse = (videoId: string) => ({
                task: {
                    type: "continue",
                    value: {
                        width: 1000,
                        height: 700,
                        title: "YouTube Player",
                        url: `https://${process.env.HOSTNAME}/player.html?vid=${videoId}`,
                    },
                },
            })

            switch (context.activity.name) {
                case "task/fetch":
                    const taskData = context.activity.value.data
                    switch (taskData.action) {
                        case "watchYoutube":
                            responseBody = watchYoutubeResponse(taskData.videoId)
                            break
                    }
                    break
            }

            return { status: 200, body: responseBody }
        }
    }

    private getStorageInfo = () => {
        const userId = storage.getItem("userId")
        return JSON.parse(storage.getItem(userId))
    }

    private getStorageToken = () => this.getStorageInfo().accessToken

    private getStorageSiteUrl = () => this.getStorageInfo().siteUrl
}
