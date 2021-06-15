/* eslint-disable */
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Loader, Provider, Breadcrumb, ChevronEndMediumIcon } from "@fluentui/react-northstar"

import { IForum, ITopic } from '../../../../reducers/reducers'
import strings from '../../../../strings'
import { Actions } from '../../helpers/utils'
import { teams_forums, teams_topics } from '../../../../lists'
import Topics from './Topics'
import Modal from '../../shared/Modal'
import { IPost } from '../../../../reducers/postReducer'
import ForumsForm from '../../shared/ForumsForm'
import { useListsService, useFormState, useDispatch, useTeamsToken, useForumsState } from '../../../../hooks'

interface ITopicsView {
    location: any
    match: any
}

const data = { title: '', description: '' }

const TopicsView: React.FC<ITopicsView> = ({ location: { search }, match: { params: { fid } } }) => {

    const dispatch = useDispatch()
    const forums: IForum[] = useForumsState()
    const [updateForumData, setUpdateForumData] = useState<any>()
    const [cached, setCached] = useState<boolean>(true)
    const newTopicState = useFormState(data)
    const updateFormState = useFormState(updateForumData)
    const history = useHistory()
    const { ssoToken, context, theme, teamsError, userName, email } = useTeamsToken()

    const { data: topics, loading, error, getListItems, addTopic, updateListItem, deleteForum } = useListsService(ssoToken, context, (search && search.indexOf("nav=1") && cached) ? true : false)

    const { Id, Title, CreatorName, Description } = forums.find(f => f.Id == fid) as IForum
    const filter = `?$filter=ForumId eq ${+fid}`

    const color = theme.siteVariables.bodyColor
    const navigate = path => history.push(path)

    useEffect(() => {
        const updatedFormData = {
            id: Id,
            title: Title,
            description: Description
        }
        setUpdateForumData(updatedFormData)
    }, [])

    useEffect(() => {
        if (ssoToken) {
            getListItems(teams_topics, filter)
        }
    }, [ssoToken, getListItems])

    useEffect(() => dispatch({ type: 'LOAD_TOPICS', payload: topics }), [topics, dispatch])

    const setDefault = () => newTopicState.handleCustomBatch({ title: "", description: "" })

    const close = setOpen => {
        setDefault()
        setOpen(false)
    }

    const handleNewTopicSubmit = async setOpen => {
        const crreatedDate = new Date().getTime()
        const { title, description } = newTopicState.state

        const topic: ITopic = {
            Title: title,
            Description: description,
            ForumId: fid,
            CreatorName: userName,
            CreatorEmail: email,
            LastPosterName: userName,
            LastPosterEmail: email,
            LastUpdate: crreatedDate,
            Views: 0,
            Replies: 0,
            CreatedDate: crreatedDate
        }

        const post: Partial<IPost> = {
            Title: title,
            ForumId: fid,
            PosterName: userName,
            PosterEmail: email,
            Content: description,
            Answered: false,
            CreatedDate: crreatedDate
        }

        await addTopic(topic, post, filter)
        close(setOpen)
        setCached(false)
    }

    const handleNewTopicClose = async setOpen => close(setOpen)

    const handleForumUpdateSubmit = async (setOpen) => {
        const { id, title, description, deleted } = updateFormState.state

        const forum: Partial<IForum> = {
            Id: id,
            Title: title,
            Description: description
        }

        if (deleted) {
            await deleteForum(fid)
            history.push('/')
        } else {
            await updateListItem(teams_forums, forum, teams_topics)
            dispatch({ type: 'UPDATE_FORUM', payload: forum })
            setOpen(false)
            setCached(false)
        }
    }

    const handleForumUpdateClose = setOpen => {
        const { title, description, deleted } = updateForumData
        updateFormState.handleCustomBatch({ title, description, deleted })
        setOpen(false)
    }

    if (teamsError) {
        return <div className="error">{(teamsError)}</div>
    }

    if (error) {
        return <div className="error">{((error as any).message)}</div>
    }

    const newTopicModal = () =>
        <Modal title={strings.NewTopic}>
            <ForumsForm
                title={strings.Title}
                description={strings.Description}
                action={Actions.AddOrReply}
                formState={newTopicState}
                handleSubmit={handleNewTopicSubmit}
                handleClose={handleNewTopicClose}
            />
        </Modal>

    const updateForumModal = () =>
        <Modal title={strings.UpdateForum}>
            <ForumsForm
                title={strings.Name}
                description={strings.Description}
                action={Actions.Update}
                formState={updateFormState}
                handleSubmit={handleForumUpdateSubmit}
                handleClose={handleForumUpdateClose}
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
                <Breadcrumb.Item aria-current="page">{Title}</Breadcrumb.Item>
            </Breadcrumb>

            <div className="title">
                {newTopicModal()}
                {
                    userName === CreatorName &&
                    <span>
                        &nbsp;|&nbsp;
                        {updateForumModal()}
                    </span>
                }
            </div>
            <Topics forumId={fid} />
        </Provider>
    )
}

export default TopicsView