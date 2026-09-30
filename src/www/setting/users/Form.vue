<script setup lang="ts">
///<-----------------------------| *** Code Basic *** |----------------------------->///
import { computed, nextTick, ref, watch, onMounted } from 'vue';
import { usePermissions } from '@/composables/usePermissions';
import { permissionsList } from '@/api/permissions-list';
import { Icon } from '@iconify/vue';
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
const page = ref({
    title: computed(() =>
        isEditMode.value
            ? 'Administrador | Usuarios | Editar'
            : 'Administrador | Usuarios | Nuevo'
    )
});
///<-----------------------------| *** Code Basic *** |----------------------------->///

import { roleService } from '@/services/roleService';
import { dependencyService } from '@/services/dependencyService';
import { userService } from '@/services/userService';
import { useRoute, useRouter } from 'vue-router';
import { getApiError, ResponseCode } from '@/utils/apiError';

const route = useRoute();
const router = useRouter();

//---- Detecta si estamos en modo editar ---- //
const isEditMode = computed(() => !!route.params.Id);
const editedId = computed(() => route.params.Id as string);
const breadcrumbs = computed(() => [
    {
        title: 'Usuarios',
        disabled: false,
        href: '/usuarios'
    },
    {
        title: isEditMode.value ? 'Editar' : 'Nuevo',
        disabled: true,
        href: '#'
    }
]);

const formField = ref({
    UserName: '',
    DocumentNumber: '',
    Name: '',
    PaternalSurname: '',
    MaternalSurname: '',
    Phone: '',
    DateBirth: '',
    Sex: '',
    Address: '',
    Email: '',
    PersonalEmail: '',
    IsActive: 1,
    Password: '',
    ConfirmPassword: '',
    ConfirmEmail: 0
});
//<-| Ref |->
const nameFdRef = ref();
const formRef = ref();

//<-| Loading |->
const ldgRoles = ref(false);
const ldgDependencies = ref(false);
const ldgEdit = ref(isEditMode.value);
const ldgCreate = ref(false);

//<-| Error Form |->
const errAlert = ref({ active: false, message: '' });
const errName = ref({ active: false, message: '' });
const errPatSurname = ref({ active: false, message: '' });
const errMatSurname = ref({ active: false, message: '' });
const errDocNumber = ref({ active: false, message: '' });
const errUserName = ref({ active: false, message: '' });
const errEmail = ref({ active: false, message: '' });
const errPassword = ref({ active: false, message: '' });
const errConPassword = ref({ active: false, message: '' });
const viewPass = ref(false);
const viewConfPass = ref(false);

//<-| Autocomplete |->
const roles = ref([]);
const dependencies = ref([]);
const listRoles = ref([]);
const listDependencies = ref([]);

const dlgQuestion = ref(false);
const noError = () => ({ active: false, message: '' });

const errNameClear = () => {
    errName.value = { active: false, message: '' };
};
const errPatSurnameClear = () => {
    errPatSurname.value = { active: false, message: '' };
};
const errMatSurnameClear = () => {
    errMatSurname.value = { active: false, message: '' };
};
const errDocNumberClear = () => {
    errDocNumber.value = { active: false, message: '' };
};
const errUserNameClear = () => {
    errUserName.value = { active: false, message: '' };
};
const errEmailClear = () => {
    errEmail.value = { active: false, message: '' };
};
const errPasswordClear = () => {
    errPassword.value = { active: false, message: '' };
};
const errConPasswordClear = () => {
    errConPassword.value = { active: false, message: '' };
};

const loadRoles = async () => {
    ldgRoles.value = true;
    try {
        listRoles.value = await roleService.getAll();
    } catch (error) {
        showSnackbar('Error al cargar los roles', 'error');
        roles.value = [];
    } finally {
        ldgRoles.value = false;
    }
};

