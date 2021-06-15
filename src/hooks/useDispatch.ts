/* eslint-disable */
import { useAppContext } from "../contexts/AppContext"

const useDispatch = () => {
    const { dispatch } = useAppContext()
    return dispatch
}

export default useDispatch