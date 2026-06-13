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
const page = ref({ title: 'Administrador | Conductores' });
const breadcrumbs = ref([
    {
        title: 'Conductores',
        disabled: true,
        href: '#'
    }
]);

const router = useRouter();
const { can } = usePermissions();
///<-----------------------------| *** Code Basic *** |----------------------------->///

/* const initialize = async () => {
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

onMounted(() => initialize()); */
</script>
<template>
    <BaseBreadcrumb
        :title="page.title"
        :breadcrumbs="breadcrumbs"
    ></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <!-- <UiParentCard title="Gestión de usuarios y permisos">
            </UiParentCard> -->
        </v-col>
    </v-row>
    <!-- 1. Snackbar mensaje -->
    <JAppSnackBar
        v-model="snackbar"
        :message="snackbarMsg"
        :type="snackbarType"
    />
</template>
<style></style>
