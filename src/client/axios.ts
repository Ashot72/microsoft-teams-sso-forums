/* eslint-disable */
import axios from 'axios'

const axiosInstance = (token: string, context: any) =>
    axios.create({
        baseURL: `${window.location.protocol}//${process.env.HOSTNAME}/`,
        headers: {
            Authorization: `Bearer ${token}`,
            siteUrl: context.teamSiteUrl || `${window.location.protocol}//${context.teamSiteDomain}`,
            accept: 'application/json;odata=verbose',
            'content-type': 'application/json;odata=verbose',
            'IF-MATCH': '*'
        }
    })

export default axiosInstance