const loadDependencies = async () => {
    ldgDependencies.value = true;
    try {
        listDependencies.value = await dependencyService.getAll();
    } catch (error) {
        showSnackbar('Error al cargar dependencias', 'error');
        dependencies.value = [];
    } finally {
        ldgDependencies.value = false;
    }
};

const loadUser = async (Id: string) => {
    ldgEdit.value = true;
    try {
        const user = await userService.getById(Id);

        // Llenar el formulario con los datos
        formField.value.UserName = user.UserName;
        formField.value.DocumentNumber = user.DocumentNumber;
        formField.value.Name = user.Name;
        formField.value.PaternalSurname = user.PaternalSurname;
        formField.value.MaternalSurname = user.MaternalSurname;
        formField.value.Phone = user.Phone;
        formField.value.DateBirth = user.DateBirth;
        formField.value.Sex = user.Sex;
        formField.value.Address = user.Address;
        formField.value.Email = user.Email;
        formField.value.PersonalEmail = user.PersonalEmail;
        formField.value.IsActive = user.IsActive;

        // Cargar roles y dependencias asignados
        roles.value = user.Roles; // array de Ids
        dependencies.value = user.Dependencies; // array de Ids
    } catch (error) {
        showSnackbar('Error al cargar el usuario', 'error');
        router.go(-1);
    } finally {
        ldgEdit.value = false;
    }
};

const confirmQuestion = () => {
    formField.value.ConfirmEmail = 1;
    dlgQuestion.value = false;
    save();
};

const save = async () => {
    const { valid } = await formRef.value.validate();
    if (!valid) return;

    errDocNumber.value = noError();
    errUserName.value = noError();
    errEmail.value = noError();
    errAlert.value = noError();

    // Validar contraseñas solo en CREAR, o si escribió algo en editar
    const passwordFilled =
        formField.value.Password || formField.value.ConfirmPassword;
    if (!isEditMode.value || passwordFilled) {
        if (formField.value.Password !== formField.value.ConfirmPassword) {
            errConPassword.value = {
                active: true,
                message: '* Las contraseñas no coinciden'
            };
            return;
        }
    }
    errConPassword.value = { active: false, message: '' };

    try {
        ldgCreate.value = true;

        if (!isEditMode.value) {
            /** Boton: Crear Usuario */
            await userService.create({
                ...formField.value,
                Roles: roles.value,
                Dependencies: dependencies.value
            });
            clear();
            setTimeout(() => {}, 700);
            showSnackbar('Usuario creado.', 'success');
        } else {
            /** Boton: Editar Usuario */
            await userService.update(editedId.value, {
                ...formField.value,
                Roles: roles.value,
                Dependencies: dependencies.value
            });
            showSnackbar('Usuario actualizado exitosamente.', 'success');
            setTimeout(() => router.go(-1), 700);
        }
    } catch (error) {
        const { code, message } = getApiError(error);

        switch (code) {
            case ResponseCode.DocumentNumberError:
                errDocNumber.value = {
                    active: true,
                    message: '* Documento ya existe.'
                };
                break;
            case ResponseCode.NameError:
                errUserName.value = {
                    active: true,
                    message: '* Usuario ya existe.'
                };
                break;
            case ResponseCode.EmailError:
                if (formField.value.ConfirmEmail == 0) {
                    errEmail.value = {
                        active: true,
                        message: '* Email ya existe.'
                    };
                    dlgQuestion.value = true;
                }
                break;
            default:
                errAlert.value = { active: true, message };
        }
    } finally {
        ldgCreate.value = false;
    }
};

const clear = () => {
    formField.value.UserName = '';
    formField.value.DocumentNumber = '';
    formField.value.Name = '';
    formField.value.PaternalSurname = '';
    formField.value.MaternalSurname = '';
    formField.value.Phone = '';
    formField.value.DateBirth = '';
    formField.value.Sex = '';
    formField.value.Address = '';
    formField.value.Email = '';
    formField.value.PersonalEmail = '';
    formField.value.IsActive = 1;
    formField.value.Password = '';
    formField.value.ConfirmPassword = '';
    formField.value.ConfirmEmail = 0;
    roles.value = [];
    dependencies.value = [];
};

