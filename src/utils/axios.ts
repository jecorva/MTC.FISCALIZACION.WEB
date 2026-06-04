import axios from 'axios';

const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
});

httpClient.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        if (status === 401 && url !== '/login') {            
            console.log('LOGIN CALLED');
        }

        // 422 siempre lo deja pasar al componente que lo manejará
        if (status === 422) {
            return Promise.reject(error);
        }

        if (status === 403) {
            //window.location.href = '/sin-permisos';
        }

        if (status === 500) {
            if (import.meta.env.DEV) {
                console.error('Error servidor:', error.response?.data?.message);
            }
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default httpClient;
