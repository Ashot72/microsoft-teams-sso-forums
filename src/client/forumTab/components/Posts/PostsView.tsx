
/* eslint-disable */
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Loader, Provider, Breadcrumb, ChevronEndMediumIcon } from "@fluentui/react-northstar"

import { IForum, ITopic } from '../../../../reducers/reducers'
import strings from '../../../../strings'
import { Actions } from '../../helpers/utils'
import Modal from '../../shared/Modal'
import { IPost } from '../../../../reducers/postReducer'
import { teams_topics, teams_posts } from '../../../../lists'
import Posts from './Posts'
import ForumsForm from '../../shared/ForumsForm'
import { useListsService, useFormState, useDispatch, useTeamsToken, useForumsState, useTopicsState } from '../../../../hooks'

interface IPostsView {
    match: any
}

const data = { title: '', description: '' }

const PostsView: React.FC<IPostsView> = ({ match: { params: { fid, tid } } }) => {

    const dispatch = useDispatch()
    const forums: IForum[] = useForumsState()
    const topics: ITopic[] = useTopicsState()

    const [updateTopicData, setUpdateTopicData] = useState<any>()
    const updateTopicState = useFormState(updateTopicData)

    const [replyPostData, setReplyPostData] = useState<any>()
    const replyPostState = useFormState(replyPostData)

    const [cached, setCached] = useState<boolean>(true)

    const history = useHistory()
    const { ssoToken, context, theme, teamsError, userName, email } = useTeamsToken()

    const { data: posts, loading, error, getListItems, addPost, updateListItem, deleteTopic, deletePost } = useListsService(ssoToken, context)

    const color = theme.siteVariables.bodyColor
    const navigate = path => history.push(path)

    const { Id: ForumId, Title: forumTitle } = forums.find(f => f.Id == fid) as IForum
    const { Id, Title, Description, CreatorName, Views } = topics.find(t => t.Id == tid) as ITopic
    const filter = `?$filter=TopicId eq ${tid}`

    useEffect(() => {
        const updatedTopicData = {
            id: Id,
            title: Title,
            description: Description
        }
        setUpdateTopicData(updatedTopicData)
    }, [])

    useEffect(() => {
        const repliedPostData = {
            id: Id,
            title: Title,
            description: ''
        }
        setReplyPostData(repliedPostData)
    }, [])

    useEffect(() => {
        if (ssoToken) {
            const topic = { Id: tid, Views: Views + 1 }
            updateListItem(teams_topics, topic, null, `?$filter=Id eq ${tid}`)
        }
    }, [ssoToken])

    useEffect(() => {
        if (ssoToken) {
            getListItems(teams_posts, filter)
        }
    }, [ssoToken, getListItems])

    useEffect(() => dispatch({ type: 'LOAD_POSTS', payload: posts }), [posts, dispatch])

    const setDefault = () => replyPostState.handleCustomBatch({ title: "", description: "" })

    const close = setOpen => {
        setDefault()
        setOpen(false)
    }

    const handleNewPostSubmit = async (setOpen) => {
        const crreatedDate = new Date().getTime()
        const { title, description } = replyPostState.state

        const post: IPost = {
            Title: title,
            ForumId: fid,
            PosterName: userName,
            PosterEmail: email,
            TopicId: tid,
            Content: description,
            Answered: false,
            CreatedDate: crreatedDate
        }

        await addPost(post, filter)
        close(setOpen)
    }

    const handleNewPostClose = async setOpen => {
        const { title, description, deleted } = replyPostData
        updateTopicState.handleCustomBatch({ title, description, deleted })
        setOpen(false)
    }

    const handleTopicUpdateSubmit = async setOpen => {
        const { id, title, description, deleted } = updateTopicState.state

        const topic: Partial<ITopic> = {
            Id: id,
            Title: title,
            Description: description
        }

        if (deleted) {
            await deleteTopic(fid, tid)
            history.push(`/topics/${fid}`)
        } else {
            await updateListItem(teams_topics, topic, teams_posts, filter)
            dispatch({ type: 'UPDATE_TOPIC', payload: topic })
            setOpen(false)
            setCached(false)
        }
    }

    const handleTopicUpdateClose = setOpen => {
        const { title, description, deleted } = updateTopicData
        updateTopicState.handleCustomBatch({ title, description, deleted })
        setOpen(false)
    }

    if (teamsError) {
        return <div className="error">{(teamsError)}</div>
    }

    if (error) {
        return <div className="error">{((error as any).message)}</div>
    }

    const replyPostModal = () =>
        <Modal title={strings.ReplyPost}>
            <ForumsForm
                title={strings.Subject}
                description={strings.Message}
                action={Actions.AddOrReply}
                formState={replyPostState}
                handleSubmit={handleNewPostSubmit}
                handleClose={handleNewPostClose}
            />
        </Modal>

    const updateTopicModal = () =>
        <Modal title={strings.UpdateTopic}>
            <ForumsForm
                title={strings.Title}
                description={strings.Description}
                action={Actions.Update}
                formState={updateTopicState}
                handleSubmit={handleTopicUpdateSubmit}
                handleClose={handleTopicUpdateClose}
            />
        </Modal>

    return (
        <Provider theme={theme}>
            {loading && <Loader label={strings.Wait} />}
            <Breadcrumb aria-label="breadcrumb">
                <Breadcrumb.Item>
                    <Breadcrumb.Link onClick={() => cached ? navigate("/?nav=1") : navigate("/")} style={{ cursor: "pointer", color }}>Forums</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Divider>
                    <ChevronEndMediumIcon />
                </Breadcrumb.Divider>
                <Breadcrumb.Item>
                    <Breadcrumb.Link onClick={() => cached ? navigate(`/topics/${ForumId}/?nav=1`) : navigate(`/topics/${ForumId}`)} style={{ cursor: "pointer", color }}>{forumTitle}</Breadcrumb.Link>
                </Breadcrumb.Item>
                <Breadcrumb.Divider>
                    <ChevronEndMediumIcon />
                </Breadcrumb.Divider>
                <Breadcrumb.Item aria-current="page">{Title}</Breadcrumb.Item>
            </Breadcrumb>

            <div className="title">
                {replyPostModal()}
                {
                    userName === CreatorName &&
                    <span>
                        &nbsp;|&nbsp;
                        {updateTopicModal()}
                    </span>
                }
            </div>
            <Posts
                fid={fid}
                tid={tid}
                filter={filter}
                posts={posts}
                updateListItem={updateListItem}
                deletePost={deletePost}
            />
        </Provider >
    )
}

export default PostsView