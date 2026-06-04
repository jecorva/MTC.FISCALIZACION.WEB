import { defineStore } from 'pinia';
import { router } from '@/router';
import httpClient from '@/utils/axios';
import { routesList } from '@/api/routes-list';
import { useSidebarStore } from '@/stores/sidebar';
import { usePermissionsStore } from '@/stores/permissions';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any,
        sessionChecked: false
    }),

    getters: {
        isAuthenticated: (state) => !!state.user
    },

    actions: {
        async login(username: string, password: string) {
            // 1. Obtén el CSRF cookie que requiere Sanctum
            await httpClient.get('/sanctum/csrf-cookie', {
                baseURL: import.meta.env.VITE_APP_URL // ← apunta a la raíz, no a /api
            });

            // 2. Login
            const response = await httpClient.post(routesList.auth.login, {
                Username: username,
                Password: password
            });

            await this.fetchUser();
            await usePermissionsStore().fetchPermissions();
            router.push('/dashboard');
        },

        async logout() {
            await httpClient.post(routesList.auth.logout);
            this.user = null;
            this.sessionChecked = false;

            const sidebarStore = useSidebarStore();
            sidebarStore.clearMenu();
            usePermissionsStore().clearPermissions();

            router.push('/login');
        },

        async fetchUser() {
            try {
                const response = await httpClient.get(routesList.auth.me);
                this.user = response.data.data;
            } catch {
                this.user = null;
            } finally {
                this.sessionChecked = true;
            }
        }
    }
});
