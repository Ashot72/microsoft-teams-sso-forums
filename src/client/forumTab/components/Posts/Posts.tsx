
/* eslint-disable */
import * as React from "react"
import { useState, useEffect } from 'react'
import { Flex, Divider } from "@fluentui/react-northstar"

import { ITopic } from '../../../../reducers/reducers'
import { IPost } from '../../../../reducers/postReducer'
import strings from '../../../../strings'
import { teams_posts } from '../../../../lists'
import Post from './Post'
import { useTopicsState } from '../../../../hooks'
import Modal from '../../shared/Modal'
import ForumsForm from '../../shared/ForumsForm'
import { Actions } from '../../helpers/utils'
import { useFormState, useDispatch } from '../../../../hooks'
import "../common.css"
import "./posts.css"

interface IPosts {
    fid: number
    tid: number
    filter: string
    posts: IPost[]
    updateListItem: any
    deletePost: any
}

const Posts: React.FC<IPosts> = ({ fid, tid, filter, posts, updateListItem, deletePost }) => {
    const dispatch = useDispatch()
    const topics: ITopic[] = useTopicsState()

    const [updatePostEditData, setUpdatePostEditData] = useState<any>()
    const updatePostEditState = useFormState(updatePostEditData)
    const [editPost, setEditPost] = useState<IPost>()

    const { Title, CreatorName } = topics.find(t => t.Id == tid) as ITopic

    useEffect(() => {
        if (editPost) {
            const updatedPostEditData = {
                id: editPost.Id,
                title: editPost.Title,
                description: editPost.Content,
                deleted: false
            }
            setUpdatePostEditData(updatedPostEditData)
        }
    }, [editPost])

    const close = setOpen => {
        setEditPost(undefined)
        setOpen(false)
    }

    const handleEditPost = (post: IPost) => setEditPost(post)

    const handleAnsweredPost = async (post: IPost) => {
        const answeredPost: Partial<IPost> = {
            Id: post.Id,
            Answered: !post.Answered
        }

        await updateListItem(teams_posts, answeredPost, teams_posts, filter)
        dispatch({ type: 'UPDATE_POST', payload: post })
    }

    const handlePostUpdateSubmit = async setOpen => {
        const { id, title, description, deleted } = updatePostEditState.state

        const post: Partial<IPost> = {
            Id: id,
            Title: title,
            Content: description
        }

        if (deleted) {
            await deletePost(fid, tid, id, filter)
            close(setOpen)
        } else {
            await updateListItem(teams_posts, post, teams_posts, filter)
            dispatch({ type: 'UPDATE_POST', payload: post })
            close(setOpen)
        }
    }

    const handlePostUpdateClose = (setOpen) => {
        const { Title, Content } = editPost as IPost
        updatePostEditState.handleCustomBatch({ title: Title, description: Content, deleted: false })
        close(setOpen)
    }

    const updatePostModal = () =>
        <Modal
            title={strings.UpdatePost}
            trigger={false}
            isOpen={editPost !== undefined}
        >
            <ForumsForm
                title={strings.Subject}
                description={strings.Message}
                action={Actions.Update}
                formState={updatePostEditState}
                handleSubmit={handlePostUpdateSubmit}
                handleClose={handlePostUpdateClose}
            />
        </Modal>

    return (
        <>
            <Flex className="header">
                <Flex.Item size="100%">
                    <div>{Title}</div>
                </Flex.Item>
            </Flex>
            {
                posts.map((post: IPost) =>
                    <>
                        <Flex
                            key={post.Id}
                            style={{
                                padding: "2px"
                            }}
                        >
                            <Post
                                creatorName={CreatorName}
                                post={post}
                                handleEditPost={handleEditPost}
                                handleAnsweredPost={handleAnsweredPost}
                            />
                        </Flex>
                        <Divider />
                    </>
                )
            }
            {updatePostModal()}
        </>
    )
}

export default Posts