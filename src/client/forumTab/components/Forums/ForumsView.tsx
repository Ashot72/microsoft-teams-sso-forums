
/* eslint-disable */
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Loader, Provider } from "@fluentui/react-northstar"

import { IForum } from '../../../../reducers/reducers'
import strings from '../../../../strings'
import { Actions } from '../../helpers/utils'
import { teams_forums } from '../../../../lists'
import Forums from './Forums'
import Modal from '../../shared/Modal'
import ForumsForm from '../../shared/ForumsForm'
import { useListsService, useDispatch, useFormState, useTeamsToken, useCheckListsExist } from '../../../../hooks'

const data = { title: '', description: '' }

interface IForumsView {
    location: any
}

const ForumsView: React.FC<IForumsView> = ({ location: { search } }) => {

    const dispatch = useDispatch()
    const formState = useFormState(data)
    const { ssoToken, theme, context, teamsError, userName } = useTeamsToken()
    const [cached, setCached] = useState<boolean>(true)

    const { data: forums, loading, error, getListItems, addListItem } = useListsService(ssoToken, context, (search && search.indexOf("nav=1") && cached) ? true : false)

    const checkListsMessage = useCheckListsExist(ssoToken, context)

    useEffect(() => {
        if (ssoToken && checkListsMessage === "") {
            getListItems(teams_forums)
        }
    }, [ssoToken, checkListsMessage, getListItems])

    useEffect(() => dispatch({ type: 'LOAD_FORUMS', payload: forums }), [forums, dispatch])

    const setDefault = () => formState.handleCustomBatch({ title: "", description: "" })

    const close = setOpen => {
        setDefault()
        setOpen(false)
    }

    const handleSubmit = async (setOpen) => {
        const { title, description } = formState.state

        const forum: Partial<IForum> = {
            Title: title,
            Description: description,
            Topics: 0,
            Posts: 0,
            CreatorName: userName,
            CreatedDate: new Date().getTime()
        }

        await addListItem(teams_forums, forum)
        close(setOpen)
        setCached(false)
    }

    const handleClose = async setOpen => close(setOpen)

    if (teamsError) {
        return <div className="error">{(teamsError)}</div>
    }

    if (error) {
        return <div className="error">{((error as any).message)}</div>
    }

    return (
        <Provider theme={theme}>
            {checkListsMessage && <Loader label={checkListsMessage} />}
            {loading && <Loader label={strings.Wait} />}

            <div className="title">
                <Modal title={strings.NewForum}>
                    <ForumsForm
                        title={strings.Name}
                        description={strings.Description}
                        action={Actions.AddOrReply}
                        formState={formState}
                        handleSubmit={handleSubmit}
                        handleClose={handleClose}
                    />
                </Modal>
            </div>
            <Forums />
        </Provider>
    )
}

export default ForumsView
