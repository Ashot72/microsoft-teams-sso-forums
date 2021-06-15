/* eslint-disable */
import * as React from "react"
import Moment from 'react-moment'
import { Flex, Image, Text, Header, EditIcon, AcceptIcon } from '@fluentui/react-northstar'

import { IPost } from '../../../../reducers/postReducer'
import strings from '../../../../strings'
import { dateFormat } from '../../helpers/utils'
import "./posts.css"
import { useTeamsToken } from '../../../../hooks'

interface IPostsItem {
    creatorName: string,
    post: IPost,
    handleEditPost: (post: IPost) => void
    handleAnsweredPost: (post: IPost) => void
}

const PostsItem: React.FC<IPostsItem> = ({ post, creatorName, handleEditPost, handleAnsweredPost }) => {

    const { userName } = useTeamsToken()
    const { Title, Content, PosterName, Answered } = post

    return (
        <>
            <Flex.Item>
                <>
                    <div
                        style={{
                            position: 'relative',
                            textAlign: "center"
                        }}
                    >
                        <Image
                            fluid
                            src="/assets/user.jpg"
                        />
                        <br />
                        <i>
                            <Text content={post.PosterName} />
                        </i>
                        <br />
                        <Text content={post.PosterEmail} style={{ fontSize: "11px" }} />
                    </div>
                </>
            </Flex.Item>
            <Flex.Item grow>
                <div className="postsContent">
                    <Flex space="between">
                        <Header as="h3" content={post.Title} />
                        <Moment locale={'en'} format={dateFormat}>
                            {post.CreatedDate}
                        </Moment>
                    </Flex>
                    <span dangerouslySetInnerHTML={{ __html: Content.replace(/\n/g, "<br />") }} />
                    <div className="icons">
                        {userName === PosterName &&
                            <EditIcon
                                size="large"
                                className="editIcon"
                                title={strings.EditPost}
                                onClick={() => handleEditPost(post)} />
                        }
                        {userName === creatorName &&
                            <AcceptIcon
                                size="large"
                                className="handCursor"
                                style={{ color: post.Answered ? "green" : "red", cursor: "pointer" }}
                                title={Answered ? strings.Answered : strings.NotAnswered}
                                onClick={() => handleAnsweredPost(post)} />
                        }
                    </div>
                </div>
            </Flex.Item>
        </>
    )
}

export default PostsItem