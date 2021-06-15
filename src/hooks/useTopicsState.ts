/* eslint-disable */
import { useAppContext } from "../contexts/AppContext"

const useTopicsState = () => {
    const { state } = useAppContext()
    return state.topics
}

export default useTopicsState