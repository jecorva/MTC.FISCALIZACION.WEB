<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Logoimg from '@/assets/images/logos/logo.png';
</script>
<template>
    <div class="logo">
        <RouterLink to="/">
            <img :src="Logoimg" alt="home" height="40" />
        </RouterLink>
    </div>
</template>