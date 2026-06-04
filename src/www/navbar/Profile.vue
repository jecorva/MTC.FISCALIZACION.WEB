<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import JAppSnackBar from '@/components/JAppSnackBar.vue';
import { profileService } from '@/services/profileService';

// |<-- SNACKBAR --|
type SnackbarType = 'success' | 'error' | 'warning' | 'info';
const snackbar = ref(false);
const snackbarMsg = ref('');
const snackbarType = ref<SnackbarType>('success');
const showSnackbar = (msg: string, type: SnackbarType) => {
    snackbarMsg.value = msg;
    snackbarType.value = type;
    snackbar.value = true;
};

// |<-- BREADCRUMB --|
const page = ref({ title: 'Mi Perfil' });
const breadcrumbs = ref([
    { text: 'Mi Perfil', disabled: true, href: '#' }
]);

// |<-- ESTADO --|
const loading = ref(false);
const savingProfile = ref(false);
const savingPassword = ref(false);
const uploadingPhoto = ref(false);
const photoPreview = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// |<-- PERFIL --|
const profile = reactive({
    Name: '',
    PaternalSurname: '',
    MaternalSurname: '',
    Phone: '',
    // Solo lectura:
    DocumentNumber: '',
    UserName: '',
    Email: '',
    Picture: ''
});

// |<-- CONTRASEÑA --|
const passwordForm = reactive({
    current_password: '',
    new_password: '',
    confirm_password: ''
});
const showCurrentPw = ref(false);
const showNewPw = ref(false);
const showConfirmPw = ref(false);

// |<-- ERRORES --|
const profileErrors = reactive({
    Name: '',
    PaternalSurname: '',
    Phone: ''
});
const passwordErrors = reactive({
    current_password: '',
    new_password: '',
    confirm_password: ''
});
const errAlert = ref({ active: false, message: '' });

// |<-- INICIALES --|
const initials = computed(() => {
    const n = profile.Name?.[0] ?? '';
    const a = profile.PaternalSurname?.[0] ?? '';
    return (n + a).toUpperCase();
});

// |<-- CARGAR DATOS --|
const loadProfile = async () => {
    loading.value = true;
    try {
        const data = await profileService.get();
        Object.assign(profile, data);
    } catch (error) {
        const msg = error?.response?.data?.message;
        showSnackbar(msg || 'Error al cargar el perfil', 'error');
    } finally {
        loading.value = false;
    }
};

// |<-- PICTURE --|
const triggerFileInput = () => fileInput.value?.click();

const onPhotoSelected = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    errAlert.value = {
        active: false,
        message: ''
    };

    if (file.size > 2 * 1024 * 1024) {
        // showSnackbar('La imagen no puede superar 2 MB', 'warning');
        errAlert.value = {
            active: true,
            message: 'La imagen no puede superar 2 MB'
        };
        return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        // showSnackbar('Formato no válido. Usa JPG, PNG o WEBP', 'warning');
        errAlert.value = {
            active: true,
            message: 'Formato no válido. Usa JPG, PNG o WEBP'
        };
        return;
    }

    // Preview inmediato
    photoPreview.value = URL.createObjectURL(file);

    // Auto-upload sin necesidad de guardar cambios
    uploadingPhoto.value = true;
    try {
        const data = await profileService.uploadPhoto(file);
        profile.Picture = data?.Picture ?? profile.Picture;
        showSnackbar('Foto actualizada correctamente', 'success');
    } catch (error) {
        const msg = error?.response?.data?.message;
        // showSnackbar(msg || 'Error al subir la foto', 'error');
        errAlert.value = {
            active: true,
            message: msg || 'Error al subir la foto'
        };
        // Revertir preview si falló
        photoPreview.value = null;
    } finally {
        uploadingPhoto.value = false;
        // Limpiar input para permitir seleccionar la misma imagen de nuevo
        if (fileInput.value) fileInput.value.value = '';
    }
};

// |<-- GUARDAR PERFIL --|
const validateProfile = () => {
    let valid = true;
    profileErrors.Name = '';
    profileErrors.PaternalSurname = '';
    profileErrors.Phone = '';

    if (!profile.Name.trim()) {
        profileErrors.Name = 'El nombre es requerido';
        valid = false;
    }
    if (!profile.PaternalSurname.trim()) {
        profileErrors.PaternalSurname = 'El apellido paterno es requerido';
        valid = false;
    }
    if (profile.Phone && !/^\+?[\d\s\-]{7,15}$/.test(profile.Phone)) {
        profileErrors.Phone = 'Formato de teléfono inválido';
        valid = false;
    }
    return valid;
};

