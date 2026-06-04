<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Form } from 'vee-validate';

/*Social icons*/
import google from '@/assets/images/svgs/google-icon.svg';
import facebook from '@/assets/images/svgs/facebook-icon.svg';

const checkbox = ref(false);
const valid = ref(false);
const show1 = ref(false);
const password = ref('');
const username = ref('');
const passwordRules = ref([
    (v: string) => !!v || 'Contraseña es requerida',
    (v: string) => (v && v.length <= 10) || 'La contraseña debe tener menos de 10 caracteres.'
]);
// const emailRules = ref([(v: string) => !!v || 'E-mail es requerido', (v: string) => /.+@.+\..+/.test(v) || 'Usuario es invalido']);
const userRules = ref([(v: string) => !!v || 'Usuario es requerido']);

async function validate(values: any, { setErrors }: any) {
    if (username.value === '' || password.value === '') {
        setErrors({ apiError: 'complete_fields' });
        return;
    }
    const authStore = useAuthStore();

    try {
        await authStore.login(username.value, password.value);
    } catch (error: any) {
        setErrors({ apiError: error?.message || 'Error al iniciar sesión' });
    }
}
</script>

<template>
    <!-- <v-row class="d-flex mb-3">
        <v-col cols="6" sm="6" class="pr-2">
            <v-btn variant="outlined" size="large" class="border text-subtitle-1 font-weight-semibold hover-link-primary" block>
                <img :src="facebook" width="20" class="mr-1" alt="facebook" />
                <span class="d-md-flex d-none mr-1">Sign in with</span> Facebook
            </v-btn>
        </v-col>
        <v-col cols="6" sm="6" class="pl-2">
            <v-btn variant="outlined" size="large" class="border text-subtitle-1 font-weight-semibold hover-link-primary" block>
                <img :src="google" height="16" class="mr-2" alt="google" />
                <span class="d-md-flex d-none mr-1">Sign in with</span> Google
            </v-btn>
        </v-col>
    </v-row>-->
    <div class="d-flex align-center text-center mb-6">
        <div class="text-h6 w-100 px-5 font-weight-regular auth-divider position-relative">
            <span class="bg-surface px-5 py-3 position-relative textSecondary">Iniciar Sesión</span>
        </div>
    </div>
    <Form @submit="validate" v-slot="{ errors, isSubmitting }" class="mt-5">
        <v-label class="font-weight-semibold pb-2">Usuario</v-label>
        <VTextField v-model="username" :rules="userRules" class="mb-3" required hide-details="auto" autofocus></VTextField>
        <div class="d-flex justify-space-between align-center pb-2">
            <v-label class="font-weight-semibold">Contraseña</v-label>
            <RouterLink to="/auth/forgot-password2" class="text-primary text-decoration-none font-weight-medium"
                >Olvido contraseña ?</RouterLink
            >
        </div>

        <VTextField v-model="password" :rules="passwordRules" required hide-details="auto" type="password" class="pwdInput"></VTextField>
        <div class="d-flex flex-wrap align-center my-3 ml-n2">
            <!-- <v-checkbox
                class="pe-2"
                v-model="checkbox"
                :rules="[(v: any) => !!v || 'You must agree to continue!']"
                required
                hide-details
                color="primary"
            >
                <template v-slot:label class="font-weight-medium">Keep me logged in</template>
            </v-checkbox> -->
        </div>
        <v-btn size="large" :loading="isSubmitting" color="primary" :disabled="isSubmitting" block type="submit" flat>INGRESAR</v-btn>
        <div v-if="errors.apiError" class="mt-2">
            <v-alert :type="errors.apiError === 'complete_fields' ? 'info' : 'error'" variant="tonal" density="compact">
                {{ errors.apiError === 'complete_fields' ? 'Por favor complete todos los campos' : errors.apiError }}
            </v-alert>
        </div>
    </Form>
</template>
