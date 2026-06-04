<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import { useSidebarStore } from '@/stores/sidebar';

import NavGroup from './NavGroup/index.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import Logo from '../logo/Logo.vue';

const customizer = useCustomizerStore();
const sidebarStore = useSidebarStore();

onMounted(() => sidebarStore.fetchMenu());

// ← directo, sin shallowRef encima
const sidebarMenu = computed(() => sidebarStore.menuItems);
</script>

<template>
    <v-navigation-drawer
        left
        v-model="customizer.Sidebar_drawer"
        elevation="0"
        rail-width="75"
        app
        class="leftSidebar"
        :rail="customizer.mini_sidebar"
        expand-on-hover
        width="260"
    >
        <div class="pa-4 pb-0">
            <Logo />
        </div>

        <perfect-scrollbar class="scrollnavbar">
            <v-list class="px-4">
                <template
                    v-for="(item, i) in sidebarMenu"
                    :key="i"
                >
                    <NavGroup
                        :item="item"
                        v-if="item.header"
                    />
                    <NavCollapse
                        :item="item"
                        :level="0"
                        v-else-if="item.children"
                        class="leftPadding"
                    />
                    <NavItem
                        :item="item"
                        v-else
                        class="leftPadding"
                    />
                </template>
            </v-list>
        </perfect-scrollbar>
    </v-navigation-drawer>
</template>
