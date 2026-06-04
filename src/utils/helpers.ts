import type {
    notificationType,
    profileType,
    languageType,
    appsLinkType,
    searchType
} from '@/types/HeaderTypes';
//
// Profile
//
const profileDD: profileType[] = [
    {
        title: 'Mi Perfil',
        href: 'profile',
        badge: false
    },
    /* {
        title: 'My Subscription',
        href: '/pages/pricing',
        badge:false
    },
    {
        title: 'My Notes',
        href: '/apps/notes',
        badge:true
    },
    {
        title: 'Account Settings',
        href: '/pages/account-settings',
        badge:false
    }, */
    {
        title: 'Cerrar Sesión',
        href: 'logout',
        badge: false
    }
];

export { profileDD };
