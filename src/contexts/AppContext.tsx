/* eslint-disable */
import * as React from 'react'
import { createContext, useReducer, useContext, Dispatch } from "react"

import { IAppState } from '../reducers/reducers'
import appReducer, { initialState } from '../reducers/reducers'

interface InitialStateProps {
    state: IAppState,
    dispatch: Dispatch<any>
}

const Context = createContext<InitialStateProps>(undefined as any)

export const AppStateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState)
    return <Context.Provider value={{ state, dispatch }} children={children} />
}

export const useAppContext = () => useContext(Context)