/* eslint-disable */
import * as React from "react"
import { useState, useEffect } from 'react'
import { Dialog, Text } from "@fluentui/react-northstar"

import strings from '../../../strings'

interface IModalProp {
    title: string
    isOpen?: boolean
    trigger?: boolean
}

const Modal: React.FC<IModalProp> = ({ title, isOpen = false, trigger = true, children }) => {
    const [open, setOpen] = useState(isOpen)
    const [hasTitle, setHasTitle] = useState(false)
    const [hasDescription, setHasDescription] = useState(false)

    const ctrl = (children as any)

    useEffect(() => {
        const state = ctrl.props.formState.state
        if (state) {
            const { title, description, deleted } = state

            title
                ? setHasTitle(true)
                : setHasTitle(false)

            description
                ? setHasDescription(true)
                : setHasDescription(false)
        }
    }, [ctrl.props])

    useEffect(() => {
        setOpen(isOpen)
    }, [isOpen])

    const onConfirm = () => {
        if (hasTitle && hasDescription) {
            ctrl.props.handleSubmit(setOpen)
        }
    }

    return (
        <Dialog
            backdrop={true}
            closeOnOutsideClick={false}
            cancelButton={strings.Close}
            onCancel={() => ctrl.props.handleClose(setOpen)}
            onConfirm={onConfirm}
            confirmButton={title}
            open={open}
            onOpen={() => setOpen(true)}
            trigger={trigger ? <Text content={title} /> : undefined}
            styles={{ width: "600px" }}
            header={{ children: () => children }}
        />
    )
}

export default Modal