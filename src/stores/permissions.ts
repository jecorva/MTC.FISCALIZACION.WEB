// stores/permissions.ts
import { defineStore } from 'pinia';
import httpClient from '@/utils/axios';
import { routesList } from '@/api/routes-list';

export const usePermissionsStore = defineStore('permissions', {
    state: () => ({
        slugs: [] as string[],
        loaded: false
    }),
    actions: {
        async fetchPermissions() {
            if (this.loaded) return;
            const res = await httpClient.get(routesList.auth.permissions);
            this.slugs = res.data.data; // ['setting.roles.list', 'setting.roles.delete', ...]
            //console.log(res.data.data);
            this.loaded = true;
        },
        clearPermissions() {
            this.slugs = [];
            this.loaded = false;
        }
    }
});
