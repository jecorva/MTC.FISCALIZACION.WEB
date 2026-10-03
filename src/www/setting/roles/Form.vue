<template>
    <v-form
        ref="formRef"
        :disabled="loadingEdit || loadingCreate"
        fast-fail
        @submit.prevent="save"
    >
        <!-- class="pt-3 px-7 text-titleDialog bg-headerDialog font-weight-medium d-flex align-center gap-2 mb-0 jc-title" -->
        <v-card-title
            class="d-flex align-center gap-2 px-7 py-3 text-raleway font-weight-bold text-h6 mb-0 bg-lightprimary text-primary border-b border-b-primary"
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
                width="22"
                height="22"
            />
            {{ dialogTitle }}
            <!-- <small
                v-if="loadingEdit"
                class="text-opensans text-14"
            >
                Cargando...
            </small> -->
        </v-card-title>
        <v-card-text class="pb-5">
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
                        @input="nameError = noError()"
                        :rules="[(v) => !!v || 'El nombre es requerido']"
                        ref="nameFieldRef"
                        append-inner-icon="mdi-information-outline"
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
                        maxlength="6"
                        :error="roleError.active"
                        :error-messages="roleError.message"
                        @input="roleError = noError()"
                        :rules="[(v) => !!v || 'Requerido']"
                        ref="roleFieldRef"
                        append-inner-icon="mdi-information-outline"
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
                        label="Descripción (opcional)"
                        append-inner-icon="mdi-information-outline"
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
                variant="tonal"
                color="muted"
                rounded="sm"
                class="text-14 px-3"
                :disabled="loadingCreate || loadingEdit"
                @click="emit('close')"
            >
                <Icon
                    class="mr-1"
                    icon="solar:round-double-alt-arrow-left-broken"
                    width="18"
                    height="18"
                />
                Cerrar
            </v-btn>
            <v-btn
                variant="flat"
                color="primary"
                rounded="sm"
                class="text-14 px-3"
                :disabled="loadingEdit"
                :loading="loadingCreate"
                type="submit"
            >
                <Icon
                    class="mr-1"
                    icon="solar:diskette-broken"
                    width="18"
                    height="18"
                />
                Guardar
            </v-btn>
        </v-card-actions>
    </v-form>
</template>
<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { roleService } from '@/services/roleService';
import type { FieldError } from '@/types/helpers/common';
import { noError, setError } from '@/utils/fieldError';
import { getApiError, ResponseCode } from '@/utils/apiError';

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

const nameError = ref<FieldError>(noError());
const roleError = ref<FieldError>(noError());

const dialogTitle = computed(() =>
    editedIndex.value === -1 ? 'NUEVO ROL' : 'EDITAR ROL'
);

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
        const { Name, Role, Description } = await roleService.getById(id);
        form.value = { Name, Role, Description };

    } catch (error) {
        msgSnackbar(getApiError(error).message, 'error');        
        emit('close');

    } finally {
        loadingEdit.value = false;
        
    }
};

const save = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    loadingCreate.value = true;
    emit('loadingCreate', true);

    try {
        if (editedIndex.value === -1) {
            await roleService.create(form.value);
            msgSnackbar('Rol creado exitosamente', 'success');
        } else {
            await roleService.update(editedIndex.value, form.value);
            msgSnackbar('Rol actualizado exitosamente', 'success');
        }
        emit('close');
        emit('refreshList');

    } catch (error) {
        const { code, message } = getApiError(error);

        switch (code) {
            case ResponseCode.NameError:
                nameError.value = setError('* El nombre ya existe.');
                focusAndSelectField(nameFieldRef);
                break;
            case ResponseCode.CodeError:
                roleError.value = setError('* El código ya existe.');
                focusAndSelectField(roleFieldRef);
                break;
            default:
                msgSnackbar(message, 'error');
        }

    } finally {
        loadingCreate.value = false;
        emit('loadingCreate', false);
        
    }
};

defineExpose({
    setEditId
});

onMounted(() => {
    focusAndSelectField(nameFieldRef);
});
</script>
<style></style>
