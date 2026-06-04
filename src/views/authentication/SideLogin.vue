<script setup lang="ts">
import LogoIcon from '@/layouts/full/logo/LogoIcon.vue';
/* Login form */
import LoginForm from '@/components/auth/LoginForm.vue';
import LogoIconSide from '@/layouts/full/logo/LogoIconSide.vue';
</script>

<template>
    <div class="pa-3 h-100vh mh-100">
        <v-row class="h-100vh">
            <v-col
                cols="12"
                lg="5"
                xl="4"
                class="bg-surface auth"
            >
                <div class="d-flex justify-center align-center h-100">
                    <div class="mt-xl-0 mt-5 auth-card px-6">
                        <LogoIcon />
                        <!-- <h2 class="text-h3 mt-3 heading">SIGEPRE</h2> -->
                        <div
                            class="mt-5 mb-2 h3 text-poppins font-weight-medium text-muted"
                        >
                            Iniciar Sesión
                        </div>
                        <LoginForm />
                        <!-- <p class="d-flex align-center justify-center textSecondary mt-6 font-weight-medium">
                            New to MatDash?
                            <RouterLink
                                class="pl-0 text-primary opacity-1 pl-2 font-weight-medium text-decoration-none"
                                height="auto"
                                to="/auth/register"
                                variant="plain"
                                >Create an account</RouterLink
                            >
                        </p> -->
                    </div>
                </div>
            </v-col>
            <v-col
                cols="12"
                lg="7"
                xl="8"
                style="background: #bf0909"
                class="d-lg-flex d-none align-center justify-center authentication position-relative"
            >
                <div
                    class="circle-top"
                    style="border-color: #f2f2f2"
                ></div>
                <div>
                    <LogoIconSide class="circle-bottom" />
                </div>
                <div
                    class="d-flex justify-center align-center w-100 h-n80"
                >
                    <v-row class="justify-center z-index-2">
                        <v-col
                            xl="6"
                            lg="7"
                        >
                            <h1 class="text-h1 text-white lh-normal">
                                Bienvenido al
                                <br />
                            </h1>
                            <p
                                class="text-h6 text-white opacity-80 font-weight-regular mt-4 lh-md"
                            >
                                Sistema de Control y Gestión de las Actas
                                de Fiscalización<br />
                                del área Unidad de Fiscalización de la
                                DRTCP.
                            </p>
                            <!-- <v-btn to="/" size="large" color="primary" class="mt-5"> Learn More </v-btn> -->
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>
    </div>
</template>
