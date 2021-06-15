/* eslint-disable */
import { useAppContext } from "../contexts/AppContext"

const useForumsState = () => {
    const { state } = useAppContext()
    return state.forums
}

export default useForumsState