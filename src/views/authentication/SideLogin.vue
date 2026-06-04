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
                        <h2 class="text-h3 mt-3 heading">SIGEPRE</h2>
                        <div class="mb-6">Iniciar Sesión</div>
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
                class="d-lg-flex d-none align-center justify-center authentication bg-darkgray position-relative"
            >
                <div class="circle-top"></div>
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
                                Bienvenido a
                                <br />
                                SIGEPRE
                            </h1>
                            <p
                                class="text-h6 text-white opacity-80 font-weight-regular mt-4 lh-md"
                            >
                                Sistema web de gestión y seguimiento de<br />
                                expedientes de pago y control presupuestal.
                            </p>
                            <!-- <v-btn to="/" size="large" color="primary" class="mt-5"> Learn More </v-btn> -->
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>
    </div>
</template>
