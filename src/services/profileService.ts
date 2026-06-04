import httpClient from '@/utils/axios';
import { routesList } from '@/api/routes-list';

export const profileService = {
    get: async () => {
        const { data } = await httpClient.get(routesList.profile.get);
        return data.data;
    },

    update: async (xData) => {
        const { data } = await httpClient.post(routesList.profile.update, {
            requestData: xData
        });
        return data.data;
    },

    uploadPhoto: async (file: File) => {
        const formData = new FormData();
        formData.append('photo', file);
        const { data } = await httpClient.post(
            routesList.profile.uploadPhoto,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return data.data;
    },

    deletePhoto: async () => {
        const { data } = await httpClient.post(
            routesList.profile.deletePhoto
        );
        return data.data;
    },

    changePass: async (xData) => {
        const { data } = await httpClient.post(
            routesList.profile.changePass,
            { requestData: xData }
        );
        return data.data;
    }
};
