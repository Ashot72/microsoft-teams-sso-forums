/* eslint-disable */
import * as React from "react"
import { useHistory } from "react-router-dom"
import { Flex, Button } from "@fluentui/react-northstar"
import Moment from 'react-moment'

import { IForum, ITopic } from '../../../../reducers/reducers'
import strings from '../../../../strings'
import { useTopicsState, useForumsState } from '../../../../hooks'
import { dateFormat } from '../../helpers/utils'
import "../common.css"

interface ITopics {
    forumId: number
}

const Topics: React.FC<ITopics> = ({ forumId }) => {
    const forums: IForum[] = useForumsState()
    const topics: ITopic[] = useTopicsState()
    const history = useHistory()

    const navigate = (path) => history.push(path)
    const forum = forums.find(f => f.Id == forumId) as IForum

    return (
        <>
            <Flex className="header">
                <Flex.Item size="40%">
                    <div>{forum.Title}</div>
                </Flex.Item>

                <Flex.Item size="20%">
                    <div>{strings.RepliesViews}</div>
                </Flex.Item>

                <Flex.Item size="40%">
                    <div>{strings.LastPost}</div>
                </Flex.Item>
            </Flex>
            {
                topics.reverse().map((topic: ITopic) =>
                    <Flex
                        key={topic.Id}
                        style={{
                            padding: "5px"
                        }}
                    >
                        <Flex.Item size="40%">
                            <div>
                                <Button text content={topic.Title} onClick={() => navigate(`/posts/${topic.ForumId}/${topic.Id}`)} className="btn" />
                                <div>{topic.Message}</div>
                                <div>{strings.By} {topic.CreatorName}</div>
                                <div>
                                    <Moment locale={'en'} format={dateFormat}>
                                        {topic.CreatedDate}
                                    </Moment>
                                </div>
                            </div>
                        </Flex.Item>
                        <Flex.Item size="20%">
                            <div style={{ textAlign: "center" }}>
                                <div>
                                    {strings.Views}:{' '}
                                    <Button text content={topic.Views} onClick={() => navigate(`/posts/${topic.ForumId}/${topic.Id}`)} className="btn" />
                                </div>
                                <div>
                                    {strings.Replies}:{' '}
                                    <Button text content={topic.Replies} onClick={() => navigate(`/posts/${topic.ForumId}/${topic.Id}`)} className="btn" />
                                </div>
                            </div>
                        </Flex.Item>
                        <Flex.Item size="40%">
                            <div>
                                {topic.LastPosterName && <div>{strings.By} {topic.LastPosterName} </div>}
                                {topic.LastUpdate > 0 &&
                                    <div>
                                        <Moment locale={'en'} format={dateFormat}>
                                            {topic.LastUpdate}
                                        </Moment>
                                    </div>
                                }
                            </div>
                        </Flex.Item>
                    </Flex>
                )
            }
        </>
    )
}

export default Topics