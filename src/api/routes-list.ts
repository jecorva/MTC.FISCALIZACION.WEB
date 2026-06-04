export const routesList = {
    auth: {
        login: '/auth/login',
        logout: '/auth/logout',
        me: '/auth/me',
        permissions: '/auth/permissions'
    },

    sidebar: {
        menu: '/sidebar/menu'
    },

    roles: {
        getAll: '/role/list',
        getById: (id) => `/role/get/${id}`,
        create: '/role/create',
        update: (id) => `/role/update/${id}`,
        delete: (id) => `/role/delete/${id}`
    },

    permissions: {
        getById: (id) => `/permission/get/${id}/permissions`,
        syncPermissions: (id) => `/permission/sync/${id}/permissions`
    },

    users: {
        getAll: '/user/list',
        getById: (id: string) => `/user/get/${id}`,
        create: '/user/create',
        update: (id: string) => `/user/update/${id}`,
        changePass: (id: string) => `/user/change-pass/${id}`,
        delete: (id: string) => `/user/delete/${id}`
    },

    userPermissions: {
        getById: (id: string) => `/user-permission/get/${id}/permissions`,
        syncPermissions: (id: string) =>
            `/user-permission/sync/${id}/permissions`
    },

    profile: {
        get: '/profile/me',
        update: '/profile/update',
        uploadPhoto: '/profile/upload-photo',
        deletePhoto: '/profile/delete-photo',
        changePass: '/profile/change-pass'
    },

    dependencies: {
        getAll: '/dependency/list',
        getPaginated: '/dependency/list-paginated',
        getParents: '/dependency/get-parents',
        getById: (id: string) => `/dependency/get/${id}`,
        create: '/dependency/create',
        update: (id: string) => `/dependency/update/${id}`,
        delete: (id: string) => `/dependency/delete/${id}`
    },

    terms: {
        getAll: '/term/list',
        getPaginated: '/term/list-paginated',
        getById: (id: string) => `/term/get/${id}`,
        create: '/term/create',
        update: (id: string) => `/term/update/${id}`,
        delete: (id: string) => `/term/delete/${id}`
    }
};
