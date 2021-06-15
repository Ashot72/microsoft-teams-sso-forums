/* eslint-disable */
import * as React from 'react'
import { Actions } from '../helpers/utils'
import { useState, useEffect, useRef } from 'react'
import {
    FormInput,
    Form,
    FormTextArea,
    Checkbox
} from "@fluentui/react-northstar"

import strings from '../../../strings'

export interface IForumsFormProp {
    title: string
    description: string
    action: Actions
    formState: any
    handleSubmit: (setOpen: () => void) => void
    handleClose: (setOpen: () => void) => void
}

const ForumsForm: React.FC<IForumsFormProp> = ({ title: t, description: d, action, formState = {} }) => {
    const { state = {}, handleChange, handleCustom } = formState
    let { title, description, deleted } = state

    const [subjectErrorMessage, setSubjectErrorMessage] = useState<string | null>(null)
    const [showSuccessIndicator, setShowSuccessIndicator] = useState<boolean>()
    const [messageErrorMessage, setMessageErrorMessage] = useState<string | null>(null)

    const inputRef = useRef<any>(null)

    useEffect(() => {
        inputRef.current.focus()
    }, [])

    useEffect(() => {
        if (!title && subjectErrorMessage !== null) {
            setSubjectErrorMessage(`'${t}' ${strings.Required}`)
            setShowSuccessIndicator(false)
        } else {
            setSubjectErrorMessage("")
            subjectErrorMessage === null
                ? setShowSuccessIndicator(false)
                : setShowSuccessIndicator(true)
        }
    }, [title])

    useEffect(() => {
        (!description && messageErrorMessage !== null)
            ? setMessageErrorMessage(`'${d}' ${strings.Required}`)
            : setMessageErrorMessage("")

    }, [description])

    return (
        <Form>
            <FormInput
                ref={inputRef}
                label={t}
                name="title"
                id="title"
                required
                showSuccessIndicator={showSuccessIndicator}
                fluid
                errorMessage={subjectErrorMessage}
                value={title}
                onChange={handleChange}
            />
            <FormTextArea
                label={`${d}*`}
                name="description"
                id="description"
                required
                rows={5}
                fluid
                errorMessage={messageErrorMessage}
                value={description}
                onChange={handleChange}
            />
            {
                action === Actions.Update &&
                <Checkbox
                    onChange={(obj, e: any) => handleCustom('deleted', e.checked)}
                    label={strings.Delete}
                    id="deleted"
                    checked={deleted}
                />
            }
        </Form>
    )
}

export default ForumsForm