<script setup lang="ts">
///<-----------------------------| CODE BASIC |----------------------------->///
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useRoute, useRouter } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import JAppSnackBar from '@/components/JAppSnackBar.vue';
import { rolePermissionService } from '@/services/roleService';

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
const page = ref({ title: 'Configuración | Roles | Permisos' });
const breadcrumbs = ref([
    { title: 'Roles', disabled: false, href: '/configuracion/roles' },
    { title: 'Permisos', disabled: true, href: '#' }
]);

const route = useRoute();
const router = useRouter();
///<-----------------------------| **** END CODE BASIC **** |----------------------------->///

const roleId = route.params.id as string;

// ─── Etiquetas de acciones ───────────────────────────────────────────────────
const actionLabels: Record<string, string> = {
    list: 'Listar',
    create: 'Crear',
    update: 'Editar',
    delete: 'Eliminar',
    view: 'Visualizar',
    manage: 'Gestionar',
    change_pass: 'Cambiar Contraseña',
    permission: 'Gestionar Permisos',
    change: 'Cambiar [Dato]'
};

function translateLabel(name: string): string {
    const key = name?.toLowerCase().replace(/[\s_]/g, '');
    for (const [k, v] of Object.entries(actionLabels)) {
        if (k.replace(/_/g, '') === key) return v;
    }
    return name;
}

