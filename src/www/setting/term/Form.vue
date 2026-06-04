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
        <v-card-text class="pt-4">
            <v-row>
                <v-col
                    cols="8"
                    class="pb-1 pt-0"
                >
                    <v-label class="text-muted mb-1">Nombre *</v-label>
                    <v-text-field
                        v-model="formData.Name"
                        @update:modelValue="
                            (val) => (formData.Name = val.toUpperCase())
                        "
                        placeholder="Nombre del periodo"
                        :error="errDepName.active"
                        :error-messages="errDepName.message"
                        @input="errDepNameClear"
                        :rules="[(v) => !!v || 'El nombre es requerido']"
                        ref="nameFieldRef"
                        :append-inner-icon="'mdi-information-outline'"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="4"
                    class="pb-1 pt-0"
                >
                    <v-label class="text-muted mb-1">Año *</v-label>
                    <v-text-field
                        :model-value="formData.Year"
                        v-maska="'####'"
                        placeholder="Año *"
                        counter="4"
                        :error="errYear.active"
                        :error-messages="errYear.message"
                        @maska="
                            (e) => {
                                formData.Year = e.target.value;
                                errYearClear();
                            }
                        "
                        :rules="[(v) => !!v || 'El año es requerido']"
                        :append-inner-icon="'mdi-information-outline'"
                        :maxlength="4"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="6"
                    class="pb-1 pt-0"
                >
                    <v-label class="text-muted mb-1"
                        >Fecha Inicio *</v-label
                    >
                    <v-text-field
                        variant="outlined"
                        hide-details="auto"
                        type="date"
                        v-model="formData.StartDate"
                        :rules="[
                            (v) => !!v || 'La fecha inicio es requerida'
                        ]"
                        @update:modelValue="
                            () => {
                                if (formData.EndDate < formData.StartDate)
                                    formData.EndDate = '';
                            }
                        "
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="6"
                    class="pb-1 pt-0"
                >
                    <v-label class="text-muted mb-1">Fecha Fin *</v-label>
                    <v-text-field
                        variant="outlined"
                        hide-details="auto"
                        type="date"
                        v-model="formData.EndDate"
                        :min="formData.StartDate"
                        :rules="[
                            (v) => !!v || 'La fecha fin es requerida'
                        ]"
                    ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    class="pb-1 pt-0"
                >
                    <small class="text-muted"
                        >(*) Indicador de campos requeridos</small
                    >
                </v-col>
            </v-row>
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
import { termService } from '@/services/termService';

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
    Year: '',
    StartDate: '',
    EndDate: ''
});
const nameFieldRef = ref();
const depFieldRef = ref();
const errDepName = ref({ active: false, message: '' });
const errYear = ref({ active: false, message: '' });
const parents = ref([]);
const ldgParents = ref(false);
const dialogTitle = computed(() =>
    editedIndex.value === -1 ? 'CREAR PERIODO' : 'EDITAR PERIODO'
);

const errDepNameClear = () => {
    errDepName.value = { active: false, message: '' };
};

const errYearClear = () => {
    errYear.value = { active: false, message: '' };
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
    /* editedIndex.value = id;
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
    } */
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
            await termService.create(formData.value);
            emit('close');
            setTimeout(() => {}, 500);
            msgSnackbar('Periodo creado exitosamente', 'success');
            emit('refreshList');
        } else {
            // Editar
            await termService.update(editedIndex.value, formData.value);
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
            TERM_NAME_EXISTS: {
                error: errDepName,
                ref: nameFieldRef
            },
            TERM_YEAR_EXISTS: { error: errYear, ref: depFieldRef }
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

onMounted(() => {
    focusAndSelectField(nameFieldRef);
});

defineExpose({
    setEditId
});
</script>
<style></style>
