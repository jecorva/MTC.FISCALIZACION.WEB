export const routesList = {
    auth: {
        checkOut    : '/auth/check-out',
        login       : '/auth/login',
        logout      : '/auth/logout',        
        permissions : '/auth/permissions'
    },

    sidebar: {
        menu        : '/sidebar/menu'
    },

    profile: {
        get         : '/profile/me',
        update      : '/profile/update',
        uploadPhoto : '/profile/upload-photo',
        deletePhoto : '/profile/delete-photo',
        changePass  : '/profile/change-pass'
    },

    users: {
        getAll      : '/users',        
        create      : '/users',
        getById     : (id: string) => `/users/${id}`,
        update      : (id: string) => `/users/${id}`,
        changePass  : (id: string) => `/users/${id}/change-pass`,
        delete      : (id: string) => `/users/${id}`
    },

    userPermissions: {
        getById         : (id: string) => `/users/${id}/permissions`,
        syncPermissions : (id: string) => `/users/${id}/sync`
    }, 

    roles: {
        getAll      : '/roles',
        create      : '/roles',
        getById     : (id: string) => `/roles/${id}`,
        update      : (id: string) => `/roles/${id}`,
        delete      : (id: string) => `/roles/${id}`
    },

    permissions: {
        getById         : (id: string) => `/roles/${id}/permissions`,
        syncPermissions : (id: string) => `/roles/${id}/sync`
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
