<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Logoiconimg from '@/assets/images/backgrounds/bg-logo.png';
</script>
<template>
    <div class="logo">
        <RouterLink to="/">
            <img :src="Logoiconimg" alt="Universidad Nacional de Piura"/>
        </RouterLink>
    </div>
</template>