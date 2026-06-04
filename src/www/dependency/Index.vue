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
const page = ref({ title: 'Dependencias' });
const breadcrumbs = ref([
    {
        text: 'Gestionar dependencias',
        disabled: true,
        href: '#'
    }
]);

const router = useRouter();
const { can } = usePermissions();
///<-----------------------------| *** Code Basic *** |----------------------------->///

import DialogForm from './Form.vue';
import { dependencyService } from '@/services/dependencyService';

// --- estado de la tabla ---
const dependencies = ref([]);
const totalItems = ref(0);
const loading = ref(false);
const search = ref('');
const tableOptions = ref({ page: 1, itemsPerPage: 10 });

const headers = [
    {
        title: 'NOMBRE DE LA DEPENDENCIA',
        align: 'start' as const,
        sortable: false,
        key: 'Name'
    },
    {
        title: 'ACRÓNIMO',
        align: 'start' as const,
        sortable: false,
        key: 'Acronym'
    },
    {
        title: 'DIRECTOR',
        align: 'start' as const,
        sortable: false,
        key: 'Director'
    },
    /* {
        title: 'ESTADO',
        align: 'start' as const,
        sortable: false,
        key: 'IsActive'
    }, */
    {
        title: 'ACCIÓN',
        align: 'center' as const,
        sortable: false,
        key: 'Id',
        width: '150px'
    }
];
const dlgCreate = ref(false);
const dlgDelete = ref(false);
const ldgCreate = ref(false);
const ldgDelete = ref(false);
const dlgCreateRef = ref();
const selectedItem = ref();
const titleDelete = computed(() =>
    ldgDelete.value
        ? 'Eliminando...'
        : '¿Estás seguro que deseas eliminar este rol?'
);

const loadItems = async ({
    page,
    itemsPerPage
}: {
    page: number;
    itemsPerPage: number;
}) => {
    loading.value = true;
    try {
        const result = await dependencyService.getPaginated(
            page,
            itemsPerPage,
            search.value
        );
        dependencies.value = result.data; // array de items
        totalItems.value = result.total; // total de registros
    } catch {
        dependencies.value = [];
        totalItems.value = 0;
    } finally {
        loading.value = false;
    }
};

const onSearch = () => {
    tableOptions.value = { ...tableOptions.value, page: 1 };
    loadItems(tableOptions.value);
};

const editItem = async (item) => {
    dlgCreate.value = true;
    await nextTick();
    dlgCreateRef.value.setEditId(item.Id);
};

const deleteItem = (item) => {
    dlgDelete.value = true;
    selectedItem.value = { ...item };
};

const deleteItemConfirm = async () => {
    ldgDelete.value = true;
    try {
        await dependencyService.delete(selectedItem.value.Id);
        showSnackbar('Registro eliminado.', 'success');
        setTimeout(() => {}, 700);
        loadItems(tableOptions.value);
    } catch (error) {
        const code = error?.response?.data?.code;
        console.log(error?.response);
        const serverMessage =
            error?.response?.data?.message || 'Error catch';
        showSnackbar(serverMessage, 'error');
    } finally {
        ldgDelete.value = false;
        dlgDelete.value = false;
    }
};
</script>

<template>
    <BaseBreadcrumb :title="page.title"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <UiParentCard title="GESTIÓN DE DEPENDENCIAS">
                <v-data-table-server
                    class="border rounded mt-3"
                    density="compact"
                    :headers="headers"
                    :items="dependencies"
                    :items-length="totalItems"
                    :loading="loading"
                    v-model:options="tableOptions"
                    @update:options="loadItems"
                    items-per-page-text="Filas por página"
                    max-height="320"
                >
                    <template v-slot:top>
                        <v-toolbar class="px-3 bg-white border-b">
                            <v-text-field
                                v-model="search"
                                @update:model-value="onSearch"
                                prepend-inner-icon="mdi-magnify"
                                density="compact"
                                label="Buscar"
                                single-line
                                flat
                                hide-details
                                variant="solo-filled"
                                class="text-13"
                            />
                            <v-divider
                                class="mx-4"
                                inset
                                vertical
                            />
                            <v-spacer />
                            <v-btn
                                v-if="
                                    can(
                                        permissionsList.dependencies.create
                                    )
                                "
                                color="primary"
                                variant="flat"
                                rounded="pill"
                                class="text-14 px-5"
                                @click="dlgCreate = true"
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
                    <!-- Dependencia | Dependencia Superior -->
                    <template v-slot:item.Name="{ item }">
                        <v-label>{{ item.Name }}</v-label
                        ><br v-if="item.ParentName != 'NOT_PARENT'" />
                        <small
                            v-if="item.ParentName != 'NOT_PARENT'"
                            class="d-flex align-item-center"
                            ><Icon
                                icon="solar:double-alt-arrow-right-bold-duotone"
                                width="14"
                            />DS - {{ item.ParentName }}</small
                        >
                    </template>

                    <!-- botones de acción igual que antes -->
                    <template v-slot:item.Id="{ item }">
                        <div class="d-flex gap-2 justify-center">
                            <v-btn
                                v-if="
                                    can(
                                        permissionsList.dependencies.update
                                    )
                                "
                                color="info"
                                size="sm"
                                class="px-2 py-2"
                                variant="flat"
                                @click="
                                    item.IsActive === 1
                                        ? editItem(item)
                                        : null
                                "
                            >
                                <Icon
                                    class="mr-1"
                                    icon="material-symbols:edit-document"
                                    width="18"
                                />
                                <!-- <v-tooltip
                                    activator="parent"
                                    location="start"
                                    >Editar</v-tooltip
                                > -->
                                Editar</v-btn
                            >
                            <v-btn
                                v-if="
                                    can(
                                        permissionsList.dependencies.delete
                                    )
                                "
                                color="error"
                                size="sm"
                                class="px-2 py-1"
                                variant="flat"
                                @click="
                                    item.IsActive === 1
                                        ? deleteItem(item)
                                        : null
                                "
                            >
                                <Icon
                                    icon="solar:trash-bin-trash-bold"
                                    width="18"
                                />
                                <v-tooltip
                                    activator="parent"
                                    location="start"
                                    >Eliminar</v-tooltip
                                >
                            </v-btn>
                        </div>
                    </template>
                </v-data-table-server>
            </UiParentCard>
        </v-col>
    </v-row>
    <!-- 1. Dialog nuevo rol -->
    <v-dialog
        v-model="dlgCreate"
        max-width="500"
        :persistent="ldgCreate"
    >
        <v-card>
            <DialogForm
                :loading-create="ldgCreate"
                ref="dlgCreateRef"
                @close="dlgCreate = false"
                @snackbar="({ msg, type }) => showSnackbar(msg, type)"
                @loadingCreate="(value) => (ldgCreate = value)"
                @refreshList="() => loadItems(tableOptions)"
            />
        </v-card>
    </v-dialog>

    <!-- 2. Dialog eliminar dependencia -->
    <v-dialog
        v-model="dlgDelete"
        :max-width="ldgDelete ? 250 : 400"
        :persistent="ldgDelete"
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

    <!-- 3. Snackbar mensaje -->
    <JAppSnackBar
        v-model="snackbar"
        :message="snackbarMsg"
        :type="snackbarType"
    />
</template>
<style></style>
