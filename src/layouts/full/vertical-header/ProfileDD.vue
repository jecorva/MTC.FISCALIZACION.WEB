<script setup lang="ts">
import { MailIcon } from 'vue-tabler-icons';
import { ref } from 'vue';
import { profileDD } from '@/utils/helpers';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const dialogLogout = ref(false); // controla el modal
const loadingLogout = ref(false); // controla el loading
const snackbar = ref(false);
const snackbarMsg = ref('');
const router = useRouter();

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
        dialogLogout.value = false;
    }
};

const handleItem = (item: any) => {
    if (item.href === 'logout') {
        dialogLogout.value = true;
    }

    if (item.href === 'profile') {
        router.push({ name: 'UserProfile' });
    }
};
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
    <v-menu
        open-on-hover
        open-on-click
    >
        <template v-slot:activator="{ props }">
            <v-btn
                variant="text"
                class="custom-hover-primary"
                color="primary"
                v-bind="props"
                rounded="lg"
            >
                <span
                    class="text-subtitle-2 font-weight-semibold text-poppins"
                >
                    {{ authStore.user?.FullName }}
                </span>
                <v-avatar
                    size="28"
                    :color="
                        authStore.user?.Picture ? undefined : 'primary'
                    "
                    class="ml-2"
                >
                    <img
                        v-if="authStore.user?.Picture"
                        :src="authStore.user.Picture"
                        width="28"
                    />
                    <span
                        v-else
                        class="text-caption text-white font-weight-bold text-poppins"
                    >
                        {{ authStore.user?.Name?.charAt(0)
                        }}{{ authStore.user?.PaternalSurname?.charAt(0) }}
                    </span>
                </v-avatar>
            </v-btn>
        </template>
        <v-sheet
            rounded="md"
            width="280"
            elevation="10"
        >
            <div class="pa-6">
                <div class="d-flex align-center pb-6">
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
                    <div class="ml-3">
                        <!-- <h6 class="text-subtitle-1 mb-n1">
                            {{ authStore.user?.FullName
                            }}
                        </h6> -->
                        <span class="text-subtitle-1 textSecondary">{{
                            authStore.user?.Email
                        }}</span
                        ><br />
                        <span
                            class="text-subtitle-1 text-error font-weight-medium"
                        >
                            {{
                                authStore.user?.Role ?? 'Sin rol asignado'
                            }}
                        </span>
                    </div>
                </div>
                <v-divider></v-divider>
                <perfect-scrollbar
                    style="height: calc(100vh - 110px); max-height: 110px"
                >
                    <v-list
                        class="py-0 theme-list mt-3"
                        lines="one"
                    >
                        <!-- :to="item.href" -->
                        <v-list-item
                            v-for="item in profileDD"
                            :key="item.title"
                            class="py-0 px-2 rounded-md custom-text-primary text-14"
                            color="primary"
                            @click="handleItem(item)"
                        >
                            <div class="d-flex gap-3 align-center">
                                <p
                                    class="text-subtitle-3 heading custom-title"
                                >
                                    {{ item.title }}
                                </p>
                                <v-chip
                                    size="small"
                                    color="error"
                                    v-if="item.badge"
                                    >4</v-chip
                                >
                            </div>
                        </v-list-item>
                    </v-list>
                </perfect-scrollbar>
            </div>
        </v-sheet>
    </v-menu>
    <v-dialog
        v-model="dialogLogout"
        max-width="400"
    >
        <v-card>
            <v-card-title class="text-h6 py-3"> Confirmar </v-card-title>

            <v-card-text class="py-3 text-center">
                ¿Estás seguro que deseas cerrar sesión?
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn
                    variant="text"
                    class="text-14"
                    @click="dialogLogout = false"
                >
                    Cancelar
                </v-btn>

                <v-btn
                    color="error"
                    class="text-14"
                    :loading="loadingLogout"
                    @click="confirmLogout"
                >
                    Cerrar sesión
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-snackbar
        v-model="snackbar"
        color="success"
        timeout="3000"
        location="top right"
    >
        {{ snackbarMsg }}
    </v-snackbar>
</template>
