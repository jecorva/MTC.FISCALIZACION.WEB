export const permissionsList = {
    roles: {
        list: 'setting.roles.list',
        create: 'setting.roles.create',
        update: 'setting.roles.update',
        delete: 'setting.roles.delete',
        permission: 'setting.roles.permission'
    },
    users: {
        list: 'setting.users.list',
        create: 'setting.users.create',
        update: 'setting.users.update',
        delete: 'setting.users.delete',
        password: 'setting.users.password',
        permission: 'setting.users.permission'
    },
    dependencies: {
        list: 'dependency.list',
        create: 'dependency.create',
        update: 'dependency.update',
        delete: 'dependency.delete'
    },
    dashboard: {
        view: 'dashboard.admin.view'
    }
};
// as const;

// El type se genera solo del objeto
// export type PermissionSlug =
//     (typeof permissionsList)[keyof typeof permissionsList][string];
