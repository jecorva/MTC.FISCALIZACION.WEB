import httpClient from '@/utils/axios';
import { routesList } from '@/api/routes-list';

export const dependencyService = {
    getAll: async () => {
        const { data } = await httpClient.get(
            routesList.dependencies.getAll
        );
        return data.data;
    },

    getPaginated: async (
        page: number,
        perPage: number,
        search: string
    ) => {
        const { data } = await httpClient.get(
            routesList.dependencies.getPaginated,
            {
                params: { page, per_page: perPage, search }
            }
        );
        // data.data viene con { data: [...], total, per_page, current_page }
        return data.data;
    },

    getParents: async () => {
        const { data } = await httpClient.get(
            routesList.dependencies.getParents
        );
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await httpClient.get(
            routesList.dependencies.getById(id)
        );
        return data.data;
    },

    create: async (dependency) => {
        const { data } = await httpClient.post(
            routesList.dependencies.create,
            dependency
        );
        return data.data;
    },

    update: async (id, xData) => {
        const { data } = await httpClient.post(
            routesList.dependencies.update(id),
            { requestData: xData }
        );
        return data.data;
    },

    delete: async (id: string) => {
        const { data } = await httpClient.delete(
            routesList.dependencies.delete(id)
        );
        return data.data;
    }
};
