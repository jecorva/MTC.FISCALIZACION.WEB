import httpClient from '@/utils/axios';
import { routesList } from '@/api/routes-list';

export const roleService = {
    getAll: async () => {
        const { data } = await httpClient.get(routesList.roles.getAll);
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await httpClient.get(
            routesList.roles.getById(id)
        );
        return data.data;
    },

    create: async (role) => {
        const { data } = await httpClient.post(
            routesList.roles.create,
            role
        );
        return data.data;
    },

    update: async (id, dataRole) => {
        const { data } = await httpClient.post(
            routesList.roles.update(id),
            { dataRole: dataRole }
        );
        return data.data;
    },

    delete: async (id: string) => {
        const { data } = await httpClient.delete(
            routesList.roles.delete(id)
        );
        return data.data;
    }
};

export const rolePermissionService = {
    getTree: async (roleId: string) => {
        const { data } = await httpClient.get(
            routesList.permissions.getById(roleId)
        );
        return data.data;
    },

    save: async (roleId: string, permissionIds: string[]) => {
        const { data } = await httpClient.post(
            routesList.permissions.syncPermissions(roleId),
            { permissions: permissionIds }
        );
        return data.data;
    }
};
