import { usePermissionsStore } from '@/stores/permissions';

export function usePermissions() {
    const store = usePermissionsStore();

    const can = (slug: string): boolean => store.slugs.includes(slug);

    return { can };
}
