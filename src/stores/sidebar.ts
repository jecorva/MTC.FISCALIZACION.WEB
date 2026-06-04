import { defineStore } from 'pinia';
import httpClient from '@/utils/axios';
import { routesList } from '@/api/routes-list';

export interface MenuItem {
    header?:   string;
    title?:    string;
    icon?:     string;
    to?:       string;
    children?: MenuItem[];
}

export const useSidebarStore = defineStore('sidebar', {
    state: () => ({
        menuItems: [] as MenuItem[],
        loaded: false,
    }),

    actions: {
        async fetchMenu() {
            if (this.loaded) return; // ya cargado, no vuelve a pedir

            const response = await httpClient.get(routesList.sidebar.menu);
            this.menuItems = response.data.data;
            this.loaded = true;
        },

        clearMenu() {
            this.menuItems = [];
            this.loaded = false;
        }
    }
});