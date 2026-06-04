<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const password = ref('Admin123*');
const username = ref('superadmin');
const showPassword = ref(false);

const passwordRules = [(v: string) => !!v || 'Contraseña es requerida'];
const userRules = [(v: string) => !!v || 'Usuario es requerido'];

const apiError = ref('');
const isSubmitting = ref(false);

const snackbar = ref(false);
const snackbarMsg = ref('');

onMounted(() => {
    const msg = localStorage.getItem('logoutMessage');

    if (msg) {
        snackbarMsg.value = msg;
        snackbar.value = true;

        localStorage.removeItem('logoutMessage');
    }
});

async function validate() {
    apiError.value = '';

    if (!username.value || !password.value) {
        apiError.value = 'complete_fields';
        return;
    }

    isSubmitting.value = true;
    const authStore = useAuthStore();

    try {
        await authStore.login(username.value, password.value);
    } catch (error: any) {
        const code = error?.response?.data?.code;

        const messages: Record<string, string> = {
            USER_NOT_FOUND:   'El usuario ingresado no existe',
            INVALID_PASSWORD: 'La contraseña es incorrecta',
            USER_BLOCKED:     'Tu cuenta está desactivada, comuníquese con el administrador',
        };

        apiError.value = messages[code] || 'Error al iniciar sesión';
    } finally {
        isSubmitting.value = false;
    }
}
</script>
<template>
    <div class="mt-5">
        <v-label class="font-weight-semibold pb-2">Usuario</v-label>
        <VTextField
            v-model="username"
            :disabled="isSubmitting"
            :rules="userRules"
            class="mb-2"
            hide-details="auto"
            placeholder="Usuario"
            autofocus
            clearable
        />

        <v-label class="font-weight-semibold pb-2">Contraseña</v-label>
        <VTextField
            v-model="password"
            :disabled="isSubmitting"
            :rules="passwordRules"
            :type="showPassword ? 'text' : 'password'"
            hide-details="auto"
            class="pwdInput"
            placeholder="Contraseña"
            clearable
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
        />

        <v-btn
            type="button"
            size="large"
            :loading="isSubmitting"
            color="primary"
            block
            flat
            class="mt-4"
            @click="validate"
        >
            Ingresar
        </v-btn>

        <div v-if="apiError" class="mt-2">
            <v-alert
                :type="apiError === 'complete_fields' ? 'info' : 'error'"
                variant="tonal"
                density="compact"
            >
                {{ apiError === 'complete_fields' ? 'Por favor complete todos los campos' : apiError }}
            </v-alert>
        </div>
    </div>
    <v-snackbar
        v-model="snackbar"
        color="success"
        timeout="3000"
        location="top right"
        >
        <v-icon class="mr-2">mdi-check-circle</v-icon>
        {{ snackbarMsg }}
    </v-snackbar>
</template>