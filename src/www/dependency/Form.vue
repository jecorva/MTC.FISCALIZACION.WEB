<template>
    <v-form
        ref="formRef"
        :disabled="ldgEdit || ldgCreate"
        fast-fail
        @submit.prevent="save"
    >
        <v-card-title
            class="text-muted py-4 d-flex align-center gap-2 text-poppins"
        >
            <v-progress-circular
                v-if="ldgEdit || ldgCreate"
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
                v-if="ldgEdit"
                class="text-opensans text-14"
            >
                Cargando...
            </small> -->
        </v-card-title>
        <v-card-text class="pt-5">
            <v-row>
                <v-col
                    cols="12"
                    class="pb-2 pt-0"
                >
                    <v-text-field
                        v-model="formData.Name"
                        @update:modelValue="
                            (val) => (formData.Name = val.toUpperCase())
                        "
                        label="Nombre de la dependencia *"
                        :error="errDepName.active"
                        :error-messages="errDepName.message"
                        @input="errDepNameClear"
                        :rules="[(v) => !!v || 'El nombre es requerido']"
                        ref="nameFieldRef"
                        :append-inner-icon="'mdi-information-outline'"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    class="pb-2 pt-0"
                >
                    <v-text-field
                        v-model="formData.Acronym"
                        @update:modelValue="
                            (val) => (formData.Acronym = val.toUpperCase())
                        "
                        label="Acrónimo *"
                        counter="6"
                        :error="errAcronym.active"
                        :error-messages="errAcronym.message"
                        @input="errAcrClear"
                        :rules="[(v) => !!v || 'Acrónimo es Requerido']"
                        :append-inner-icon="'mdi-information-outline'"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    class="pb-2 pt-0"
                >
                    <v-autocomplete
                        variant="outlined"
                        label="Director"
                        closable-chips
                    >
                        <template v-slot:chip>
                            <v-chip
                                label
                                color="primary"
                                size="large"
                                class="mb-1 text-subtitle-1 font-weight-regular"
                            ></v-chip>
                        </template>
                    </v-autocomplete>
                </v-col>
                <v-col
                    cols="12"
                    class="pb-2 pt-0"
                >
                    <v-autocomplete
                        v-model="formData.ParentId"
                        :items="parents"
                        item-title="Name"
                        item-value="Id"
                        variant="outlined"
                        label="Dependencia Superior"
                        :loading="ldgParents"
                        closable-chips
                    >
                        <!-- <template v-slot:chip="{ props, item }">
                            <v-chip
                                v-bind="props"
                                label
                                color="primary"
                                size="large"
                                class="mb-1 text-subtitle-1 font-weight-regular"
                            >
                                {{ item.title }}
                            </v-chip>
                        </template> -->
                    </v-autocomplete>
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
                :disabled="ldgCreate || ldgEdit"
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
                :disabled="ldgEdit"
                :loading="ldgCreate"
                type="submit"
            >
                <Icon
                    class="mr-1"
                    icon="solar:diskette-broken"
                    width="20"
                />
                Guardar
            </v-btn>
        </v-card-actions>
    </v-form>
</template>
<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { dependencyService } from '@/services/dependencyService';

const emit = defineEmits([
    'close',
    'snackbar',
    'ldgCreate',
    'refreshList'
]);

const msgSnackbar = (msg: string, type) => {
    emit('snackbar', {
        msg,
        type
    });
};

const editedIndex = ref(-1);
const ldgCreate = ref(false);
const ldgEdit = ref(false);
const formRef = ref();
const formData = ref({
    Name: '',
    Acronym: '',
    DirectorName: '',
    DependencyId: '',
    ParentId: null
});
const nameFieldRef = ref();
const depFieldRef = ref();
const errDepName = ref({ active: false, message: '' });
const errAcronym = ref({ active: false, message: '' });
const parents = ref([]);
const ldgParents = ref(false);
const dialogTitle = computed(() =>
    editedIndex.value === -1 ? 'CREAR DEPENDENCIA' : 'EDITAR DEPENDENCIA'
);

const errDepNameClear = () => {
    errDepName.value = { active: false, message: '' };
};

const errAcrClear = () => {
    errAcronym.value = { active: false, message: '' };
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
    ldgEdit.value = true;
    try {
        const dependency = await dependencyService.getById(id);
        formData.value = { ...dependency };
    } catch (error) {
        const code = error?.response?.data?.code;
        const messages: Record<string, string> = {
            DEPENDENCY_NOT_RETRIEVED: error?.response?.data?.message,
            DEPENDENCY_NOT_FOUND: error?.response?.data?.message
        };
        msgSnackbar(
            messages[code] || 'Error al obtener el datos',
            'error'
        );
        emit('close');
    } finally {
        ldgEdit.value = false;
    }
};

const save = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    // <- Luego de validar el formulario, continua
    try {
        ldgCreate.value = true;
        emit('ldgCreate', true);

        if (editedIndex.value === -1) {
            // Crear
            await dependencyService.create(formData.value);
            emit('close');
            setTimeout(() => {}, 500);
            msgSnackbar('Dependencia creada exitosamente', 'success');
            emit('refreshList');
        } else {
            // Editar
            await dependencyService.update(
                editedIndex.value,
                formData.value
            );
            emit('close');
            setTimeout(() => {}, 700);
            msgSnackbar('Registro actualizado exitosamente.', 'success');
            emit('refreshList');
        }
    } catch (error) {
        const code = error?.response?.data?.code;
        //console.log(error?.response);
        const serverMessage =
            error?.response?.data?.message || 'Error desconocido';

        const fieldErrors: Record<
            string,
            { error: typeof errDepName; ref: typeof nameFieldRef }
        > = {
            DEPENDENCY_NAME_EXISTS: {
                error: errDepName,
                ref: nameFieldRef
            },
            ACRONYM_EXISTS: { error: errAcronym, ref: depFieldRef }
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
        ldgCreate.value = false;
        emit('ldgCreate', false);
    }
};

const loadParents = async () => {
    ldgParents.value = true;
    try {
        parents.value = await dependencyService.getParents();
        // console.log(parents.value);
    } catch {
        parents.value = [];
    } finally {
        ldgParents.value = false;
    }
};

onMounted(() => loadParents());

defineExpose({
    setEditId
});
</script>
<style></style>
