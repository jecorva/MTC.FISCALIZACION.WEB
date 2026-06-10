<script setup>
import { Icon } from '@iconify/vue';
const props = defineProps({
    title: String,
    breadcrumbs: Array,
    icon: String,
    text: String
});
</script>

<template>
    <v-card
        elevation="10"
        class="mb-8"
    >
        <div class="px-6 py-4">
            <div class="d-flex justify-space-between align-center">
                <h5 class="text-h5 text-muted">{{ title }}</h5>

                <div
                    class="d-flex align-center text-raleway"
                    style="gap: 6px"
                >
                    <router-link
                        to="/"
                        style="
                            color: inherit;
                            display: flex;
                            align-items: center;
                        "
                    >
                        <Icon
                            icon="solar:home-2-line-duotone"
                            height="18"
                        />
                    </router-link>

                    <template
                        v-for="(item, index) in breadcrumbs"
                        :key="index"
                    >
                        <Icon
                            icon="solar:alt-arrow-right-line-duotone"
                            height="14"
                            style="color: #9e9e9e"
                        />

                        <router-link
                            v-if="!item.disabled"
                            :to="item.href"
                            class="bc-link"
                        >
                            {{ item.title }}
                        </router-link>

                        <span
                            v-else
                            style="
                                font-size: 13px;
                                font-weight: 600;
                                background: #58595b;
                                color: white;
                                padding: 3px 10px;
                                border-radius: 4px;
                            "
                        >
                            {{ item.title }}
                        </span>
                    </template>
                </div>
            </div>
        </div>
    </v-card>
</template>

<style scoped>
.bc-link {
    font-size: 14px;
    color: #9e9e9e;
    text-decoration: none;
    transition: color 0.2s;
}

.bc-link:hover {
    color: #58595b;
    /* text-decoration: underline; */
}
</style>
