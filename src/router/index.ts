import { useAuthStore } from '@/stores/auth';
import { usePermissionsStore } from '@/stores/permissions';
import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/views/authentication/Error.vue')
        },
        MainRoutes,
        AuthRoutes
    ]
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const permissionsStore = usePermissionsStore();

    // Si aún no verificamos la sesión, consultamos al backend
    if (!authStore.sessionChecked) {
        await authStore.fetchUser();
    }

    // Si hay usuario pero no se han cargado los permisos aún
    if (authStore.user && !permissionsStore.loaded) {
        await permissionsStore.fetchPermissions();
    }

    if (to.meta.requiresAuth && !authStore.user) {
        return next('/login');
    }

    if (to.path === '/login' && authStore.user) {
        return next('/dashboard');
    }

    next();
});