const initialize = async () => {
    await Promise.all([loadRoles(), loadDependencies()]);

    if (isEditMode.value) {
        await loadUser(editedId.value);
    }
};

onMounted(() => initialize());
</script>
<template>
    <BaseBreadcrumb
        :title="page.title"
        :breadcrumbs="breadcrumbs"
        class="elevation-1"
    ></BaseBreadcrumb>
    <v-row>
        <v-col cols="12">
            <UiParentCard
                :title="isEditMode ? 'Editar Usuario' : 'Crear Usuario'"
                icon="solar:user-circle-linear"
                class="elevation-1"
            >
                <template v-slot:action>
                    <div class="d-flex gap-2">
                        <v-btn
                            variant="flat"
                            size="small"
                            rounded="sm"
                            class="px-1 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 border border-amber-200"
                            @click="$router.go(-1)"
                        >
                            <Icon
                                icon="solar:close-bold"
                                width="18"
                            />
                        </v-btn>
                    </div>
                </template>
                <v-form
                    ref="formRef"
                    :disabled="ldgEdit || ldgCreate"
                    fast-fail
                    @submit.prevent="save"
                >
                    <v-row>
                        <v-col
                            cols="12"
                            class="pb-0"
                        >
                            <div
                                class="d-flex justify-space-between align-center"
                                style="gap: 8px"
                            >
                                <div
                                    class="text-muted js-title font-weight-medium h5 hidden-sm-and-down"
                                >
                                    Para crear un nuevo usuario, completa
                                    todos los campos obligatorios (*)
                                </div>
                                <div
                                    class="d-flex align-center"
                                    style="gap: 8px"
                                >
                                    <v-switch
                                        v-model="formField.IsActive"
                                        hide-details
                                        color="success"
                                        inset
                                        :true-value="1"
                                        :false-value="0"
                                        class="flex-grow-0"
                                    ></v-switch>
                                    <!-- <span
                                        class="text-subtitle-1 font-weight-medium"
                                        :class="
                                            formField.IsActive
                                                ? 'text-success'
                                                : 'text-error'
                                        "
                                    >
                                        {{
                                            formField.IsActive
                                                ? 'Activo'
                                                : 'Inactivo'
                                        }}
                                    </span> -->
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            class="px-0 py-0"
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

                        <v-col
                            md="7"
                            xl="7"
                            sm="12"
                        >
                            <v-card variant="outlined">
                                <v-overlay
                                    :model-value="ldgEdit"
                                    contained
                                    class="align-center justify-center"
                                    persistent
                                    scrim="#d5d5d5"
                                    :opacity="0.3"
                                >
                                    <v-progress-circular
                                        indeterminate
                                        color="muted"
                                    />
                                </v-overlay>
                                <v-card-item>
                                    <!-- <h5
                                        class="text-h3 text-muted font-weight-bold mb-0 pb-0"
                                    >
                                        Datos Personales
                                    </h5> -->

                                    <div class="mt-1">
                                        <v-row>
                                            <v-col
                                                cols="12"
                                                class="pb-1"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Nombre(s) *</v-label
                                                ><small
                                                    v-if="isEditMode"
                                                    class="text-muted"
                                                >
                                                    [ Solo lectura ]</small
                                                >
                                                <v-text-field
                                                    :readonly="isEditMode"
                                                    :class="
                                                        isEditMode
                                                            ? 'readonly-field'
                                                            : ''
                                                    "
                                                    v-model="
                                                        formField.Name
                                                    "
                                                    @update:modelValue="
                                                        (val) =>
                                                            (formField.Name =
                                                                val.toUpperCase())
                                                    "
                                                    placeholder="Escribir"
                                                    :error="errName.active"
                                                    :error-messages="
                                                        errName.message
                                                    "
                                                    @input="errNameClear"
                                                    :rules="[
                                                        (v) =>
                                                            !!v ||
                                                            '* El nombre es requerido'
                                                    ]"
                                                    ref="nameFdRef"
                                                    :append-inner-icon="'mdi-account'"
                                                >
                                                    <!-- <template
                                                    v-slot:append-inner
                                                >
                                                    <Icon
                                                        icon="solar:user-broken"
                                                        width="22"
                                                        height="22"
                                                    />
                                                </template> -->
                                                </v-text-field>
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                md="6"
                                                class="pb-1 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Apellido Paterno
                                                    *</v-label
                                                ><small
                                                    v-if="isEditMode"
                                                    class="text-muted"
                                                >
                                                    [ Solo lectura ]</small
                                                >
                                                <v-text-field
                                                    :readonly="isEditMode"
                                                    :class="
                                                        isEditMode
                                                            ? 'readonly-field'
                                                            : ''
                                                    "
                                                    v-model="
                                                        formField.PaternalSurname
                                                    "
                                                    @update:modelValue="
                                                        (val) =>
                                                            (formField.PaternalSurname =
                                                                val.toUpperCase())
                                                    "
                                                    placeholder="Escribir"
                                                    :error="
                                                        errPatSurname.active
                                                    "
                                                    :error-messages="
                                                        errPatSurname.message
                                                    "
                                                    @input="
                                                        errPatSurnameClear
                                                    "
                                                    :rules="[
                                                        (v) =>
                                                            !!v ||
                                                            '* Apellido paterno es requerido'
                                                    ]"
                                                    :append-inner-icon="'mdi-account'"
                                                >
                                                    <!-- <template
                                                    v-slot:append-inner
                                                >
                                                    <Icon
                                                        icon="solar:user-broken"
                                                        width="22"
                                                        height="22"
                                                    />
                                                </template> -->
                                                </v-text-field>
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                md="6"
                                                class="pb-1 pt-0"
                                                ><v-label
                                                    class="text-muted mb-1"
                                                    >Apellido Materno
                                                    *</v-label
                                                ><small
                                                    v-if="isEditMode"
                                                    class="text-muted"
                                                >
                                                    [ Solo lectura ]</small
                                                >
                                                <v-text-field
                                                    :readonly="isEditMode"
                                                    :class="
                                                        isEditMode
                                                            ? 'readonly-field'
                                                            : ''
                                                    "
                                                    v-model="
                                                        formField.MaternalSurname
                                                    "
                                                    @update:modelValue="
                                                        (val) =>
                                                            (formField.MaternalSurname =
                                                                val.toUpperCase())
                                                    "
                                                    placeholder="Escribir"
                                                    :error="
                                                        errMatSurname.active
                                                    "
                                                    :error-messages="
                                                        errMatSurname.message
                                                    "
                                                    @input="
                                                        errMatSurnameClear
                                                    "
                                                    :rules="[
                                                        (v) =>
                                                            !!v ||
                                                            '* Apellido materno es requerido'
                                                    ]"
                                                    :append-inner-icon="'mdi-account'"
                                                    ><!-- <template
                                                    v-slot:append-inner
                                                >
                                                    <Icon
                                                        icon="solar:user-broken"
                                                        width="22"
                                                        height="22"
                                                    /> </template
                                            > --></v-text-field
                                                >
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                md="6"
                                                class="pb-1 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >DNI *</v-label
                                                >
                                                <v-text-field
                                                    v-model="
                                                        formField.DocumentNumber
                                                    "
                                                    v-maska="'########'"
                                                    :maxlength="8"
                                                    placeholder="Escribir"
                                                    :error="
                                                        errDocNumber.active
                                                    "
                                                    :error-messages="
                                                        errDocNumber.message
                                                    "
                                                    @input="
                                                        errDocNumberClear
                                                    "
                                                    :rules="[
                                                        (v) =>
                                                            !!v ||
                                                            '* Campo obligatorio'
                                                    ]"
                                                    :append-inner-icon="'mdi-alert-circle'"
                                                    ><!-- <template
                                                    v-slot:append-inner
                                                >
                                                    <Icon
                                                        icon="solar:card-2-broken"
                                                        width="22" /></template
                                            > --></v-text-field
                                                >
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                md="6"
                                                class="pb-1 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Teléfono</v-label
                                                >
                                                <v-text-field
                                                    v-model="
                                                        formField.Phone
                                                    "
                                                    placeholder="999 999 999"
                                                    v-maska="'### ### ###'"
                                                    :append-inner-icon="'mdi-phone'"
                                                    ><!-- <template
                                                    v-slot:append-inner
                                                >
                                                    <Icon
                                                        icon="solar:phone-rounded-broken"
                                                        width="22"
                                                    /> </template
                                            > --></v-text-field
                                                >
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                md="5"
                                                class="pb-5 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Fecha
                                                    Nacimiento</v-label
                                                >
                                                <v-text-field
                                                    variant="outlined"
                                                    hide-details
                                                    type="date"
                                                    v-model="
                                                        formField.DateBirth
                                                    "
                                                ></v-text-field>
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                md="7"
                                                class="pb-5 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Sexo</v-label
                                                >
                                                <v-radio-group
                                                    inline
                                                    class="ml-n3"
                                                    hide-details
                                                    v-model="formField.Sex"
                                                >
                                                    <v-radio
                                                        label="Masculino"
                                                        color="primary"
                                                        value="1"
                                                    ></v-radio>
                                                    <v-radio
                                                        label="Femenino"
                                                        color="primary"
                                                        value="2"
                                                    ></v-radio>
                                                    <v-radio
                                                        label="No especifica"
                                                        color="primary"
                                                        value="0"
                                                    ></v-radio>
                                                </v-radio-group>
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                class="pb-1 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Dirección</v-label
                                                >
                                                <v-text-field
                                                    v-model="
                                                        formField.Address
                                                    "
                                                    placeholder="Escribir"
                                                >
                                                    <template
                                                        v-slot:append-inner
                                                    >
                                                        <Icon
                                                            icon="solar:map-point-broken"
                                                            width="22"
                                                        />
                                                    </template>
                                                </v-text-field>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-card-item>
                            </v-card>
                        </v-col>

                        <v-col
                            md="5"
                            xl="5"
                            cols="12"
                            class="px-0"
                        >
                            <v-card variant="outlined">
                                <v-overlay
                                    :model-value="ldgEdit"
                                    contained
                                    class="align-center justify-center"
                                    persistent
                                    scrim="#d5d5d5"
                                    :opacity="0.3"
                                >
                                    <v-progress-circular
                                        indeterminate
                                        color="muted"
                                    />
                                </v-overlay>
                                <v-card-item>
                                    <!--  <div
                                        class="d-flex align-center justify-space-between"
                                    >
                                        <h5
                                            class="text-h3 text-muted font-weight-bold"
                                        >
                                            Datos Usuario
                                        </h5>
                                    </div>
                                    <div
                                        class="text-subtitle-1 textSecondary"
                                    >
                                        Complete los campos obligatorios(*)
                                    </div> -->

                                    <div class="mt-4">
                                        <v-row>
                                            <v-col
                                                cols="12"
                                                class="pb-1 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Usuario *</v-label
                                                ><small
                                                    v-if="isEditMode"
                                                    class="text-muted"
                                                >
                                                    [ Solo lectura ]</small
                                                >
                                                <v-text-field
                                                    :readonly="isEditMode"
                                                    v-model="
                                                        formField.UserName
                                                    "
                                                    placeholder="Escribir"
                                                    :class="
                                                        isEditMode
                                                            ? 'readonly-field'
                                                            : ''
                                                    "
                                                    :error="errName.active"
                                                    :error-messages="
                                                        errUserName.message
                                                    "
                                                    @input="
                                                        errUserNameClear
                                                    "
                                                    :rules="[
                                                        (v) =>
                                                            !!v ||
                                                            '* El usuario es requerido'
                                                    ]"
                                                    ref="nameFdRef"
                                                    :append-inner-icon="'mdi-account-circle'"
                                                >
                                                    <!-- <template
                                                    v-slot:append-inner
                                                >
                                                    <Icon
                                                        icon="solar:user-circle-broken"
                                                        width="22"
                                                        height="22"
                                                    />
                                                </template> -->
                                                </v-text-field>
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                class="pb-1 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Correo Electrónico
                                                    *</v-label
                                                >
                                                <v-text-field
                                                    v-model="
                                                        formField.Email
                                                    "
                                                    placeholder="Escribir"
                                                    type="email"
                                                    :error="
                                                        errEmail.active
                                                    "
                                                    :error-messages="
                                                        errEmail.message
                                                    "
                                                    @input="errEmailClear"
                                                    :rules="[
                                                        (v) =>
                                                            !!v ||
                                                            '* Correo electrónico es requerido'
                                                    ]"
                                                    :append-inner-icon="'mdi-email'"
                                                >
                                                    <!-- <template
                                                    v-slot:append-inner
                                                >
                                                    <Icon
                                                        icon="solar:mention-square-broken"
                                                        width="22"
                                                        height="22"
                                                    />
                                                </template> -->
                                                </v-text-field>
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                md="6"
                                                class="pb-1 pt-0"
                                                ><v-label
                                                    class="text-muted mb-1"
                                                    >Contraseña *
                                                    <!-- {{
                                                        !isEditMode
                                                            ? '*'
                                                            : '(dejar vacío para no cambiar)'
                                                    }} --></v-label
                                                >
                                                <v-text-field
                                                    v-model="
                                                        formField.Password
                                                    "
                                                    placeholder="Escribir"
                                                    :error="
                                                        errPassword.active
                                                    "
                                                    :error-messages="
                                                        errPassword.message
                                                    "
                                                    @input="
                                                        errPasswordClear
                                                    "
                                                    :rules="
                                                        isEditMode
                                                            ? []
                                                            : [
                                                                  (v) =>
                                                                      !!v ||
                                                                      '* La contraseña es requerida'
                                                              ]
                                                    "
                                                    :type="
                                                        viewPass
                                                            ? 'text'
                                                            : 'password'
                                                    "
                                                    :append-inner-icon="
                                                        viewPass
                                                            ? 'mdi-eye'
                                                            : 'mdi-eye-off'
                                                    "
                                                    @click:append-inner="
                                                        viewPass =
                                                            !viewPass
                                                    "
                                                >
                                                </v-text-field>
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                md="6"
                                                class="pb-1 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Confirmar Contraseña
                                                    *</v-label
                                                >
                                                <v-text-field
                                                    v-model="
                                                        formField.ConfirmPassword
                                                    "
                                                    placeholder="Escribir"
                                                    :error="
                                                        errConPassword.active
                                                    "
                                                    :error-messages="
                                                        errConPassword.message
                                                    "
                                                    @input="
                                                        errConPasswordClear
                                                    "
                                                    :rules="
                                                        isEditMode
                                                            ? []
                                                            : [
                                                                  (v) =>
                                                                      !!v ||
                                                                      '* Este campo es obligatorio'
                                                              ]
                                                    "
                                                    :type="
                                                        viewConfPass
                                                            ? 'text'
                                                            : 'password'
                                                    "
                                                    :append-inner-icon="
                                                        viewConfPass
                                                            ? 'mdi-eye'
                                                            : 'mdi-eye-off'
                                                    "
                                                    @click:append-inner="
                                                        viewConfPass =
                                                            !viewConfPass
                                                    "
                                                ></v-text-field>
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                class="pb-1 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Roles *</v-label
                                                >
                                                <v-autocomplete
                                                    v-model="roles"
                                                    :items="listRoles"
                                                    :loading="ldgRoles"
                                                    variant="outlined"
                                                    item-title="Name"
                                                    item-value="Id"
                                                    multiple
                                                    closable-chips
                                                >
                                                    <template
                                                        v-slot:chip="{
                                                            item,
                                                            props
                                                        }"
                                                    >
                                                        <v-chip
                                                            v-bind="props"
                                                            label
                                                            color="primary"
                                                            size="large"
                                                            class="mb-1 text-subtitle-1 font-weight-regular"
                                                        >
                                                            {{
                                                                item.title
                                                            }}
                                                        </v-chip>
                                                    </template>
                                                </v-autocomplete>
                                            </v-col>
                                            <v-col
                                                cols="12"
                                                class="pb-1 pt-0"
                                            >
                                                <v-label
                                                    class="text-muted mb-1"
                                                    >Dependencia *</v-label
                                                >
                                                <v-autocomplete
                                                    v-model="dependencies"
                                                    :items="
                                                        listDependencies
                                                    "
                                                    :loading="
                                                        ldgDependencies
                                                    "
                                                    item-title="Name"
                                                    item-value="Id"
                                                    variant="outlined"
                                                    multiple
                                                    closable-chips
                                                >
                                                    <template
                                                        v-slot:chip="{
                                                            item,
                                                            props
                                                        }"
                                                    >
                                                        <v-chip
                                                            v-bind="props"
                                                            label
                                                            color="primary"
                                                            size="large"
                                                            class="mb-1 text-subtitle-1 font-weight-regular"
                                                        >
                                                            {{
                                                                item.title
                                                            }}
                                                        </v-chip>
                                                    </template>
                                                </v-autocomplete>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-card-item>
                            </v-card>
                        </v-col>

                        <v-col
                            cols="12"
                            class="text-end px-0"
                        >
                            <v-btn
                                variant="flat"
                                color="primary"
                                :loading="ldgCreate"
                                type="submit"
                                rounded="sm"
                                class="text-14"
                            >
                                <Icon
                                    icon="solar:diskette-line-duotone"
                                    width="18"
                                    class="mr-1"
                                />
                                Guardar
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </UiParentCard>
            <!-- <UiParentCard
                title="Datos del Usuario"
                class="mt-3"
            >
            </UiParentCard> -->
        </v-col>
    </v-row>
    <!-- 1. Snackbar mensaje -->
    <JAppSnackBar
        v-model="snackbar"
        :message="snackbarMsg"
        :type="snackbarType"
    />

    <!-- 2. Dialog Question -->
    <v-dialog
        v-model="dlgQuestion"
        :max-width="400"
    >
        <v-card>
            <v-card-title class="text-h6 py-3 border-bottom bg-light">
                Confirmar
            </v-card-title>
            <v-card-text class="text-center py-2">
                <div>
                    <Icon
                        class="text-info"
                        icon="solar:question-circle-broken"
                        width="50"
                        height="50"
                    />
                </div>
                ¿El correo electrónico ya existe, desea continuar?
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn
                    variant="text"
                    class="text-14"
                    @click="dlgQuestion = false"
                >
                    Cancelar
                </v-btn>
                <v-btn
                    color="primary"
                    class="text-14"
                    @click="confirmQuestion"
                >
                    Si, continuar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style>
.v-text-field .v-input__details,
.v-input__details {
    padding-top: 0px !important;
}
</style>
<style scoped>
:deep(.readonly-field .v-field) {
    background-color: rgba(0, 0, 0, 0.05);
    opacity: 0.85;
}

:deep(.readonly-field .v-field__outline) {
    opacity: 0.3;
}
</style>
