const MainRoutes = {
    path: '/',
    meta: { requiresAuth: true },
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
        {
            name: 'Dashboard',
            path: 'dashboard',
            component: () => import('@/www/dashboard/Index.vue')
        },
        ///|-- ROLES --|
        {
            name: 'Roles',
            path: 'admin/roles',
            component: () => import('@/www/setting/roles/Table.vue')
        },
        {
            name: 'RolesPermissions',
            path: 'admin/roles/permisos/:id', // ← /dashboard/roles/permisos/5
            component: () => import('@/www/setting/roles/Permissions.vue')
        },
        ///|-- USERS --|
        {
            name: 'Users',
            path: 'admin/usuarios',
            component: () => import('@/www/setting/users/Index.vue')
        },
        {
            name: 'UserForm',
            path: 'admin/usuarios/nuevo',
            component: () => import('@/www/setting/users/Form.vue')
        },
        {
            name: 'UserFormEdit',
            path: 'admin/usuarios/editar/:Id',
            component: () => import('@/www/setting/users/Form.vue')
        },
        {
            name: 'UserPermissions',
            path: 'admin/usuarios/permisos/:Id',
            component: () => import('@/www/setting/users/Permissions.vue')
        },
        {
            name: 'UserProfile',
            path: 'profile',
            component: () => import('@/www/navbar/Profile.vue')
        },
        ///|-- DEPENDENCIES --|
        {
            name: 'Dependecy',
            path: 'dependencias',
            component: () => import('@/www/dependency/Index.vue')
        },
        ///|-- TERMS --|
        {
            name: 'Terms',
            path: 'admin/periodos',
            component: () => import('@/www/setting/term/Index.vue')
        },
        ///|-- TYPEEXPEDIENTS --|
        {
            name: 'TypeExpedients',
            path: 'admin/tipo-expedientes',
            component: () => import('@/www/setting/type/Index.vue')
        }
    ]
};

export default MainRoutes;
