import axios from 'axios';

export interface ApiResponse<T = unknown> {
    code: string;
    message: string;
    data: T;
}

export const getApiError = (error: unknown) => {
    if (axios.isAxiosError<ApiResponse>(error)) {
        const res = error.response;
        if (!res) {
            return { code: '_NetworkError_', message: 'No se pudo conectar con el servidor' };
        }
        return {
            code: res.data?.code ?? '_Unknown_',
            message: res.data?.message ?? 'Error inesperado'
        };
    }
    return { code: '_Unknown_', message: 'Error inesperado' };
};

export const ResponseCode = {
    Success: '_Success_',
    NotFound: '_NotFound_',
    Forbidden: '_Forbidden_',
    ServerError: '_ServerError_',
    DocumentNumberError: '_DocumentNumberError_',
    NameError: '_NameError_',
    EmailError: '_EmailError_'
} as const;