const saveProfile = async () => {
    if (!validateProfile()) return;
    savingProfile.value = true;
    try {
        await profileService.update({
            Name: profile.Name,
            PaternalSurname: profile.PaternalSurname,
            MaternalSurname: profile.MaternalSurname,
            Phone: profile.Phone
        });
        showSnackbar('Perfil actualizado correctamente', 'success');
    } catch (error) {
        const msg = error?.response?.data?.message;
        //showSnackbar(msg || 'Error al actualizar el perfil', 'error');
        errAlert.value = {
            active: true,
            message: msg || 'Error al actualizar el perfil'
        };
    } finally {
        savingProfile.value = false;
    }
};

// |<-- CAMBIO DE CONTRASEÑA --|
const validatePassword = () => {
    let valid = true;
    passwordErrors.current_password = '';
    passwordErrors.new_password = '';
    passwordErrors.confirm_password = '';

    if (!passwordForm.current_password) {
        passwordErrors.current_password = 'Ingresa tu contraseña actual';
        valid = false;
    }
    if (passwordForm.new_password.length < 8) {
        passwordErrors.new_password = 'Mínimo 8 caracteres';
        valid = false;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
        passwordErrors.confirm_password = 'Las contraseñas no coinciden';
        valid = false;
    }
    return valid;
};

const changePassword = async () => {
    if (!validatePassword()) return;
    savingPassword.value = true;
    try {
        await profileService.changePass({
            CurrentPassword: passwordForm.current_password,
            NewPassword: passwordForm.new_password
        });
        passwordForm.current_password = '';
        passwordForm.new_password = '';
        passwordForm.confirm_password = '';
        showSnackbar('Contraseña actualizada correctamente', 'success');
    } catch (error) {
        const code = error?.response?.data?.code;
        const msg = error?.response?.data?.message;

        if (code === 'WRONG_PASSWORD') {
            passwordErrors.current_password =
                '* La contraseña actual es incorrecta';
        }

        errAlert.value = {
            active: true,
            message: msg || 'Error al cambiar la contraseña'
        };
    } finally {
        savingPassword.value = false;
    }
};

onMounted(() => loadProfile());
</script>

