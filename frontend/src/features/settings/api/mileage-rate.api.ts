import { api } from "@/api/client";
export async function getMileageRates() {
    try { return (await api.get('/api/v1/reports/mileage-rates')).data; }
    catch (error: any) {
        if (error?.response?.status !== 404 || error?.response?.data?.detail !== 'Not Found') throw error;
        return (await api.get('/api/v1/admin/mileage-rate')).data;
    }
}
