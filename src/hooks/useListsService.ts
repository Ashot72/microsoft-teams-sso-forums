/* eslint-disable */
import { Context } from "@microsoft/teams-js"
import { useState, useCallback } from "react"

import { IForum, ITopic } from "../reducers/reducers"
import { IPost } from '../reducers/postReducer'
import axiosInstance from "../client/axios"
import { teams_forums, teams_topics, teams_posts } from '../lists'

export let cache = {}

const updateCache = (title: string, id: number, item: any) => {
    if (cache[title]) {
        const cachedItem = cache[title].find(c => c.Id === id)
        if (cachedItem) {
            cache[title] = cache[title].map(i => i.Id === item.Id ? { ...i, ...item } : i)
        }
    }
}

const deleteFromCache = (title: string, id: number) => {
    if (cache[title]) {
        const cachedItem = cache[title].find(c => c.Id === id)
        if (cachedItem) {
            cache[title] = cache[title].filter(i => i.Id !== id)
        }
    }
}

export const useListsService = (ssoToken: string, context: Context | undefined, cached: boolean = false) => {
    const [data, setData] = useState([])
    const [error, setError] = useState()
    const [loading, setLoading] = useState(false)

    const getListItems = useCallback(async (list: string, filter: string = "") => {
        if (ssoToken && context) {
            setLoading(true)
            try {
                if (cached && cache[list]) {
                    setData(cache[list])
                    setLoading(false)
                } else {
                    const items = await axiosInstance(ssoToken, context).get(`api/getItems`, {
                        params: { list, filter }
                    })

                    const data = items.data
                    cache[list] = (data)
                    setData(data)
                    setLoading(false)
                }
            } catch (e) {
                setError(e)
                setLoading(false)
            }
        }
    }, [ssoToken, context, cached])

    const addListItem = async (list: string, item) => {
        setLoading(true)
        try {
            await axiosInstance(ssoToken, context).post("api/addListItem", { list, item })
            getListItems(list)
        } catch (e) {
            setError(e)
            setLoading(false)
        }
    }

    const updateListItem = async (list: string, item, loadList: any = list, filter = "") => {
        setLoading(true)
        try {
            await axiosInstance(ssoToken, context).patch("api/updateListItem", { list, item })
            if (loadList) {
                getListItems(loadList, filter)
            }
            //  updateCache(list, item.Id, item)
            // setLoading(false)
        } catch (e) {
            setError(e)
            setLoading(false)
        }
    }

    const updateForumInfo = async (forumId: number) => {
        const topicsByForum = axiosInstance(ssoToken, context).get("api/getByForum", {
            params: {
                forumId, list: teams_topics
            }
        })

        const postsByForum = axiosInstance(ssoToken, context).get("api/getByForum", {
            params: {
                forumId, list: teams_posts
            }
        })

        return Promise.all([topicsByForum, postsByForum])
            .then(async ([ts, ps]) => {
                const p = ps.data.length > 0 ? ps.data[ps.data.length - 1] : undefined

                const forum: Partial<IForum> =
                {
                    Id: forumId,
                    LastTopic: p ? p.Title : "",
                    LastForumId: p ? p.ForumId : 0,
                    LastTopicId: p ? p.TopicId : 0,
                    LastPosterName: p ? p.PosterName : "",
                    LastPosterEmail: p ? p.PosterEmail : "",
                    LastUpdate: p ? p.CreatedDate : 0,
                    Topics: ts.data.length,
                    Posts: ps.data.length
                }
                await axiosInstance(ssoToken, context).patch("api/updateListItem", { list: teams_forums, item: forum })
                updateCache(teams_forums, forumId, forum)
            })
            .catch(e => {
                setError(e)
                setLoading(false)
            })
    }

    const updateTopicInfo = async (topicId: number) => {
        const postsByTopicId = axiosInstance(ssoToken, context).get("api/getPostsByTopicId", {
            params: {
                topicId
            }
        })

        return postsByTopicId
            .then(async ps => {
                const p = ps.data[ps.data.length - 1]

                const topic: Partial<ITopic> = {
                    Id: topicId,
                    Replies: ps.data.length - 1,
                    LastPosterName: p.PosterName,
                    LastPosterEmail: p.PosterEmail,
                    LastUpdate: p.CreatedDate
                }
                await axiosInstance(ssoToken, context).patch("api/updateListItem", { list: teams_topics, item: topic })
            })

    }

    const addTopic = async (topic: ITopic, post: Partial<IPost>, filter: string) => {
        setLoading(true)
        try {
            const topicAdded = await axiosInstance(ssoToken, context).post("api/addListItem", { list: teams_topics, item: topic })
            post.TopicId = (topicAdded.data as ITopic).Id
            await axiosInstance(ssoToken, context).post("api/addListItem", { list: teams_posts, item: post })

            getListItems(teams_topics, filter)

            updateForumInfo(topic.ForumId)
            setLoading(false)
        } catch (e) {
            setError(e)
            setLoading(false)
        }
    }

    const addPost = async (post: IPost, filter: string) => {
        setLoading(true)
        try {
            await axiosInstance(ssoToken, context).post("api/addListItem", { list: teams_posts, item: post })
            getListItems(teams_posts, filter)

            updateForumInfo(post.ForumId)
            updateTopicInfo(post.TopicId)
        } catch (e) {
            setError(e)
            setLoading(false)
        }
    }

    const deleteForum = async (forumId: number) => {
        setLoading(true)
        try {
            await axiosInstance(ssoToken, context).post(`api/deleteForum`, { item: { Id: forumId } })
            deleteFromCache(teams_forums, forumId)
            setLoading(false)
        } catch (e) {
            setError(e)
            setLoading(false)
        }
    }

    const deleteTopic = async (forumId: number, topicId: number) => {
        setLoading(true)
        try {
            await axiosInstance(ssoToken, context).post(`api/deleteTopic`, { item: { Id: topicId } })
            setLoading(false)
            updateForumInfo(forumId)
        } catch (e) {
            setError(e)
            setLoading(false)
        }
    }

    const deletePost = async (forumId: number, topicId: number, postId: number, filter) => {
        setLoading(true)
        try {
            await axiosInstance(ssoToken, context).post(`api/deletePost`, { item: { Id: postId, TopicId: topicId } })
            getListItems(teams_posts, filter)
            updateForumInfo(forumId)
            updateTopicInfo(topicId)
        } catch (e) {
            setError(e)
            setLoading(false)
        }
    }

    return {
        data,
        loading,
        error,
        getListItems,
        addListItem,
        updateListItem,
        deleteForum,
        addTopic,
        addPost,
        deleteTopic,
        deletePost
    }
}