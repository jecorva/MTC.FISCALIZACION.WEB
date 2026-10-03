import type { FieldError } from '@/types/helpers/common';

export const noError = (): FieldError => ({ active: false, message: '' });
export const setError = (message: string): FieldError => ({ active: true, message });