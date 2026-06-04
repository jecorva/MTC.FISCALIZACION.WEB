<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useCustomizerStore } from '../../../stores/customizer';
import { useEcomStore } from '@/stores/apps/eCommerce';
import LanguageDD from './LanguageDD.vue';
import NotificationDD from './NotificationDD.vue';
import ProfileDD from './ProfileDD.vue';
import Searchbar from './Searchbar.vue';
import RightMobileSidebar from './RightMobileSidebar.vue';
import Navigations from './Navigations.vue';
import { Icon } from '@iconify/vue';
import Logo from '../logo/Logo.vue';
import ThemeToggler from './ThemeToggler.vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const loadingLogout = ref(false);

const confirmLogout = async () => {
    loadingLogout.value = true;
    try {
        await authStore.logout();
        localStorage.setItem(
            'logoutMessage',
            'Sesión cerrada correctamente'
        );
    } finally {
        loadingLogout.value = false;
    }
};

const customizer = useCustomizerStore();
const showSearch = ref(false);
const priority = ref(customizer.setHorizontalLayout ? 0 : 0);
function searchbox() {
    showSearch.value = !showSearch.value;
}
watch(priority, (newPriority) => {
    priority.value = newPriority;
});

// count items
const store = useEcomStore();
const getCart = computed(() => {
    return store.cart;
});
</script>

<template>
    <v-app-bar
        elevation="0"
        :priority="priority"
        height="70"
        id="top"
        class="main-head"
    >
        <v-btn
            class="hidden-md-and-down custom-hover-primary"
            icon
            size="small"
            variant="text"
            color="primary"
            @click.stop="
                customizer.SET_MINI_SIDEBAR(!customizer.mini_sidebar)
            "
        >
            <Icon
                icon="solar:hamburger-menu-line-duotone"
                height="22"
                style="color: #0074ba !important"
            />
        </v-btn>

        <v-btn
            class="hidden-lg-and-up custom-hover-primary"
            size="small"
            variant="text"
            color="primary"
            icon
            @click.stop="customizer.SET_SIDEBAR_DRAWER"
        >
            <Icon
                icon="solar:hamburger-menu-line-duotone"
                height="22"
                style="color: #0074ba !important"
            />
        </v-btn>

        <!-- ---------------------------------------------- -->
        <!-- Search part -->
        <!-- ---------------------------------------------- -->
        <!-- <Searchbar /> -->

        <!-- ---------------------------------------------- -->
        <!-- Mega menu -->
        <!-- ---------------------------------------------- -->
        <div class="hidden-sm-and-down">
            <!-- <Navigations /> -->
        </div>

        <v-spacer class="hidden-sm-and-down" />

        <!-- ---------------------------------------------- -->
        <!-- Mobile Logo -->
        <!-- ---------------------------------------------- -->
        <div class="hidden-md-and-up">
            <Logo />
        </div>

        <!-- ThemeToggler -->
        <!-- <ThemeToggler /> -->

        <!-- ---------------------------------------------- -->
        <!-- translate -->
        <!-- ---------------------------------------------- -->
        <!-- <div class="hidden-sm-and-down">
            <LanguageDD />
        </div> -->

        <!-- ---------------------------------------------- -->
        <!-- ShoppingCart -->
        <!-- ---------------------------------------------- -->
        <!--  <v-btn icon class="custom-hover-primary hidden-sm-and-down" size="small"  variant="text" color="primary" to="/ecommerce/checkout">
            <v-badge color="error" :content="getCart?.length">
                <Icon icon="solar:cart-large-2-outline" height="22"   />
            </v-badge>
        </v-btn> -->

        <!-- ---------------------------------------------- -->
        <!-- Notification -->
        <!-- ---------------------------------------------- -->
        <!-- <div class="hidden-sm-and-down">
            <NotificationDD />
        </div> -->

        <!-- ---------------------------------------------- -->
        <!-- User Profile -->
        <!-- ---------------------------------------------- -->
        <div class="hidden-sm-and-down">
            <ProfileDD />
        </div>

        <!----Mobile ----->
        <!-- <v-menu
            :close-on-content-click="true"
            class="mobile_popup"
        >
            <template v-slot:activator="{ props }">
                <v-btn
                    icon
                    class="hidden-md-and-up custom-hover-primary"
                    color="primary"
                    variant="text"
                    v-bind="props"
                    size="small"
                >
                    <Icon
                        icon="solar:menu-dots-bold-duotone"
                        height="22"
                    />
                </v-btn>
            </template>
            <v-sheet
                rounded="lg"
                elevation="10"
                class="mt-4 dropdown-box px-4 py-3"
            >
                <div class="text-center">                    
                    <RightMobileSidebar />
                    <LanguageDD />
                    <v-btn
                        icon
                        variant="text"
                        class="mr-sm-3 mr-2 custom-hover-primary"
                        to="/ecommerce/checkout"
                        size="small"
                    >
                        <v-badge
                            color="primary"
                            :content="getCart?.length"
                            offset-x="-4"
                            offset-y="-6"
                        >
                            <Icon
                                icon="solar:cart-large-2-outline"
                                height="22"
                            />
                        </v-badge>
                    </v-btn>
                    <NotificationDD />
                    <ProfileDD />
                </div>
            </v-sheet>
        </v-menu> -->
        <!----Mobile ----->
        <v-menu
            :close-on-content-click="true"
            class="mobile_popup"
        >
            <template v-slot:activator="{ props }">
                <v-btn
                    icon
                    class="hidden-md-and-up custom-hover-primary"
                    color="primary"
                    variant="text"
                    v-bind="props"
                    size="small"
                >
                    <Icon
                        icon="solar:menu-dots-bold-duotone"
                        height="22"
                    />
                </v-btn>
            </template>
            <v-sheet
                rounded="lg"
                elevation="10"
                class="mt-4 dropdown-box px-4 py-3"
                min-width="220"
            >
                <!-- Nombre + avatar -->
                <div class="d-flex align-center gap-3 pb-3">
                    <v-avatar
                        size="35"
                        :color="
                            authStore.user?.Picture ? undefined : 'primary'
                        "
                    >
                        <img
                            v-if="authStore.user?.Picture"
                            :src="authStore.user.Picture"
                            width="35"
                        />
                        <span
                            v-else
                            class="text-h6 text-poppins text-white font-weight-bold"
                        >
                            {{ authStore.user?.Name?.charAt(0) }}
                        </span>
                    </v-avatar>
                    <div>
                        <p
                            class="text-subtitle-2 font-weight-semibold text-poppins mb-0"
                        >
                            {{ authStore.user?.FullName }}
                        </p>
                        <p class="text-caption text-medium-emphasis mb-0">
                            {{
                                authStore.user?.Role ?? 'Sin rol asignado'
                            }}
                        </p>
                    </div>
                </div>

                <v-divider class="mb-3" />

                <!-- Cerrar sesión directo -->
                <v-btn
                    block
                    variant="text"
                    color="muted"
                    size="small"
                    class="text-14"
                    prepend-icon="mdi-logout"
                    :loading="loadingLogout"
                    @click="confirmLogout"
                >
                    Cerrar sesión
                </v-btn>
            </v-sheet>
        </v-menu>
    </v-app-bar>
</template>
