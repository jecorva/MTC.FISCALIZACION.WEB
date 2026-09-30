<script setup lang="ts">
import { Icon } from '@iconify/vue';

withDefaults(
    defineProps<{
        title?: string;
        icon?: string;
        accentColor?: string;
    }>(),
    {
        icon: 'solar:widget-linear',
        accentColor: '#98A4AE' // rojo MTC
    }
);
</script>

<template>
    <v-card
        elevation="10"
        style="overflow: hidden"
    >
        <v-card-item
            class="card-header py-3 px-6"
            :style="{ borderTopColor: accentColor }"
        >
            <div class="d-sm-flex align-center justify-space-between">
                <div class="d-flex align-center">
                    <Icon
                        :icon="icon"
                        width="20"
                        :color="accentColor"
                    />
                    <v-card-title class="text-h5 mb-0 ml-2 header-title">
                        {{ title }}
                    </v-card-title>
                </div>
                <slot name="action" />
            </div>
        </v-card-item>
        <v-divider />
        <v-card-text>
            <slot />
        </v-card-text>
    </v-card>
</template>

<style scoped>
.card-header {
    background: #fff;
    border-top: 4px solid;
    font-weight: 600;
}
.header-title {
    color: #58595B;
}
</style>