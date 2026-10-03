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

        // #region UserPath
        {
            name: 'Users',
            path: 'usuarios',
            component: () => import('@/www/setting/users/Index.vue')
        },
        {
            name: 'UserForm',
            path: 'usuarios/registrar',
            component: () => import('@/www/setting/users/Form.vue')
        },
        {
            name: 'UserFormEdit',
            path: 'usuarios/:Id/editar',
            component: () => import('@/www/setting/users/Form.vue')
        },
        {
            name: 'UserPermissions',
            path: 'usuarios/:Id/permisos',
            component: () => import('@/www/setting/users/Permissions.vue')
        },
        {
            name: 'UserProfile',
            path: 'profile',
            component: () => import('@/www/navbar/Profile.vue')
        },
        // #endregion

        // #region RolesPath
        {
            name: 'Roles',
            path: 'roles',
            component: () => import('@/www/setting/roles/Table.vue')
        },
        {
            name: 'RolesPermissions',
            path: 'roles/:Id/permisos', // ← /dashboard/roles/permisos/5
            component: () => import('@/www/setting/roles/Permissions.vue')
        },
        // #endregion
        
        ///|-- DRIVERS --|
        {
            name: 'Drivers',
            path: 'admin/conductores',
            component: () => import('@/www/setting/driver/Index.vue')
        },
        ///|-- VEHICLES --|
        {
            name: 'Vehicles',
            path: 'admin/vehiculos',
            component: () => import('@/www/setting/vehicle/Index.vue')
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
        ///|-- INSPECTION --|
        {
            name: 'Acts',
            path: 'fiscalizador/actas',
            component: () => import('@/www/inspector/acts/Index.vue')
        },
        {
            name: 'RoutesInspections',
            path: 'fiscalizador/rutas-inspecciones',
            component: () => import('@/www/inspector/routes/Index.vue')
        }
    ]
};

export default MainRoutes;
