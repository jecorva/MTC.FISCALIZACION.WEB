const AuthRoutes = {
    path: '/auth',
    component: () => import('@/layouts/blank/BlankLayout.vue'),
    meta: {
        requiresAuth: false
    },
    children: [
        {
            name: 'Login',
            path: '/login',
            component: () => import('@/views/authentication/SideLogin.vue')
        }
    ]
};

export default AuthRoutes;