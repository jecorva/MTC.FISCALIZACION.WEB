<template>
    <v-snackbar
        v-model="modelValue"
        :color="color"
        :timeout="timeout"
        location="top right"
        
        elevation="4"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <div class="d-flex align-center">
            <v-icon class="mr-2">
                {{ icon }}
            </v-icon>
            <span>{{ message }}</span>
        </div>

        <template #actions>
            <v-btn icon variant="text" size="small" @click="modelValue = false">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

type SnackbarType = 'success' | 'error' | 'warning' | 'info';

const props = withDefaults(defineProps<{
    modelValue: boolean;
    message    : string;
    type      ?: SnackbarType;
    timeout   ?: number;
}>(), {
    type   : 'success',
    timeout: 3000,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const modelValue = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
    modelValue.value = val;
});

watch(modelValue, (val) => {
    emit('update:modelValue', val);
});

const color = computed<string>(() => {
    const map: Record<SnackbarType, string> = {
        success: 'success',
        error  : 'error',
        warning: 'warning',
        info   : 'info',
    };
    return map[props.type];
});

const icon = computed<string>(() => {
    const map: Record<SnackbarType, string> = {
        success: 'mdi-check-circle',
        error  : 'mdi-alert-circle',
        warning: 'mdi-alert',
        info   : 'mdi-information',
    };
    return map[props.type];
});
</script>