// ─── Estado ─────────────────────────────────────────────────────────────────
const tree = ref<any[]>([]);
const roleName = ref('');
const expanded = ref<string[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogConfirm = ref(false);
const dialogLoading = ref(false);

// ─── Cargar árbol ────────────────────────────────────────────────────────────
async function loadTree() {
    loading.value = true;
    try {
        const data = await rolePermissionService.getTree(roleId);
        roleName.value = data.roleName ?? '';
        tree.value = data.tree ?? [];
        expanded.value = tree.value.map((n: any) => n.id);
    } catch {
        showSnackbar('Error al cargar los permisos', 'error');
    } finally {
        loading.value = false;
    }
}

// ─── Expand / collapse ───────────────────────────────────────────────────────
function toggleExpand(id: string) {
    const idx = expanded.value.indexOf(id);
    if (idx === -1) expanded.value.push(id);
    else expanded.value.splice(idx, 1);
}

// ─── Toggle permiso ──────────────────────────────────────────────────────────
function togglePermission(permId: string) {
    toggleInTree(tree.value, permId);
}

function toggleInTree(nodes: any[], permId: string): boolean {
    for (const node of nodes) {
        if (node.id === permId) {
            node.assigned = !node.assigned;
            return true;
        }
        if (node.children?.length && toggleInTree(node.children, permId))
            return true;
    }
    return false;
}

// ─── Recolectar asignados ─────────────────────────────────────────────────────
function collectAssigned(nodes: any[]): string[] {
    const result: string[] = [];
    for (const node of nodes) {
        if (node.children?.length) {
            result.push(...collectAssigned(node.children));
        } else if (node.assigned) {
            result.push(node.id);
        }
    }
    return result;
}

// ─── Guardar ─────────────────────────────────────────────────────────────────
function onSaveClick() {
    dialogConfirm.value = true;
}

async function confirmSave() {
    dialogConfirm.value = false;
    dialogLoading.value = true;
    try {
        const permissionIds = collectAssigned(tree.value);
        await rolePermissionService.save(roleId, permissionIds);
        showSnackbar('Permisos guardados correctamente.', 'success');
    } catch {
        showSnackbar('Ocurrió un error al guardar los permisos', 'error');
    } finally {
        dialogLoading.value = false;
    }
}

onMounted(() => loadTree());
</script>

<template>
    <BaseBreadcrumb
        :title="page.title"
        :breadcrumbs="breadcrumbs"
    />

    <v-row>
        <v-col cols="12">
            <UiParentCard title="GESTIONAR PERMISOS DE ROL">
                <template v-slot:action>
                    <div class="d-flex gap-2">
                        <v-btn
                            variant="flat"
                            color="light"
                            class="border text-muted text-14"
                            @click="router.push('/configuracion/roles')"
                        >
                            <Icon
                                icon="solar:double-alt-arrow-left-outline"
                                width="20"
                            />
                            Atrás
                        </v-btn>
                    </div>
                </template>

                <!-- Loading -->
                <v-row v-if="loading">
                    <v-col class="text-center py-10">
                        <v-progress-circular
                            indeterminate
                            color="primary"
                        />
                    </v-col>
                </v-row>

                <v-row v-else>
                    <!-- ── Columna izquierda ── -->
                    <v-col
                        cols="12"
                        md="5"
                    >
                        <!-- Alerta con nombre del rol -->
                        <v-alert
                            border="start"
                            variant="tonal"
                            color="primary"
                            class="mb-4"
                        >
                            <template v-slot:prepend>
                                <Icon
                                    icon="solar:shield-user-bold-duotone"
                                    width="30"
                                    class="text-primary"
                                />
                            </template>
                            <div
                                class="h5 text-poppins font-weight-bold mb-1"
                            >
                                {{ roleName || '—' }}
                            </div>
                            <div class="text-body text-justify">
                                Desglose el árbol y seleccione los permisos
                                que desea asignar a este Rol.
                            </div>
                        </v-alert>

                        <!-- Advertencia -->
                        <v-alert
                            border="start"
                            variant="tonal"
                            color="warning"
                            class="mb-4"
                        >
                            <template v-slot:prepend>
                                <Icon
                                    icon="solar:danger-triangle-bold-duotone"
                                    width="30"
                                />
                            </template>
                            <div
                                class="h5 font-weight-bold mb-1 text-poppins text-muted"
                            >
                                ADVERTENCIA
                            </div>
                            <div class="text-body text-muted text-justify">
                                Tenga cuidado al asignar permisos a los
                                roles, ya que esto afecta directamente a
                                todos los usuarios que posean este rol.
                            </div>
                        </v-alert>

                        <!-- Leyenda -->
                        <v-card
                            variant="outlined"
                            class="pa-4"
                        >
                            <div
                                class="text-14 font-weight-bold mb-3 text-poppins"
                            >
                                LEYENDA
                            </div>
                            <div class="d-flex align-center mb-2 gap-2">
                                <Icon
                                    icon="solar:check-circle-bold-duotone"
                                    width="18"
                                    class="text-success"
                                />
                                <span class="text-body">
                                    Permiso asignado al rol
                                </span>
                            </div>
                            <div class="d-flex align-center gap-2">
                                <Icon
                                    icon="solar:close-circle-bold-duotone"
                                    width="18"
                                    class="text-error"
                                />
                                <span class="text-body">Sin asignar</span>
                            </div>
                        </v-card>
                    </v-col>

                    <!-- ── Columna derecha: árbol ── -->
                    <v-col
                        cols="12"
                        md="7"
                    >
                        <div class="border rounded pa-2">
                            <div
                                v-for="parent in tree"
                                :key="parent.id"
                                class="mb-1"
                            >
                                <!-- Nodo padre -->
                                <div
                                    class="d-flex align-center px-2 py-1 rounded node-row"
                                    @click="toggleExpand(parent.id)"
                                >
                                    <Icon
                                        :icon="
                                            expanded.includes(parent.id)
                                                ? 'solar:alt-arrow-down-bold'
                                                : 'solar:alt-arrow-right-bold'
                                        "
                                        width="16"
                                        class="mr-1 text-primary"
                                    />
                                    <Icon
                                        v-if="parent.icon"
                                        :icon="'solar:' + parent.icon"
                                        width="16"
                                        class="text-primary mr-2"
                                    />
                                    <span
                                        class="text-body font-weight-semibold"
                                    >
                                        {{ parent.name }}
                                    </span>
                                </div>

                                <!-- Hijos del padre -->
                                <div
                                    v-show="expanded.includes(parent.id)"
                                    class="pl-6"
                                >
                                    <template
                                        v-for="child in parent.children"
                                        :key="child.id"
                                    >
                                        <!-- Submenu con hijos propios -->
                                        <template
                                            v-if="child.children?.length"
                                        >
                                            <div
                                                class="d-flex align-center px-2 py-1 rounded node-row"
                                                @click="
                                                    toggleExpand(child.id)
                                                "
                                            >
                                                <Icon
                                                    :icon="
                                                        expanded.includes(
                                                            child.id
                                                        )
                                                            ? 'solar:alt-arrow-down-bold'
                                                            : 'solar:alt-arrow-right-bold'
                                                    "
                                                    width="14"
                                                    class="mr-1 text-medium-emphasis"
                                                />
                                                <span
                                                    class="text-body-3 font-weight-medium"
                                                >
                                                    {{ child.name }}
                                                </span>
                                            </div>

                                            <div
                                                v-show="
                                                    expanded.includes(
                                                        child.id
                                                    )
                                                "
                                                class="pl-5"
                                            >
                                                <div
                                                    v-for="perm in child.children"
                                                    :key="perm.id"
                                                    class="d-flex align-center px-2 py-1 rounded perm-row"
                                                    @click="
                                                        togglePermission(
                                                            perm.id
                                                        )
                                                    "
                                                >
                                                    <Icon
                                                        v-if="
                                                            perm.assigned
                                                        "
                                                        icon="solar:check-circle-bold-duotone"
                                                        width="16"
                                                        class="text-success mr-2"
                                                    />
                                                    <Icon
                                                        v-else
                                                        icon="solar:close-circle-bold-duotone"
                                                        width="16"
                                                        class="text-error mr-2"
                                                    />
                                                    <span
                                                        :class="[
                                                            'text-body-2',
                                                            perm.assigned
                                                                ? 'text-success font-weight-medium'
                                                                : ''
                                                        ]"
                                                    >
                                                        {{
                                                            translateLabel(
                                                                perm.name
                                                            )
                                                        }}
                                                    </span>
                                                </div>
                                            </div>
                                        </template>

                                        <!-- Hoja directa -->
                                        <div
                                            v-else
                                            class="d-flex align-center px-2 py-1 rounded perm-row"
                                            @click="
                                                togglePermission(child.id)
                                            "
                                        >
                                            <Icon
                                                v-if="child.assigned"
                                                icon="solar:check-circle-bold-duotone"
                                                width="16"
                                                class="text-success mr-2"
                                            />
                                            <Icon
                                                v-else
                                                icon="solar:close-circle-bold-duotone"
                                                width="16"
                                                class="text-error mr-2"
                                            />
                                            <span
                                                :class="[
                                                    'text-body-2',
                                                    child.assigned
                                                        ? 'text-success font-weight-medium'
                                                        : ''
                                                ]"
                                            >
                                                {{
                                                    translateLabel(
                                                        child.name
                                                    )
                                                }}
                                            </span>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>

                <v-divider class="my-4" />

                <div class="d-flex justify-end gap-2">
                    <v-btn
                        variant="flat"
                        color="error"
                        class="text-14"
                        @click="router.push('/configuracion/roles')"
                    >
                        <Icon
                            icon="solar:double-alt-arrow-left-bold-duotone"
                            width="20"
                            class="mr-1"
                        />
                        Cancelar
                    </v-btn>
                    <v-btn
                        color="primary"
                        variant="elevated"
                        class="text-14"
                        :loading="saving"
                        @click="onSaveClick"
                    >
                        <Icon
                            icon="solar:check-circle-bold"
                            width="20"
                            class="mr-1"
                        />
                        Guardar
                    </v-btn>
                </div>
            </UiParentCard>
        </v-col>
    </v-row>

    <!-- Dialog confirmación -->
    <v-dialog
        v-model="dialogConfirm"
        max-width="400"
    >
        <v-card>
            <v-card-title class="text-h6 py-3 border-bottom bg-light">
                Confirmar
            </v-card-title>
            <v-card-text class="text-center py-4">
                <Icon
                    icon="solar:question-circle-bold-duotone"
                    width="70"
                    class="text-primary mb-2"
                />
                <div>¿Estás seguro que deseas guardar los cambios?</div>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn
                    class="text-14 mb-2"
                    rounded="sm"
                    color="error"
                    variant="text"
                    @click="dialogConfirm = false"
                >
                    Cancelar
                </v-btn>
                <v-btn
                    class="text-14 px-4 me-2 mb-2"
                    rounded="sm"
                    color="info"
                    variant="flat"
                    :loading="saving"
                    @click="confirmSave"
                >
                    Guardar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Dialog loading -->
    <v-dialog
        v-model="dialogLoading"
        max-width="250"
        persistent
    >
        <v-card>
            <v-card-text class="text-center py-6">
                <v-progress-circular
                    indeterminate
                    color="primary"
                    size="42"
                    class="mb-2"
                />
                <div class="text-14">Guardando...</div>
            </v-card-text>
        </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <JAppSnackBar
        v-model="snackbar"
        :message="snackbarMsg"
        :type="snackbarType"
    />
</template>

<style scoped>
.node-row {
    cursor: pointer;
    user-select: none;
}
.node-row:hover {
    background-color: rgba(var(--v-theme-primary), 0.06);
    border-radius: 4px;
}
.perm-row {
    cursor: pointer;
    user-select: none;
}
.perm-row:hover {
    background-color: rgba(var(--v-theme-success), 0.06);
    border-radius: 4px;
}
</style>
