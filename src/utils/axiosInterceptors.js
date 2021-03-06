import axios from "axios";

const options = {
    baseURL: process.env.REACT_APP_API_DOMAIN,
    timeout: 15000,
    withCredentials: true
}

const api = axios.create(options)

api.interceptors.request.use((config) => {
    config.headers.Authorization = `bearer ${localStorage.getItem('accessToken')}`
    return config
})

api.interceptors.response.use((config) => {
    return config
}, async (error) => {
    const origin = error.config
    const accessToken = localStorage.getItem('accessToken');
    if ( error.response.status === 401 && origin && !origin._isRetry && accessToken) {
        origin._isRetry = true
        try {
            const response = await axios.get('/users/refreshToken', {
                ...options,
                headers: {
                    authorization: `bearer ${localStorage.getItem('accessToken')}`
                }

            })
            localStorage.setItem('accessToken', response.data.accessToken)
            return api.request(origin)
        } catch (e) {
            throw e;
        }
    }
    throw error
})
export default api