<template>
    <BaseBreadcrumb
        :title="page.title"
        :breadcrumbs="breadcrumbs"
    />

    <v-row v-if="loading">
        <v-col class="d-flex justify-center py-10">
            <v-progress-circular
                indeterminate
                color="primary"
            />
        </v-col>
    </v-row>

    <v-row v-else>
        <v-col
            cols="12"
            class="py-0"
        >
            <v-alert
                type="error"
                variant="flat"
                closable
                close-label="Close Alert"
                class="mb-4"
                v-if="errAlert.active"
            >
                <div>
                    {{ errAlert.message }}
                </div>
            </v-alert>
        </v-col>
        <!-- Columna izquierda: Picture + datos bloqueados -->
        <v-col
            cols="12"
            md="4"
        >
            <UiParentCard>
                <!-- Picture de perfil -->
                <div class="d-flex flex-column align-center gap-3 pb-4">
                    <v-avatar
                        size="96"
                        class="cursor-pointer"
                        @click="triggerFileInput"
                    >
                        <v-img
                            v-if="photoPreview || profile.Picture"
                            :src="photoPreview ?? profile.Picture"
                        />
                        <span
                            v-else
                            class="text-h5 font-weight-medium"
                        >
                            {{ initials }}
                        </span>

                        <!-- Overlay cámara o loading -->
                        <div class="avatar-overlay">
                            <v-progress-circular
                                v-if="uploadingPhoto"
                                indeterminate
                                color="white"
                                size="24"
                            />
                            <v-icon
                                v-else
                                color="white"
                            >
                                mdi-camera
                            </v-icon>
                        </div>
                    </v-avatar>

                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        class="d-none"
                        @change="onPhotoSelected"
                    />

                    <v-btn
                        variant="outlined"
                        size="small"
                        class="font-weight-medium"
                        prepend-icon="mdi-upload"
                        :loading="uploadingPhoto"
                        @click="triggerFileInput"
                    >
                        Cambiar Foto
                    </v-btn>

                    <p class="text-caption text-medium-emphasis">
                        JPG, PNG o WEBP. Máx 2 MB
                    </p>
                </div>

                <v-divider />

                <!-- Campos bloqueados -->
                <div class="pt-4 d-flex flex-column gap-3">
                    <div>
                        <p
                            class="text-caption text-uppercase text-poppins text-medium-emphasis mb-1"
                        >
                            Número de documento
                        </p>
                        <p
                            class="text-body-3 d-flex align-center text-manrope gap-1"
                        >
                            <v-icon
                                size="16"
                                class="mr-2"
                            >
                                mdi-card-account-details-outline
                            </v-icon>
                            {{ profile.DocumentNumber }}
                        </p>
                    </div>
                    <div>
                        <p
                            class="text-caption text-uppercase text-poppins text-medium-emphasis mb-1"
                        >
                            Usuario
                        </p>
                        <p
                            class="text-body-3 d-flex align-center text-manrope gap-1"
                        >
                            <v-icon
                                size="16"
                                class="mr-2"
                            >
                                mdi-account
                            </v-icon>
                            {{ profile.UserName }}
                        </p>
                    </div>
                    <div>
                        <p
                            class="text-caption text-uppercase text-poppins text-medium-emphasis mb-1"
                        >
                            Correo electrónico
                        </p>
                        <p
                            class="text-body-3 d-flex align-center text-manrope gap-1"
                        >
                            <v-icon
                                size="16"
                                class="mr-2"
                            >
                                mdi-email
                            </v-icon>
                            {{ profile.Email }}
                        </p>
                    </div>
                </div>
            </UiParentCard>
        </v-col>

        <!-- Columna derecha: formularios -->
        <v-col
            cols="12"
            md="8"
        >
            <!-- Datos personales -->
            <UiParentCard
                title="Información personal"
                class="mb-4"
            >
                <v-row>
                    <v-col
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="profile.Name"
                            @update:modelValue="
                                (val) => (profile.Name = val.toUpperCase())
                            "
                            label="Nombre(s) *"
                            variant="outlined"
                            density="comfortable"
                            :error-messages="profileErrors.Name"
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="profile.PaternalSurname"
                            @update:modelValue="
                                (val) =>
                                    (profile.PaternalSurname =
                                        val.toUpperCase())
                            "
                            label="Apellido Paterno *"
                            variant="outlined"
                            density="comfortable"
                            :error-messages="profileErrors.PaternalSurname"
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="profile.MaternalSurname"
                            @update:modelValue="
                                (val) =>
                                    (profile.MaternalSurname =
                                        val.toUpperCase())
                            "
                            label="Apellido Materno"
                            variant="outlined"
                            density="comfortable"
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="profile.Phone"
                            placeholder="999999999"
                            v-maska="'#########'"
                            label="Teléfono"
                            variant="outlined"
                            density="comfortable"
                            :error-messages="profileErrors.Phone"
                            prepend-inner-icon="mdi-phone-outline"
                        />
                    </v-col>
                </v-row>

                <div class="d-flex justify-end gap-2 pt-2">
                    <!-- <v-btn
                        variant="outlined"
                        @click="loadProfile"
                    >
                        Cancelar
                    </v-btn> -->
                    <v-btn
                        color="primary"
                        :loading="savingProfile"
                        class="text-14"
                        @click="saveProfile"
                    >
                        <Icon
                            icon="solar:diskette-broken"
                            width="20"
                            class="mr-1"
                        />
                        Guardar
                    </v-btn>
                </div>
            </UiParentCard>

            <!-- Cambio de contraseña -->
            <UiParentCard title="Cambio de contraseña">
                <v-row>
                    <v-col
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="passwordForm.current_password"
                            label="Contraseña actual *"
                            :type="showCurrentPw ? 'text' : 'password'"
                            :append-inner-icon="
                                showCurrentPw ? 'mdi-eye-off' : 'mdi-eye'
                            "
                            variant="outlined"
                            density="comfortable"
                            :error-messages="
                                passwordErrors.current_password
                            "
                            @click:append-inner="
                                showCurrentPw = !showCurrentPw
                            "
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        sm="6"
                    />
                    <!-- spacer -->
                    <v-col
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="passwordForm.new_password"
                            label="Nueva contraseña *"
                            :type="showNewPw ? 'text' : 'password'"
                            :append-inner-icon="
                                showNewPw ? 'mdi-eye-off' : 'mdi-eye'
                            "
                            variant="outlined"
                            density="comfortable"
                            :error-messages="passwordErrors.new_password"
                            hint="Mínimo 8 caracteres"
                            persistent-hint
                            @click:append-inner="showNewPw = !showNewPw"
                        />
                    </v-col>
                    <v-col
                        cols="12"
                        sm="6"
                    >
                        <v-text-field
                            v-model="passwordForm.confirm_password"
                            label="Confirmar contraseña *"
                            :type="showConfirmPw ? 'text' : 'password'"
                            :append-inner-icon="
                                showConfirmPw ? 'mdi-eye-off' : 'mdi-eye'
                            "
                            variant="outlined"
                            density="comfortable"
                            :error-messages="
                                passwordErrors.confirm_password
                            "
                            @click:append-inner="
                                showConfirmPw = !showConfirmPw
                            "
                        />
                    </v-col>
                </v-row>

                <div class="d-flex justify-end pt-2">
                    <v-btn
                        color="primary"
                        :loading="savingPassword"
                        class="text-14"
                        @click="changePassword"
                    >
                        <Icon
                            icon="solar:diskette-broken"
                            width="20"
                            class="mr-1"
                        />
                        Cambiar Contraseña
                    </v-btn>
                </div>
            </UiParentCard>
        </v-col>
    </v-row>

    <JAppSnackBar
        v-model="snackbar"
        :message="snackbarMsg"
        :type="snackbarType"
    />
</template>

<style scoped>
.avatar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
}
.v-avatar:hover .avatar-overlay {
    opacity: 1;
}
</style>
