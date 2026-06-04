<script setup lang="ts">
import { computed, nextTick, ref, watch, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { permissionsList } from '@/api/permissions-list';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { Icon } from '@iconify/vue';
import { roleService } from '@/services/roleService';
import { useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import JAppSnackBar from '@/components/JAppSnackBar.vue';
import RoleForm from './Form.vue';

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
// |<-- SNACKBAR --|

// |<-- BREADCRUMB --|
const page = ref({ title: 'Configuración | Roles' });
const breadcrumbs = ref([
    {
        text: 'Roles',
        disabled: true,
        href: '#'
    }
]);
// |<-- BREADCRUMB --|

const { can } = usePermissions();
const dialog = ref(false);
const dialogDelete = ref(false);
const dialogCreate = ref(false);
const dlgCreateRef = ref();
const filtrable = ref('');
const loading = ref(false);
const loadingDelete = ref(false);
const loadingCreate = ref(false);
const router = useRouter();
const headers = [
    {
        title: 'NOMBRE',
        align: 'start' as const,
        sortable: false,
        key: 'Name'
    },
    {
        title: 'DESCRIPCIÓN',
        align: 'start' as const,
        sortable: false,
        key: 'Description'
    },
    {
        title: 'CODE',
        align: 'start' as const,
        sortable: false,
        key: 'Role'
    },
    {
        title: 'ACCIÓN',
        align: 'center' as const,
        sortable: false,
        key: 'Id',
        width: '100px'
    }
];
const roles = ref([]);
const itemRow = ref();
const titleDelete = computed(() =>
    loadingDelete.value
        ? 'Eliminando...'
        : '¿Estás seguro que deseas eliminar este rol?'
);

const initialize = async () => {
    loading.value = true;
    try {
        roles.value = await roleService.getAll();
    } catch (error) {
        showSnackbar('Error al cargar los roles', 'error');
        roles.value = [];
    } finally {
        loading.value = false;
    }
};

const editItem = async (item) => {
    dialogCreate.value = true;
    await nextTick();
    dlgCreateRef.value.setEditId(item.Id);
};

const permissionsSetting = (item) => {
    router.push({ name: 'RolesPermissions', params: { id: item.Id } });
};

const deleteItem = (item) => {
    dialogDelete.value = true;
    itemRow.value = { ...item };
};

const deleteItemConfirm = async () => {
    loadingDelete.value = true;
    try {
        await roleService.delete(itemRow.value.Id);
        showSnackbar('Rol eliminado exitosamente', 'success');
        setTimeout(() => {}, 500);
        initialize();
    } catch (error) {
        const code = error?.response?.data?.code;
        const messages: Record<string, string> = {
            ROLE_ASSIGNED:
                error?.response?.data?.message || 'Sin mensaje específico',
            ROLE_HAS_PERMISSIONS:
                error?.response?.data?.message || 'Sin mensaje específico',
            ROLE_NOT_DELETED:
                error?.response?.data?.message || 'Sin mensaje específico'
        };
        showSnackbar(
            messages[code] || 'Error al eliminar el rol',
            'error'
        );
    } finally {
        loadingDelete.value = false;
        dialogDelete.value = false;
    }
};

watch(dialog, (val) => {
    val || close();
});

onMounted(() => initialize());
</script>

<template>
    <BaseBreadcrumb
        :title="page.title"
        :breadcrumbs="breadcrumbs"
    ></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <UiParentCard title="TABLA DE ROLES">
                <v-alert
                    border="start"
                    variant="tonal"
                    class="border border-primary"
                    color="primary"
                >
                    <template v-slot:prepend>
                        <Icon
                            icon="solar:info-circle-bold-duotone"
                            width="50"
                        />
                    </template>

                    <div class="h5 text-poppins font-weight-bold mb-0">
                        ADVERTENCIA!
                    </div>
                    <div class="text-body text-justify">
                        Debe de tener cuidado al asignar los permisos a los
                        roles, ya que esto puede afectar la correcta
                        asignación a los usuarios.
                    </div>
                </v-alert>
                <v-data-table
                    class="border rounded datatabels mt-3"
                    density="compact"
                    v-model:search="filtrable"
                    :headers="headers"
                    :items="roles"
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
                                v-if="can(permissionsList.roles.create)"
                                color="primary"
                                variant="flat"
                                rounded="pill"
                                class="text-14 px-5"
                                @click="dialogCreate = true"
                            >
                                <Icon
                                    icon="material-symbols:add-rounded"
                                    width="24"
                                    height="24"
                                    style="color: #fff"
                                />
                                Agregar
                            </v-btn>
                        </v-toolbar>
                    </template>
                    <template v-slot:item.Id="{ item }">
                        <div class="d-flex gap-2 justify-center">
                            <!-- <Icon icon="solar:pen-new-square-broken" height="20" class="text-primary cursor-pointer" @click="editItem(item)" />
                             -->
                            <v-btn
                                v-if="
                                    can(permissionsList.roles.permission)
                                "
                                size="sm"
                                :color="
                                    item.IsActive === 1
                                        ? 'primary'
                                        : 'gray'
                                "
                                class="text-13 px-3"
                                @click="
                                    item.IsActive === 1
                                        ? permissionsSetting(item)
                                        : permissionsSetting(item)
                                "
                            >
                                <Icon
                                    class="mr-1"
                                    icon="solar:settings-bold"
                                    width="18"
                                />
                                Permisos
                            </v-btn>
                            <v-btn
                                v-if="can(permissionsList.roles.update)"
                                :color="
                                    item.IsActive === 1 ? 'info' : 'gray'
                                "
                                size="sm"
                                class="px-2 py-2"
                                @click="
                                    item.IsActive === 1
                                        ? editItem(item)
                                        : null
                                "
                                :disabled="item.IsActive !== 1"
                            >
                                <Icon
                                    class="mr-1"
                                    icon="material-symbols:edit-document"
                                    width="18"
                                />
                                Editar
                            </v-btn>
                            <v-btn
                                v-if="can(permissionsList.roles.delete)"
                                color="error"
                                size="sm"
                                class="px-2 py-1"
                                variant="flat"
                                @click="
                                    item.IsActive === 1
                                        ? deleteItem(item)
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
                    <!-- <template v-slot:no-data>
                        <span class="text-center">Sin registros</span>
                    </template> -->
                </v-data-table>
            </UiParentCard>
        </v-col>
    </v-row>
    <!-- 1. Dialog nuevo rol -->
    <v-dialog
        v-model="dialogCreate"
        max-width="500"
        :persistent="loadingCreate"
    >
        <v-card>
            <RoleForm
                :loading-create="loadingCreate"
                ref="dlgCreateRef"
                @close="dialogCreate = false"
                @snackbar="({ msg, type }) => showSnackbar(msg, type)"
                @loadingCreate="(value) => (loadingCreate = value)"
                @refreshList="initialize"
            />
        </v-card>
    </v-dialog>

    <!-- 2. Dialog eliminar rol -->
    <v-dialog
        v-model="dialogDelete"
        :max-width="loadingDelete ? 250 : 400"
        :persistent="loadingDelete"
    >
        <v-card>
            <v-card-title class="text-h6 py-3 border-bottom bg-light">
                Confirmar
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
                    :disabled="loadingDelete"
                    @click="dialogDelete = false"
                >
                    Cancelar
                </v-btn>
                <v-btn
                    color="error"
                    class="text-14"
                    :loading="loadingDelete"
                    @click="deleteItemConfirm"
                >
                    Eliminar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- 3. Snackbar mensaje -->
    <JAppSnackBar
        v-model="snackbar"
        :message="snackbarMsg"
        :type="snackbarType"
    />
</template>

<style></style>
