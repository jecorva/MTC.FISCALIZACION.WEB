import { defineStore } from 'pinia';
import api from '@/utils/axios';

export const useUsersStore = defineStore('users', {
    state: () => ({
        users: [] as any[],
        loading: false,
        error: null as any
    }),

    actions: {
        async getAll() {
            this.loading = true;
            try {
                const response = await api.get('/users');
                this.users = response.data;
            } catch (error) {
                this.error = error;
            } finally {
                this.loading = false;
            }
        }
    }
});