import httpClient from '@/utils/axios';
import { routesList } from '@/api/routes-list';

export const userService = {
    getAll: async () => {
        const { data } = await httpClient.get(routesList.users.getAll);
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await httpClient.get(
            routesList.users.getById(id)
        );
        return data.data;
    },

    create: async (user) => {
        const { data } = await httpClient.post(
            routesList.users.create,
            user
        );
        return data.data;
    },

    update: async (id, user) => {
        const { data } = await httpClient.post(
            routesList.users.update(id),
            user
        );
        return data.data;
    },

    changePassword: async (id, password) => {
        const { data } = await httpClient.post(
            routesList.users.changePass(id),
            password
        );
        return data.data;
    },

    delete: async (id: string) => {
        const { data } = await httpClient.delete(
            routesList.users.delete(id)
        );
        return data.data;
    }
};

export const userPermissionService = {
    getTree: async (id: string) => {
        const { data } = await httpClient.get(
            routesList.userPermissions.getById(id)
        );
        return data.data;
    },

    save: async (
        userId: string,
        permissions: { id: string; granted: boolean }[]
    ) => {
        const { data } = await httpClient.post(
            routesList.userPermissions.syncPermissions(userId),
            { permissions }
        );
        return data.data;
    }
};
