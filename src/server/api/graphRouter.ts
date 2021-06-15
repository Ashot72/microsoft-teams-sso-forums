/* eslint-disable */
import express = require('express')
import passport = require('passport')
import { BearerStrategy, VerifyCallback, IBearerStrategyOption, ITokenPayload } from 'passport-azure-ad'
import axios from 'axios'
import qs = require('querystring')
import * as debug from 'debug'
const log = debug('graphRouter')
const storage = require("localStorage")

import axiosInstance from "../axios"
import { teams_forums, teams_posts, teams_topics } from "../../lists"
import CustomListGenerator from '../CustomListGenerator'

export const graphRouter = (): express.Router => {
    const customListGenerator = new CustomListGenerator()
    const router = express.Router()

    // Set up the Bearer Strategy
    const bearerStrategy = new BearerStrategy({
        identityMetadata: "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
        clientID: process.env.GRAPH_APP_ID as string,
        audience: `api://${process.env.HOSTNAME}/${process.env.GRAPH_APP_ID}`,
        loggingLevel: "info",
        loggingNoPII: false,
        validateIssuer: false,
        passReqToCallback: false
    } as IBearerStrategyOption,
        (token: ITokenPayload, done: VerifyCallback) => {
            done(null, { tid: token.tid, name: token.name, upn: token.upn }, token)
        }
    )
    const pass = new passport.Passport()
    router.use(pass.initialize())
    pass.use(bearerStrategy)

    const exchangeForToken = (tid: string, token: string, scopes: string[]): Promise<string> => {
        return new Promise((resolve, reject) => {
            const url = `https://login.microsoftonline.com/${tid}/oauth2/v2.0/token`
            const params = {
                client_id: process.env.GRAPH_APP_ID,
                client_secret: process.env.GRAPH_APP_SECRET,
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: token,
                requested_token_use: "on_behalf_of",
                scope: scopes.join(" ")
            }

            axios.post(url,
                qs.stringify(params), {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(result => {
                if (result.status !== 200) {
                    reject(result)
                    log(result.statusText)
                } else {
                    resolve(result.data.access_token)
                }
            }).catch(err => {
                // error code 400 likely means you have not done an admin consent on the app
                log("exchangeForToken:", err.response.data)
                reject(err)
            })
        })
    }

    const getAccessToken = async (req, userId) =>
        await exchangeForToken(userId,
            req.header("Authorization")!.replace("Bearer ", "") as string,
            ["https://lightningtoolsdev.sharepoint.com/Sites.Manage.All"]
        )

    const getStorageToken = () => {
        const userId = storage.getItem("userId")
        const info = JSON.parse(storage.getItem(userId))
        return info.accessToken
    }

    const metadata = (data, list) =>
        JSON.stringify({
            __metadata: {
                type: `SP.Data.${list.replace("_", "_x005f_")}ListItem`
            },
            ...data
        })

    const sendError = (err: any, res: any) => {
        err.status
            ? res.status(err.status).send(err.message)
            : res.status(500).send(err)
    }

    const deleteItem = (siteurl, accessToken, list, id): Promise<any> =>
        axiosInstance(siteurl, accessToken).delete(`/_api/web/lists/GetByTitle('${list}')/items(${id})`)

    router.get(
        "/checkList",
        pass.authenticate("oauth-bearer", { session: false }),
        async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const { user, headers: { siteurl } } = req as any

            try {
                const accessToken = await getAccessToken(req, user.tid)
                storage.setItem("userId", user.tid)
                storage.setItem([user.tid], JSON.stringify({ accessToken, siteUrl: siteurl }))

                customListGenerator.checkLists(accessToken, siteurl)
                    .then((exists: boolean) => {
                        exists
                            ? res.sendStatus(200)
                            : res.sendStatus(201)
                    })
                    .catch(err => {
                        console.log("checkList: " + err)
                        sendError(err, res)
                    })
            } catch (err) {
                console.log("getAccessToken: ", err)
                sendError(err, res)
            }
        }
    ),
        router.post(
            "/genLists",
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                customListGenerator.generateLists()
                    .then(() => res.sendStatus(201))
                    .catch(err => {
                        console.log("genLists: " + err)
                        sendError(err, res)
                    })
            }
        ),
        router.get(
            "/getByForum",
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const { headers: { siteurl }, query: { forumId, list } } = req as any
                try {
                    const accessToken = getStorageToken()

                    axiosInstance(siteurl, accessToken).get(`/_api/web/lists/GetByTitle('${list}')/items?$filter=ForumId eq ${forumId}`
                    ).then(response => res.json(response.data.d.results))
                        .catch(err => {
                            console.log("getByForum: ", err)
                            sendError(err, res)
                        })
                } catch (err) {
                    console.log("getStorageToken: ", err)
                    sendError(err, res)
                }
            }
        ),
        router.get(
            "/getPostsByTopicId",
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const { headers: { siteurl }, query: { topicId, list } } = req as any
                try {
                    const accessToken = getStorageToken()
                    axiosInstance(siteurl, accessToken).get(`/_api/web/lists/GetByTitle('${teams_posts}')/items?$filter=TopicId eq ${topicId}`
                    ).then(response => res.json(response.data.d.results))
                        .catch(err => {
                            console.log("getByTopic: ", err)
                            sendError(err, res)
                        })
                } catch (err) {
                    console.log("getStorageToken: ", err)
                    sendError(err, res)
                }
            }
        ),
        router.get(
            "/getItems",
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const { headers: { siteurl }, query: { filter, list } } = req as any
                try {
                    const accessToken = getStorageToken()
                    axiosInstance(siteurl, accessToken).get(`/_api/web/lists/GetByTitle('${list}')/items${filter}`)
                        .then(response => res.json(response.data.d.results))
                        .catch(err => {
                            console.log("getItems: ", err)
                            sendError(err, res)
                        })
                } catch (err) {
                    console.log("getStorageToken: ", err)
                    sendError(err, res)
                }
            }
        ),
        router.post("/addListItem",
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const { headers: { siteurl }, body: { list, item } } = req as any
                try {
                    const accessToken = getStorageToken()
                    axiosInstance(siteurl, accessToken).post(`/_api/web/lists/GetByTitle('${list}')/items`,
                        metadata(
                            item,
                            list
                        ))
                        .then(response => res.json(response.data.d))
                        .catch(err => {
                            console.log("addListItem: ", err)
                            sendError(err, res)
                        });
                } catch (err) {
                    console.log("getStorageToken: ", err)
                    sendError(err, res)
                }
            }),
        router.patch("/updateListItem",
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const { headers: { siteurl }, body: { list, item } } = req as any

                try {
                    const accessToken = getStorageToken()
                    axiosInstance(siteurl, accessToken).patch(`/_api/web/lists/GetByTitle('${list}')/items(${item.Id})`,
                        metadata(
                            item,
                            list
                        ))
                        .then(() => res.sendStatus(200))
                        .catch(err => {
                            console.log("updateListItem: ", err)
                            sendError(err, res)
                        });
                } catch (err) {
                    console.log("getStorageToken: ", err)
                    sendError(err, res)
                }
            }),
        router.post("/deleteForum",
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const { headers: { siteurl }, body: { item } } = req as any
                try {
                    const accessToken = getStorageToken()
                    const topics = axiosInstance(siteurl, accessToken).get(`/_api/web/lists/GetByTitle('${teams_topics}')/items?$filter=ForumId eq ${item.Id}`)
                    const posts = axiosInstance(siteurl, accessToken).get(`/_api/web/lists/GetByTitle('${teams_posts}')/items?$filter=ForumId eq ${item.Id}`)

                    axios.all([topics, posts])
                        .then(async ([t, p]) => {
                            deleteItem(siteurl, accessToken, teams_forums, item.Id)
                                .then(() => {
                                    try {
                                        t.data.d.results.forEach(async topic => await deleteItem(siteurl, accessToken, teams_topics, topic.Id))
                                        p.data.d.results.forEach(async post => await deleteItem(siteurl, accessToken, teams_posts, post.Id))
                                        res.sendStatus(204)
                                    } catch (err) {
                                        console.log("deleteForum - Topics and Posts: ", err)
                                        sendError(err, res)
                                    }
                                })
                                .catch((err) => {
                                    console.log("deleteForum: ", err)
                                    sendError(err, res)
                                })
                        })
                        .catch(err => {
                            console.log("deleteForum - Get Topics and Posts: ", err)
                            sendError(err, res)
                        })

                } catch (err) {
                    console.log("getStorageToken: ", err)
                    sendError(err, res)
                }
            }),
        router.post("/deleteTopic",
            async (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const { headers: { siteurl }, body: { item } } = req as any
                try {
                    const accessToken = getStorageToken()
                    const posts = await axiosInstance(siteurl, accessToken).get(`/_api/web/lists/GetByTitle('${teams_posts}')/items?$filter=TopicId eq ${item.Id}`)
                    deleteItem(siteurl, accessToken, teams_topics, item.Id)
                        .then(() => {
                            try {
                                posts.data.d.results.forEach(async post => await deleteItem(siteurl, accessToken, teams_posts, post.Id))
                                res.sendStatus(204)
                            } catch (err) {
                                console.log("deleteTopic - Posts: ", err)
                                sendError(err, res)
                            }
                        })
                        .catch((err) => {
                            console.log("deleteTopic: ", err)
                            sendError(err, res)
                        })
                } catch (err) {
                    console.log("getStorageToken and Get Posts: ", err)
                    sendError(err, res)
                }
            }),
        router.post("/deletePost",
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                const { headers: { siteurl }, body: { item } } = req as any
                try {
                    const accessToken = getStorageToken()
                    deleteItem(siteurl, accessToken, teams_posts, item.Id)
                        .then(() => res.sendStatus(204))
                        .catch((err) => {
                            console.log("deletePost: ", err)
                            sendError(err, res)
                        })
                } catch (err) {
                    console.log("getStorageToken: ", err)
                    sendError(err, res)
                }
            })

    return router
}