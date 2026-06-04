import httpClient from '@/utils/axios';
import { routesList } from '@/api/routes-list';

export const termService = {
    getAll: async () => {
        const { data } = await httpClient.get(routesList.terms.getAll);
        return data.data;
    },

    getPaginated: async (
        page: number,
        perPage: number,
        search: string
    ) => {
        const { data } = await httpClient.get(
            routesList.terms.getPaginated,
            {
                params: {
                    page,
                    per_page: perPage,
                    search
                }
            }
        );
        // data.data viene con { data: [...], total, per_page, current_page }
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await httpClient.get(
            routesList.terms.getById(id)
        );
        return data.data;
    },

    create: async (term) => {
        const { data } = await httpClient.post(
            routesList.terms.create,
            term
        );
        return data.data;
    },

    update: async (id, xData) => {
        const { data } = await httpClient.post(
            routesList.terms.update(id),
            { requestData: xData }
        );
        return data.data;
    },

    delete: async (id: string) => {
        const { data } = await httpClient.delete(
            routesList.terms.delete(id)
        );
        return data.data;
    }
};
