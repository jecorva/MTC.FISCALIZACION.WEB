<template>
    <v-form
        ref="formRef"
        :disabled="loadingEdit || loadingCreate"
        fast-fail
        @submit.prevent="save"
    >
        <v-card-title
            class="text-muted py-4 d-flex align-center gap-2 text-poppins"
        >
            <v-progress-circular
                v-if="loadingEdit || loadingCreate"
                size="20"
                width="2"
                indeterminate
            >
            </v-progress-circular>
            <Icon
                v-else
                icon="solar:add-circle-bold"
                width="24"
                height="24"
            />
            {{ dialogTitle }}
            <!-- <small
                v-if="loadingEdit"
                class="text-opensans text-14"
            >
                Cargando...
            </small> -->
        </v-card-title>
        <v-card-text class="pt-5">
            <v-row>
                <v-col
                    cols="12"
                    sm="6"
                    md="8"
                    class="py-0"
                >
                    <v-text-field
                        v-model="form.Name"
                        @update:modelValue="
                            (val) => (form.Name = val.toUpperCase())
                        "
                        label="Nombre *"
                        :error="nameError.active"
                        :error-messages="nameError.message"
                        @input="clearNameError"
                        :rules="[(v) => !!v || 'El nombre es requerido']"
                        ref="nameFieldRef"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    sm="6"
                    md="4"
                    class="py-0"
                >
                    <v-text-field
                        v-model="form.Role"
                        @update:modelValue="
                            (val) => (form.Role = val.toUpperCase())
                        "
                        label="Código *"
                        counter="6"
                        :error="roleError.active"
                        :error-messages="roleError.message"
                        @input="clearRoleError"
                        :rules="[(v) => !!v || 'Requerido']"
                        ref="roleFieldRef"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    sm="12"
                    md="12"
                    class="py-1"
                >
                    <v-text-field
                        v-model="form.Description"
                        label="Descripción"
                    ></v-text-field>
                </v-col>
            </v-row>

            <small class="text-muted"
                >(*) Indicador de campos requeridos</small
            >
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="justify-end py-3 px-6">
            <v-btn
                variant="flat"
                color="info"
                class="text-14 px-3"
                :disabled="loadingCreate || loadingEdit"
                @click="emit('close')"
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
                :disabled="loadingEdit"
                :loading="loadingCreate"
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
</template>
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import { roleService } from '@/services/roleService';

const emit = defineEmits([
    'close',
    'snackbar',
    'loadingCreate',
    'refreshList'
]);

const msgSnackbar = (msg: string, type) => {
    emit('snackbar', {
        msg,
        type
    });
};

const editedIndex = ref(-1);
const loadingCreate = ref(false);
const loadingEdit = ref(false);
const formRef = ref();
const form = ref({
    Name: '',
    Role: '',
    Description: ''
});
const nameFieldRef = ref();
const roleFieldRef = ref();
const nameError = ref({ active: false, message: '' });
const roleError = ref({ active: false, message: '' });
const dialogTitle = computed(() =>
    editedIndex.value === -1 ? 'CREAR ROL' : 'EDITAR ROL'
);

const clearNameError = () => {
    nameError.value = { active: false, message: '' };
};

const clearRoleError = () => {
    roleError.value = { active: false, message: '' };
};

const focusAndSelectField = async (fieldRef: any) => {
    await nextTick();
    // El input nativo está dentro del componente Vuetify
    const input = fieldRef.value?.$el?.querySelector('input');
    if (input) {
        input.focus();
        input.select();
    }
};

const setEditId = async (id) => {
    editedIndex.value = id;
    loadingEdit.value = true;
    try {
        const role = await roleService.getById(id);
        form.value = { ...role };
    } catch (error) {
        const code = error?.response?.data?.code;
        const messages: Record<string, string> = {
            ROLE_NOT_RETRIEVED: error?.response?.data?.message,
            ROLE_NOT_FOUND: error?.response?.data?.message
        };
        msgSnackbar(messages[code] || 'Error al obtener el rol', 'error');
        emit('close');
    } finally {
        loadingEdit.value = false;
    }
};

const save = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    // <- Luego de validar el formulario, continua
    try {
        loadingCreate.value = true;
        emit('loadingCreate', true);

        if (editedIndex.value === -1) {
            // Crear nuevo rol
            await roleService.create(form.value);
            emit('close');
            setTimeout(() => {}, 500);
            msgSnackbar('Rol creado exitosamente', 'success');
            emit('refreshList');
        } else {
            // Editar rol existente
            await roleService.update(editedIndex.value, form.value);
            emit('close');
            setTimeout(() => {}, 500);
            msgSnackbar('Rol actualizado exitosamente', 'success');
            emit('refreshList');
        }
    } catch (error) {
        const code = error?.response?.data?.code;
        //console.log(error?.response);
        const serverMessage =
            error?.response?.data?.message || 'Error desconocido';

        const fieldErrors: Record<
            string,
            { error: typeof nameError; ref: typeof nameFieldRef }
        > = {
            ROLE_NAME_EXISTS: { error: nameError, ref: nameFieldRef },
            ROLE_CODE_EXISTS: { error: roleError, ref: roleFieldRef }
        };

        if (fieldErrors[code]) {
            fieldErrors[code].error.value = {
                active: true,
                message: serverMessage
            };
            focusAndSelectField(fieldErrors[code].ref);
        } else {
            msgSnackbar(serverMessage, 'error');
        }
    } finally {
        loadingCreate.value = false;
        emit('loadingCreate', false);
    }
};

defineExpose({
    setEditId
});
</script>
<style></style>
