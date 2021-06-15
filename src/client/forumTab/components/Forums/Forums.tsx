/* eslint-disable */
import * as React from "react"
import { useHistory } from "react-router-dom"
import { Flex, Button, ChatIcon } from "@fluentui/react-northstar"
import Moment from 'react-moment'

import { IForum } from '../../../../reducers/reducers'
import strings from '../../../../strings'
import { useForumsState } from '../../../../hooks'
import { dateFormat } from '../../helpers/utils'
import "../common.css"

const Forums: React.FC = () => {
  const forums: IForum[] = useForumsState()
  const history = useHistory()

  const navigate = (path) => history.push(path)

  return (
    <>
      <Flex className="header">
        <Flex.Item size="40%">
          <div>{strings.Forum}</div>
        </Flex.Item>

        <Flex.Item size="20%">
          <div>{strings.TopicsPosts}</div>
        </Flex.Item>

        <Flex.Item size="35%">
          <div>{strings.LastPost}</div>
        </Flex.Item>

        <Flex.Item size="5%">
          <div onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }} title={strings.Bot}><ChatIcon /></div>
        </Flex.Item>
      </Flex>

      {
        forums.map((forum: IForum) =>
          <Flex
            key={forum.Id}
            style={{
              padding: "5px"
            }}
          >
            <Flex.Item size="40%">
              <div>
                <Button text content={forum.Title} onClick={() => navigate(`/topics/${forum.Id}`)} className="btn" />
              </div>
            </Flex.Item>
            <Flex.Item size="20%">
              <div style={{ textAlign: "center" }}>
                <div>
                  {strings.Topics}:{' '}
                  <Button text content={forum.Topics} onClick={() => navigate(`/topics/${forum.Id}`)} className="btn" />
                </div>
                <div>
                  {strings.Posts}:{' '}
                  <Button text content={forum.Posts} onClick={() => navigate(`/topics/${forum.Id}`)} className="btn" />
                </div>
              </div>
            </Flex.Item>
            <Flex.Item size="40%">
              <div>
                {forum.LastTopic}
                {forum.LastPosterName && <div>{strings.By} {forum.LastPosterName} </div>}
                {forum.LastUpdate &&
                  <div>
                    <Moment locale={'en'} format={dateFormat}>
                      {forum.LastUpdate}
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

export default Forums