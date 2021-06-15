/* eslint-disable */
import { useEffect, useState } from 'react'

const useFormState = data => {
    const [state, setState] = useState(data)

    useEffect(() => setState(data), [data])

    const handleChange = e => setState({ ...state, [e.target.name]: e.target.value })
    const handleChecked = e => setState({ ...state, [e.target.name]: e.target.checked })
    const handleCustom = (key, value) => setState({ ...state, [key]: value })
    const handleCustomBatch = (keyValues) => setState({ ...state, ...keyValues })

    return { state, handleChecked, handleChange, handleCustom, handleCustomBatch }
}

export default useFormState