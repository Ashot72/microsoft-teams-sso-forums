/* eslint-disable */
import { useEffect, useState } from "react"

import axiosInstance from "../client/axios"
import strings from '../strings'
import { cache } from "./useListsService"
import { teams_forums } from "../lists"

const useCheckListsExist = (ssoToken: string, context) => {
    const [checkListsMessage, setCheckListsMessage] = useState<string | null>(null)

    useEffect(() => {
        if (ssoToken) {
            if (cache[teams_forums]) {
                setCheckListsMessage("")
            } else {
                setCheckListsMessage(strings.Wait)
                //check a list existence
                axiosInstance(ssoToken, context).get("api/checkList")
                    .then((ret) => {
                        if (ret.status == 201) {
                            // Lists do not exist
                            setCheckListsMessage(strings.WaitListGeneration)
                            axiosInstance(ssoToken, context).post("api/genLists")
                                .then(() => {
                                    setCheckListsMessage("")
                                }).catch(e => {
                                    setCheckListsMessage(`${strings.ListGenError}: ${e}`)
                                })
                        } else if (ret.status == 200) {
                            // Lists already exist
                            setCheckListsMessage("")
                        }
                    }).catch(e => {
                        setCheckListsMessage(`${strings.ListExtError}: ${e}`)
                    })
            }
        }
    }, [ssoToken])

    return checkListsMessage
}

export default useCheckListsExist