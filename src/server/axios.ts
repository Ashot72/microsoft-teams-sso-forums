/* eslint-disable */
import axios from 'axios'

const axiosInstance = (siteUrl: string, token: string) =>
    axios.create({
        baseURL: `${siteUrl}`,
        headers: {
            Authorization: `Bearer ${token}`,
            accept: 'application/json;odata=verbose',
            'content-type': 'application/json;odata=verbose',
            'IF-MATCH': '*'
        }
    })

export default axiosInstance