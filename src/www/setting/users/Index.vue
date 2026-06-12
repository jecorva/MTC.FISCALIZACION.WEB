<script setup lang="ts">
///<-----------------------------| *** Code Basic *** |----------------------------->///
import { computed, nextTick, ref, watch, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { permissionsList } from '@/api/permissions-list';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import JAppSnackBar from '@/components/JAppSnackBar.vue';

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
const page = ref({ title: 'Administrador | Usuarios' });
const breadcrumbs = ref([
    {
        title: 'Usuarios',
        disabled: true,
        href: '#'
    }
]);
const router = useRouter();
const { can } = usePermissions();
///<-----------------------------| *** Code Basic *** |----------------------------->///
import { userService } from '@/services/userService';

const filtrable = ref('');
const loading = ref(false);
const users = ref([]);
const headers = [
    {
        title: 'DNI',
        align: 'start' as const,
        sortable: false,
        key: 'DocumentNumber'
    },
    {
        title: 'NOMBRES Y APELLIDOS',
        align: 'start' as const,
        sortable: false,
        key: 'FullName'
    },
    {
        title: 'USUARIO',
        align: 'start' as const,
        sortable: false,
        key: 'UserName'
    },
    {
        title: 'ESTADO',
        align: 'start' as const,
        sortable: false,
        key: 'IsActive'
    },
    {
        title: 'ACCIÓN',
        align: 'center' as const,
        sortable: false,
        key: 'Id',
        width: '150px'
    }
];

const dlgPassword = ref(false);
const dlgDelete = ref(false);
const changeFormRef = ref();
const ldgChange = ref(false);
const ldgDelete = ref(false);
const changeId = ref('');
const viewPass = ref(false);
const viewConPass = ref(false);
const change = ref({
    Password: '',
    ConfirmPassword: ''
});
const errPassword = ref({ active: false, message: '' });
const errConPassword = ref({ active: false, message: '' });
const errAlert = ref({ active: false, message: '' });
const errPasswordClear = () => {
    errPassword.value = { active: false, message: '' };
};
const errConPasswordClear = () => {
    errConPassword.value = { active: false, message: '' };
};
const titleDelete = computed(() =>
    ldgDelete.value
        ? 'Eliminando...'
        : '¿Estás seguro que deseas eliminar este usuario?'
);

const openChangePassword = (item) => {
    change.value = {
        Password: '',
        ConfirmPassword: ''
    };
    errPassword.value = {
        active: false,
        message: ''
    };
    errConPassword.value = {
        active: false,
        message: ''
    };
    changeId.value = item.Id;
    dlgPassword.value = true;
};

const openDelete = (item) => {
    changeId.value = item.Id;
    dlgDelete.value = true;
};

const changePasswordSave = async () => {
    const { valid } = await changeFormRef.value.validate();
    if (!valid) return;

    errAlert.value = {
        active: false,
        message: ''
    };

    if (change.value.Password != change.value.ConfirmPassword) {
        errConPassword.value = {
            active: true,
            message: 'Contraseñas diferentes.'
        };
        return;
    }

    try {
        ldgChange.value = true;
        await userService.changePassword(changeId.value, {
            Password: change.value.Password
        });
        change.value = {
            Password: '',
            ConfirmPassword: ''
        };
        dlgPassword.value = false;
        setTimeout(() => {}, 500);
        showSnackbar('Contraseña cambiada.', 'success');
    } catch (error) {
        const code = error?.response?.data?.code;
        const messages: Record<string, string> = {
            CHANGE_NOT_FOUND: error?.response?.data?.message
        };
        errAlert.value = {
            active: true,
            message: messages[code] ?? 'Error en el servidor'
        };
    } finally {
        ldgChange.value = false;
    }
};

const deleteItemConfirm = async () => {
    ldgDelete.value = true;
    try {
        await userService.delete(changeId.value);
        initialize();
        setTimeout(() => {}, 1000);
        showSnackbar('Registro eliminado.', 'success');
    } catch (error) {
        const code = error?.response?.data?.code;
        const messages: Record<string, string> = {
            DELETE_NOT_FOUND: error?.response?.data?.message
        };
        showSnackbar(messages[code] ?? 'Error en el servidor', 'error');
    } finally {
        ldgDelete.value = false;
        dlgDelete.value = false;
    }
};

//|<- ONCLICK EDITAR
const editItem = (item) => {
    router.push({ name: 'UserFormEdit', params: { Id: item.Id } });
};

//|<- ONCLICK CREAR
const onClickCreate = () => {
    router.push({ name: 'UserForm' });
};

//|<- ONCLICK PERMISSION
const onClickPermission = (item) => {
    router.push({ name: 'UserPermissions', params: { Id: item.Id } });
};

const initialize = async () => {
    loading.value = true;
    try {
        users.value = await userService.getAll();
    } catch (error) {
        //const code = error?.response?.data?.code;
        const serverMessage = error?.response?.data?.message;
        showSnackbar(serverMessage, 'error');
        users.value = [];
    } finally {
        loading.value = false;
    }
};

onMounted(() => initialize());
</script>
<template>
    <BaseBreadcrumb
        :title="page.title"
        :breadcrumbs="breadcrumbs"
    ></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <UiParentCard title="GESTIÓN DE USUARIOS Y PERMISOS">
                <v-data-table
                    class="border rounded datatabels mt-3"
                    density="compact"
                    v-model:search="filtrable"
                    :headers="headers"
                    :items="users"
                    :loading="loading"
                    :sort-by="[{ key: 'name', order: 'asc' }]"
                    max-height="320"
                >
                    <template v-slot:top>
                        <v-toolbar class="px-3 bg-white border-b">
                            <v-text-field
                                v-model="filtrable"
                                prepend-inner-icon="mdi-magnify"
                                density="compact"
                                label="Buscar"
                                class="text-13"
                                single-line
                                flat
                                hide-details
                                variant="solo-filled"
                            >
                            </v-text-field>
                            <v-divider
                                class="mx-4"
                                inset
                                vertical
                            ></v-divider>
                            <v-spacer></v-spacer>
                            <v-btn
                                v-if="can(permissionsList.users.create)"
                                color="primary"
                                variant="flat"
                                rounded="pill"
                                class="text-14 px-5"
                                @click="onClickCreate"
                            >
                                <Icon
                                    icon="material-symbols:add-rounded"
                                    width="24"
                                    height="24"
                                    class=""
                                    style="color: #fff"
                                />
                                Agregar
                            </v-btn>
                        </v-toolbar>
                    </template>
                    <template v-slot:item.IsActive="{ item }">
                        <small
                            :class="
                                item.IsActive == 1
                                    ? 'bg-success'
                                    : 'bg-error'
                            "
                            class="rounded-pill text-center py-1 px-4 text-uppercase"
                        >
                            {{
                                item.IsActive == 1 ? 'Activo' : 'Inactivo'
                            }}
                        </small>
                    </template>
                    <template v-slot:item.Id="{ item }">
                        <div class="d-flex gap-2 justify-center">
                            <v-btn
                                v-if="
                                    can(permissionsList.users.permission)
                                "
                                size="sm"
                                variant="flat"
                                :color="
                                    item.IsActive === 1 ? 'info' : 'gray'
                                "
                                class="text-13 px-3"
                                @click="
                                    item.IsActive === 1
                                        ? onClickPermission(item)
                                        : null
                                "
                                :disabled="item.IsActive !== 1"
                            >
                                <Icon
                                    icon="solar:settings-bold"
                                    width="18"
                                />
                                Permisos
                            </v-btn>
                            <v-btn
                                v-if="can(permissionsList.users.update)"
                                color="info"
                                size="sm"
                                class="px-2 py-2"
                                variant="flat"
                                @click="editItem(item)"
                            >
                                <v-tooltip
                                    activator="parent"
                                    location="start"
                                    >Editar</v-tooltip
                                >
                                <Icon
                                    icon="material-symbols:edit-document"
                                    width="18"
                                />
                            </v-btn>
                            <v-btn
                                v-if="can(permissionsList.users.password)"
                                :color="
                                    item.IsActive === 1 ? 'info' : 'gray'
                                "
                                size="sm"
                                class="px-2 py-1"
                                variant="flat"
                                @click="
                                    item.IsActive === 1
                                        ? openChangePassword(item)
                                        : null
                                "
                                :disabled="item.IsActive !== 1"
                            >
                                <v-tooltip
                                    activator="parent"
                                    location="start"
                                    >Cambiar Contraseña</v-tooltip
                                >
                                <Icon
                                    icon="material-symbols:lock-open"
                                    width="18"
                                />
                            </v-btn>
                            <v-btn
                                v-if="can(permissionsList.users.delete)"
                                :color="
                                    item.IsActive === 1 ? 'error' : 'gray'
                                "
                                size="sm"
                                class="px-2 py-1"
                                variant="flat"
                                @click="
                                    item.IsActive === 1
                                        ? openDelete(item)
                                        : null
                                "
                                :disabled="item.IsActive !== 1"
                            >
                                <v-tooltip
                                    activator="parent"
                                    location="start"
                                    >Eliminar</v-tooltip
                                >
                                <Icon
                                    icon="solar:trash-bin-trash-bold"
                                    width="18"
                                />
                            </v-btn>
                        </div>
                    </template>
                </v-data-table>
            </UiParentCard>
        </v-col>
    </v-row>

    <!-- 1. DIALOG PASSWORD -->
    <v-dialog
        v-model="dlgPassword"
        :max-width="400"
    >
        <v-card>
            <v-form
                ref="changeFormRef"
                fast-fail
                @submit.prevent="changePasswordSave"
                :disabled="ldgChange"
            >
                <v-card-title
                    class="text-muted py-4 d-flex align-center gap-2 text-poppins"
                >
                    <v-progress-circular
                        v-if="ldgChange"
                        size="20"
                        width="2"
                        indeterminate
                    >
                    </v-progress-circular>
                    <Icon
                        v-else
                        icon="material-symbols:lock-open"
                        width="24"
                        height="24"
                    />
                    CAMBIAR CONTRASEÑA
                </v-card-title>
                <v-card-text class="py-2">
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
                    <v-row>
                        <v-col
                            cols="12"
                            class="py-0 mt-2"
                        >
                            <v-text-field
                                v-model="change.Password"
                                label="Contraseña nueva *"
                                :error="errPassword.active"
                                :error-messages="errPassword.message"
                                @input="errPasswordClear"
                                :rules="[
                                    (v) =>
                                        !!v ||
                                        '* La contraseña es requerida'
                                ]"
                                :type="viewPass ? 'text' : 'password'"
                                :append-inner-icon="
                                    viewPass ? 'mdi-eye' : 'mdi-eye-off'
                                "
                                @click:append-inner="viewPass = !viewPass"
                            ></v-text-field>
                        </v-col>
                        <v-col
                            cols="12"
                            class="py-1"
                        >
                            <v-text-field
                                v-model="change.ConfirmPassword"
                                label="Confirmar contraseña nueva *"
                                :error="errConPassword.active"
                                :error-messages="errConPassword.message"
                                @input="errConPasswordClear"
                                :rules="[
                                    (v) =>
                                        !!v ||
                                        '* La contraseña es requerida'
                                ]"
                                :type="viewConPass ? 'text' : 'password'"
                                :append-inner-icon="
                                    viewConPass ? 'mdi-eye' : 'mdi-eye-off'
                                "
                                @click:append-inner="
                                    viewConPass = !viewConPass
                                "
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="justify-end py-3 px-6">
                    <v-btn
                        variant="flat"
                        color="info"
                        class="text-14 px-3"
                        @click="dlgPassword = false"
                    >
                        <Icon
                            class="mr-1"
                            icon="solar:round-double-alt-arrow-left-broken"
                            width="22"
                            height="22"
                        />
                        Cerrar
                    </v-btn>
                    <v-btn
                        variant="flat"
                        color="primary"
                        class="text-14 px-3"
                        :loading="ldgChange"
                        type="submit"
                    >
                        <Icon
                            class="mr-1"
                            icon="solar:diskette-broken"
                            width="20"
                            height="20"
                        />
                        Guardar
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>

    <!-- 2. Snackbar mensaje -->
    <JAppSnackBar
        v-model="snackbar"
        :message="snackbarMsg"
        :type="snackbarType"
    />

    <!-- 3. Dialog eliminar usuario -->
    <v-dialog
        v-model="dlgDelete"
        :max-width="ldgDelete ? 250 : 400"
        :persistent="ldgDelete"
    >
        <v-card>
            <v-card-title class="text-h6 py-3 border-bottom bg-light">
                Mensaje - Eliminar
            </v-card-title>
            <v-card-text class="text-center py-2">
                <div>
                    <Icon
                        class="text-error trash-animate"
                        icon="solar:trash-bin-minimalistic-bold-duotone"
                        width="50"
                        height="50"
                    />
                </div>
                {{ titleDelete }}
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn
                    variant="text"
                    class="text-14"
                    :disabled="ldgDelete"
                    @click="dlgDelete = false"
                >
                    Cancelar
                </v-btn>
                <v-btn
                    color="error"
                    class="text-14"
                    :loading="ldgDelete"
                    @click="deleteItemConfirm"
                >
                    Eliminar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style></style>
